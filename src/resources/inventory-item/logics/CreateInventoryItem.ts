import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { HlmTooltip } from '@spartan-ng/helm/tooltip';
import * as yup from 'yup';
import { FormButton } from '@/components/form/Button';
import { Form } from '@/components/form/Form';
import { FormMultiSelect } from '@/components/form/MultiSelect';
import { FormNumberInput } from '@/components/form/Number';
import { FormSelect, type SelectValue } from '@/components/form/Select';
import { FormTextInput } from '@/components/form/TextInput';
import { I18n } from '@/libs/i18n';
import { getItemCategoriesService } from '@/resources/item-category/services/getItemCategories';
import { getStoragesService } from '@/resources/storage/services/getStorages';
import { getUnitsService } from '@/resources/unit/services/getUnits';
import { validatedFormState } from '@/utils/form';
import { injectNotify } from '@/utils/notify';
import { createMutation, createQuery } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import { createInventoryItemService } from '../services/createInventoryItem';
import { getInventoryItemsService } from '../services/getInventoryItems';

export type InventoryItemComponentEntry = {
  id: number;
  name: string;
  quantity_required: number;
};

export function injectCreateInventoryItemLogicData({ onSuccess }: { onSuccess: () => void }) {
  const i18n = inject(I18n);
  const notify = injectNotify();

  const createInventoryItemSchema = computed(() => yup.object({
    name: yup.string().default('').trim().required(i18n.t('forms.inventoryItem.validation.nameRequired')).max(255),
    unit_id: yup.number().nullable().default(null).required(i18n.t('forms.inventoryItem.validation.unitRequired')),
    storage_id: yup.number().nullable().default(null),
    quantity: yup.number().nullable().default(0).min(0),
    category_ids: yup.array(yup.number().required()).default([]),
  }));

  const createInventoryItemValidatedFormState = validatedFormState(createInventoryItemSchema);

  const components = signal<InventoryItemComponentEntry[]>([]);

  const createInventoryItemMutation = createMutation({
    mutationFn: () => {
      const { name, unit_id, storage_id, quantity, category_ids } = createInventoryItemValidatedFormState.state();

      return createInventoryItemService({
        body: {
          name,
          unit_id: unit_id!,
          storage_id,
          quantity: quantity ?? 0,
          category_ids,
          components: components().map((component) => ({ id: component.id, quantity_required: component.quantity_required })),
        },
      });
    },
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.createItem'),
  });

  function createInventoryItemReset() {
    createInventoryItemValidatedFormState.reset();
    components.set([]);
  }

  return { createInventoryItemValidatedFormState, createInventoryItemMutation, createInventoryItemReset, components };
}

