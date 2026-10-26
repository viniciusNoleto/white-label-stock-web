import { Component, input } from '@angular/core';
import { BRAND_NAME } from '@/shared/constants/brand';

/** Logo (ícone do sistema, `public/icon.png` reduzido) + nome da marca. */
@Component({
  selector: 'app-brand-mark',
  host: { class: 'flex items-center gap-3' },
  template: `
    <img
      src="/icon-128.png"
      alt=""
      width="32"
      height="32"
      class="size-8 shrink-0 rounded-lg shadow-sm shadow-primary-200 dark:shadow-none"
    />

    @if (showName()) {
      <span class="font-semibold text-[15.5px] text-gray-900 dark:text-gray-100">
        {{ brandName }}
      </span>
    }
  `,
})
export class BrandMark {
  readonly showName = input(true);

  protected readonly brandName = BRAND_NAME;
}
