import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import * as yup from 'yup';
import { I18nextProvider } from 'react-i18next';
import i18n, { LANGUAGE_STORAGE_KEY } from '@/libs/i18n';
import { setYupLocale } from '@/libs/yup/yup-locale';
import { yupPtBR } from '@/libs/yup/yup-pt-br';
import { yupEsMX } from '@/libs/yup/yup-es-mx';
import { yupEnUS } from '@/libs/yup/yup-en-us';
import { mantineTheme } from '@/libs/matine/mantine-theme';
import { useScheduleLabels } from '@/libs/matine/locale';
import ptBR from '@/locales/pt-br';
import esMX from '@/locales/es-mx';
import enUS from '@/locales/en-us';
import { colorVariations, PRIMARY_COLOR, PRIMARY_COLOR_PALETTE } from '@/shared/constants/colors';
import { SUPPORTED_LOCALES } from '@/shared/constants/locale';
import { BRAND_NAME } from '@/shared/constants/brand';

function keysOf(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) => (v && typeof v === 'object' ? keysOf(v, `${prefix}${k}.`) : [`${prefix}${k}`]));
}

describe('i18n', () => {
  it('initializes with pt-br and the three supported locales', () => {
    expect(i18n.language).toBe('pt-br');
    expect(LANGUAGE_STORAGE_KEY).toBe('white-label-inventory-system:language');
    expect(SUPPORTED_LOCALES).toEqual(['pt-br', 'es-mx', 'en-us']);
  });

  it('restores the saved language on load', async () => {
    vi.resetModules();
    localStorage.setItem('white-label-inventory-system:language', 'en-us');

    const fresh = (await import('@/libs/i18n')).default;

    expect(fresh.language).toBe('en-us');
    expect(fresh.t('sidebar.items')).toBe(enUS.sidebar.items);
  });

  it('locales expose the same keys', () => {
    const base = keysOf(ptBR).sort();

    expect(keysOf(esMX).sort()).toEqual(base);
    expect(keysOf(enUS).sort()).toEqual(base);
  });
});

describe('yup locales', () => {
  const schema = yup.object({
    name: yup.string().required().min(3).max(5).email().length(4).matches(/x/).url().uuid().datetime().trim().lowercase().uppercase(),
    age: yup.number().typeError('${path}').min(1).max(2).lessThan(3).moreThan(0).positive().negative().integer(),
    when: yup.date().min(new Date(2020, 0, 1)).max(new Date(2021, 0, 1)),
    flag: yup.boolean().isTrue(),
    list: yup.array().min(1).max(2).length(3),
    pick: yup.mixed().oneOf(['a']).notOneOf(['b']).defined(),
    nn: yup.string().nonNullable(),
    obj: yup.object({ a: yup.string() }).noUnknown(),
  });

  it.each([
    ['pt-br', yupPtBR, 'Campo obrigatório'],
    ['es-mx', yupEsMX, 'Campo obligatorio'],
    ['en-us', yupEnUS, 'Required field'],
    ['xx', yupPtBR, 'Campo obrigatório'],
  ])('setYupLocale(%s) applies the dictionary', async (lang, dict, required) => {
    setYupLocale(lang);

    const error = await yup.string().required().validate(undefined).catch(e => e.errors[0]);
    expect(error).toBe(required);

    // exercise every message builder of the dictionary
    const messages = Object.values(dict).flatMap(group => Object.values(group as object));
    const params = { values: 'a, b', type: 'number', length: 2, min: 1, max: 2, less: 3, more: 0, value: true, unknown: 'x', path: 'p' };
    for (const m of messages) {
      const out = typeof m === 'function' ? m(params as never) : m;
      expect(typeof out).toBe('string');
    }
    for (const m of messages.filter(m => typeof m === 'function')) {
      expect(typeof (m as (p: object) => string)({ ...params, type: 'weird', value: false })).toBe('string');
    }

    await schema.validate({}, { abortEarly: false }).catch(() => {});
  });
});

describe('mantine theme / colors / brand', () => {
  it('builds 11-shade palettes', () => {
    const palette = colorVariations('#336699');

    expect(Object.keys(palette)).toHaveLength(11);
    expect(palette[500]).toBe('#336699');
    expect(PRIMARY_COLOR_PALETTE[500]).toBe(PRIMARY_COLOR);
  });

  it('registers custom colors on the theme', () => {
    expect(mantineTheme.primaryColor).toBe('primary');
    expect(mantineTheme.colors?.primary).toHaveLength(11);
    expect(mantineTheme.colors?.red).toHaveLength(11);
    expect(BRAND_NAME).toBe('StockFlow');
  });
});

describe('useScheduleLabels', () => {
  it('returns translated schedule labels and the current locale', () => {
    const { result } = renderHook(() => useScheduleLabels(), {
      wrapper: ({ children }) => <I18nextProvider i18n={i18n}>{children}</I18nextProvider>,
    });

    expect(result.current.locale).toBe('pt-br');
    expect(result.current.scheduleLabels.today).toBe('events.scheduleLabels.today');
    expect((result.current.scheduleLabels.moreLabel as (n: number) => string)(3)).toBe('events.scheduleLabels.moreLabel');
  });
});
