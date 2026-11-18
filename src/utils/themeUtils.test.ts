import { beforeEach, describe, expect, it } from 'vitest';
import { applySavedTheme, generateShades } from './themeUtils';

describe('theme utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.cssText = '';
  });

  it('generates the full brand palette and preserves the base color', () => {
    const shades = generateShades('#336699');
    expect(Object.keys(shades)).toHaveLength(9);
    expect(shades['--brand-500']).toBe('#336699');
    expect(shades['--brand-50']).toMatch(/^#[\da-f]{6}$/i);
  });

  it('applies the saved theme and brand palette', () => {
    localStorage.setItem('app-theme', 'dark');
    localStorage.setItem('brand-color', '#336699');
    applySavedTheme();
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(document.documentElement.style.getPropertyValue('--brand-500')).toBe('#336699');
  });

  it('defaults to light theme when no preference has been saved', () => {
    applySavedTheme();
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });
});
