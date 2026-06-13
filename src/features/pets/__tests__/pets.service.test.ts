import { describe, it, expect, vi, beforeEach } from 'vitest';
import { petsService } from '../pets.service';

vi.mock('@/lib/supabase', () => {
  const from = vi.fn();
  return { supabase: { from } };
});

describe('petsService', () => {
  let supabaseMock: any;

  beforeEach(async () => {
    const mod = await import('@/lib/supabase');
    supabaseMock = mod.supabase;
    supabaseMock.from = vi.fn();
  });

  describe('getPets', () => {
    it('returns paginated pets', async () => {
      const range = vi.fn().mockResolvedValue({
        data: [{ id: 'p1', name: 'Max', customer_id: 'c1', species_id: 's1', breed_id: 'b1', gender: 'male', birth_date: '2020-01-01', weight: 10, color: 'Brown', is_sterilized: false, is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01', species: { name: 'Dog' }, breeds: { name: 'Labrador' }, customers: { full_name: 'John' } }],
        count: 1, error: null
      });
      const order = vi.fn(() => ({ range }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await petsService.getPets({ page: 1 });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Max');
    });

    it('filters by search', async () => {
      const range = vi.fn().mockResolvedValue({ data: [], count: 0, error: null });
      const ilike = vi.fn(() => ({ range }));
      const order = vi.fn(() => ({ ilike }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await petsService.getPets({ search: 'Max' });
      expect(result.items).toEqual([]);
    });
  });

  describe('getPetById', () => {
    it('returns pet when found', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: 'p1', name: 'Max', customer_id: 'c1', species_id: 's1', breed_id: 'b1', gender: 'male', birth_date: '2020-01-01', weight: 10, color: 'Brown', is_sterilized: false, microchip_number: null, qr_code: null, is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01', species: { name: 'Dog' }, breeds: { name: 'Labrador' }, customers: { full_name: 'John' } },
        error: null
      });
      const eq = vi.fn(() => ({ single }));
      const select = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select });

      const result = await petsService.getPetById('p1');
      expect(result).not.toBeNull();
      expect(result!.name).toBe('Max');
    });

    it('returns null when not found', async () => {
      const single = vi.fn().mockResolvedValue({ data: null, error: null });
      const eq = vi.fn(() => ({ single }));
      const select = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select });

      const result = await petsService.getPetById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('createPet', () => {
    it('creates pet successfully', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: 'p1', name: 'New Pet', customer_id: 'c1', species_id: 's1', breed_id: 'b1', gender: 'male', birth_date: '2020-01-01', weight: 5, color: 'Black', is_sterilized: false, microchip_number: null, qr_code: null, is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01', species: { name: 'Cat' }, breeds: { name: 'Persian' }, customers: { full_name: 'John' } },
        error: null
      });
      const select = vi.fn(() => ({ single }));
      const insert = vi.fn(() => ({ select }));
      supabaseMock.from.mockReturnValue({ insert });

      const result = await petsService.createPet({ name: 'New Pet', customerId: 'c1', speciesId: 's1', breedId: 'b1', gender: 'male' });
      expect(result.name).toBe('New Pet');
    });
  });

  describe('updatePet', () => {
    it('updates pet successfully', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: 'p1', name: 'Updated', customer_id: 'c1', species_id: 's1', breed_id: 'b1', gender: 'male', birth_date: '2020-01-01', weight: 12, color: 'Brown', is_sterilized: true, microchip_number: null, qr_code: null, is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01', species: { name: 'Dog' }, breeds: { name: 'Labrador' }, customers: { full_name: 'John' } },
        error: null
      });
      const select = vi.fn(() => ({ single }));
      const eq = vi.fn(() => ({ select }));
      const update = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ update });

      const result = await petsService.updatePet('p1', { name: 'Updated', weight: 12 });
      expect(result.name).toBe('Updated');
    });
  });

  describe('getSpecies', () => {
    it('returns species list', async () => {
      const order = vi.fn().mockResolvedValue({ data: [{ id: 's1', name: 'Dog' }], error: null });
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await petsService.getSpecies();
      expect(result).toHaveLength(1);
    });
  });

  describe('getBreedsBySpecies', () => {
    it('returns breeds for species', async () => {
      const order = vi.fn().mockResolvedValue({ data: [{ id: 'b1', name: 'Labrador', species_id: 's1' }], error: null });
      const eq = vi.fn(() => ({ order }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq })) });

      const result = await petsService.getBreedsBySpecies('s1');
      expect(result).toHaveLength(1);
    });
  });

  describe('generateQRCode', () => {
    it('returns QR code URL', async () => {
      const result = await petsService.generateQRCode('p1');
      expect(result).toContain('pet:p1');
    });
  });

  describe('getPetTimeline', () => {
    it('returns timeline entries', async () => {
      const order = vi.fn().mockResolvedValue({ data: [{ id: 'tl1', event: 'Checkup' }], error: null });
      const eq = vi.fn(() => ({ order }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq })) });

      const result = await petsService.getPetTimeline('p1');
      expect(result).toHaveLength(1);
    });
  });
});