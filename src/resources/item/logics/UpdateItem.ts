import { Component, computed, inject, input, output, type Signal, signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import * as yup from 'yup';
import { FormButton } from '@/components/form/Button';
import { FormDateInput } from '@/components/form/DateInput';
import { Form } from '@/components/form/Form';
import { FormSelect } from '@/components/form/Select';
import { FormTextInput } from '@/components/form/TextInput';
import { I18n } from '@/libs/i18n';
import { getStoragesService } from '@/resources/storage/services/getStorages';
import { todayISO } from '@/utils/date';
import { validatedFormState } from '@/utils/form';
import { injectNotify } from '@/utils/notify';
import { createMutation, createQuery } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import type { IItem } from '../models/Item';
import { updateItemService, type UpdateItemServicePayload } from '../services/updateItem';
import { MAX_PER_PAGE } from '@/shared/constants/pagination';

type UpdateItemValues = { produced_at: string; expires_at: string; storage_id: number | null };

/**
 * Só o que mudou vai para a API. Mudar a produção sem mexer no vencimento deixa a API
 * recalcular o vencimento pela validade do produto. O código nunca muda (é gerado pela API).
 */
export function updateItemPayload(initial: UpdateItemValues, current: UpdateItemValues): UpdateItemServicePayload {
  const body: UpdateItemServicePayload = {};

  if (current.produced_at !== initial.produced_at) body.produced_at = current.produced_at;
  if (current.expires_at !== initial.expires_at) body.expires_at = current.expires_at || null;
  if (current.storage_id !== initial.storage_id) body.storage_id = current.storage_id;

  return body;
}

export function injectUpdateItemLogicData({ editingItemId, onSuccess }: { editingItemId: Signal<number | undefined>; onSuccess: () => void }) {
  const i18n = inject(I18n);
  const notify = injectNotify();

  const updateItemSchema = computed(() => yup.object({
    // Mesmas regras da API: produção nunca no futuro e vencimento nunca antes da produção.
    produced_at: yup.string()
      .default('')
      .required(i18n.t('forms.updateItem.validation.dateRequired'))
      .test('notFuture', i18n.t('forms.updateItem.validation.dateFuture'), (value) => !value || value <= todayISO()),
    expires_at: yup.string()
      .default('')
      .test('afterProduced', i18n.t('forms.updateItem.validation.expiresBeforeProduced'), function (value) {
        const producedAt: string = this.parent.produced_at;

        return !value || !producedAt || value >= producedAt;
      }),
    storage_id: yup.number().nullable().default(null),
  }));

  const updateItemValidatedFormState = validatedFormState(updateItemSchema);

  const initialValues = signal<UpdateItemValues>({ produced_at: '', expires_at: '', storage_id: null });

  /** Só para exibir: o código não é editável. */
  const updateItemCode = signal('');

  const updateItemMutation = createMutation({
    mutationFn: () => updateItemService({ itemId: editingItemId()!, body: updateItemPayload(initialValues(), updateItemValidatedFormState.state()) }),
    onSuccess: (res) => {
      notify.success(res);

      onSuccess();
    },
    onError: (err) => notify.error(err, 'notifications.errors.updateItem'),
  });

  function updateItemInit(item: IItem) {
    const values = { produced_at: item.produced_at, expires_at: item.expires_at ?? '', storage_id: item.storage?.id ?? null };

    updateItemCode.set(item.code);
    initialValues.set(values);
    updateItemValidatedFormState.reset(values);
  }

  /** Nada mudou → não chama a API (ela recusaria o payload vazio). */
  function updateItemHasChanges() {
    return Object.keys(updateItemPayload(initialValues(), updateItemValidatedFormState.state())).length > 0;
  }

  return { updateItemValidatedFormState, updateItemMutation, updateItemInit, updateItemHasChanges, updateItemCode: updateItemCode.asReadonly() };
}

@Component({
  selector: 'app-update-item-logic',
  imports: [Form, FormField, FormTextInput, FormDateInput, FormSelect, FormButton, TranslatePipe],
  template: `
    @let form = logicData().updateItemValidatedFormState;

    @let isPending = logicData().updateItemMutation.isPending();

    <form
      appForm
      class="flex flex-col gap-6"
      (submitted)="updateItem()"
    >
      <div class="form-grid">
        <app-form-text-input
          class="col-span-12"
          [label]="'forms.updateItem.code.label' | t"
          [description]="'forms.updateItem.code.description' | t"
          [value]="logicData().updateItemCode()"
          [disabled]="true"
        />

        <app-form-date-input
          class="col-span-12"
          [label]="'forms.updateItem.producedAt.label' | t"
          [description]="'forms.updateItem.producedAt.description' | t"
          [maxDate]="today"
          [formField]="form.field.produced_at"
          withAsterisk
        />

        <app-form-date-input
          class="col-span-12"
          [label]="'forms.updateItem.expiresAt.label' | t"
          [description]="'forms.updateItem.expiresAt.description' | t"
          [minDate]="form.state().produced_at || undefined"
          [formField]="form.field.expires_at"
        />

        <app-form-select
          class="col-span-12"
          valueField="id"
          labelField="name"
          [clearable]="true"
          [label]="'forms.updateItem.storage.label' | t"
          [placeholder]="'forms.updateItem.storage.placeholder' | t"
          [data]="storages()"
          [formField]="form.field.storage_id"
        />
      </div>

      <div class="flex justify-end gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
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
export class UpdateItemLogicComponent {
  readonly logicData = input.required<ReturnType<typeof injectUpdateItemLogicData>>();
  readonly cancel = output<void>();

  /** Teto da data de produção (a API recusa produção no futuro). */
  protected readonly today = todayISO();

  private readonly storagesQuery = createQuery({ queryFn: () => getStoragesService({ query: { per_page: MAX_PER_PAGE } }) });

  protected readonly storages = computed(() => this.storagesQuery.data()?.data.items ?? []);

  protected updateItem() {
    const { updateItemValidatedFormState, updateItemMutation, updateItemHasChanges } = this.logicData();

    if (!updateItemValidatedFormState.validate()) return;

    if (!updateItemHasChanges()) {
      this.cancel.emit();
      return;
    }

    updateItemMutation.mutate();
  }
}
