import { booleanAttribute, Component, computed, HOST_TAG_NAME, inject, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { buttonVariants, type ButtonVariants } from '@spartan-ng/helm/button';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { classes } from '@spartan-ng/helm/utils';

/**
 * `<button appButton>` — botão do Spartan com `loading`, ícones por nome
 * (`leftIcon="lucidePlus"`) e `label`. Tooltip: some `hlmTooltip="…"` no
 * mesmo elemento.
 *
 * `type` padrão é `button`: só submete o form com `type="submit"`.
 */
@Component({
  selector: 'button[appButton], a[appButton]',
  imports: [NgIcon, HlmSpinner],
  host: {
    'data-slot': 'button',
    '[attr.type]': 'isAnchor ? null : type()',
    '[attr.disabled]': '!isAnchor && isDisabled() || null',
    '[attr.data-disabled]': 'isDisabled() || null',
    '[attr.aria-disabled]': 'isAnchor && isDisabled() || null',
    '[attr.aria-busy]': 'loading() || null',
    '[attr.tabindex]': 'isAnchor && isDisabled() ? -1 : null',
  },
  template: `
    @if (loading()) {
      <hlm-spinner aria-label="" />
    } @else if (leftIcon()) {
      <ng-icon
        [name]="leftIcon()!"
        data-icon="inline-start"
      />
    }

    @if (icon() && !loading()) {
      <ng-icon [name]="icon()!" />
    }

    @if (label()) {
      {{ label() }}
    }

    <ng-content />

    @if (rightIcon()) {
      <ng-icon
        [name]="rightIcon()!"
        data-icon="inline-end"
      />
    }
  `,
})
export class FormButton {
  protected readonly isAnchor = inject(HOST_TAG_NAME) === 'a';

  readonly variant = input<ButtonVariants['variant']>('default');
  readonly size = input<ButtonVariants['size']>('default');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly label = input<string>();
  /** Ícone central — para botões só de ícone (use `size="icon"`). */
  readonly icon = input<string>();
  readonly leftIcon = input<string>();
  readonly rightIcon = input<string>();
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly isDisabled = computed(() => this.disabled() || this.loading());

  constructor() {
    classes(() => ['cursor-pointer', buttonVariants({ variant: this.variant(), size: this.size() })]);
  }
}
