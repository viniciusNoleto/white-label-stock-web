# Layout de formulários — `form-grid`

`.form-grid` (em `src/styles.css`) = `grid grid-cols-12 gap-6`.

## Regras

- Todo layout de campos em grid dentro de um formulário (modais incluídas) usa `class="form-grid"`. Nunca crie grids ad-hoc.
- **Nunca altere as colunas da grid.** A responsividade é controlada só pelo span de cada campo: `col-span-12`, `sm:col-span-6`…
- Todo filho direto da grid declara seu span explicitamente — inclusive `col-span-12`.
- Formulários pequenos (modais `sm`/`md`, poucos campos): um campo por linha (`col-span-12`).
- Lado a lado (`col-span-12 sm:col-span-6`) só em formulários grandes (modal `lg`/`xl`) ou para campos curtos e relacionados.
- Campos longos (textarea, multi-select, blocos agrupados) são sempre `col-span-12`.

```html
<div class="form-grid">
  <app-form-select
    class="col-span-12 sm:col-span-6"
    …
  />

  <app-form-number-input
    class="col-span-12 sm:col-span-6"
    …
  />

  <app-form-multi-select
    class="col-span-12"
    …
  />
</div>
```
