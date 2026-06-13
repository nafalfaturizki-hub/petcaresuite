import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../auth.service';

vi.mock('@/lib/supabase', () => {
  const from = vi.fn();
  return { supabase: { from, auth: { signInWithPassword: vi.fn(), signOut: vi.fn(), resetPasswordForEmail: vi.fn(), getSession: vi.fn() } } };
});

describe('authService', () => {
  let supabaseMock: any;

  beforeEach(async () => {
    const mod = await import('@/lib/supabase');
    supabaseMock = mod.supabase;
    supabaseMock.from = vi.fn();
    supabaseMock.auth.signInWithPassword = vi.fn();
    supabaseMock.auth.signOut = vi.fn();
    supabaseMock.auth.resetPasswordForEmail = vi.fn();
    supabaseMock.auth.getSession = vi.fn();
  });

  describe('signIn', () => {
    it('returns user and session on successful sign in', async () => {
      const mockSession = { access_token: 'token', refresh_token: 'refresh' };
      supabaseMock.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'u1', email: 'test@test.com' }, session: mockSession },
        error: null
      });

      const single = vi.fn().mockResolvedValue({
        data: { full_name: 'Test User', role: 'owner', is_active: true },
        error: null
      });
      const eq = vi.fn(() => ({ single }));
      const select = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select });

      const result = await authService.signIn('test@test.com', 'password');
      expect(result.user.id).toBe('u1');
      expect(result.user.role).toBe('owner');
      expect(result.session).toEqual(mockSession);
    });

    it('throws error when sign in fails', async () => {
      supabaseMock.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' }
      });

      await expect(authService.signIn('wrong@test.com', 'wrong')).rejects.toThrow('Invalid login credentials');
    });

    it('throws error when no user returned', async () => {
      supabaseMock.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: null
      });

      await expect(authService.signIn('test@test.com', 'password')).rejects.toThrow('Unable to sign in');
    });
  });

  describe('signOut', () => {
    it('signs out successfully', async () => {
      supabaseMock.auth.signOut.mockResolvedValue({ error: null });
      await expect(authService.signOut()).resolves.not.toThrow();
    });

    it('throws on sign out error', async () => {
      supabaseMock.auth.signOut.mockResolvedValue({ error: { message: 'Sign out failed', code: 'UNKNOWN' } });
      await expect(authService.signOut()).rejects.toThrow();
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('sends password reset email', async () => {
      supabaseMock.auth.resetPasswordForEmail.mockResolvedValue({ error: null });
      await expect(authService.sendPasswordResetEmail('test@test.com')).resolves.not.toThrow();
    });

    it('throws on reset email error', async () => {
      supabaseMock.auth.resetPasswordForEmail.mockResolvedValue({ error: { message: 'Reset failed', code: 'UNKNOWN' } });
      await expect(authService.sendPasswordResetEmail('test@test.com')).rejects.toThrow();
    });
  });

  describe('getCurrentUser', () => {
    it('returns null when no session', async () => {
      supabaseMock.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
      const result = await authService.getCurrentUser();
      expect(result).toBeNull();
    });

    it('returns null on error', async () => {
      supabaseMock.auth.getSession.mockResolvedValue({ data: { session: null }, error: { message: 'Error' } });
      const result = await authService.getCurrentUser();
      expect(result).toBeNull();
    });

    it('returns user profile when session exists', async () => {
      supabaseMock.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'u1', email: 'test@test.com' } } },
        error: null
      });

      const single = vi.fn().mockResolvedValue({
        data: { full_name: 'Test User', role: 'owner', is_active: true },
        error: null
      });
      const eq = vi.fn(() => ({ single }));
      const select = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select });

      const result = await authService.getCurrentUser();
      expect(result).not.toBeNull();
      expect(result!.id).toBe('u1');
    });
  });

  describe('fetchProfile', () => {
    it('returns profile data', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { full_name: 'Alice', role: 'staff', is_active: true },
        error: null
      });
      const eq = vi.fn(() => ({ single }));
      const select = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select });

      const result = await authService.fetchProfile('u1', 'alice@test.com');
      expect(result.fullName).toBe('Alice');
      expect(result.role).toBe('staff');
    });

    it('throws when profile not found', async () => {
      const single = vi.fn().mockResolvedValue({ data: null, error: null });
      const eq = vi.fn(() => ({ single }));
      const select = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select });

      await expect(authService.fetchProfile('u1', 'test@test.com')).rejects.toThrow('Unable to load user profile');
    });

    it('throws on database error', async () => {
      const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error', code: 'UNKNOWN' } });
      const eq = vi.fn(() => ({ single }));
      const select = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select });

      await expect(authService.fetchProfile('u1', 'test@test.com')).rejects.toThrow();
    });
  });

  describe('createProfile', () => {
    it('creates and returns profile', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { full_name: 'New User', role: 'customer', is_active: true },
        error: null
      });
      const select = vi.fn(() => ({ single }));
      const insert = vi.fn(() => ({ select }));
      supabaseMock.from.mockReturnValue({ insert });

      const result = await authService.createProfile('u1', 'new@test.com', 'New User', 'customer');
      expect(result.fullName).toBe('New User');
      expect(result.role).toBe('customer');
    });

    it('throws on creation error', async () => {
      const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed', code: 'UNKNOWN' } });
      const select = vi.fn(() => ({ single }));
      const insert = vi.fn(() => ({ select }));
      supabaseMock.from.mockReturnValue({ insert });

      await expect(authService.createProfile('u1', 'new@test.com', 'New User', 'customer')).rejects.toThrow();
    });
  });

  describe('updateProfile', () => {
    it('updates and returns profile', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { full_name: 'Updated', role: 'staff', is_active: true, email: 'test@test.com' },
        error: null
      });
      const select = vi.fn(() => ({ single }));
      const eq = vi.fn(() => ({ select }));
      const update = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ update });

      const result = await authService.updateProfile('u1', { fullName: 'Updated', role: 'staff' });
      expect(result.fullName).toBe('Updated');
      expect(result.role).toBe('staff');
    });

    it('throws when no updates provided', async () => {
      await expect(authService.updateProfile('u1', {})).rejects.toThrow('No updates provided');
    });

    it('throws on update error', async () => {
      const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'Update failed', code: 'UNKNOWN' } });
      const select = vi.fn(() => ({ single }));
      const eq = vi.fn(() => ({ select }));
      const update = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ update });

      await expect(authService.updateProfile('u1', { fullName: 'Test' })).rejects.toThrow();
    });
  });
});