import { Component, computed, inject, input, model, type OnInit } from '@angular/core';
import { FormMultiSelect } from '@/components/form/MultiSelect';
import { I18n } from '@/libs/i18n';
import { getItemsService } from '@/resources/item/services/getItems';
import { formatISODate } from '@/utils/date';
import { createQuery } from '@/utils/query';
import { TranslatePipe } from '@/utils/translate.pipe';
import { MAX_PER_PAGE } from '@/shared/constants/pagination';

/**
 * Escolha item por item de um produto atômico (no lugar do FEFO). Lista só o que pode ir no
 * pacote: dentro da validade e livre — fora de outros pacotes pendentes. Os itens que o próprio
 * pacote já separou (`ownItemIds`, na edição) contam como livres. Ordem: vence primeiro.
 * A escolha só é válida com exatamente `quantity` itens.
 */
@Component({
  selector: 'app-delivery-package-item-picker',
  imports: [FormMultiSelect, TranslatePipe],
  host: { class: 'block' },
  template: `
    <app-form-multi-select
      valueField="id"
      labelField="label"
      [label]="'forms.deliveryPackage.items.pickLabel' | t: { selected: itemIds().length, count: quantity() ?? 0 }"
      [placeholder]="(itemsQuery.isFetching() ? 'forms.deliveryPackage.items.pickLoading' : 'forms.deliveryPackage.items.pickPlaceholder') | t"
      [data]="options()"
      [value]="itemIds()"
      (valueChange)="itemIds.set($any($event))"
    />
  `,
})
export class DeliveryPackageItemPicker implements OnInit {
  private readonly i18n = inject(I18n);

  readonly productId = input.required<number>();
  /** Quantos itens precisam ser escolhidos (a quantidade do produto no pacote). */
  readonly quantity = input<number | null>(null);
  readonly ownItemIds = input<readonly number[]>([]);
  readonly itemIds = model.required<number[]>();

  // Depende do `productId` (input): só busca depois que os inputs chegam.
  protected readonly itemsQuery = createQuery({
    enabled: false,
    queryFn: () => getItemsService({ query: { product_id: this.productId(), expiration: 'valid', per_page: MAX_PER_PAGE } }),
  });

  protected readonly options = computed(() => {
    const own = new Set(this.ownItemIds());
    const items = this.itemsQuery.data()?.data.items ?? [];

    return items
      .filter((item) => +item.reserved_quantity === 0 || own.has(item.id))
      .map((item) => ({
        id: item.id,
        label: item.expires_at
          ? this.i18n.t('forms.deliveryPackage.items.pickOption', { code: item.code, date: formatISODate(item.expires_at, this.i18n.language()) })
          : this.i18n.t('forms.deliveryPackage.items.pickOptionNoExpiration', { code: item.code }),
      }));
  });

  ngOnInit() {
    this.itemsQuery.refetch();
  }
}
