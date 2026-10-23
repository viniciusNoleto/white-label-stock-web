import { describe, expect, it, vi } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname } from 'next/navigation';
import i18n, { LANGUAGE_STORAGE_KEY } from '@/libs/i18n';
import { renderWithProviders } from '../../support/render';
import { InventorySidebar } from '@/components/layout/InventorySidebar';
import { InventoryHeader } from '@/components/layout/InventoryHeader';
import { LanguageSwitcher } from '@/components/utils/LanguageSwitcher';

describe('InventorySidebar', () => {
  it('lists every section and highlights the active route', () => {
    vi.mocked(usePathname).mockReturnValue('/inventory/units/123');

    renderWithProviders(<InventorySidebar />);

    const links = screen.getAllByRole('link');
    expect(links.map(a => a.getAttribute('href'))).toEqual(['/', '/inventory/items', '/inventory/categories', '/inventory/units', '/inventory/storages']);
    expect(screen.getByRole('link', { name: /Unidades/ })).toHaveClass('text-primary-500');
    expect(screen.getByRole('link', { name: /Itens/ })).not.toHaveClass('text-primary-500');
    expect(screen.getByText('StockFlow')).toBeInTheDocument();
  });
});

describe('InventoryHeader', () => {
  it('switches the language and persists the choice', async () => {
    renderWithProviders(<InventoryHeader />);

    await userEvent.hover(screen.getByRole('button', { name: 'Idioma' }));
    await userEvent.click(await screen.findByRole('button', { name: 'English (US)' }));

    expect(i18n.language).toBe('en-us');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en-us');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Language' })).toBeInTheDocument());
  });

  it('falls back to the Brazilian flag for unknown languages', async () => {
    renderWithProviders(<InventoryHeader />);

    // i18n normalizes unsupported languages to the fallback, so emit a raw value to reach the defensive branch
    act(() => {
      Object.defineProperty(i18n, 'language', { value: 'fr', configurable: true, writable: true });
      i18n.emit('languageChanged', 'fr');
    });

    expect(document.querySelector('[data-icon="circle-flags:br"]')).not.toBeNull();

    delete (i18n as { language?: string }).language;
  });

  it('switches the color scheme and updates the trigger icon', async () => {
    renderWithProviders(<InventoryHeader />);
    const trigger = screen.getByRole('button', { name: 'Aparência' });

    expect(trigger.querySelector('[data-icon="lucide:sun"]')).not.toBeNull();

    await userEvent.hover(trigger);
    await userEvent.click(await screen.findByRole('button', { name: 'Escuro' }));
    await waitFor(() => expect(trigger.querySelector('[data-icon="lucide:moon"]')).not.toBeNull());

    await userEvent.click(screen.getByRole('button', { name: 'Sistema' }));
    await waitFor(() => expect(trigger.querySelector('[data-icon="lucide:monitor"]')).not.toBeNull());

    await userEvent.click(screen.getByRole('button', { name: 'Claro' }));
    await waitFor(() => expect(trigger.querySelector('[data-icon="lucide:sun"]')).not.toBeNull());
  });
});

describe('LanguageSwitcher', () => {
  it('changes language from the select', async () => {
    renderWithProviders(<LanguageSwitcher />);

    await userEvent.click(screen.getByRole('combobox', { name: 'Idioma' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Español (México)' }));

    expect(i18n.language).toBe('es-mx');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('es-mx');
  });
});
