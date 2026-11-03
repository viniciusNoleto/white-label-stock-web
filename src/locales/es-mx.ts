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
      save: 'Guardar',
      cancel: 'Cancelar',
      close: 'Cerrar',
      edit: 'Editar',
      delete: 'Eliminar',
    },
    table: {
      emptyDefault: 'No se encontraron datos',
      actionsColumn: 'Acciones',
    },
    notifications: {
      errorTitle: 'Error',
    },
    pagination: {
      previous: 'Anterior',
      next: 'Siguiente',
      label: 'Paginación',
    },
  },

  errorBoundary: {
    title: 'Algo salió mal.',
    description: 'Recarga la página o ponte en contacto con soporte.',
  },

  home: {
    subtitle: 'Sistema genérico de control de existencias e inventario',
    description: 'Gestiona tu inventario de forma simple y eficiente. Registra artículos, organízalos por categorías, controla cantidades y construye productos compuestos a partir de sus componentes, todo en un solo lugar.',
    ctaPrimary: 'Ir al Inventario',
    ctaSecondary: 'Saber más',
    features: {
      categories: {
        title: 'Categorías',
        description: 'Organiza tus artículos en categorías con colores personalizados.',
      },
      stock: {
        title: 'Control de existencias',
        description: 'Edita cantidades directamente en la tabla con precisión decimal.',
      },
      build: {
        title: 'Construcción',
        description: 'Construye artículos compuestos consumiendo sus componentes automáticamente.',
      },
    },
  },

  header: {
    menu: 'Menú',
    logout: 'Cerrar sesión',
    breadcrumb: 'Ruta de navegación',
    userMenu: 'Menú del usuario',
    colorScheme: {
      label: 'Apariencia',
      light: 'Claro',
      dark: 'Oscuro',
      auto: 'Sistema',
    },
  },

  footer: {
    createdBy: 'Creado por',
  },

  notFound: {
    title: 'Página no encontrada',
    description: 'La dirección accedida no existe o fue movida.',
    back: 'Volver al inicio',
  },

  flow: {
    label: 'Flujo del inventario',
    receiving: 'Recepción',
    storage: 'Almacenaje',
    production: 'Producción',
    shipping: 'Envío',
  },

  auth: {
    login: {
      showcase: {
        eyebrow: 'Inventario · Producción · Logística',
        title: 'Cada artículo en su lugar, cada movimiento registrado.',
        description: 'De la recepción al envío: organiza ubicaciones de almacenaje, controla cantidades y convierte componentes en productos terminados.',
      },
      title: 'Iniciar sesión',
      subtitle: 'Accede a tu cuenta para gestionar el inventario',
      email: {
        label: 'Correo electrónico',
        placeholder: 'tu@correo.com',
      },
      password: {
        label: 'Contraseña',
        placeholder: 'Escribe tu contraseña',
      },
      submit: 'Entrar',
      validation: {
        emailRequired: 'El correo es obligatorio',
        emailInvalid: 'Correo inválido',
        passwordRequired: 'La contraseña es obligatoria',
      },
      notifications: {
        error: 'No fue posible iniciar sesión. Inténtalo de nuevo.',
      },
    },
    sessionExpired: 'Tu sesión expiró. Inicia sesión de nuevo.',
  },

  sidebar: {
    section: 'Inventario',
    items: 'Artículos',
    categories: 'Categorías',
    units: 'Unidades',
    storages: 'Almacenamientos',
    deliveries: 'Entregas',
    groups: {
      operation: 'Operación',
      registry: 'Catálogos',
    },
  },

  units: {
    page: {
      title: 'Unidades',
      subtitle: 'Gestiona las unidades de medida',
    },
    table: {
      count_one: '{{count}} unidad',
      count_other: '{{count}} unidades',
      columns: {
        name: 'Nombre',
        abbreviation: 'Abreviatura',
      },
      empty: 'No hay unidades registradas. Crea la primera haciendo clic en \'Nueva Unidad\'.',
    },
    delete: {
      confirm: '¿Seguro que deseas eliminar la unidad "{{name}}"? Esta acción no se puede deshacer.',
    },
  },

  categories: {
    page: {
      title: 'Categorías',
      subtitle: 'Gestiona las categorías de artículos',
    },
    table: {
      count_one: '{{count}} categoría',
      count_other: '{{count}} categorías',
      columns: {
        name: 'Nombre',
        color: 'Color',
      },
      empty: 'No hay categorías registradas. Crea la primera haciendo clic en \'Nueva Categoría\'.',
    },
    actions: {
      edit: 'Editar categoría',
      delete: 'Eliminar categoría',
    },
    delete: {
      confirm: '¿Seguro que deseas eliminar la categoría "{{name}}"? Esta acción no se puede deshacer.',
    },
  },

  storages: {
    page: {
      title: 'Almacenamientos',
      subtitle: 'Gestiona los lugares de almacenamiento',
    },
    table: {
      count_one: '{{count}} ubicación',
      count_other: '{{count}} ubicaciones',
      columns: {
        name: 'Nombre',
        description: 'Descripción',
      },
      empty: 'No hay almacenamientos registrados. Crea el primero haciendo clic en \'Nuevo Almacenamiento\'.',
    },
    actions: {
      new: 'Nuevo Almacenamiento',
      edit: 'Editar almacenamiento',
      delete: 'Eliminar almacenamiento',
    },
    modals: {
      create: 'Nuevo Almacenamiento',
      update: 'Editar Almacenamiento',
      delete: 'Eliminar Almacenamiento',
    },
    delete: {
      confirm: '¿Estás seguro de que deseas eliminar el almacenamiento "{{name}}"? Esta acción no se puede deshacer.',
    },
  },

  inventory: {
    page: {
      title: 'Artículos',
      subtitle: 'Gestiona tus artículos de existencias',
    },
    actions: {
      newUnit: 'Nueva Unidad',
      newCategory: 'Nueva Categoría',
      newItem: 'Nuevo Artículo',
    },
    search: {
      placeholder: 'Buscar por nombre...',
    },
    table: {
      count_one: '{{count}} artículo',
      count_other: '{{count}} artículos',
      columns: {
        name: 'Nombre',
        categories: 'Categorías',
        quantity: 'Cantidad',
        unit: 'Unidad',
        storage: 'Almacenamiento',
        packaged: 'Empaquetado',
      },
      empty: 'No se encontraron artículos. Crea el primero haciendo clic en \'Nuevo Artículo\'.',
      packagedHint: 'Cantidad separada en paquetes de entrega pendientes',
    },
    rowActions: {
      editQuantity: 'Editar cantidad',
      adjustStock: 'Ajustar inventario',
      editItem: 'Editar artículo',
      editStorage: 'Editar almacenamiento',
      build: 'Construir',
    },
    modals: {
      createUnit: 'Nueva Unidad',
      updateUnit: 'Editar Unidad',
      deleteUnit: 'Eliminar Unidad',
      createCategory: 'Nueva Categoría',
      updateCategory: 'Editar Categoría',
      deleteCategory: 'Eliminar Categoría',
      createItem: 'Nuevo Artículo de Inventario',
      updateQuantity: 'Editar Cantidad',
      updateItem: 'Editar Artículo',
      updateStorage: 'Editar Almacenamiento',
      build: 'Construir: {{name}}',
    },
  },

  deliveries: {
    page: {
      title: 'Entregas',
      subtitle: 'Arma paquetes con artículos del inventario y registra las entregas',
    },
    actions: {
      new: 'Nuevo Paquete',
    },
    filters: {
      pending: 'Pendientes',
      delivered: 'Entregados',
      all: 'Todos',
    },
    table: {
      count_one: '{{count}} paquete',
      count_other: '{{count}} paquetes',
      columns: {
        package: 'Paquete',
        items: 'Artículos',
        notes: 'Notas',
        status: 'Estado',
      },
      packageNumber: 'Paquete #{{id}}',
      empty: 'No se encontraron paquetes. Crea el primero haciendo clic en \'Nuevo Paquete\'.',
    },
    status: {
      pending: 'Pendiente',
      delivered: 'Entregado',
    },
    rowActions: {
      deliver: 'Marcar como entregado',
      edit: 'Editar paquete',
      delete: 'Eliminar paquete',
    },
    modals: {
      create: 'Nuevo Paquete de Entrega',
      update: 'Editar Paquete #{{id}}',
      deliver: 'Entregar Paquete #{{id}}',
      delete: 'Eliminar Paquete',
    },
    deliver: {
      confirm: 'Al confirmar, estos artículos se restarán del inventario:',
      inStock: 'En inventario: {{count}}',
      shortage: 'No hay existencias suficientes de algún artículo. Ajusta el inventario o edita el paquete antes de entregarlo.',
      submit: 'Confirmar entrega',
    },
    delete: {
      confirmPending: '¿Seguro que deseas eliminar el paquete #{{id}}? Los artículos dejan de estar separados y siguen en el inventario.',
      confirmDelivered: '¿Seguro que deseas eliminar el paquete #{{id}} del historial? Los artículos entregados no vuelven al inventario.',
    },
  },

  forms: {
    password: {
      show: 'Mostrar contraseña',
      hide: 'Ocultar contraseña',
    },

    color: {
      swatches: 'Colores sugeridos',
    },

    select: {
      clear: 'Limpiar selección',
      empty: 'No se encontraron opciones',
    },

    unit: {
      name: {
        label: 'Nombre',
        placeholder: 'Escribe un nombre',
      },
      abbreviation: {
        label: 'Abreviatura',
        placeholder: 'Escribe una abreviatura',
      },
      validation: {
        nameRequired: 'El nombre es obligatorio',
        abbreviationRequired: 'La abreviatura es obligatoria',
      },
    },

    category: {
      name: {
        label: 'Nombre',
        placeholder: 'Escribe un nombre',
      },
      color: {
        label: 'Color',
        placeholder: 'Escribe un código de color',
      },
      validation: {
        nameRequired: 'El nombre es obligatorio',
        colorRequired: 'El color es obligatorio',
      },
    },

    storage: {
      name: {
        label: 'Nombre',
        placeholder: 'Escribe un nombre',
      },
      description: {
        label: 'Descripción',
        placeholder: 'Describe este lugar de almacenamiento',
      },
      validation: {
        nameRequired: 'El nombre es obligatorio',
      },
    },

    inventoryItem: {
      name: {
        label: 'Nombre',
        placeholder: 'Escribe un nombre',
      },
      unit: {
        label: 'Unidad',
        placeholder: 'Seleccionar una unidad',
      },
      quantity: {
        label: 'Cantidad inicial',
        placeholder: 'Escribe una cantidad',
      },
      categories: {
        label: 'Categorías',
        placeholder: 'Seleccionar categorías',
      },
      storage: {
        label: 'Almacenamiento',
        placeholder: 'Selecciona un lugar de almacenamiento (opcional)',
      },
      components: {
        label: 'Componentes',
        selectPlaceholder: 'Seleccionar un artículo',
        qtyPlaceholder: 'Escribe una cantidad',
        empty: 'No se agregaron componentes.',
        add: 'Agregar componente',
        remove: 'Quitar componente',
      },
      validation: {
        nameRequired: 'El nombre es obligatorio',
        unitRequired: 'La unidad es obligatoria',
      },
    },

    updateQuantity: {
      description: {
        set: 'Define la nueva cantidad de "{{name}}".',
        add: 'Indica cuánto entró al inventario de "{{name}}".',
        subtract: 'Indica cuánto salió del inventario de "{{name}}".',
      },
      current: 'Cantidad actual: {{count}}',
      mode: {
        set: 'Establecer valor',
        add: 'Sumar',
        subtract: 'Restar',
      },
      quantity: {
        label: 'Nueva cantidad',
        placeholder: 'Escribe un valor',
      },
      amount: {
        label: 'Valor',
        placeholder: 'Escribe un valor',
      },
      preview: 'Nueva cantidad: {{count}}',
      validation: {
        required: 'La cantidad es obligatoria',
        min: 'La cantidad no puede ser negativa',
        positive: 'El valor debe ser mayor que cero',
        max: 'No se puede restar más que el inventario actual ({{count}})',
      },
    },

    build: {
      noComponentsMessage: 'Este artículo no tiene componentes registrados. Agrega componentes al crear o editar el artículo.',
      requiredComponentsLabel: 'Componentes necesarios por unidad',
      requiredLabel: 'Necesario: {{count}}',
      availableLabel: 'Disponible: {{count}}',
      maxPossibleLabel: 'Máx. posible: {{count}}',
      quantity: {
        label: 'Cantidad a construir',
        placeholder: 'Escribe una cantidad',
      },
      submit: 'Construir',
      validation: {
        required: 'La cantidad es obligatoria',
        min: 'Mínimo de 1 unidad',
      },
    },

    deliveryPackage: {
      items: {
        label: 'Artículos del paquete',
        selectPlaceholder: 'Selecciona un artículo',
        qtyPlaceholder: 'Cantidad',
        add: 'Agregar artículo',
        remove: 'Quitar artículo',
        empty: 'Ningún artículo agregado.',
        free: 'Libre: {{count}} {{unit}}',
        quantityOf: 'Cantidad de {{name}}',
      },
      notes: {
        label: 'Notas',
        placeholder: 'Dirección, cliente, horario, forma de pago...',
      },
      validation: {
        itemsRequired: 'Agrega al menos un artículo al paquete',
        quantityPositive: 'Cada artículo necesita una cantidad mayor que cero',
        notesMax: 'Las notas pueden tener como máximo {{count}} caracteres',
      },
    },
  },

  notifications: {
    errors: {
      createUnit: 'No se pudo crear la unidad. Inténtalo de nuevo.',
      updateUnit: 'No se pudo actualizar la unidad. Inténtalo de nuevo.',
      deleteUnit: 'No se pudo eliminar la unidad. Inténtalo de nuevo.',
      createCategory: 'No se pudo crear la categoría. Inténtalo de nuevo.',
      updateCategory: 'No se pudo actualizar la categoría. Inténtalo de nuevo.',
      deleteCategory: 'No se pudo eliminar la categoría. Inténtalo de nuevo.',
      createItem: 'No se pudo crear el artículo. Inténtalo de nuevo.',
      updateQuantity: 'No se pudo actualizar la cantidad.',
      updateItem: 'No se pudo actualizar el artículo. Inténtalo de nuevo.',
      updateItemStorage: 'No se pudo actualizar el almacenamiento. Inténtalo de nuevo.',
      build: 'No se pudo construir el artículo.',
      createStorage: 'No se pudo crear el almacenamiento. Inténtalo de nuevo.',
      updateStorage: 'No se pudo actualizar el almacenamiento. Inténtalo de nuevo.',
      deleteStorage: 'No se pudo eliminar el almacenamiento. Inténtalo de nuevo.',
      createDeliveryPackage: 'No se pudo crear el paquete. Inténtalo de nuevo.',
      updateDeliveryPackage: 'No se pudo actualizar el paquete. Inténtalo de nuevo.',
      deleteDeliveryPackage: 'No se pudo eliminar el paquete. Inténtalo de nuevo.',
      deliverDeliveryPackage: 'No se pudo entregar el paquete.',
    },
  },
} as typeof enUs;
