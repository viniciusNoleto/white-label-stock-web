# Padrões de template Angular (obrigatórios)

Vale para todo `template:` de componente (`.ts`). Templates ficam inline no componente.

## Regra 1 — Atributos em linhas separadas

Tag com **mais de um atributo/binding** → um por linha, com `>` ou `/>` em linha própria.

```html
<!-- ✅ Correto -->
<app-form-text-input
  [label]="'forms.unit.name.label' | t"
  [formField]="form.field.name"
  withAsterisk
/>

<!-- ✅ Exceção: um único atributo pode ficar na mesma linha -->
<section appCard>

<!-- ❌ Errado -->
<button appButton variant="ghost" (click)="cancel.emit()">
```

## Regra 2 — Texto sempre em linha própria

```html
<!-- ✅ Correto -->
<h1 class="text-2xl font-bold">
  {{ 'units.page.title' | t }}
</h1>

<!-- ❌ Errado -->
<h1 class="text-2xl font-bold">{{ 'units.page.title' | t }}</h1>
```

## Regra 3 — Linha em branco entre nós irmãos

Elementos irmãos (inclusive blocos `@if`/`@for`/`@let`) separados por **uma** linha em branco. Nunca linha em branco logo após a abertura nem antes do fechamento do pai.

## Controle de fluxo — substitui `UtilsIf`/`UtilsFor` do React

| React (antes) | Angular (agora) |
|---|---|
| `<UtilsIf condition={x}>{() => …}</UtilsIf>` | `@if (x) { … }` |
| `<UtilsIf cases={[…]} />` | `@if (a) { … } @else if (b) { … } @else { … }` |
| `<UtilsFor each={items} eachKey={…} empty={…}>` | `@for (item of items(); track item.id) { … } @empty { … }` |
| `useMemo` | `computed()` |
| variável local de render | `@let nome = expr;` |

- `@for` **sempre** com `track` por id estável (`track item.id`); use `$index` só para listas de primitivos.
- Nunca use `*ngIf`, `*ngFor`, `ngClass`, `ngStyle` — use control flow e bindings `[class.x]`/`[style.x]`.
- Em elementos com diretiva Spartan (`hlmInput`, `hlmBadge`…) **não** use `[class]="..."` (sobrescreve as classes da diretiva): use `[class.nome]="cond"` ou `class="..."` estático.

## Texto traduzido

Todo texto visível passa pelo pipe `t` (`TranslatePipe`), nunca string fixa:

```html
{{ 'storages.delete.confirm' | t: { name: storageName() } }}
```

## Componentes

- Standalone, sem `standalone: true`, sem `changeDetection` (OnPush é o padrão no v22).
- `input()`, `output()`, `model()`, `computed()`, `signal()` — nunca decorators `@Input/@Output`.
- Bindings de host no objeto `host` do decorator (nunca `@HostBinding/@HostListener`).
- Serviços singleton com `@Service()`; dependências via `inject()`.
