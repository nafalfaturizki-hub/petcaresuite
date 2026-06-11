import { supabase } from '@/lib/supabase';
import type { FinancialReport, MonthlyPoint } from './reports.types';

function monthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export const reportsService = {
  async getFinancialReport({ startDate, endDate }: { startDate?: string; endDate?: string } = {}): Promise<FinancialReport> {
    const from = startDate || new Date(new Date().setMonth(new Date().getMonth() - 11)).toISOString();
    const to = endDate || new Date().toISOString();

    // gather invoices in range
    const { data: invoices = [], error: invErr } = await supabase.from('invoices').select('id, total, created_at').gte('created_at', from).lte('created_at', to);
    if (invErr) throw new Error(invErr.message);

    // gather transactions (expenses) in range
    const { data: txs = [], error: txErr } = await supabase.from('transactions').select('id, amount, type, created_at').gte('created_at', from).lte('created_at', to);
    if (txErr) throw new Error(txErr.message);

    const totalRevenue = (invoices || []).reduce((s: number, inv: any) => s + Number(inv.total || 0), 0);
    const totalExpense = (txs || []).reduce((s: number, t: any) => s + (t.type === 'debit' ? Number(t.amount || 0) : 0), 0);

    // monthly trend — revenue per month
    const monthMap: Record<string, number> = {};
    (invoices || []).forEach((inv: any) => {
      const k = monthKey(inv.created_at || inv.createdAt || new Date().toISOString());
      monthMap[k] = (monthMap[k] || 0) + Number(inv.total || 0);
    });

    // produce last 12 months
    const points: MonthlyPoint[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      points.push({ month: k, value: monthMap[k] || 0 });
    }

    return {
      summary: {
        totalRevenue,
        totalExpense,
        netProfit: totalRevenue - totalExpense
      },
      monthlyTrend: points
    };
  },

  async getClinicalStats(from?: string, to?: string) {
    const f = from || '1970-01-01';
    const t = to || new Date().toISOString();

    const { data: records = [], error: recErr } = await supabase.from('medical_records').select('pet_id, assessment, record_type, created_at').gte('created_at', f).lte('created_at', t);
    if (recErr) throw new Error(recErr.message);

    const totalPatients = new Set((records || []).map((r: any) => r.pet_id)).size;

    const { data: appts = [], error: apptErr } = await supabase.from('appointments').select('customer_id, created_at').gte('created_at', f).lte('created_at', t);
    if (apptErr) throw new Error(apptErr.message);
    const newPatients = new Set((appts || []).map((a: any) => a.customer_id)).size;

    const diagCount: Record<string, number> = {};
    (records || []).forEach((r: any) => { const key = (r.assessment || 'Unknown').trim(); if (!key) return; diagCount[key] = (diagCount[key] || 0) + 1; });
    const topDiagnoses = Object.entries(diagCount).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name, count }));

    const typeBreakdown: Record<string, number> = {};
    (records || []).forEach((r: any) => { typeBreakdown[r.record_type] = (typeBreakdown[r.record_type] || 0) + 1; });

    return { totalPatients, newPatients, topDiagnoses, typeBreakdown };
  },

  async getDoctorStats(from?: string, to?: string) {
    const f = from || '1970-01-01';
    const t = to || new Date().toISOString();
    const { data: appts = [], error: err } = await supabase.from('appointments').select('id, doctor_id, pet_id, service_id, created_at').gte('created_at', f).lte('created_at', t);
    if (err) throw new Error(err.message);

    const byDoctor: Record<string, { patients: Set<string>; services: number; appointments: number; revenue: number }> = {};
    for (const a of (appts || [])) {
      const d = a.doctor_id || 'unassigned';
      if (!byDoctor[d]) byDoctor[d] = { patients: new Set(), services: 0, appointments: 0, revenue: 0 };
      byDoctor[d].patients.add(a.pet_id);
      byDoctor[d].services += 1;
      byDoctor[d].appointments += 1;
    }

    // revenue from invoices linked via appointment
    const appointmentIds = (appts || []).map((a: any) => a.id);
    const { data: invoices = [] } = await supabase.from('invoices').select('id, appointment_id, total').in('appointment_id', appointmentIds);
    const invMap: Record<string, number> = {};
    (invoices || []).forEach((inv: any) => { if (!inv || !inv.appointment_id) return; invMap[inv.appointment_id] = Number(inv.total || 0); });

    for (const a of (appts || [])) {
      const d = a.doctor_id || 'unassigned';
      byDoctor[d].revenue += invMap[a.id] || 0;
    }

    const results = [];
    for (const [doctorId, stats] of Object.entries(byDoctor)) {
      // fetch doctor name
      const { data: doc } = await supabase.from('doctors').select('id, profile_id').eq('id', doctorId).maybeSingle();
      let name = 'Unknown';
      if (doc?.profile_id) {
        const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', doc.profile_id).maybeSingle();
        if (prof) name = prof.full_name || 'Unknown';
      }
      results.push({ doctorId, doctorName: name, patients: stats.patients.size, services: stats.services, revenue: stats.revenue });
    }

    return results;
  },

  async getInventoryStats() {
    const { data: low = [], error: lowErr } = await supabase.from('inventory_items').select('id').lte('current_stock', supabase.rpc ? 0 : 0); // fallback
    // safer: compute low stock count via query for items where current_stock <= min_stock
    const { data: low2, error: low2Err } = await supabase.from('inventory_items').select('id').filter('current_stock', 'lte', 'min_stock');
    const lowCount = (low2 || []).length;

    const now = new Date();
    const plus30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const plus90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data: exp30 = [], error: e30 } = await supabase.from('inventory_batches').select('id').gte('expiry_date', now.toISOString().slice(0,10)).lte('expiry_date', plus30);
    const { data: exp90 = [], error: e90 } = await supabase.from('inventory_batches').select('id').gte('expiry_date', now.toISOString().slice(0,10)).lte('expiry_date', plus90);

    const { data: items = [], error: itErr } = await supabase.from('inventory_items').select('current_stock, price_per_unit');
    const totalValue = (items || []).reduce((s: number, it: any) => s + Number(it.current_stock || 0) * Number(it.price_per_unit || 0), 0);

    return { lowStockCount: lowCount, expiring30: (exp30 || []).length, expiring90: (exp90 || []).length, totalValue };
  },

  async getProductStats(from?: string, to?: string) {
    const f = from || '1970-01-01';
    const t = to || new Date().toISOString();
    const { data: items = [], error } = await supabase.from('invoice_items').select('reference_id, name, quantity, total, created_at').gte('created_at', f).lte('created_at', t).eq('item_type', 'product');
    if (error) throw new Error(error.message);
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    for (const it of (items || [])) {
      const key = it.reference_id || it.name;
      if (!map[key]) map[key] = { name: it.name, qty: 0, revenue: 0 };
      map[key].qty += Number(it.quantity || 0);
      map[key].revenue += Number(it.total || 0);
    }
    const results = Object.entries(map).map(([ref, v]) => ({ reference: ref, name: v.name, qty: v.qty, revenue: v.revenue }));
    results.sort((a, b) => b.qty - a.qty);
    return results;
  },

  async getRevenueByService(from?: string, to?: string) {
    const f = from || '1970-01-01';
    const t = to || new Date().toISOString();
    const { data: items = [], error } = await supabase.from('invoice_items').select('reference_id, name, total').gte('created_at', f).lte('created_at', t).eq('item_type', 'service');
    if (error) throw new Error(error.message);
    const map: Record<string, number> = {};
    const names: Record<string, string> = {};
    for (const it of (items || [])) {
      const key = it.reference_id || it.name;
      map[key] = (map[key] || 0) + Number(it.total || 0);
      names[key] = it.name;
    }
    return Object.entries(map).map(([ref, amount]) => ({ serviceId: ref, serviceName: names[ref] || ref, amount }));
  }
};

export default reportsService;
