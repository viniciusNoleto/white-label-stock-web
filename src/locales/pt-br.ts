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
    loading: 'Carregando…',
    table: {
      emptyDefault: 'Nenhum dado encontrado',
      actionsColumn: 'Ações',
      rowNumber: '#',
      rowNumberLabel: 'Número da linha',
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
      noAccount: 'Ainda não tem acesso?',
      requestAccess: 'Solicitar acesso',
      validation: {
        emailRequired: 'E-mail é obrigatório',
        emailInvalid: 'E-mail inválido',
        passwordRequired: 'Senha é obrigatória',
      },
      notifications: {
        error: 'Não foi possível entrar. Tente novamente.',
      },
    },
    register: {
      title: 'Solicitar acesso',
      subtitle: 'Envie seus dados: um administrador aprova o pedido antes do primeiro acesso',
      name: {
        label: 'Nome',
        placeholder: 'Seu nome completo',
      },
      password: {
        placeholder: 'Mínimo de {{min}} caracteres',
      },
      passwordConfirmation: {
        label: 'Confirmar senha',
        placeholder: 'Digite a senha novamente',
      },
      submit: 'Enviar pedido',
      hasAccount: 'Já tem acesso?',
      backToLogin: 'Voltar para o login',
      sent: {
        title: 'Pedido enviado',
        description: 'Seu pedido de acesso para {{email}} está na fila de aprovação. Assim que um administrador aprovar, é só entrar com o e-mail e a senha que você cadastrou.',
      },
      validation: {
        nameRequired: 'Nome é obrigatório',
        passwordMin: 'A senha deve ter pelo menos {{min}} caracteres',
        passwordConfirmationRequired: 'Confirme a senha',
        passwordMismatch: 'As senhas não conferem',
      },
      notifications: {
        error: 'Não foi possível enviar o pedido. Tente novamente.',
      },
    },
    sessionExpired: 'Sua sessão expirou. Entre novamente.',
  },

  sidebar: {
    dashboard: 'Painel',
    section: 'Inventário',
    stock: 'Operação',
    items: 'Itens',
    products: 'Produtos',
    categories: 'Categorias',
    units: 'Unidades',
    storages: 'Armazenamentos',
    deliveries: 'Entregas',
    movements: 'Movimentações',
    registrationRequests: 'Pedidos de cadastro',
    users: 'Usuários',
    groups: {
      operation: 'Estoque',
      registry: 'Cadastros',
      admin: 'Administração',
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

  users: {
    page: {
      title: 'Usuários',
      subtitle: 'Quem tem acesso ao sistema. Usuários comuns podem ser excluídos e perdem o acesso na hora.',
    },
    search: {
      placeholder: 'Buscar por nome ou e-mail...',
    },
    table: {
      count_one: '{{count}} usuário',
      count_other: '{{count}} usuários',
      columns: {
        name: 'Nome',
        email: 'E-mail',
        role: 'Perfil',
        createdAt: 'Desde',
      },
      empty: 'Nenhum usuário encontrado.',
    },
    roles: {
      admin: 'Administrador',
      user: 'Usuário',
    },
    modals: {
      delete: 'Excluir Usuário',
    },
    delete: {
      confirm: 'Tem certeza que deseja excluir "{{name}}"? A pessoa perde o acesso imediatamente e precisará pedir um novo cadastro.',
    },
  },

  registrationRequests: {
    page: {
      title: 'Pedidos de cadastro',
      subtitle: 'Pessoas que pediram acesso. Aprove para criar o usuário ou recuse para excluir o pedido.',
    },
    table: {
      count_one: '{{count}} pedido pendente',
      count_other: '{{count}} pedidos pendentes',
      columns: {
        requestedAt: 'Pedido em',
      },
      empty: 'Nenhum pedido de cadastro aguardando aprovação.',
    },
    actions: {
      approve: 'Aprovar',
      reject: 'Recusar',
    },
    modals: {
      approve: 'Aprovar Cadastro',
      reject: 'Recusar Cadastro',
    },
    approve: {
      confirm: 'Aprovar o acesso de "{{name}}" ({{email}})? A pessoa poderá entrar com a senha que cadastrou.',
    },
    reject: {
      confirm: 'Recusar o pedido de "{{name}}" ({{email}})? O pedido será excluído.',
    },
  },

  inventory: {
    actions: {
      newUnit: 'Nova Unidade',
      newCategory: 'Nova Categoria',
    },
    modals: {
      createUnit: 'Nova Unidade',
      updateUnit: 'Editar Unidade',
      deleteUnit: 'Excluir Unidade',
      createCategory: 'Nova Categoria',
      updateCategory: 'Editar Categoria',
      deleteCategory: 'Excluir Categoria',
    },
  },
  stock: {
    page: {
      title: 'Operação',
      subtitle: 'O estoque de relance: itens atômicos agrupados por produto, lotes a granel como estão',
    },
    search: {
      placeholder: 'Buscar por produto ou SKU...',
    },
    table: {
      count_one: '{{count}} linha',
      count_other: '{{count}} linhas',
      columns: {
        product: 'Produto',
        quantity: 'Quantidade',
        expiration: 'Próximo vencimento',
        storages: 'Armazenamento',
      },
      empty: 'Nada em estoque ainda. Gere itens a partir de um produto para começar.',
      units_one: '{{count}} item com código próprio',
      units_other: '{{count}} itens com código próprio',
      lot: 'Lote {{code}}',
      expiredCount: '{{count}} vencido(s)',
    },
    rowActions: {
      produce: 'Gerar itens',
      viewItems: 'Ver itens',
      viewExpiring: 'Ver os itens deste produto com este vencimento',
      viewInStorage: 'Ver os itens deste produto em {{name}}',
    },
    filters: {
      storage: 'Todos os armazenamentos',
      expiresAt: 'Data de vencimento',
    },
  },
  products: {
    page: {
      title: 'Produtos',
      subtitle: 'O modelo de cada item: unidade, receita e validade',
    },
    actions: {
      new: 'Novo Produto',
    },
    search: {
      placeholder: 'Buscar por nome ou SKU...',
    },
    table: {
      count_one: '{{count}} produto',
      count_other: '{{count}} produtos',
      columns: {
        name: 'Nome',
        mode: 'Controle',
        recipe: 'Receita (por unidade)',
        shelfLife: 'Validade',
        stock: 'Estoque',
      },
      empty: 'Nenhum produto encontrado. Crie o primeiro clicando em \'Novo Produto\'.',
      atomic: 'Atômico',
      bulk: 'A granel',
      shelfLifeDays_one: '{{count}} dia',
      shelfLifeDays_other: '{{count}} dias',
      noShelfLife: 'Não vence',
      reserved: '{{count}} reservado(s)',
    },
    rowActions: {
      produce: 'Gerar itens',
      viewItems: 'Ver itens',
      edit: 'Editar produto',
      delete: 'Excluir produto',
    },
    modals: {
      create: 'Novo Produto',
      update: 'Editar Produto',
      delete: 'Excluir Produto',
    },
    delete: {
      confirm: 'Tem certeza que deseja excluir o produto "{{name}}"? Esta ação não pode ser desfeita.',
    },
  },
  items: {
    page: {
      title: 'Itens',
      subtitle: 'Cada registro do estoque, com código, produção e validade',
    },
    actions: {
      new: 'Gerar Itens',
    },
    search: {
      placeholder: 'Buscar por código...',
    },
    filters: {
      product: 'Todos os produtos',
      expiration: {
        all: 'Todos',
        expiring: 'Vencendo',
        expired: 'Vencidos',
        date: 'Data',
      },
      byProduct: 'Filtrar por produto',
      byStorage: 'Filtrar por armazenamento',
      storage: 'Todos os armazenamentos',
      expiresAt: 'Data de vencimento',
    },
    table: {
      count_one: '{{count}} item',
      count_other: '{{count}} itens',
      columns: {
        code: 'Código',
        product: 'Produto',
        quantity: 'Quantidade',
        producedAt: 'Produção',
        expiresAt: 'Validade',
        storage: 'Armazenamento',
      },
      empty: 'Nenhum item encontrado. Gere itens clicando em \'Gerar Itens\'.',
      reserved: '{{count}} reservado(s)',
      reservedHint: 'Quantidade reservada em pacotes de entrega pendentes',
    },
    expiration: {
      expired: 'vencido',
      expiring: 'Vence em breve',
      valid: 'Dentro da validade',
      none: 'Não vence',
    },
    rowActions: {
      edit: 'Editar item',
      adjustStock: 'Ajustar quantidade',
      delete: 'Excluir item',
      movements: 'Ver movimentações',
    },
    modals: {
      create: 'Gerar Itens',
      update: 'Editar Item {{code}}',
      updateQuantity: 'Ajustar Quantidade',
      delete: 'Excluir Item',
    },
    delete: {
      confirm: 'Tirar o item "{{code}}" do estoque? Use para perdas, quebras ou vencidos.',
    },
  },

  dashboard: {
    page: {
      title: 'Painel',
      subtitle: 'O que pede ação agora e como foi o período',
      updatedAt: 'Atualizado às {{time}}',
      refresh: 'Atualizar o painel',
      error: 'Não foi possível carregar o painel.',
      retry: 'Tentar de novo',
    },
    period: {
      days_one: '{{count}} dia',
      days_other: '{{count}} dias',
    },
    trend: {
      vsPrevious: '{{percent}} vs. período anterior ({{previous}})',
      noBase: 'Período anterior: {{previous}}',
    },
    alerts: {
      packagesWithExpired_one: '{{count}} pacote pendente tem item que venceu depois de separado: a entrega vai falhar. Troque o item.',
      packagesWithExpired_other: '{{count}} pacotes pendentes têm item que venceu depois de separado: a entrega vai falhar. Troque os itens.',
      outOfStock_one: '{{count}} produto com saída no período está sem estoque livre.',
      outOfStock_other: '{{count}} produtos com saída no período estão sem estoque livre.',
      expired_one: '{{count}} item vencido ainda está no estoque: dê baixa.',
      expired_other: '{{count}} itens vencidos ainda estão no estoque: dê baixa.',
    },
    kpis: {
      items: 'Itens em estoque',
      itemsDetail: '{{inStock}} de {{total}} produtos com estoque',
      expiring: 'Vencendo em 7 dias',
      expiringDetail_one: '{{count}} item já vencido',
      expiringDetail_other: '{{count}} itens já vencidos',
      pending: 'Pacotes pendentes',
      pendingSince: 'Mais antigo: {{date}}',
      pendingNone: 'Nenhum aguardando entrega',
      delivered: 'Pacotes entregues',
      losses: 'Baixas',
      inPeriod_one: 'No último dia',
      inPeriod_other: 'Nos últimos {{count}} dias',
    },
    columns: {
      product: 'Produto',
      quantity: 'Quantidade',
    },
    activity: {
      title: 'Atividade do estoque',
      subtitle: 'Movimentações por dia, de {{from}} a {{to}}',
      ariaLabel: 'Gráfico de linhas com as entradas, saídas e baixas de cada um dos {{days}} dias',
      focusHint: 'Use as setas para ver cada dia',
      showTable: 'Ver como tabela',
      date: 'Dia',
      series: {
        inflow: 'Entradas',
        outflow: 'Saídas',
        losses: 'Baixas',
      },
    },
    restock: {
      title: 'Reposição',
      subtitle: 'Quanto o estoque livre aguenta no ritmo de saída dos últimos {{days}} dias',
      empty: 'Nenhum produto teve saída no período.',
      coverageNone: 'Acabou',
      coverageDays: '{{days}} dias',
      columns: {
        free: 'Livre',
        dailyOutflow: 'Saída/dia',
        coverage: 'Dura',
      },
    },
    expiration: {
      title: 'Vencimentos',
      subtitle: 'Vencidos para dar baixa e o que vence em até 7 dias para sair primeiro',
      empty: 'Nada vencido nem vencendo nos próximos 7 dias.',
      columns: {
        expired: 'Vencido',
        expiring: 'Vencendo',
        next: 'Vence em',
      },
    },
    topDelivered: {
      title: 'Mais entregues',
      subtitle: 'Produtos em mais pacotes nos últimos {{days}} dias',
      empty: 'Nenhuma entrega no período.',
      columns: {
        packages: 'Pacotes',
      },
    },
    losses: {
      title: 'Perdas',
      subtitle: 'Baixas dos últimos {{days}} dias por motivo e por produto',
      empty: 'Nenhuma baixa no período.',
      expiredShare_one: '({{count}} por vencimento)',
      expiredShare_other: '({{count}} por vencimento)',
      columns: {
        writeOffs: 'Baixas',
      },
    },
  },

  movements: {
    page: {
      title: 'Movimentações',
      subtitle: 'Tudo o que entrou, saiu ou mudou de lugar no estoque, item por item',
    },
    search: {
      placeholder: 'Buscar por código ou produto...',
    },
    filters: {
      type: 'Todos os tipos',
      product: 'Todos os produtos',
      storage: 'Todos os armazenamentos',
      period: 'Período',
      dateFrom: 'Data inicial',
      dateTo: 'Data final',
    },
    types: {
      entry: 'Entrada',
      production: 'Produção',
      consumption: 'Consumo',
      adjustment: 'Ajuste',
      transfer: 'Transferência',
      delivery: 'Entrega',
      write_off: 'Baixa',
    },
    reasons: {
      expired: 'Vencimento',
      damaged: 'Avaria',
      lost: 'Extravio',
      other: 'Outro',
      none: 'Sem motivo',
    },
    table: {
      count_one: '{{count}} movimentação',
      count_other: '{{count}} movimentações',
      empty: 'Nenhuma movimentação encontrada',
      columns: {
        date: 'Data',
        type: 'Tipo',
        item: 'Item',
        product: 'Produto',
        quantity: 'Quantidade',
        balance: 'Saldo do item',
        storage: 'Armazenamento',
        user: 'Usuário',
      },
      package: 'Pacote #{{id}}',
      openItem: 'Abrir na lista de itens',
      itemGone: 'Este item já saiu do estoque',
      noStorage: 'Sem armazenamento',
      to: 'para',
    },
  },

  deliveries: {
    page: {
      title: 'Entregas',
      subtitle: 'Monte pacotes de produtos, veja quais itens separar e registre as entregas',
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
      delete: 'Desfazer pacote',
    },
    modals: {
      create: 'Novo Pacote de Entrega',
      update: 'Editar Pacote #{{id}}',
      deliver: 'Entregar Pacote #{{id}}',
      delete: 'Desfazer Pacote',
    },
    deliver: {
      confirm: 'Ao confirmar, estes itens saem do estoque:',
      pick: 'Separar: {{codes}}',
      inStock: 'Em estoque: {{count}}',
      shortage: 'Não há estoque suficiente para algum item. Ajuste o estoque ou edite o pacote antes de entregar.',
      submit: 'Confirmar entrega',
    },
    delete: {
      submit: 'Desfazer',
      confirmPending: 'Tem certeza que deseja desfazer o pacote #{{id}}? Os itens deixam de ficar separados e continuam no estoque.',
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

    product: {
      name: {
        label: 'Nome',
        placeholder: 'Ex.: Armário modelo A',
      },
      sku: {
        label: 'SKU',
        placeholder: 'Ex.: ARM-A',
      },
      mode: {
        label: 'Controle',
        atomic: 'Atômico',
        bulk: 'A granel',
        atomicDescription: 'Cada unidade é um item com código próprio (um armário, um bolo).',
        bulkDescription: 'Cada item é um lote com uma quantidade (parafusos, farinha).',
        locked: 'O produto já tem itens: o controle não pode mais mudar.',
      },
      unit: {
        label: 'Unidade',
        placeholder: 'Selecione uma unidade',
      },
      shelfLife: {
        label: 'Validade (dias)',
        placeholder: 'Não vence',
        description: 'Dias após a produção. Deixe vazio se não vence.',
      },
      categories: {
        label: 'Categorias',
        placeholder: 'Selecione as categorias',
      },
      components: {
        label: 'Receita',
        description: 'Produtos usados para fazer uma unidade. Podem ser consumidos do estoque ao gerar itens.',
        selectPlaceholder: 'Selecione um produto',
        qtyPlaceholder: 'Quantidade',
        quantityOf: 'Quantidade de {{name}}',
        option: '{{name}} · {{count}} {{unit}}',
        empty: 'Sem componentes: o produto não é feito a partir de outros.',
        add: 'Adicionar componente',
        remove: 'Remover componente',
      },
      validation: {
        nameRequired: 'Nome é obrigatório',
        unitRequired: 'Unidade é obrigatória',
        sku: 'Use letras, números, ponto, hífen ou sublinhado',
        shelfLife: 'Use um número inteiro de dias, a partir de 1',
        componentQuantity: 'Cada componente precisa de uma quantidade maior que zero',
        componentInteger: 'Componentes atômicos são contados por unidade: use números inteiros',
      },
    },

    createItems: {
      product: {
        label: 'Produto',
        placeholder: 'Selecione um produto',
        locked: 'Gerando a partir da linha deste produto: o produto não pode ser trocado aqui.',
      },
      quantity: {
        atomicLabel: 'Quantos itens',
        atomicDescription: 'Cada um recebe um código próprio.',
        bulkLabel: 'Quantidade do lote ({{unit}})',
        bulkDescription: 'Um único registro com esta quantidade.',
      },
      producedAt: {
        label: 'Data de produção',
        expiresOn: 'Vence em {{date}} ({{count}} dias).',
        noExpiration: 'Este produto não vence.',
      },
      storage: {
        label: 'Armazenamento',
        placeholder: 'Selecione um armazenamento (opcional)',
      },
      consume: {
        label: 'Consumir a receita do estoque',
        description: 'Os componentes saem do estoque, o que vence primeiro sai primeiro.',
        line: 'Precisa {{required}} · livre {{free}}',
        max: 'Dá para produzir até {{count}} com o estoque livre.',
      },
      submit: 'Gerar',
      validation: {
        productRequired: 'Produto é obrigatório',
        quantityRequired: 'Quantidade é obrigatória',
        quantityPositive: 'Quantidade deve ser maior que zero',
        integer: 'Itens atômicos: use um número inteiro',
        max: 'No máximo {{count}} por vez',
        dateRequired: 'Data de produção é obrigatória',
        dateFuture: 'A data de produção não pode ser no futuro',
      },
    },

    updateItem: {
      code: {
        label: 'Código',
        description: 'Gerado automaticamente na criação; não pode ser alterado.',
      },
      producedAt: {
        label: 'Data de produção',
        description: 'Ao mudar, o vencimento é recalculado pela validade do produto.',
      },
      expiresAt: {
        label: 'Vencimento',
        description: 'Vazio = não vence.',
      },
      storage: {
        label: 'Armazenamento',
        placeholder: 'Selecione um armazenamento (opcional)',
      },
      validation: {
        dateRequired: 'Data de produção é obrigatória',
        dateFuture: 'A data de produção não pode ser no futuro',
        expiresBeforeProduced: 'O vencimento não pode ser anterior à data de produção',
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
      setWarning: {
        title: 'Cuidado: "Definir valor" apaga o que outras pessoas registrarem ao mesmo tempo',
        body: 'O número que você digitar substitui a quantidade inteira deste lote. Se alguém registrar uma entrada ou uma saída dele enquanto esta janela está aberta, essa movimentação some sem aviso e o estoque fica errado.',
        advice: 'Prefira "Somar" ou "Subtrair": eles só aplicam a diferença e nunca apagam o registro de ninguém. Use "Definir valor" só para corrigir depois de contar o lote na mão.',
      },
    },

    deliveryPackage: {
      items: {
        label: 'Produtos do pacote',
        selectPlaceholder: 'Selecione um produto',
        qtyPlaceholder: 'Quantidade',
        add: 'Adicionar produto',
        remove: 'Remover produto',
        empty: 'Nenhum produto adicionado.',
        free: 'Livre: {{count}} {{unit}}',
        quantityOf: 'Quantidade de {{name}}',
        option: '{{name}} · {{count}} {{unit}}',
        mode: {
          fefo: 'Mais antigos primeiro',
          manual: 'Escolher item a item',
          fefoDescription: 'O sistema separa os itens que vencem primeiro.',
          manualDescription: 'Escolha exatamente quais itens vão no pacote, na quantidade informada.',
        },
        pickLabel: 'Itens selecionados ({{selected}} de {{count}})',
        pickPlaceholder: 'Busque pelo código',
        pickLoading: 'Carregando itens…',
        pickOption: '{{code}} · vence em {{date}}',
        pickOptionNoExpiration: '{{code}} · não vence',
      },
      notes: {
        label: 'Anotações',
        placeholder: 'Endereço, cliente, horário, forma de pagamento...',
      },
      validation: {
        itemsRequired: 'Adicione ao menos um produto ao pacote',
        quantityPositive: 'Cada produto precisa de uma quantidade maior que zero',
        integer: 'Produtos atômicos são contados por unidade: use números inteiros',
        notesMax: 'As anotações podem ter no máximo {{count}} caracteres',
        selectionMismatch: 'Em "Escolher item a item", escolha exatamente a quantidade informada de cada produto',
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
      createProduct: 'Não foi possível criar o produto. Tente novamente.',
      updateProduct: 'Não foi possível atualizar o produto. Tente novamente.',
      deleteProduct: 'Não foi possível excluir o produto. Tente novamente.',
      createItems: 'Não foi possível gerar os itens.',
      deleteItem: 'Não foi possível excluir o item. Tente novamente.',
      updateQuantity: 'Não foi possível atualizar a quantidade.',
      updateItem: 'Não foi possível atualizar o item. Tente novamente.',
      createStorage: 'Não foi possível criar o armazenamento. Tente novamente.',
      updateStorage: 'Não foi possível atualizar o armazenamento. Tente novamente.',
      deleteStorage: 'Não foi possível excluir o armazenamento. Tente novamente.',
      createDeliveryPackage: 'Não foi possível criar o pacote. Tente novamente.',
      updateDeliveryPackage: 'Não foi possível atualizar o pacote. Tente novamente.',
      deleteDeliveryPackage: 'Não foi possível desfazer o pacote. Tente novamente.',
      deliverDeliveryPackage: 'Não foi possível entregar o pacote.',
      deleteUser: 'Não foi possível excluir o usuário. Tente novamente.',
      approveRegistrationRequest: 'Não foi possível aprovar o pedido. Tente novamente.',
      rejectRegistrationRequest: 'Não foi possível recusar o pedido. Tente novamente.',
    },
  },
} as typeof enUs;
