import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../auth.store';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      role: null,
      session: null,
      isInitializing: true
    });
  });

  it('initializes with default state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.role).toBeNull();
    expect(state.session).toBeNull();
    expect(state.isInitializing).toBe(true);
  });

  it('setUser updates user and role', () => {
    const user = { id: 'u1', email: 'test@test.com', fullName: 'Test', role: 'owner' as const, isActive: true };
    useAuthStore.getState().setUser(user);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.role).toBe('owner');
  });

  it('setSession updates session', () => {
    const session = { access_token: 'token', refresh_token: 'refresh' } as any;
    useAuthStore.getState().setSession(session);
    const state = useAuthStore.getState();
    expect(state.session).toEqual(session);
  });

  it('setSession accepts null', () => {
    useAuthStore.getState().setSession(null);
    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
  });

  it('setInitializing updates loading state', () => {
    useAuthStore.getState().setInitializing(false);
    const state = useAuthStore.getState();
    expect(state.isInitializing).toBe(false);
  });

  it('clearAuth resets user, role, and session', () => {
    useAuthStore.setState({
      user: { id: 'u1', email: 'test@test.com', fullName: 'Test', role: 'owner', isActive: true },
      role: 'owner',
      session: { access_token: 'token' } as any
    });
    useAuthStore.getState().clearAuth();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.role).toBeNull();
    expect(state.session).toBeNull();
  });
});