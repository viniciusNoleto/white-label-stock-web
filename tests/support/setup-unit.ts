import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';
import i18n from '@/libs/i18n';

// @iconify/react fetches icon data over the network; render a deterministic placeholder instead.
vi.mock('@iconify/react', () => ({
  Icon: ({ icon, className }: { icon: string; className?: string }) =>
    React.createElement('span', { 'data-icon': icon, className }),
}));

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/inventory/items'),
  redirect: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
Element.prototype.scrollIntoView = vi.fn();


beforeEach(async () => {
  await i18n.changeLanguage('pt-br');
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.clear();
});
