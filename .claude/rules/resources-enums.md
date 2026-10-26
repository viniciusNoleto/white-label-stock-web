# Resources — Enums

Ficam em `src/resources/{recurso}/enums/{Nome}.ts`, um arquivo por enum.

Todo conjunto fixo de slugs (enviados/recebidos da API ou usados em lógica, como modos de um formulário) vira **string enum** com prefixo `E`:

```ts
export enum EQuantityMode {
  SET = 'set',
  ADD = 'add',
  SUBTRACT = 'subtract',
}
```

- Chave em UPPER_SNAKE_CASE; valor = slug exato.
- Não crie enum para unions de tipos complexos ou que misturam strings com outros primitivos.
- No template, exponha o enum no componente (`protected readonly modes = EQuantityMode;`).
