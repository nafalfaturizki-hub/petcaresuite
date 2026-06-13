import { http, HttpResponse } from 'msw';

const API_BASE = 'https://api.example.com';

export const handlers = [
  // Auth handlers
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as any;
    if (body?.email === 'error@test.com') {
      return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    return HttpResponse.json({
      user: { id: 'u1', email: body?.email, role: 'owner', fullName: 'Test User', isActive: true },
      session: { access_token: 'mock-token', refresh_token: 'mock-refresh' }
    });
  }),

  http.post(`${API_BASE}/auth/logout`, () => {
    return HttpResponse.json({ success: true });
  }),

  // Profile handlers
  http.get(`${API_BASE}/profiles/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      full_name: 'Test User',
      role: 'owner',
      is_active: true
    });
  }),

  // Appointments handlers
  http.get(`${API_BASE}/appointments`, () => {
    return HttpResponse.json({
      items: [
        {
          id: 'a1',
          customer_id: 'c1',
          pet_id: 'p1',
          doctor_id: 'd1',
          service_id: 's1',
          services: { name: 'Consultation' },
          customers: { full_name: 'John Doe' },
          pets: { name: 'Max' },
          doctors: { profiles: { full_name: 'Dr. Smith' } },
          appointment_date: '2026-06-15',
          start_time: '09:00:00',
          end_time: '10:00:00',
          status: 'scheduled',
          created_at: '2026-06-10T00:00:00Z'
        }
      ],
      total: 1
    });
  }),

  // Inventory handlers
  http.get(`${API_BASE}/inventory_items`, () => {
    return HttpResponse.json({
      items: [
        {
          id: 'i1',
          name: 'Test Item',
          category_id: 'cat1',
          unit: 'pcs',
          min_stock: 5,
          current_stock: 10,
          price_per_unit: 50000,
          is_active: true,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z'
        }
      ],
      total: 1
    });
  }),

  // Customers handlers
  http.get(`${API_BASE}/customers`, () => {
    return HttpResponse.json({
      items: [
        {
          id: 'c1',
          full_name: 'John Doe',
          whatsapp: '+6281234567890',
          email: 'john@test.com',
          status: 'active',
          loyalty_points: 100,
          created_at: '2026-01-01T00:00:00Z'
        }
      ],
      total: 1
    });
  }),

  // Error handlers
  http.get(`${API_BASE}/error-test`, () => {
    return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
  }),

  http.get(`${API_BASE}/unauthorized`, () => {
    return HttpResponse.json({ error: 'Unauthorized' }, { status: 403 });
  })
];

export { http, HttpResponse };