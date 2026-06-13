import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useModuleStore } from '../module.store';

vi.mock('@/lib/supabase', () => ({
  supabase: { from: vi.fn() }
}));

describe('moduleStore', () => {
  beforeEach(() => {
    useModuleStore.setState({
      modules: { clinic: true, monitoring: false, inpatient: false, grooming: false, petshop: false, inventory: false, accounting: false, website: false },
      isLoading: false,
      error: null
    });
  });

  it('initializes with default modules', () => {
    const state = useModuleStore.getState();
    expect(state.modules.clinic).toBe(true);
    expect(state.modules.monitoring).toBe(false);
  });

  it('setModules updates modules', () => {
    useModuleStore.getState().setModules({ clinic: false, monitoring: true, inpatient: false, grooming: false, petshop: false, inventory: false, accounting: false, website: false });
    const state = useModuleStore.getState();
    expect(state.modules.clinic).toBe(false);
    expect(state.modules.monitoring).toBe(true);
  });

  it('setLoading updates loading state', () => {
    useModuleStore.getState().setLoading(true);
    expect(useModuleStore.getState().isLoading).toBe(true);
  });

  it('setError updates error state', () => {
    useModuleStore.getState().setError('Test error');
    expect(useModuleStore.getState().error).toBe('Test error');
  });

  it('fetchModuleStatus loads modules from supabase', async () => {
    const { supabase } = await import('@/lib/supabase');
    const single = vi.fn().mockResolvedValue({
      data: { value: { clinic: true, monitoring: true, inpatient: false, grooming: false, petshop: false, inventory: true, accounting: false, website: false } },
      error: null
    });
    const eq = vi.fn(() => ({ single }));
    supabase.from = vi.fn(() => ({ select: vi.fn(() => ({ eq })) }));

    await useModuleStore.getState().fetchModuleStatus();
    const state = useModuleStore.getState();
    expect(state.modules.monitoring).toBe(true);
    expect(state.modules.inventory).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('fetchModuleStatus handles error', async () => {
    const { supabase } = await import('@/lib/supabase');
    const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } });
    const eq = vi.fn(() => ({ single }));
    supabase.from = vi.fn(() => ({ select: vi.fn(() => ({ eq })) }));

    await useModuleStore.getState().fetchModuleStatus();
    const state = useModuleStore.getState();
    expect(state.error).toBe('DB Error');
    expect(state.isLoading).toBe(false);
  });
});