import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type TableAction, UtilsTable, UtilsTableCell } from './Table';

type Row = { id: number; name: string; qty: number };

@Component({
  imports: [UtilsTable, UtilsTableCell],
  template: `
    <app-utils-table
      emptyText="Nada aqui"
      [rows]="rows()"
      [columns]="{ name: 'Nome', qty: 'Qtd' }"
      [actions]="actions"
      [page]="1"
      [lastPage]="lastPage()"
      (pageChange)="page = $event"
    >
      <ng-template
        appTableCell="qty"
        [appTableCellOf]="rows()"
        let-row
      >
        <strong>
          {{ row.qty * 2 }}
        </strong>
      </ng-template>
    </app-utils-table>
  `,
})
class Host {
  readonly rows = signal<Row[]>([{ id: 1, name: 'Parafuso', qty: 3 }]);
  readonly lastPage = signal(1);
  page = 1;
  clicked: Row | null = null;
  readonly actions: TableAction<Row>[] = [{ label: 'Editar', icon: 'lucidePencil', onClick: ({ item }) => (this.clicked = item) }];
}

describe('UtilsTable', () => {
  async function render() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('renders headers, raw values and custom cells', async () => {
    const { element } = await render();

    expect([...element.querySelectorAll('th')].map((th) => th.textContent!.trim())).toEqual(['Nome', 'Qtd', 'Ações']);
    expect(element.querySelector('tbody td')!.textContent!.trim()).toBe('Parafuso');
    expect(element.querySelector('tbody strong')!.textContent!.trim()).toBe('6');
  });

  it('runs row actions with the row item', async () => {
    const { fixture, element } = await render();

    (element.querySelector('button[aria-label="Editar"]') as HTMLButtonElement).click();

    expect(fixture.componentInstance.clicked?.name).toBe('Parafuso');
  });

  it('shows the empty text and pagination only when needed', async () => {
    const { fixture, element } = await render();

    expect(element.querySelector('app-utils-pagination')).toBeNull();

    fixture.componentInstance.rows.set([]);
    fixture.componentInstance.lastPage.set(3);
    await fixture.whenStable();

    expect(element.textContent).toContain('Nada aqui');

    (element.querySelector('button[aria-current="page"] ~ button') as HTMLButtonElement).click();
    expect(fixture.componentInstance.page).toBe(2);
  });
});
