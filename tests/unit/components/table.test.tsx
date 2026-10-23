import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../support/render';
import { UtilsTable } from '@/components/utils/Table';

const rows = [{ id: 1, name: 'Ana', age: 30 }, { id: 2, name: 'Bruno', age: 25 }];
const columns = { name: 'Nome', age: 'Idade' };

describe('UtilsTable', () => {
  it('renders headers and raw cell values', () => {
    renderWithProviders(<UtilsTable rows={rows} columns={columns} rowKey={({ item }) => item.id} />);

    expect(screen.getAllByRole('columnheader').map(th => th.textContent)).toEqual(['Nome', 'Idade']);
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('Bruno')).toBeInTheDocument();
  });

  it('renders custom cells, title and alias', () => {
    renderWithProviders(
      <UtilsTable
        title="Pessoas"
        alias={<button type="button">extra</button>}
        rows={rows}
        columns={columns}
        renderCells={{ age: ({ item, index }) => `${item.age} anos #${index}` }}
      />,
    );

    expect(screen.getByText('Pessoas')).toBeInTheDocument();
    expect(screen.getByText('extra')).toBeInTheDocument();
    expect(screen.getByText('30 anos #0')).toBeInTheDocument();
  });

  it('shows the default and custom empty texts', () => {
    const { rerender } = renderWithProviders(<UtilsTable rows={[]} columns={columns} />);
    expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument();

    rerender(<UtilsTable rows={[]} columns={columns} emptyText="Vazio!" actions={[{ label: 'x' }]} />);
    expect(screen.getByText('Vazio!').closest('td')).toHaveAttribute('colspan', '3');
  });

  it('renders static actions with icon or label and passes the row to onClick', async () => {
    const onEdit = vi.fn();
    const onView = vi.fn();

    renderWithProviders(
      <UtilsTable
        rows={rows}
        columns={columns}
        actions={[
          { icon: 'lucide:pencil', label: 'Editar', onClick: onEdit },
          { label: 'Ver', onClick: onView },
          { label: 'Sem ação' },
        ]}
      />,
    );

    expect(screen.getByRole('columnheader', { name: 'Ações' })).toBeInTheDocument();

    const secondRow = screen.getAllByRole('row')[2];
    await userEvent.click(within(secondRow).getByRole('button', { name: 'Editar' }));
    await userEvent.click(within(secondRow).getByRole('button', { name: 'Ver' }));
    await userEvent.click(within(secondRow).getByRole('button', { name: 'Sem ação' }));

    expect(onEdit).toHaveBeenCalledWith({ item: rows[1], index: 1 });
    expect(onView).toHaveBeenCalledWith({ item: rows[1], index: 1 });
  });

  it('supports per-row action factories', () => {
    renderWithProviders(
      <UtilsTable
        rows={rows}
        columns={columns}
        actions={({ item }) => (item.age > 26 ? [{ label: 'Promover' }] : [])}
      />,
    );

    expect(screen.getAllByRole('button', { name: 'Promover' })).toHaveLength(1);
  });

  it('hides the actions column for an empty action list', () => {
    renderWithProviders(<UtilsTable rows={rows} columns={columns} actions={[]} />);

    expect(screen.queryByRole('columnheader', { name: 'Ações' })).toBeNull();
  });

  it('paginates when there is more than one page', async () => {
    const setPage = vi.fn();
    const { rerender } = renderWithProviders(<UtilsTable rows={rows} columns={columns} lastPage={3} page={1} setPage={setPage} loading />);

    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(setPage).toHaveBeenCalledWith(2);

    rerender(<UtilsTable rows={rows} columns={columns} lastPage={1} page={1} setPage={setPage} />);
    expect(screen.queryByRole('button', { name: '2' })).toBeNull();
  });
});
