import { describe, it, expect } from 'vitest';
import { AppError, handleSupabaseError, isNetworkError } from '../error';

describe('AppError', () => {
  it('creates error with message and code', () => {
    const error = new AppError('Test error', 'TEST_CODE', { detail: 'context' });
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.context).toEqual({ detail: 'context' });
    expect(error.name).toBe('AppError');
  });

  it('creates error without context', () => {
    const error = new AppError('Simple error', 'SIMPLE');
    expect(error.message).toBe('Simple error');
    expect(error.code).toBe('SIMPLE');
    expect(error.context).toBeUndefined();
  });
});

describe('handleSupabaseError', () => {
  it('throws AppError for duplicate key error (23505)', () => {
    expect(() => handleSupabaseError({ code: '23505', message: 'duplicate' })).toThrow('This record already exists.');
  });

  it('throws AppError for foreign key violation (23503)', () => {
    expect(() => handleSupabaseError({ code: '23503', message: 'fk violation' })).toThrow('Cannot complete: referenced record not found.');
  });

  it('throws AppError for permission denied (42501)', () => {
    expect(() => handleSupabaseError({ code: '42501', message: 'permission denied' })).toThrow('You do not have permission to perform this action.');
  });

  it('throws AppError for not found (PGRST116)', () => {
    expect(() => handleSupabaseError({ code: 'PGRST116', message: 'not found' })).toThrow('Record not found.');
  });

  it('throws AppError with original message for unknown code', () => {
    expect(() => handleSupabaseError({ code: 'UNKNOWN', message: 'Something went wrong' })).toThrow('Something went wrong');
  });

  it('throws AppError with UNKNOWN code when code is missing', () => {
    expect(() => handleSupabaseError({ message: 'No code provided' } as any)).toThrow('No code provided');
  });
});

describe('isNetworkError', () => {
  it('returns true for fetch TypeError', () => {
    const error = new TypeError('Failed to fetch');
    expect(isNetworkError(error)).toBe(true);
  });

  it('returns false for other errors', () => {
    const error = new Error('Regular error');
    expect(isNetworkError(error)).toBe(false);
  });

  it('returns false for non-Error values', () => {
    expect(isNetworkError('string error')).toBe(false);
    expect(isNetworkError(null)).toBe(false);
    expect(isNetworkError(undefined)).toBe(false);
  });
});