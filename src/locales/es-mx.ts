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
    loading: 'Cargando…',
    table: {
      emptyDefault: 'No se encontraron datos',
      actionsColumn: 'Acciones',
      rowNumber: '#',
      rowNumberLabel: 'Número de fila',
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
      noAccount: '¿Aún no tienes acceso?',
      requestAccess: 'Solicitar acceso',
      validation: {
        emailRequired: 'El correo es obligatorio',
        emailInvalid: 'Correo inválido',
        passwordRequired: 'La contraseña es obligatoria',
      },
      notifications: {
        error: 'No fue posible iniciar sesión. Inténtalo de nuevo.',
      },
    },
    register: {
      title: 'Solicitar acceso',
      subtitle: 'Envía tus datos: un administrador aprueba la solicitud antes del primer acceso',
      name: {
        label: 'Nombre',
        placeholder: 'Tu nombre completo',
      },
      password: {
        placeholder: 'Mínimo de {{min}} caracteres',
      },
      passwordConfirmation: {
        label: 'Confirmar contraseña',
        placeholder: 'Escribe la contraseña de nuevo',
      },
      submit: 'Enviar solicitud',
      hasAccount: '¿Ya tienes acceso?',
      backToLogin: 'Volver al inicio de sesión',
      sent: {
        title: 'Solicitud enviada',
        description: 'Tu solicitud de acceso para {{email}} está en la fila de aprobación. Cuando un administrador la apruebe, inicia sesión con el correo y la contraseña que registraste.',
      },
      validation: {
        nameRequired: 'El nombre es obligatorio',
        passwordMin: 'La contraseña debe tener al menos {{min}} caracteres',
        passwordConfirmationRequired: 'Confirma la contraseña',
        passwordMismatch: 'Las contraseñas no coinciden',
      },
      notifications: {
        error: 'No se pudo enviar la solicitud. Inténtalo de nuevo.',
      },
    },
    sessionExpired: 'Tu sesión expiró. Inicia sesión de nuevo.',
  },

  sidebar: {
    section: 'Inventario',
    stock: 'Operación',
    items: 'Artículos',
    products: 'Productos',
    categories: 'Categorías',
    units: 'Unidades',
    storages: 'Almacenamientos',
    deliveries: 'Entregas',
    movements: 'Movimientos',
    registrationRequests: 'Solicitudes de registro',
    users: 'Usuarios',
    groups: {
      operation: 'Inventario',
      registry: 'Catálogos',
      admin: 'Administración',
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

  users: {
    page: {
      title: 'Usuarios',
      subtitle: 'Quién tiene acceso al sistema. Los usuarios comunes se pueden eliminar y pierden el acceso al instante.',
    },
    search: {
      placeholder: 'Buscar por nombre o correo...',
    },
    table: {
      count_one: '{{count}} usuario',
      count_other: '{{count}} usuarios',
      columns: {
        name: 'Nombre',
        email: 'Correo',
        role: 'Perfil',
        createdAt: 'Desde',
      },
      empty: 'No se encontraron usuarios.',
    },
    roles: {
      admin: 'Administrador',
      user: 'Usuario',
    },
    modals: {
      delete: 'Eliminar Usuario',
    },
    delete: {
      confirm: '¿Seguro que deseas eliminar a "{{name}}"? La persona pierde el acceso de inmediato y tendrá que solicitar un nuevo registro.',
    },
  },

  registrationRequests: {
    page: {
      title: 'Solicitudes de registro',
      subtitle: 'Personas que pidieron acceso. Aprueba para crear el usuario o rechaza para eliminar la solicitud.',
    },
    table: {
      count_one: '{{count}} solicitud pendiente',
      count_other: '{{count}} solicitudes pendientes',
      columns: {
        requestedAt: 'Solicitado el',
      },
      empty: 'No hay solicitudes de registro esperando aprobación.',
    },
    actions: {
      approve: 'Aprobar',
      reject: 'Rechazar',
    },
    modals: {
      approve: 'Aprobar Registro',
      reject: 'Rechazar Registro',
    },
    approve: {
      confirm: '¿Aprobar el acceso de "{{name}}" ({{email}})? La persona podrá iniciar sesión con la contraseña que registró.',
    },
    reject: {
      confirm: '¿Rechazar la solicitud de "{{name}}" ({{email}})? La solicitud será eliminada.',
    },
  },

  inventory: {
    actions: {
      newUnit: 'Nueva Unidad',
      newCategory: 'Nueva Categoría',
    },
    modals: {
      createUnit: 'Nueva Unidad',
      updateUnit: 'Editar Unidad',
      deleteUnit: 'Eliminar Unidad',
      createCategory: 'Nueva Categoría',
      updateCategory: 'Editar Categoría',
      deleteCategory: 'Eliminar Categoría',
    },
  },
  stock: {
    page: {
      title: 'Operación',
      subtitle: 'El inventario de un vistazo: artículos atómicos agrupados por producto, lotes a granel tal cual',
    },
    search: {
      placeholder: 'Buscar por producto o SKU...',
    },
    table: {
      count_one: '{{count}} fila',
      count_other: '{{count}} filas',
      columns: {
        product: 'Producto',
        quantity: 'Cantidad',
        expiration: 'Próxima caducidad',
        storages: 'Almacenamiento',
      },
      empty: 'Aún no hay nada en inventario. Genera artículos a partir de un producto para empezar.',
      units_one: '{{count}} artículo con código propio',
      units_other: '{{count}} artículos con código propio',
      lot: 'Lote {{code}}',
      expiredCount: '{{count}} caducado(s)',
    },
    rowActions: {
      produce: 'Generar artículos',
      viewItems: 'Ver artículos',
      viewExpiring: 'Ver los artículos de este producto con este vencimiento',
      viewInStorage: 'Ver los artículos de este producto en {{name}}',
    },
    filters: {
      storage: 'Todos los almacenes',
      expiresAt: 'Fecha de vencimiento',
    },
  },
  products: {
    page: {
      title: 'Productos',
      subtitle: 'El modelo de cada artículo: unidad, receta y caducidad',
    },
    actions: {
      new: 'Nuevo Producto',
    },
    search: {
      placeholder: 'Buscar por nombre o SKU...',
    },
    table: {
      count_one: '{{count}} producto',
      count_other: '{{count}} productos',
      columns: {
        name: 'Nombre',
        mode: 'Control',
        recipe: 'Receta (por unidad)',
        shelfLife: 'Caducidad',
        stock: 'Inventario',
      },
      empty: 'No se encontraron productos. Crea el primero haciendo clic en \'Nuevo Producto\'.',
      atomic: 'Atómico',
      bulk: 'A granel',
      shelfLifeDays_one: '{{count}} día',
      shelfLifeDays_other: '{{count}} días',
      noShelfLife: 'No caduca',
      reserved: '{{count}} reservado(s)',
    },
    rowActions: {
      produce: 'Generar artículos',
      viewItems: 'Ver artículos',
      edit: 'Editar producto',
      delete: 'Eliminar producto',
    },
    modals: {
      create: 'Nuevo Producto',
      update: 'Editar Producto',
      delete: 'Eliminar Producto',
    },
    delete: {
      confirm: '¿Seguro que deseas eliminar el producto "{{name}}"? Esta acción no se puede deshacer.',
    },
  },
  items: {
    page: {
      title: 'Artículos',
      subtitle: 'Cada registro del inventario, con código, producción y caducidad',
    },
    actions: {
      new: 'Generar Artículos',
    },
    search: {
      placeholder: 'Buscar por código...',
    },
    filters: {
      product: 'Todos los productos',
      expiration: {
        all: 'Todos',
        expiring: 'Por caducar',
        expired: 'Caducados',
        date: 'Fecha',
      },
      byProduct: 'Filtrar por producto',
      byStorage: 'Filtrar por almacén',
      storage: 'Todos los almacenes',
      expiresAt: 'Fecha de vencimiento',
    },
    table: {
      count_one: '{{count}} artículo',
      count_other: '{{count}} artículos',
      columns: {
        code: 'Código',
        product: 'Producto',
        quantity: 'Cantidad',
        producedAt: 'Producción',
        expiresAt: 'Caducidad',
        storage: 'Almacenamiento',
      },
      empty: 'No se encontraron artículos. Genera artículos haciendo clic en \'Generar Artículos\'.',
      reserved: '{{count}} reservado(s)',
      reservedHint: 'Cantidad reservada en paquetes de entrega pendientes',
    },
    expiration: {
      expired: 'caducado',
      expiring: 'Caduca pronto',
      valid: 'Dentro de la caducidad',
      none: 'No caduca',
    },
    rowActions: {
      edit: 'Editar artículo',
      adjustStock: 'Ajustar cantidad',
      delete: 'Eliminar artículo',
      movements: 'Ver movimientos',
    },
    modals: {
      create: 'Generar Artículos',
      update: 'Editar Artículo {{code}}',
      updateQuantity: 'Ajustar Cantidad',
      delete: 'Eliminar Artículo',
    },
    delete: {
      confirm: '¿Sacar el artículo "{{code}}" del inventario? Úsalo para pérdidas, roturas o caducados.',
    },
  },

  movements: {
    page: {
      title: 'Movimientos',
      subtitle: 'Todo lo que entró, salió o cambió de lugar en el inventario, artículo por artículo',
    },
    search: {
      placeholder: 'Buscar por código o producto...',
    },
    filters: {
      type: 'Todos los tipos',
      product: 'Todos los productos',
      storage: 'Todos los almacenes',
      period: 'Periodo',
      dateFrom: 'Fecha inicial',
      dateTo: 'Fecha final',
    },
    types: {
      entry: 'Entrada',
      production: 'Producción',
      consumption: 'Consumo',
      adjustment: 'Ajuste',
      transfer: 'Traslado',
      delivery: 'Entrega',
      write_off: 'Baja',
    },
    table: {
      count_one: '{{count}} movimiento',
      count_other: '{{count}} movimientos',
      empty: 'No se encontraron movimientos',
      columns: {
        date: 'Fecha',
        type: 'Tipo',
        item: 'Artículo',
        product: 'Producto',
        quantity: 'Cantidad',
        balance: 'Saldo del artículo',
        storage: 'Almacén',
        user: 'Usuario',
      },
      package: 'Paquete #{{id}}',
      openItem: 'Abrir en la lista de artículos',
      itemGone: 'Este artículo ya salió del inventario',
      noStorage: 'Sin almacén',
      to: 'a',
    },
  },

  deliveries: {
    page: {
      title: 'Entregas',
      subtitle: 'Arma paquetes de productos, mira qué artículos separar y registra las entregas',
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
      delete: 'Deshacer paquete',
    },
    modals: {
      create: 'Nuevo Paquete de Entrega',
      update: 'Editar Paquete #{{id}}',
      deliver: 'Entregar Paquete #{{id}}',
      delete: 'Deshacer Paquete',
    },
    deliver: {
      confirm: 'Al confirmar, estos artículos salen del inventario:',
      pick: 'Separar: {{codes}}',
      inStock: 'En inventario: {{count}}',
      shortage: 'No hay existencias suficientes de algún artículo. Ajusta el inventario o edita el paquete antes de entregarlo.',
      submit: 'Confirmar entrega',
    },
    delete: {
      submit: 'Deshacer',
      confirmPending: '¿Seguro que deseas deshacer el paquete #{{id}}? Los artículos dejan de estar separados y siguen en el inventario.',
      confirmDelivered: '¿Seguro que deseas deshacer el paquete #{{id}} y quitarlo del historial? Los artículos entregados no vuelven al inventario.',
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

    product: {
      name: {
        label: 'Nombre',
        placeholder: 'Ej.: Armario modelo A',
      },
      sku: {
        label: 'SKU',
        placeholder: 'Ej.: ARM-A',
      },
      mode: {
        label: 'Control',
        atomic: 'Atómico',
        bulk: 'A granel',
        atomicDescription: 'Cada unidad es un artículo con código propio (un armario, un pastel).',
        bulkDescription: 'Cada artículo es un lote con una cantidad (tornillos, harina).',
        locked: 'El producto ya tiene artículos: el control ya no puede cambiar.',
      },
      unit: {
        label: 'Unidad',
        placeholder: 'Selecciona una unidad',
      },
      shelfLife: {
        label: 'Caducidad (días)',
        placeholder: 'No caduca',
        description: 'Días después de la producción. Déjalo vacío si no caduca.',
      },
      categories: {
        label: 'Categorías',
        placeholder: 'Selecciona las categorías',
      },
      components: {
        label: 'Receta',
        description: 'Productos usados para hacer una unidad. Se pueden consumir del inventario al generar artículos.',
        selectPlaceholder: 'Selecciona un producto',
        qtyPlaceholder: 'Cantidad',
        quantityOf: 'Cantidad de {{name}}',
        empty: 'Sin componentes: el producto no se hace a partir de otros.',
        add: 'Agregar componente',
        remove: 'Quitar componente',
      },
      validation: {
        nameRequired: 'El nombre es obligatorio',
        unitRequired: 'La unidad es obligatoria',
        sku: 'Usa letras, números, punto, guion o guion bajo',
        shelfLife: 'Usa un número entero de días, a partir de 1',
        componentQuantity: 'Cada componente necesita una cantidad mayor que cero',
        componentInteger: 'Los componentes atómicos se cuentan por unidad: usa números enteros',
      },
    },

    createItems: {
      product: {
        label: 'Producto',
        placeholder: 'Selecciona un producto',
        locked: 'Generando desde la fila de este producto: aquí no se puede cambiar el producto.',
      },
      quantity: {
        atomicLabel: 'Cuántos artículos',
        atomicDescription: 'Cada uno recibe un código propio.',
        bulkLabel: 'Cantidad del lote ({{unit}})',
        bulkDescription: 'Un único registro con esta cantidad.',
      },
      producedAt: {
        label: 'Fecha de producción',
        expiresOn: 'Caduca el {{date}} ({{count}} días).',
        noExpiration: 'Este producto no caduca.',
      },
      storage: {
        label: 'Almacenamiento',
        placeholder: 'Selecciona un almacenamiento (opcional)',
      },
      consume: {
        label: 'Consumir la receta del inventario',
        description: 'Los componentes salen del inventario, lo que caduca primero sale primero.',
        line: 'Necesita {{required}} · libre {{free}}',
        max: 'Puedes producir hasta {{count}} con el inventario libre.',
      },
      submit: 'Generar',
      validation: {
        productRequired: 'El producto es obligatorio',
        quantityRequired: 'La cantidad es obligatoria',
        quantityPositive: 'La cantidad debe ser mayor que cero',
        integer: 'Artículos atómicos: usa un número entero',
        max: 'Como máximo {{count}} por vez',
        dateRequired: 'La fecha de producción es obligatoria',
      },
    },

    updateItem: {
      code: {
        label: 'Código',
        description: 'Generado automáticamente al crearlo; no se puede cambiar.',
      },
      producedAt: {
        label: 'Fecha de producción',
        description: 'Al cambiarla, la caducidad se recalcula con la del producto.',
      },
      expiresAt: {
        label: 'Caducidad',
        description: 'Vacío = no caduca.',
      },
      storage: {
        label: 'Almacenamiento',
        placeholder: 'Selecciona un almacenamiento (opcional)',
      },
      validation: {
        dateRequired: 'La fecha de producción es obligatoria',
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
      setWarning: {
        title: 'Cuidado: "Definir valor" borra lo que otras personas registren al mismo tiempo',
        body: 'El número que escribas reemplaza toda la cantidad de este lote. Si alguien registra una entrada o una salida mientras esta ventana está abierta, ese movimiento se pierde sin aviso y el inventario queda mal.',
        advice: 'Prefiere "Sumar" o "Restar": solo aplican la diferencia y nunca borran el registro de nadie. Usa "Definir valor" solo para corregir después de contar el lote a mano.',
      },
    },

    deliveryPackage: {
      items: {
        label: 'Productos del paquete',
        selectPlaceholder: 'Selecciona un producto',
        qtyPlaceholder: 'Cantidad',
        add: 'Agregar producto',
        remove: 'Quitar producto',
        empty: 'No se agregaron productos.',
        free: 'Libre: {{count}} {{unit}}',
        quantityOf: 'Cantidad de {{name}}',
        option: '{{name}} · {{count}} {{unit}}',
        mode: {
          fefo: 'Los más antiguos primero',
          manual: 'Elegir uno por uno',
          fefoDescription: 'El sistema aparta los artículos que vencen primero.',
          manualDescription: 'Elige exactamente qué artículos van en el paquete, en la cantidad indicada.',
        },
        pickLabel: 'Artículos seleccionados ({{selected}} de {{count}})',
        pickPlaceholder: 'Busca por código',
        pickLoading: 'Cargando artículos…',
        pickOption: '{{code}} · vence el {{date}}',
        pickOptionNoExpiration: '{{code}} · no vence',
      },
      notes: {
        label: 'Notas',
        placeholder: 'Dirección, cliente, horario, forma de pago...',
      },
      validation: {
        itemsRequired: 'Agrega al menos un producto al paquete',
        quantityPositive: 'Cada producto necesita una cantidad mayor que cero',
        integer: 'Los productos atómicos se cuentan por unidad: usa números enteros',
        notesMax: 'Las notas pueden tener como máximo {{count}} caracteres',
        selectionMismatch: 'En "Elegir uno por uno", elige exactamente la cantidad indicada de cada producto',
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
      createProduct: 'No se pudo crear el producto. Inténtalo de nuevo.',
      updateProduct: 'No se pudo actualizar el producto. Inténtalo de nuevo.',
      deleteProduct: 'No se pudo eliminar el producto. Inténtalo de nuevo.',
      createItems: 'No se pudieron generar los artículos.',
      deleteItem: 'No se pudo eliminar el artículo. Inténtalo de nuevo.',
      updateQuantity: 'No se pudo actualizar la cantidad.',
      updateItem: 'No se pudo actualizar el artículo. Inténtalo de nuevo.',
      createStorage: 'No se pudo crear el almacenamiento. Inténtalo de nuevo.',
      updateStorage: 'No se pudo actualizar el almacenamiento. Inténtalo de nuevo.',
      deleteStorage: 'No se pudo eliminar el almacenamiento. Inténtalo de nuevo.',
      createDeliveryPackage: 'No se pudo crear el paquete. Inténtalo de nuevo.',
      updateDeliveryPackage: 'No se pudo actualizar el paquete. Inténtalo de nuevo.',
      deleteDeliveryPackage: 'No se pudo deshacer el paquete. Inténtalo de nuevo.',
      deliverDeliveryPackage: 'No se pudo entregar el paquete.',
      deleteUser: 'No se pudo eliminar el usuario. Inténtalo de nuevo.',
      approveRegistrationRequest: 'No se pudo aprobar la solicitud. Inténtalo de nuevo.',
      rejectRegistrationRequest: 'No se pudo rechazar la solicitud. Inténtalo de nuevo.',
    },
  },
} as typeof enUs;
