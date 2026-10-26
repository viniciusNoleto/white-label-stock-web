import { Component } from '@angular/core';
import { AUTHOR_LINKEDIN_URL, AUTHOR_NAME } from '@/shared/constants/brand';
import { TranslatePipe } from '@/utils/translate.pipe';

/**
 * Crédito obrigatório da licença — deve ficar visível em todas as telas.
 */
@Component({
  selector: 'app-attribution-footer',
  imports: [TranslatePipe],
  template: `
    <footer class="flex items-center justify-center py-4 px-6 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 bg-stone-50/80 dark:bg-neutral-950/80 backdrop-blur-sm">
      <span>
        {{ 'footer.createdBy' | t }}

        <a
          class="underline hover:text-gray-700 dark:hover:text-gray-200"
          target="_blank"
          rel="noopener noreferrer"
          [href]="authorUrl"
        >
          {{ authorName }}
        </a>
      </span>
    </footer>
  `,
})
export class AttributionFooter {
  protected readonly authorUrl = AUTHOR_LINKEDIN_URL;
  protected readonly authorName = AUTHOR_NAME;
}
