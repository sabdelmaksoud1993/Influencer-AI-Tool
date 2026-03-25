import { API_BASE_URL, COLORS, SPACING } from '../src/constants/config';

describe('Config', () => {
  it('API_BASE_URL points to production', () => {
    expect(API_BASE_URL).toContain('myglowpass.com');
    expect(API_BASE_URL).toContain('https://');
  });

  it('COLORS has all required keys', () => {
    expect(COLORS.primary).toBeDefined();
    expect(COLORS.background).toBeDefined();
    expect(COLORS.text).toBeDefined();
    expect(COLORS.surface).toBeDefined();
    expect(COLORS.error).toBeDefined();
    expect(COLORS.success).toBeDefined();
  });

  it('COLORS primary is pink (matching web branding)', () => {
    expect(COLORS.primary).toBe('#EC4899');
  });

  it('SPACING has all required sizes', () => {
    expect(SPACING.xs).toBe(4);
    expect(SPACING.sm).toBe(8);
    expect(SPACING.md).toBe(16);
    expect(SPACING.lg).toBe(24);
    expect(SPACING.xl).toBe(32);
    expect(SPACING.xxl).toBe(48);
  });
});
