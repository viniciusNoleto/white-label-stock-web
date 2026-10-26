import { effect, inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { type RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { I18n } from '@/libs/i18n';
import { BRAND_NAME } from '@/shared/constants/brand';

/**
 * `title` das rotas é uma chave de tradução: vira "Título | StockFlow" e
 * acompanha a troca de idioma.
 */
@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly i18n = inject(I18n);

  private titleKey: string | undefined;

  constructor() {
    super();

    effect(() => {
      this.i18n.language();
      this.apply();
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot) {
    this.titleKey = this.buildTitle(snapshot);
    this.apply();
  }

  private apply() {
    const key = this.titleKey;
    this.title.setTitle(key ? `${this.i18n.t(key)} | ${BRAND_NAME}` : BRAND_NAME);
  }
}
