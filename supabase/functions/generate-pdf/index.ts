import PDFDocument from 'pdfkit';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false }
});

interface GeneratePdfPayload {
  type: 'receipt' | 'vaccine-certificate' | 'invoice';
  id: string;
}

function bufferFromDoc(doc: PDFKit.PDFDocument): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}

function formatCurrency(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);
  return `₱${amount.toFixed(2)}`;
}

async function fetchClinicProfile() {
  const { data, error } = await supabase.from('settings').select('value').eq('key', 'clinic_profile').single();
  if (error) {
    throw new Error(error.message);
  }

  return data?.value ?? {};
}

export async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const payload = (await request.json()) as GeneratePdfPayload;
  if (!payload?.type || !payload?.id) {
    return new Response(JSON.stringify({ success: false, message: 'Missing required payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const clinicProfile = await fetchClinicProfile();
  const doc = new PDFDocument({ size: 'A4', margin: 40 });

  const createBaseHeader = () => {
    doc.fontSize(18).text(clinicProfile.name ?? 'PetCare Clinic', { align: 'center' });
    doc.fontSize(10).text(clinicProfile.address ?? '', { align: 'center' });
    doc.fontSize(10).text(clinicProfile.contact ?? '', { align: 'center' });
    doc.moveDown(1.5);
  };

  if (payload.type === 'receipt' || payload.type === 'invoice') {
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, customer:customer_id(*), invoice_items(*)')
      .eq('id', payload.id)
      .single();

    if (invoiceError || !invoice) {
      return new Response(JSON.stringify({ success: false, message: invoiceError?.message ?? 'Invoice not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    createBaseHeader();
    doc.fontSize(16).text(payload.type === 'receipt' ? 'Receipt' : 'Invoice', { underline: true });
    doc.moveDown();

    doc.fontSize(10).text(`Invoice #: ${invoice.invoice_number}`);
    doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`);
    doc.text(`Customer: ${invoice.customer?.full_name ?? 'N/A'}`);
    doc.text(`Email: ${invoice.customer?.email ?? '-'}`);
    doc.text(`Phone: ${invoice.customer?.whatsapp ?? '-'}`);
    doc.moveDown();

    const items = Array.isArray(invoice.invoice_items) ? invoice.invoice_items : [];
    doc.fontSize(12).text('Items', { underline: true });
    doc.moveDown(0.5);

    items.forEach((item: any) => {
      doc.fontSize(10).text(`${item.name} x${item.quantity} @ ${formatCurrency(item.unit_price)} = ${formatCurrency(item.total)}`);
      if (item.discount && Number(item.discount) > 0) {
        doc.fontSize(9).fillColor('gray').text(`Discount: ${formatCurrency(item.discount)}`);
        doc.fillColor('black');
      }
    });

    doc.moveDown();
    doc.fontSize(12).text('Totals', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Subtotal: ${formatCurrency(invoice.subtotal)}`);
    doc.text(`Discount: ${formatCurrency(invoice.discount_amount)}`);
    doc.text(`Total: ${formatCurrency(invoice.total)}`);
    doc.text(`Paid: ${formatCurrency(invoice.paid_amount)}`);
    doc.text(`Payment Method: ${invoice.payment_method}`);
    if (invoice.payment_method_secondary) {
      doc.text(`Secondary Payment: ${invoice.payment_method_secondary}`);
    }
  } else if (payload.type === 'vaccine-certificate') {
    const { data: record, error: recordError } = await supabase
      .from('vaccination_records')
      .select('*, pet:pet_id(*), vaccine:vaccine_id(*), doctor:doctor_id(*)')
      .eq('id', payload.id)
      .single();

    if (recordError || !record) {
      return new Response(JSON.stringify({ success: false, message: recordError?.message ?? 'Vaccination record not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    createBaseHeader();
    doc.fontSize(16).text('Vaccination Certificate', { underline: true, align: 'center' });
    doc.moveDown(1);

    doc.fontSize(10).text(`Pet Name: ${record.pet?.name ?? 'N/A'}`);
    doc.text(`Species: ${record.pet?.species_id ?? 'N/A'}`);
    doc.text(`Breed: ${record.pet?.breed_id ?? 'N/A'}`);
    doc.text(`Owner: ${record.pet?.customer_id ?? 'N/A'}`);
    doc.moveDown(0.5);
    doc.text(`Vaccine: ${record.vaccine?.name ?? 'N/A'}`);
    doc.text(`Batch #: ${record.batch_number ?? '-'}`);
    doc.text(`Vaccinated at: ${new Date(record.vaccinated_at).toLocaleDateString()}`);
    doc.text(`Next due date: ${record.next_due_date ? new Date(record.next_due_date).toLocaleDateString() : 'N/A'}`);

    doc.moveDown(1);
    doc.text(`Doctor: ${record.doctor?.profile_id?.full_name ?? 'N/A'}`);
    doc.text(`Signature: _______________________________`);
  }

  const buffer = await bufferFromDoc(doc);
  const path = `${payload.type}/${payload.id}.pdf`;
  const { error: uploadError } = await supabase.storage.from('documents').upload(path, buffer, { upsert: true });

  if (uploadError) {
    return new Response(JSON.stringify({ success: false, message: uploadError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { data: urlData, error: urlError } = await supabase.storage.from('documents').createSignedUrl(path, 60 * 60);
  if (urlError || !urlData) {
    return new Response(JSON.stringify({ success: false, message: urlError?.message ?? 'Unable to create URL' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ success: true, url: urlData.signedURL }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
