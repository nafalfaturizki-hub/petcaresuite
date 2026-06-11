import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false }
});

interface SendWhatsAppPayload {
  to: string;
  message: string;
  provider: 'fonnte' | 'wablas';
  userId: string;
}

async function loadSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['whatsapp_config'])
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return Object.fromEntries(data?.map((row) => [row.key, row.value]) ?? []);
}

async function insertNotificationLog(payload: {
  userId: string;
  channel: string;
  recipient: string;
  templateKey: string;
  status: string;
  errorMessage?: string | null;
}) {
  try {
    const table = supabase.from('notifications_log');
    if (typeof (table as any).insert !== 'function') return;
    const { error } = await (table as any).insert([
      {
        user_id: payload.userId,
        channel: payload.channel,
        recipient: payload.recipient,
        template_key: payload.templateKey,
        payload: { message: payload.errorMessage ? null : 'sent' },
        status: payload.status,
        error_message: payload.errorMessage || null,
        sent_at: new Date().toISOString()
      }
    ]);

    if (error) {
      console.error('Failed to insert notification log:', error.message);
    }
  } catch (err) {
    console.error('Failed to insert notification log (unexpected):', err);
  }
}

async function sendWithFonnte(config: any, to: string, message: string) {
  if (!config?.api_key) {
    throw new Error('Fonnte configuration is incomplete');
  }

  const response = await fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: config.api_key
    },
    body: JSON.stringify({ target: to, message })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Fonnte send error: ${response.status} ${body}`);
  }

  return response.json();
}

async function sendWithWablas(config: any, to: string, message: string) {
  if (!config?.api_key) {
    throw new Error('Wablas configuration is incomplete');
  }

  const response = await fetch('https://solo.wablas.com/api/send-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: config.api_key
    },
    body: JSON.stringify({ phone: to, message })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Wablas send error: ${response.status} ${body}`);
  }

  return response.json();
}

export async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const payload = (await request.json()) as SendWhatsAppPayload;

  if (!payload?.to || !payload?.message || !payload?.provider || !payload?.userId) {
    return new Response(JSON.stringify({ success: false, message: 'Missing required payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const settings = await loadSettings();
  const whatsappConfig = settings['whatsapp_config'];

  if (!whatsappConfig) {
    return new Response(JSON.stringify({ success: false, message: 'WhatsApp configuration not found' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const result =
      payload.provider === 'fonnte'
        ? await sendWithFonnte(whatsappConfig, payload.to, payload.message)
        : await sendWithWablas(whatsappConfig, payload.to, payload.message);

    await insertNotificationLog({
      userId: payload.userId,
      channel: 'whatsapp',
      recipient: payload.to,
      templateKey: 'send_whatsapp',
      status: 'sent'
    });

    return new Response(JSON.stringify({ success: true, message: 'Message sent', result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    await insertNotificationLog({
      userId: payload.userId,
      channel: 'whatsapp',
      recipient: payload.to,
      templateKey: 'send_whatsapp',
      status: 'failed',
      errorMessage: message
    });

    return new Response(JSON.stringify({ success: false, message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
