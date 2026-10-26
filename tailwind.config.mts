import type { Config } from 'tailwindcss';
import {
  PRIMARY_COLOR_PALETTE,
  SECONDARY_COLOR_PALETTE,
  TERTIARY_COLOR_PALETTE,
} from './src/shared/constants/colors.ts';

export default {
  theme: {
    extend: {
      colors: {
        primary: PRIMARY_COLOR_PALETTE,
        secondary: SECONDARY_COLOR_PALETTE,
        tertiary: TERTIARY_COLOR_PALETTE,
      },
    },
  },
} satisfies Config;
