/*
 * Paleta da marca — para fazer o white-label, troque as cores base abaixo.
 * As escalas (50…950) são geradas a partir delas: 500 = cor base, clareando
 * até 50 e escurecendo até 950. Usado pelo `tailwind.config.ts`.
 */

export const PRIMARY_COLOR = '#6F1FF9';

export const SECONDARY_COLOR = '#881FF9';

export const TERTIARY_COLOR = '#2482ED';

export const PRIMARY_COLOR_PALETTE = colorVariations(PRIMARY_COLOR);

export const SECONDARY_COLOR_PALETTE = colorVariations(SECONDARY_COLOR);

export const TERTIARY_COLOR_PALETTE = colorVariations(TERTIARY_COLOR);

export type ColorPalette = Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950, string>;

export function colorVariations(color: string): ColorPalette {
  return {
    50: lighten(color, 0.5),
    100: lighten(color, 0.4),
    200: lighten(color, 0.3),
    300: lighten(color, 0.2),
    400: lighten(color, 0.1),
    500: color.toLowerCase(),
    600: darken(color, 0.1),
    700: darken(color, 0.2),
    800: darken(color, 0.3),
    900: darken(color, 0.4),
    950: darken(color, 0.5),
  };
}

/** Mesma semântica do `Color(c).lighten(v)`: luminosidade HSL multiplicada por (1 + v). */
export function lighten(color: string, value: number): string {
  const [h, s, l] = hexToHsl(color);

  return hslToHex(h, s, Math.min(1, l * (1 + value)));
}

/** Mesma semântica do `Color(c).darken(v)`: luminosidade HSL multiplicada por (1 - v). */
export function darken(color: string, value: number): string {
  const [h, s, l] = hexToHsl(color);

  return hslToHex(h, s, Math.max(0, l * (1 - value)));
}

function hexToHsl(hex: string): [number, number, number] {
  const int = Number.parseInt(hex.replace('#', ''), 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;

  if (delta === 0) return [0, 0, l];

  const s = l <= 0.5 ? delta / (max + min) : delta / (2 - max - min);
  const h = max === r ? (g - b) / delta : max === g ? 2 + (b - r) / delta : 4 + (r - g) / delta;

  return [((h * 60) % 360 + 360) % 360, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    const value = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));

    return Math.round(value * 255).toString(16).padStart(2, '0');
  };

  return `#${channel(0)}${channel(8)}${channel(4)}`;
}
