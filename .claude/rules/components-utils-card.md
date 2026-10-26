# Diretiva UtilsCard (`appCard`)

`import { UtilsCard } from '@/components/utils/Card';`

## Interface

```ts
// <section appCard> (qualquer elemento)
noPadding = input(false);
noBorder = input(false);
background = input('bg-white dark:bg-neutral-900'); // troque para cards translúcidos
```

## Estilo padrão (já aplicado)

```
block rounded-2xl shadow-sm dark:shadow-none p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900
```

Não repita essas classes — use `class` só para somar ou sobrescrever (as classes do elemento vencem as padrão).

## Padrões corretos

```html
<section
  appCard
  class="flex flex-col gap-6"
>
  …
</section>

<!-- login: card translúcido sobre o WavesBackground -->
<section
  appCard
  background="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm"
  class="w-full max-w-md p-8 sm:p-10"
>
```
