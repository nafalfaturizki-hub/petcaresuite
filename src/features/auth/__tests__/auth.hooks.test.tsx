import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthActions } from '../auth.hooks';
import { useAuthStore } from '@/stores/auth.store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: { signInWithPassword: vi.fn(), signOut: vi.fn(), resetPasswordForEmail: vi.fn(), getSession: vi.fn() }
  }
}));

vi.mock('../auth.service', () => ({
  authService: {
    signIn: vi.fn(),
    signOut: vi.fn(),
    sendPasswordResetEmail: vi.fn()
  }
}));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useAuthActions', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, role: null, session: null, isInitializing: false });
  });

  it('signIn calls service and updates store', async () => {
    const { authService } = await import('../auth.service');
    const mockUser = { id: 'u1', email: 'test@test.com', fullName: 'Test', role: 'owner' as const, isActive: true };
    const mockSession = { access_token: 'token' } as any;
    (authService.signIn as any).mockResolvedValue({ user: mockUser, session: mockSession });

    const { result } = renderHook(() => useAuthActions(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.signIn('test@test.com', 'password');
    });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.role).toBe('owner');
  });

  it('signOut calls service and clears store', async () => {
    useAuthStore.setState({
      user: { id: 'u1', email: 'test@test.com', fullName: 'Test', role: 'owner', isActive: true },
      role: 'owner',
      session: { access_token: 'token' } as any
    });

    const { authService } = await import('../auth.service');
    (authService.signOut as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuthActions(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.signOut();
    });

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.role).toBeNull();
  });

  it('sendPasswordReset calls service', async () => {
    const { authService } = await import('../auth.service');
    (authService.sendPasswordResetEmail as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuthActions(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.sendPasswordReset('test@test.com');
    });

    expect(authService.sendPasswordResetEmail).toHaveBeenCalledWith('test@test.com');
  });

  it('signIn propagates errors', async () => {
    const { authService } = await import('../auth.service');
    (authService.signIn as any).mockRejectedValue(new Error('Auth failed'));

    const { result } = renderHook(() => useAuthActions(), { wrapper: createWrapper() });

    await expect(
      act(async () => {
        await result.current.signIn('test@test.com', 'wrong');
      })
    ).rejects.toThrow('Auth failed');
  });
});