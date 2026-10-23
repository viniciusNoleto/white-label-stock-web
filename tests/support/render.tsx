import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/libs/i18n';
import { mantineTheme } from '@/libs/matine/mantine-theme';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false, cacheTime: 0 },
      mutations: { retry: false },
    },
    logger: { log: () => {}, warn: () => {}, error: () => {} },
  });
}

export function TestProviders({ children, queryClient = createTestQueryClient() }: { children: React.ReactNode; queryClient?: QueryClient }) {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider
          theme={mantineTheme}
          env="test"
        >
          {children}
        </MantineProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}

export function renderWithProviders(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: ({ children }) => <TestProviders>{children}</TestProviders>, ...options });
}
