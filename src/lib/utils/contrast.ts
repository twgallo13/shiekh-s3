/**
 * Color contrast utility for WCAG 2.1 AA compliance checking
 */

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to relative luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if contrast meets WCAG 2.1 AA standards
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @returns true if contrast meets AA standards (4.5:1 for normal text, 3:1 for large text)
 */
export function checkContrast(foreground: string, background: string): boolean {
  const ratio = getContrastRatio(foreground, background);
  // WCAG 2.1 AA requires 4.5:1 for normal text, 3:1 for large text
  // We'll use 4.5:1 as the threshold for this check
  return ratio >= 4.5;
}

/**
 * Get contrast ratio as a number
 */
export function getContrastRatioValue(foreground: string, background: string): number {
  return getContrastRatio(foreground, background);
}

/**
 * Tailwind color token mappings for common colors
 */
export const TAILWIND_COLORS = {
  // Grays
  'gray-50': '#f9fafb',
  'gray-100': '#f3f4f6',
  'gray-200': '#e5e7eb',
  'gray-300': '#d1d5db',
  'gray-400': '#9ca3af',
  'gray-500': '#6b7280',
  'gray-600': '#4b5563',
  'gray-700': '#374151',
  'gray-800': '#1f2937',
  'gray-900': '#111827',
  
  // Blues
  'blue-50': '#eff6ff',
  'blue-100': '#dbeafe',
  'blue-200': '#bfdbfe',
  'blue-300': '#93c5fd',
  'blue-400': '#60a5fa',
  'blue-500': '#3b82f6',
  'blue-600': '#2563eb',
  'blue-700': '#1d4ed8',
  'blue-800': '#1e40af',
  'blue-900': '#1e3a8a',
  
  // Reds
  'red-50': '#fef2f2',
  'red-100': '#fee2e2',
  'red-200': '#fecaca',
  'red-300': '#fca5a5',
  'red-400': '#f87171',
  'red-500': '#ef4444',
  'red-600': '#dc2626',
  'red-700': '#b91c1c',
  'red-800': '#991b1b',
  'red-900': '#7f1d1d',
  
  // Greens
  'green-50': '#f0fdf4',
  'green-100': '#dcfce7',
  'green-200': '#bbf7d0',
  'green-300': '#86efac',
  'green-400': '#4ade80',
  'green-500': '#22c55e',
  'green-600': '#16a34a',
  'green-700': '#15803d',
  'green-800': '#166534',
  'green-900': '#14532d',
  
  // Yellows
  'yellow-50': '#fefce8',
  'yellow-100': '#fef3c7',
  'yellow-200': '#fde68a',
  'yellow-300': '#fcd34d',
  'yellow-400': '#fbbf24',
  'yellow-500': '#f59e0b',
  'yellow-600': '#d97706',
  'yellow-700': '#b45309',
  'yellow-800': '#92400e',
  'yellow-900': '#78350f',
} as const;

/**
 * Resolve Tailwind color token to hex value
 */
export function resolveTailwindColor(color: string): string {
  if (color.startsWith('#')) return color;
  
  const tailwindColor = TAILWIND_COLORS[color as keyof typeof TAILWIND_COLORS];
  return tailwindColor || color;
}
