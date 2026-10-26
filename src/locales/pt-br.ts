import type enUs from './en-us'

export default {
  language: {
    label: 'Idioma',
    'pt-br': 'Português (Brasil)',
    'es-mx': 'Español (México)',
    'en-us': 'English (US)',
  },

  common: {
    actions: {
      save: 'Salvar',
      cancel: 'Cancelar',
      close: 'Fechar',
      edit: 'Editar',
      delete: 'Excluir',
    },
    table: {
      emptyDefault: 'Nenhum dado encontrado',
      actionsColumn: 'Ações',
    },
    notifications: {
      errorTitle: 'Erro',
    },
    pagination: {
      previous: 'Anterior',
      next: 'Próxima',
      label: 'Paginação',
    },
  },

  errorBoundary: {
    title: 'Algo deu errado.',
    description: 'Recarregue a página ou entre em contato com o suporte.',
  },

  home: {
    subtitle: 'Sistema genérico de controle de estoque e inventário',
    description: 'Gerencie seu inventário de forma simples e eficiente. Cadastre itens, organize por categorias, controle quantidades e construa produtos compostos a partir de seus componentes — tudo em um só lugar.',
    ctaPrimary: 'Acessar Inventário',
    ctaSecondary: 'Saiba mais',
    features: {
      categories: {
        title: 'Categorias',
        description: 'Organize seus itens em categorias com cores personalizadas.',
      },
      stock: {
        title: 'Controle de estoque',
        description: 'Edite quantidades diretamente na tabela com precisão decimal.',
      },
      build: {
        title: 'Construção',
        description: 'Construa itens compostos consumindo seus componentes automaticamente.',
      },
    },
  },

  header: {
    menu: 'Menu',
    logout: 'Sair',
    breadcrumb: 'Navegação estrutural',
    userMenu: 'Menu do usuário',
    colorScheme: {
      label: 'Aparência',
      light: 'Claro',
      dark: 'Escuro',
      auto: 'Sistema',
    },
  },

  footer: {
    createdBy: 'Criado por',
  },

  notFound: {
    title: 'Página não encontrada',
    description: 'O endereço acessado não existe ou foi movido.',
    back: 'Voltar ao início',
  },

  flow: {
    label: 'Fluxo do estoque',
    receiving: 'Recebimento',
    storage: 'Armazenagem',
    production: 'Produção',
    shipping: 'Expedição',
  },

  auth: {
    login: {
      showcase: {
        eyebrow: 'Estoque · Produção · Logística',
        title: 'Cada item no lugar certo, cada movimento registrado.',
        description: 'Do recebimento à expedição: organize locais de armazenagem, controle quantidades e transforme componentes em produtos acabados.',
      },
      title: 'Entrar',
      subtitle: 'Acesse sua conta para gerenciar o inventário',
      email: {
        label: 'E-mail',
        placeholder: 'seu@email.com',
      },
      password: {
        label: 'Senha',
        placeholder: 'Digite sua senha',
      },
      submit: 'Entrar',
      validation: {
        emailRequired: 'E-mail é obrigatório',
        emailInvalid: 'E-mail inválido',
        passwordRequired: 'Senha é obrigatória',
      },
      notifications: {
        error: 'Não foi possível entrar. Tente novamente.',
      },
    },
    sessionExpired: 'Sua sessão expirou. Entre novamente.',
  },

  sidebar: {
    section: 'Inventário',
    items: 'Itens',
    categories: 'Categorias',
    units: 'Unidades',
    storages: 'Armazenamentos',
  },

  units: {
    page: {
      title: 'Unidades',
      subtitle: 'Gerencie as unidades de medida',
    },
    table: {
      columns: {
        name: 'Nome',
        abbreviation: 'Abreviação',
      },
      empty: 'Nenhuma unidade cadastrada. Crie a primeira clicando em \'Nova Unidade\'.',
    },
    delete: {
      confirm: 'Tem certeza que deseja excluir a unidade "{{name}}"? Esta ação não pode ser desfeita.',
    },
  },

  categories: {
    page: {
      title: 'Categorias',
      subtitle: 'Gerencie as categorias de itens',
    },
    table: {
      columns: {
        name: 'Nome',
        color: 'Cor',
      },
      empty: 'Nenhuma categoria cadastrada. Crie a primeira clicando em \'Nova Categoria\'.',
    },
    actions: {
      edit: 'Editar categoria',
      delete: 'Excluir categoria',
    },
    delete: {
      confirm: 'Tem certeza que deseja excluir a categoria "{{name}}"? Esta ação não pode ser desfeita.',
    },
  },

  storages: {
    page: {
      title: 'Armazenamentos',
      subtitle: 'Gerencie os locais de armazenamento',
    },
    table: {
      columns: {
        name: 'Nome',
        description: 'Descrição',
      },
      empty: 'Nenhum armazenamento cadastrado. Crie o primeiro clicando em \'Novo Armazenamento\'.',
    },
    actions: {
      new: 'Novo Armazenamento',
      edit: 'Editar armazenamento',
      delete: 'Excluir armazenamento',
    },
    modals: {
      create: 'Novo Armazenamento',
      update: 'Editar Armazenamento',
      delete: 'Excluir Armazenamento',
    },
    delete: {
      confirm: 'Tem certeza que deseja excluir o armazenamento "{{name}}"? Esta ação não pode ser desfeita.',
    },
  },

  inventory: {
    page: {
      title: 'Itens',
      subtitle: 'Gerencie seus itens de estoque',
    },
    actions: {
      newUnit: 'Nova Unidade',
      newCategory: 'Nova Categoria',
      newItem: 'Novo Item',
    },
    search: {
      placeholder: 'Buscar por nome...',
    },
    table: {
      columns: {
        name: 'Nome',
        categories: 'Categorias',
        quantity: 'Quantidade',
        unit: 'Unidade',
        storage: 'Armazenamento',
      },
      empty: 'Nenhum item encontrado. Crie o primeiro item clicando em \'Novo Item\'.',
    },
    rowActions: {
      editQuantity: 'Editar quantidade',
      editName: 'Editar nome',
      editStorage: 'Editar armazenamento',
      build: 'Construir',
    },
    modals: {
      createUnit: 'Nova Unidade',
      updateUnit: 'Editar Unidade',
      deleteUnit: 'Excluir Unidade',
      createCategory: 'Nova Categoria',
      updateCategory: 'Editar Categoria',
      deleteCategory: 'Excluir Categoria',
      createItem: 'Novo Item de Inventário',
      updateQuantity: 'Editar Quantidade',
      updateName: 'Editar Nome',
      updateStorage: 'Editar Armazenamento',
      build: 'Construir: {{name}}',
    },
  },

  forms: {
    password: {
      show: 'Mostrar senha',
      hide: 'Ocultar senha',
    },

    color: {
      swatches: 'Cores sugeridas',
    },

    select: {
      clear: 'Limpar seleção',
      empty: 'Nenhuma opção encontrada',
    },

    unit: {
      name: {
        label: 'Nome',
        placeholder: 'Digite um nome',
      },
      abbreviation: {
        label: 'Abreviação',
        placeholder: 'Digite uma abreviação',
      },
      validation: {
        nameRequired: 'Nome é obrigatório',
        abbreviationRequired: 'Abreviação é obrigatória',
      },
    },

    category: {
      name: {
        label: 'Nome',
        placeholder: 'Digite um nome',
      },
      color: {
        label: 'Cor',
        placeholder: 'Digite um código de cor',
      },
      validation: {
        nameRequired: 'Nome é obrigatório',
        colorRequired: 'Cor é obrigatória',
      },
    },

    storage: {
      name: {
        label: 'Nome',
        placeholder: 'Digite um nome',
      },
      description: {
        label: 'Descrição',
        placeholder: 'Descreva este local de armazenamento',
      },
      validation: {
        nameRequired: 'Nome é obrigatório',
      },
    },

    inventoryItem: {
      name: {
        label: 'Nome',
        placeholder: 'Digite um nome',
      },
      unit: {
        label: 'Unidade',
        placeholder: 'Selecione uma unidade',
      },
      quantity: {
        label: 'Quantidade inicial',
        placeholder: 'Digite uma quantidade',
      },
      categories: {
        label: 'Categorias',
        placeholder: 'Selecione as categorias',
      },
      storage: {
        label: 'Armazenamento',
        placeholder: 'Selecione um local de armazenamento (opcional)',
      },
      components: {
        label: 'Componentes',
        selectPlaceholder: 'Selecione um item',
        qtyPlaceholder: 'Digite uma quantidade',
        empty: 'Nenhum componente adicionado.',
        add: 'Adicionar componente',
        remove: 'Remover componente',
      },
      validation: {
        nameRequired: 'Nome é obrigatório',
        unitRequired: 'Unidade é obrigatória',
      },
    },

    updateQuantity: {
      description: 'Defina a nova quantidade para "{{name}}".',
      mode: {
        set: 'Definir valor',
        add: 'Somar',
        subtract: 'Subtrair',
      },
      quantity: {
        label: 'Nova quantidade',
        placeholder: 'Digite um valor',
      },
      amount: {
        label: 'Valor',
        placeholder: 'Digite um valor',
      },
      preview: 'Nova quantidade: {{count}}',
      validation: {
        required: 'Quantidade é obrigatória',
        min: 'Quantidade não pode ser negativa',
      },
    },

    build: {
      noComponentsMessage: 'Este item não possui componentes cadastrados. Adicione componentes ao criar ou editar o item.',
      requiredComponentsLabel: 'Componentes necessários por unidade',
      requiredLabel: 'Necessário: {{count}}',
      availableLabel: 'Disponível: {{count}}',
      maxPossibleLabel: 'Máx. possível: {{count}}',
      quantity: {
        label: 'Quantidade a construir',
        placeholder: 'Digite uma quantidade',
      },
      submit: 'Construir',
      validation: {
        required: 'Quantidade é obrigatória',
        min: 'Mínimo de 1 unidade',
      },
    },
  },

  notifications: {
    errors: {
      createUnit: 'Não foi possível criar a unidade. Tente novamente.',
      updateUnit: 'Não foi possível atualizar a unidade. Tente novamente.',
      deleteUnit: 'Não foi possível excluir a unidade. Tente novamente.',
      createCategory: 'Não foi possível criar a categoria. Tente novamente.',
      updateCategory: 'Não foi possível atualizar a categoria. Tente novamente.',
      deleteCategory: 'Não foi possível excluir a categoria. Tente novamente.',
      createItem: 'Não foi possível criar o item. Tente novamente.',
      updateQuantity: 'Não foi possível atualizar a quantidade.',
      updateItemName: 'Não foi possível atualizar o nome. Tente novamente.',
      updateItemStorage: 'Não foi possível atualizar o armazenamento. Tente novamente.',
      build: 'Não foi possível construir o item.',
      createStorage: 'Não foi possível criar o armazenamento. Tente novamente.',
      updateStorage: 'Não foi possível atualizar o armazenamento. Tente novamente.',
      deleteStorage: 'Não foi possível excluir o armazenamento. Tente novamente.',
    },
  },
} as typeof enUs;
