import { effect, inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { type RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { I18n } from '@/libs/i18n';
import { BRAND_NAME } from '@/utils/brand';

/**
 * `title` das rotas é uma chave de tradução: vira "Título | {APP_NAME}" e
 * acompanha a troca de idioma.
 */
@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly i18n = inject(I18n);
  private readonly brandName = inject(BRAND_NAME);

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
    this.title.setTitle(key ? `${this.i18n.t(key)} | ${this.brandName}` : this.brandName);
  }
}
