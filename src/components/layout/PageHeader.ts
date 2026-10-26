import { Component, input } from '@angular/core';

/** Título + subtítulo da página, com slot à direita para ações (`<ng-content />`). */
@Component({
  selector: 'app-page-header',
  host: { class: 'flex flex-wrap items-center justify-between gap-4' },
  template: `
    <div class="flex flex-col gap-1">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {{ title() }}
      </h1>

      @if (subtitle()) {
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ subtitle() }}
        </p>
      }
    </div>

    <ng-content />
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
