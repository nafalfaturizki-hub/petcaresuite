import { describe, it, expect, vi, beforeEach } from 'vitest';
import { medicalRecordsService } from '../medical-records.service';

vi.mock('@/lib/supabase', () => {
  const from = vi.fn();
  return { supabase: { from, storage: { from: vi.fn() } } };
});

describe('medicalRecordsService', () => {
  let supabaseMock: any;

  beforeEach(async () => {
    const mod = await import('@/lib/supabase');
    supabaseMock = mod.supabase;
    supabaseMock.from = vi.fn();
    supabaseMock.storage.from = vi.fn();
  });

  describe('getMedicalRecords', () => {
    it('returns paginated records', async () => {
      const range = vi.fn().mockResolvedValue({
        data: [{ id: 'r1', pet_id: 'p1', doctor_id: 'd1', record_type: 'checkup', date: '2026-01-01', notes: 'Healthy', pets: { name: 'Max' }, doctors: { profiles: { full_name: 'Dr. Smith' } } }],
        count: 1, error: null
      });
      const order = vi.fn(() => ({ range }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await medicalRecordsService.getMedicalRecords({ page: 1 });
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('filters by petId', async () => {
      const range = vi.fn().mockResolvedValue({ data: [], count: 0, error: null });
      const eq = vi.fn(() => ({ range }));
      const order = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await medicalRecordsService.getMedicalRecords({ petId: 'p1' });
      expect(result.items).toEqual([]);
    });
  });

  describe('getMedicalRecordById', () => {
    it('returns record with prescriptions and attachments', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: 'r1', pet_id: 'p1', doctor_id: 'd1', record_type: 'checkup', date: '2026-01-01', notes: 'Healthy', subjective: 'S', objective: 'O', assessment: 'A', plan: 'P', prescriptions: [], medical_attachments: [], pets: { name: 'Max' }, doctors: { profiles: { full_name: 'Dr. Smith' } } },
        error: null
      });
      const eq = vi.fn(() => ({ single }));
      const select = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select });

      const result = await medicalRecordsService.getMedicalRecordById('r1');
      expect(result).not.toBeNull();
      expect(result!.soap.subjective).toBe('S');
    });

    it('returns null when not found', async () => {
      const single = vi.fn().mockResolvedValue({ data: null, error: null });
      const eq = vi.fn(() => ({ single }));
      const select = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select });

      const result = await medicalRecordsService.getMedicalRecordById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('createMedicalRecord', () => {
    it('creates record with prescriptions', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: 'r1', pet_id: 'p1', doctor_id: 'd1', record_type: 'checkup', date: '2026-01-01', notes: 'Test' },
        error: null
      });
      const select = vi.fn(() => ({ single }));
      const insert = vi.fn(() => ({ select }));
      supabaseMock.from.mockReturnValue({ insert });

      const result = await medicalRecordsService.createMedicalRecord({
        petId: 'p1', doctorId: 'd1', recordType: 'checkup', date: '2026-01-01',
        soap: { subjective: 'S', objective: 'O', assessment: 'A', plan: 'P' },
        prescriptions: [{ medication: 'Amoxicillin', dosage: '500mg', frequency: '2x daily', duration: '7' }]
      });
      expect(result).not.toBeNull();
    });
  });

  describe('addPrescription', () => {
    it('adds prescription to record', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: 'p1', drug_name: 'Amoxicillin', dose: '500mg', instruction: '2x daily', duration_days: 7 },
        error: null
      });
      const select = vi.fn(() => ({ single }));
      const insert = vi.fn(() => ({ select }));
      supabaseMock.from.mockReturnValue({ insert });

      const result = await medicalRecordsService.addPrescription('r1', { medication: 'Amoxicillin', dosage: '500mg', frequency: '2x daily', duration: '7' });
      expect(result.medication).toBe('Amoxicillin');
    });
  });

  describe('removePrescription', () => {
    it('removes prescription', async () => {
      const eq = vi.fn().mockResolvedValue({ error: null });
      const delete_ = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ delete: delete_ });

      const result = await medicalRecordsService.removePrescription('p1');
      expect(result).toBe(true);
    });
  });

  describe('uploadAttachment', () => {
    it('uploads file attachment', async () => {
      const upload = vi.fn().mockResolvedValue({ error: null });
      supabaseMock.storage.from.mockReturnValue({ upload });

      const single = vi.fn().mockResolvedValue({
        data: { id: 'att1', file_name: 'test.pdf', file_url: 'path/test.pdf', created_at: '2026-01-01' },
        error: null
      });
      const select = vi.fn(() => ({ single }));
      const insert = vi.fn(() => ({ select }));
      supabaseMock.from.mockReturnValue({ insert });

      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const result = await medicalRecordsService.uploadAttachment('r1', file);
      expect(result.filename).toBe('test.pdf');
    });

    it('handles URL attachment', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: 'att2', file_name: 'doc.pdf', file_url: 'https://example.com/doc.pdf', created_at: '2026-01-01' },
        error: null
      });
      const select = vi.fn(() => ({ single }));
      const insert = vi.fn(() => ({ select }));
      supabaseMock.from.mockReturnValue({ insert });

      const result = await medicalRecordsService.uploadAttachment('r1', { name: 'doc.pdf', url: 'https://example.com/doc.pdf' });
      expect(result.filename).toBe('doc.pdf');
    });
  });

  describe('removeAttachment', () => {
    it('removes attachment', async () => {
      const eq = vi.fn().mockResolvedValue({ error: null });
      const delete_ = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ delete: delete_ });

      const result = await medicalRecordsService.removeAttachment('att1');
      expect(result).toBe(true);
    });
  });
});