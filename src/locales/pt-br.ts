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
    deliveries: 'Entregas',
    groups: {
      operation: 'Operação',
      registry: 'Cadastros',
    },
  },

  units: {
    page: {
      title: 'Unidades',
      subtitle: 'Gerencie as unidades de medida',
    },
    table: {
      count_one: '{{count}} unidade',
      count_other: '{{count}} unidades',
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
      count_one: '{{count}} categoria',
      count_other: '{{count}} categorias',
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
      count_one: '{{count}} local',
      count_other: '{{count}} locais',
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
      count_one: '{{count}} item',
      count_other: '{{count}} itens',
      columns: {
        name: 'Nome',
        categories: 'Categorias',
        quantity: 'Quantidade',
        unit: 'Unidade',
        storage: 'Armazenamento',
        packaged: 'Empacotado',
      },
      empty: 'Nenhum item encontrado. Crie o primeiro item clicando em \'Novo Item\'.',
      packagedHint: 'Quantidade separada em pacotes de entrega pendentes',
    },
    rowActions: {
      editQuantity: 'Editar quantidade',
      adjustStock: 'Ajustar estoque',
      editItem: 'Editar item',
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
      updateItem: 'Editar Item',
      updateStorage: 'Editar Armazenamento',
      build: 'Construir: {{name}}',
    },
  },

  deliveries: {
    page: {
      title: 'Entregas',
      subtitle: 'Monte pacotes com itens do estoque e registre as entregas',
    },
    actions: {
      new: 'Novo Pacote',
    },
    filters: {
      pending: 'Pendentes',
      delivered: 'Entregues',
      all: 'Todos',
    },
    table: {
      count_one: '{{count}} pacote',
      count_other: '{{count}} pacotes',
      columns: {
        package: 'Pacote',
        items: 'Itens',
        notes: 'Anotações',
        status: 'Situação',
      },
      packageNumber: 'Pacote #{{id}}',
      empty: 'Nenhum pacote encontrado. Crie o primeiro clicando em \'Novo Pacote\'.',
    },
    status: {
      pending: 'Pendente',
      delivered: 'Entregue',
    },
    rowActions: {
      deliver: 'Marcar como entregue',
      edit: 'Editar pacote',
      delete: 'Excluir pacote',
    },
    modals: {
      create: 'Novo Pacote de Entrega',
      update: 'Editar Pacote #{{id}}',
      deliver: 'Entregar Pacote #{{id}}',
      delete: 'Excluir Pacote',
    },
    deliver: {
      confirm: 'Ao confirmar, estes itens serão subtraídos do estoque:',
      inStock: 'Em estoque: {{count}}',
      shortage: 'Não há estoque suficiente para algum item. Ajuste o estoque ou edite o pacote antes de entregar.',
      submit: 'Confirmar entrega',
    },
    delete: {
      confirmPending: 'Tem certeza que deseja excluir o pacote #{{id}}? Os itens deixam de ficar separados e continuam no estoque.',
      confirmDelivered: 'Tem certeza que deseja excluir o pacote #{{id}} do histórico? Os itens entregues não voltam para o estoque.',
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
      description: {
        set: 'Defina a nova quantidade de "{{name}}".',
        add: 'Informe quanto entrou no estoque de "{{name}}".',
        subtract: 'Informe quanto saiu do estoque de "{{name}}".',
      },
      current: 'Quantidade atual: {{count}}',
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
        positive: 'Valor deve ser maior que zero',
        max: 'Não é possível subtrair mais que o estoque atual ({{count}})',
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

    deliveryPackage: {
      items: {
        label: 'Itens do pacote',
        selectPlaceholder: 'Selecione um item',
        qtyPlaceholder: 'Quantidade',
        add: 'Adicionar item',
        remove: 'Remover item',
        empty: 'Nenhum item adicionado.',
        free: 'Livre: {{count}} {{unit}}',
        quantityOf: 'Quantidade de {{name}}',
      },
      notes: {
        label: 'Anotações',
        placeholder: 'Endereço, cliente, horário, forma de pagamento...',
      },
      validation: {
        itemsRequired: 'Adicione ao menos um item ao pacote',
        quantityPositive: 'Cada item precisa de uma quantidade maior que zero',
        notesMax: 'As anotações podem ter no máximo {{count}} caracteres',
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
      updateItem: 'Não foi possível atualizar o item. Tente novamente.',
      updateItemStorage: 'Não foi possível atualizar o armazenamento. Tente novamente.',
      build: 'Não foi possível construir o item.',
      createStorage: 'Não foi possível criar o armazenamento. Tente novamente.',
      updateStorage: 'Não foi possível atualizar o armazenamento. Tente novamente.',
      deleteStorage: 'Não foi possível excluir o armazenamento. Tente novamente.',
      createDeliveryPackage: 'Não foi possível criar o pacote. Tente novamente.',
      updateDeliveryPackage: 'Não foi possível atualizar o pacote. Tente novamente.',
      deleteDeliveryPackage: 'Não foi possível excluir o pacote. Tente novamente.',
      deliverDeliveryPackage: 'Não foi possível entregar o pacote.',
    },
  },
} as typeof enUs;
