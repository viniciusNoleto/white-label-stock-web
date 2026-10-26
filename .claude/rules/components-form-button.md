# FormButton (`appButton`)

`import { FormButton } from '@/components/form/Button';`

## Interface

```ts
// <button appButton> ou <a appButton>
variant = input<'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'>('default');
size = input<'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'>('default');
type = input<'button' | 'submit' | 'reset'>('button');
label = input<string>();       // alternativa ao conteúdo projetado
icon = input<string>();        // ícone central (botão só de ícone: use size="icon…")
leftIcon = input<string>();
rightIcon = input<string>();
loading = input(false);        // mostra spinner e desabilita
disabled = input(false);
```

Ícones são nomes registrados em `src/libs/icons.ts` (`lucidePlus`, `lucideTrash2`…). Ícone novo → importe e registre lá.

## Equivalências com o Mantine

| Mantine (antes) | Agora |
|---|---|
| `color="primary"` (filled) | `variant="default"` (padrão) |
| `variant="subtle" color="gray"` | `variant="ghost"` |
| `color="red"` | `variant="destructive"` |
| `variant="default"`/`outline` | `variant="outline"` |
| `tooltip="…"` | `hlmTooltip="…"` no mesmo elemento (`HlmTooltip` de `@spartan-ng/helm/tooltip`) |

## Padrões corretos

```html
<button
  appButton
  leftIcon="lucidePlus"
  (click)="openCreateUnitModal()"
>
  {{ 'inventory.actions.newUnit' | t }}
</button>

<button
  appButton
  variant="ghost"
  size="icon-sm"
  icon="lucideX"
  [attr.aria-label]="'forms.inventoryItem.components.remove' | t"
  [hlmTooltip]="'forms.inventoryItem.components.remove' | t"
  (click)="removeComponent(component.id)"
></button>
```

Botão só de ícone **sempre** com `aria-label`.
