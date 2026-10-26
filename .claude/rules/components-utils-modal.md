# UtilsModal

`import { UtilsModal } from '@/components/utils/Modal';` — `hlm-dialog` do Spartan com a API do `Modal` do Mantine.

## Interface

```ts
opened = input(false);
title = input('');
size = input<'sm' | 'md' | 'lg' | 'xl'>('md');   // 24rem / 32rem / 42rem / 56rem
closed = output<void>();                          // Esc, clique fora ou botão X
```

## Regras

- O conteúdo vai **sempre** dentro de `<ng-template>`: só é criado ao abrir e é destruído ao fechar (as queries do conteúdo só rodam quando o modal abre).
- Estado dos modais da página num único `signal<Record<ModalKey, boolean>>`, com `setModal`/`closeModal`.
- Antes de abrir: `…Reset()` (create) ou `…Init(item)` (update) da logic.

## Padrão correto

```html
<app-utils-modal
  size="sm"
  [opened]="modals().createUnit"
  [title]="'inventory.modals.createUnit' | t"
  (closed)="closeModal('createUnit')"
>
  <ng-template>
    <app-create-unit-logic
      [logicData]="createUnitLogicData"
      (cancel)="closeModal('createUnit')"
    />
  </ng-template>
</app-utils-modal>
```

```ts
type ModalKey = 'createUnit' | 'updateUnit' | 'deleteUnit';

protected readonly modals = signal<Record<ModalKey, boolean>>({ createUnit: false, updateUnit: false, deleteUnit: false });

protected openCreateUnitModal() {
  this.createUnitLogicData.createUnitReset();
  this.setModal('createUnit', true);
}

protected closeModal(key: ModalKey) {
  this.setModal(key, false);
}

private setModal(key: ModalKey, opened: boolean) {
  this.modals.update((modals) => ({ ...modals, [key]: opened }));
}
```
