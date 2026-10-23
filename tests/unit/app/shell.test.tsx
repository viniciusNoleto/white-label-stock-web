import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { redirect } from 'next/navigation';
import { renderWithProviders } from '../../support/render';
import RootLayout, { metadata } from '@/app/layout';
import { Providers } from '@/app/providers';
import Home from '@/app/page';
import InventoryLayout from '@/app/inventory/layout';
import InventoryPage from '@/app/inventory/page';

describe('RootLayout', () => {
  it('declares metadata and renders the html shell', () => {
    expect(metadata).toEqual({ title: 'StockFlow', description: 'Sistema genérico de controle de estoque e inventário' });

    vi.spyOn(console, 'error').mockImplementation(() => {});
    const html = renderToStaticMarkup(<RootLayout><p>conteúdo</p></RootLayout>);

    expect(html).toContain('<html lang="pt-BR"');
    expect(html).toContain('conteúdo');
  });
});

describe('Providers', () => {
  it('renders children inside the app providers', () => {
    render(<Providers><p>filho</p></Providers>);

    expect(screen.getByText('filho')).toBeInTheDocument();
  });
});

describe('Home page', () => {
  it('shows the brand, translated copy and the CTA to the inventory', () => {
    renderWithProviders(<Home />);

    expect(screen.getByRole('heading', { name: 'StockFlow' })).toBeInTheDocument();
    expect(screen.getByText('Sistema genérico de controle de estoque e inventário')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Acessar Inventário' })).toHaveAttribute('href', '/inventory');
    expect(screen.getByRole('link', { name: 'Saiba mais' })).toHaveAttribute('href', '#features');
    expect(screen.getByText('Controle de estoque')).toBeInTheDocument();
    expect(screen.getByText('Construção')).toBeInTheDocument();
  });
});

describe('Inventory layout and index', () => {
  it('wraps pages with the sidebar and header', () => {
    renderWithProviders(<InventoryLayout><p>página</p></InventoryLayout>);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('página')).toBeInTheDocument();
  });

  it('redirects /inventory to the items page', () => {
    InventoryPage();

    expect(redirect).toHaveBeenCalledWith('/inventory/items');
  });
});