@Component({
  selector: 'app-create-inventory-item-logic',
  imports: [Form, FormField, FormTextInput, FormSelect, FormNumberInput, FormMultiSelect, FormButton, HlmTooltip, TranslatePipe],
  template: `
    @let form = logicData().createInventoryItemValidatedFormState;

    @let isPending = logicData().createInventoryItemMutation.isPending();

    <form
      appForm
      class="flex flex-col gap-6"
      (submitted)="createInventoryItem()"
    >
      <div class="form-grid">
        <app-form-text-input
          class="col-span-12"
          [label]="'forms.inventoryItem.name.label' | t"
          [placeholder]="'forms.inventoryItem.name.placeholder' | t"
          [formField]="form.field.name"
          withAsterisk
        />

        <app-form-select
          class="col-span-12 sm:col-span-6"
          valueField="id"
          labelField="name"
          [label]="'forms.inventoryItem.unit.label' | t"
          [placeholder]="'forms.inventoryItem.unit.placeholder' | t"
          [data]="units()"
          [formField]="form.field.unit_id"
          withAsterisk
        />

        <app-form-number-input
          class="col-span-12 sm:col-span-6"
          [minValue]="0"
          [label]="'forms.inventoryItem.quantity.label' | t"
          [placeholder]="'forms.inventoryItem.quantity.placeholder' | t"
          [formField]="form.field.quantity"
        />

        <app-form-select
          class="col-span-12"
          valueField="id"
          labelField="name"
          [clearable]="true"
          [label]="'forms.inventoryItem.storage.label' | t"
          [placeholder]="'forms.inventoryItem.storage.placeholder' | t"
          [data]="storages()"
          [formField]="form.field.storage_id"
        />

        <app-form-multi-select
          class="col-span-12"
          valueField="id"
          labelField="name"
          [label]="'forms.inventoryItem.categories.label' | t"
          [placeholder]="'forms.inventoryItem.categories.placeholder' | t"
          [data]="categories()"
          [formField]="form.field.category_ids"
        />

        <fieldset class="col-span-12 flex flex-col gap-3">
          <legend class="text-sm font-medium pb-3">
            {{ 'forms.inventoryItem.components.label' | t }}
          </legend>

          <div class="form-grid gap-3! items-end">
            <app-form-select
              class="col-span-12 sm:col-span-7"
              valueField="id"
              labelField="name"
              [placeholder]="'forms.inventoryItem.components.selectPlaceholder' | t"
              [data]="availableComponentItems()"
              [(value)]="selectedComponentId"
            />

            <app-form-number-input
              class="col-span-9 sm:col-span-4"
              [minValue]="0"
              [ariaLabel]="'forms.inventoryItem.components.qtyPlaceholder' | t"
              [placeholder]="'forms.inventoryItem.components.qtyPlaceholder' | t"
              [(value)]="componentQuantity"
            />

            <button
              appButton
              size="icon"
              class="col-span-3 sm:col-span-1 w-full"
              icon="lucidePlus"
              [attr.aria-label]="'forms.inventoryItem.components.add' | t"
              [hlmTooltip]="'forms.inventoryItem.components.add' | t"
              [disabled]="!selectedComponentId() || !componentQuantity()"
              (click)="addComponent()"
            ></button>
          </div>

          <ul class="flex flex-col gap-2">
            @for (component of logicData().components(); track component.id) {
              <li class="flex items-center gap-2 p-2 pl-3 bg-gray-50 dark:bg-neutral-800 rounded-lg text-sm">
                <span class="flex-1 truncate">
                  {{ component.name }}
                </span>

                <app-form-number-input
                  class="w-28"
                  [minValue]="0"
                  [ariaLabel]="component.name"
                  [value]="component.quantity_required"
                  (valueChange)="updateComponentQuantity(component.id, $event)"
                />

                <button
                  appButton
                  variant="ghost"
                  size="icon-sm"
                  icon="lucideX"
                  class="text-destructive"
                  [attr.aria-label]="'forms.inventoryItem.components.remove' | t"
                  [hlmTooltip]="'forms.inventoryItem.components.remove' | t"
                  (click)="removeComponent(component.id)"
                ></button>
              </li>
            } @empty {
              <li class="text-xs text-gray-500 dark:text-gray-400 py-1">
                {{ 'forms.inventoryItem.components.empty' | t }}
              </li>
            }
          </ul>
        </fieldset>
      </div>

      <div class="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
        <button
          appButton
          variant="ghost"
          [disabled]="isPending"
          (click)="cancel.emit()"
        >
          {{ 'common.actions.cancel' | t }}
        </button>

        <button
          appButton
          type="submit"
          [loading]="isPending"
        >
          {{ 'common.actions.save' | t }}
        </button>
      </div>
    </form>
  `,
})
export class CreateInventoryItemLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectCreateInventoryItemLogicData>>();
  readonly cancel = output<void>();

  protected readonly selectedComponentId = signal<SelectValue | null>(null);
  protected readonly componentQuantity = signal<number | null>(1);

  private readonly unitsQuery = createQuery({ queryFn: () => getUnitsService() });
  private readonly categoriesQuery = createQuery({ queryFn: () => getItemCategoriesService() });
  private readonly storagesQuery = createQuery({ queryFn: () => getStoragesService() });
  private readonly allItemsQuery = createQuery({ queryFn: () => getInventoryItemsService({ query: { per_page: 100 } }) });

  protected readonly units = computed(() => this.unitsQuery.data()?.data ?? []);
  protected readonly categories = computed(() => this.categoriesQuery.data()?.data ?? []);
  protected readonly storages = computed(() => this.storagesQuery.data()?.data ?? []);
  private readonly allItems = computed(() => this.allItemsQuery.data()?.data.items ?? []);

  protected readonly availableComponentItems = computed(() => {
    const selected = new Set(this.logicData().components().map((component) => component.id));
    return this.allItems().filter((item) => !selected.has(item.id));
  });

  protected addComponent() {
    const item = this.allItems().find((candidate) => candidate.id === this.selectedComponentId());
    const quantity = this.componentQuantity();

    if (!item || !quantity || quantity <= 0) return;

    this.logicData().components.update((components) => [...components, { id: item.id, name: item.name, quantity_required: quantity }]);

    this.selectedComponentId.set(null);
    this.componentQuantity.set(1);
  }

  protected removeComponent(id: number) {
    this.logicData().components.update((components) => components.filter((component) => component.id !== id));
  }

  protected updateComponentQuantity(id: number, quantity: number | null) {
    this.logicData().components.update((components) =>
      components.map((component) => (component.id === id ? { ...component, quantity_required: quantity ?? 0 } : component)),
    );
  }

  protected createInventoryItem() {
    const { createInventoryItemValidatedFormState, createInventoryItemMutation } = this.logicData();

    if (!createInventoryItemValidatedFormState.validate()) return;

    createInventoryItemMutation.mutate();
  }
}
