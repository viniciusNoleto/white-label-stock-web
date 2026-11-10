export default {
  language: {
    label: 'Language',
    'pt-br': 'Português (Brasil)',
    'es-mx': 'Español (México)',
    'en-us': 'English (US)',
  },

  common: {
    actions: {
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      edit: 'Edit',
      delete: 'Delete',
    },
    loading: 'Loading…',
    table: {
      emptyDefault: 'No data found',
      actionsColumn: 'Actions',
      rowNumber: '#',
      rowNumberLabel: 'Row number',
    },
    notifications: {
      errorTitle: 'Error',
    },
    pagination: {
      previous: 'Previous',
      next: 'Next',
      label: 'Pagination',
    },
  },

  errorBoundary: {
    title: 'Something went wrong.',
    description: 'Reload the page or contact support.',
  },

  home: {
    subtitle: 'Generic stock and inventory control system',
    description: 'Manage your inventory simply and efficiently. Register items, organize them by category, control quantities and build composite products from their components — all in one place.',
    ctaPrimary: 'Go to Inventory',
    ctaSecondary: 'Learn more',
    features: {
      categories: {
        title: 'Categories',
        description: 'Organize your items into categories with custom colors.',
      },
      stock: {
        title: 'Stock control',
        description: 'Edit quantities directly in the table with decimal precision.',
      },
      build: {
        title: 'Build',
        description: 'Build composite items, automatically consuming their components.',
      },
    },
  },

  header: {
    menu: 'Menu',
    logout: 'Sign out',
    breadcrumb: 'Breadcrumb',
    userMenu: 'User menu',
    colorScheme: {
      label: 'Appearance',
      light: 'Light',
      dark: 'Dark',
      auto: 'System',
    },
  },

  footer: {
    createdBy: 'Created by',
  },

  notFound: {
    title: 'Page not found',
    description: 'The address you accessed does not exist or was moved.',
    back: 'Back to home',
  },

  flow: {
    label: 'Stock flow',
    receiving: 'Receiving',
    storage: 'Storage',
    production: 'Production',
    shipping: 'Shipping',
  },

  auth: {
    login: {
      showcase: {
        eyebrow: 'Stock · Production · Logistics',
        title: 'Every item in its place, every movement on record.',
        description: 'From receiving to shipping: organize storage locations, control quantities and turn components into finished products.',
      },
      title: 'Sign in',
      subtitle: 'Access your account to manage the inventory',
      email: {
        label: 'Email',
        placeholder: 'you@email.com',
      },
      password: {
        label: 'Password',
        placeholder: 'Type your password',
      },
      submit: 'Sign in',
      noAccount: 'Don\'t have access yet?',
      requestAccess: 'Request access',
      validation: {
        emailRequired: 'Email is required',
        emailInvalid: 'Invalid email',
        passwordRequired: 'Password is required',
      },
      notifications: {
        error: 'Could not sign in. Please try again.',
      },
    },
    register: {
      title: 'Request access',
      subtitle: 'Send your details: an administrator approves the request before your first sign-in',
      name: {
        label: 'Name',
        placeholder: 'Your full name',
      },
      password: {
        placeholder: 'At least {{min}} characters',
      },
      passwordConfirmation: {
        label: 'Confirm password',
        placeholder: 'Type the password again',
      },
      submit: 'Send request',
      hasAccount: 'Already have access?',
      backToLogin: 'Back to sign in',
      sent: {
        title: 'Request sent',
        description: 'Your access request for {{email}} is in the approval queue. Once an administrator approves it, sign in with the email and password you registered.',
      },
      validation: {
        nameRequired: 'Name is required',
        passwordMin: 'Password must be at least {{min}} characters',
        passwordConfirmationRequired: 'Confirm the password',
        passwordMismatch: 'Passwords do not match',
      },
      notifications: {
        error: 'Could not send the request. Please try again.',
      },
    },
    sessionExpired: 'Your session has expired. Please sign in again.',
  },

  sidebar: {
    section: 'Inventory',
    stock: 'Operation',
    items: 'Items',
    products: 'Products',
    categories: 'Categories',
    units: 'Units',
    storages: 'Storages',
    deliveries: 'Deliveries',
    movements: 'Movements',
    registrationRequests: 'Registration requests',
    users: 'Users',
    groups: {
      operation: 'Stock',
      registry: 'Catalog',
      admin: 'Administration',
    },
  },

  units: {
    page: {
      title: 'Units',
      subtitle: 'Manage measurement units',
    },
    table: {
      count_one: '{{count}} unit',
      count_other: '{{count}} units',
      columns: {
        name: 'Name',
        abbreviation: 'Abbreviation',
      },
      empty: 'No units found. Create the first one by clicking \'New Unit\'.',
    },
    delete: {
      confirm: 'Are you sure you want to delete the unit "{{name}}"? This action cannot be undone.',
    },
  },

  categories: {
    page: {
      title: 'Categories',
      subtitle: 'Manage item categories',
    },
    table: {
      count_one: '{{count}} category',
      count_other: '{{count}} categories',
      columns: {
        name: 'Name',
        color: 'Color',
      },
      empty: 'No categories found. Create the first one by clicking \'New Category\'.',
    },
    actions: {
      edit: 'Edit category',
      delete: 'Delete category',
    },
    delete: {
      confirm: 'Are you sure you want to delete the category "{{name}}"? This action cannot be undone.',
    },
  },

  storages: {
    page: {
      title: 'Storages',
      subtitle: 'Manage storage locations',
    },
    table: {
      count_one: '{{count}} location',
      count_other: '{{count}} locations',
      columns: {
        name: 'Name',
        description: 'Description',
      },
      empty: 'No storages found. Create the first one by clicking \'New Storage\'.',
    },
    actions: {
      new: 'New Storage',
      edit: 'Edit storage',
      delete: 'Delete storage',
    },
    modals: {
      create: 'New Storage',
      update: 'Edit Storage',
      delete: 'Delete Storage',
    },
    delete: {
      confirm: 'Are you sure you want to delete the storage "{{name}}"? This action cannot be undone.',
    },
  },

  users: {
    page: {
      title: 'Users',
      subtitle: 'Who has access to the system. Regular users can be deleted and lose access right away.',
    },
    search: {
      placeholder: 'Search by name or email...',
    },
    table: {
      count_one: '{{count}} user',
      count_other: '{{count}} users',
      columns: {
        name: 'Name',
        email: 'Email',
        role: 'Role',
        createdAt: 'Since',
      },
      empty: 'No users found.',
    },
    roles: {
      admin: 'Administrator',
      user: 'User',
    },
    modals: {
      delete: 'Delete User',
    },
    delete: {
      confirm: 'Are you sure you want to delete "{{name}}"? They lose access immediately and will need to request a new registration.',
    },
  },

  registrationRequests: {
    page: {
      title: 'Registration requests',
      subtitle: 'People who asked for access. Approve to create the user or reject to delete the request.',
    },
    table: {
      count_one: '{{count}} pending request',
      count_other: '{{count}} pending requests',
      columns: {
        requestedAt: 'Requested at',
      },
      empty: 'No registration requests awaiting approval.',
    },
    actions: {
      approve: 'Approve',
      reject: 'Reject',
    },
    modals: {
      approve: 'Approve Registration',
      reject: 'Reject Registration',
    },
    approve: {
      confirm: 'Approve access for "{{name}}" ({{email}})? They will be able to sign in with the password they registered.',
    },
    reject: {
      confirm: 'Reject the request from "{{name}}" ({{email}})? The request will be deleted.',
    },
  },

  inventory: {
    actions: {
      newUnit: 'New Unit',
      newCategory: 'New Category',
    },
    modals: {
      createUnit: 'New Unit',
      updateUnit: 'Edit Unit',
      deleteUnit: 'Delete Unit',
      createCategory: 'New Category',
      updateCategory: 'Edit Category',
      deleteCategory: 'Delete Category',
    },
  },
  stock: {
    page: {
      title: 'Operation',
      subtitle: 'Stock at a glance: atomic items grouped by product, bulk lots as they are',
    },
    search: {
      placeholder: 'Search by product or SKU...',
    },
    table: {
      count_one: '{{count}} row',
      count_other: '{{count}} rows',
      columns: {
        product: 'Product',
        quantity: 'Quantity',
        expiration: 'Next expiration',
        storages: 'Storage',
      },
      empty: 'Nothing in stock yet. Generate items from a product to get started.',
      units_one: '{{count}} item with its own code',
      units_other: '{{count}} items with their own codes',
      lot: 'Lot {{code}}',
      expiredCount: '{{count}} expired',
    },
    rowActions: {
      produce: 'Generate items',
      viewItems: 'View items',
      viewExpiring: 'See this product\'s items with this expiration',
      viewInStorage: 'See this product\'s items in {{name}}',
    },
    filters: {
      storage: 'All storages',
      expiresAt: 'Expiration date',
    },
  },
  products: {
    page: {
      title: 'Products',
      subtitle: 'The model of each item: unit, recipe and shelf life',
    },
    actions: {
      new: 'New Product',
    },
    search: {
      placeholder: 'Search by name or SKU...',
    },
    table: {
      count_one: '{{count}} product',
      count_other: '{{count}} products',
      columns: {
        name: 'Name',
        mode: 'Tracking',
        recipe: 'Recipe (per unit)',
        shelfLife: 'Shelf life',
        stock: 'Stock',
      },
      empty: 'No products found. Create the first one by clicking \'New Product\'.',
      atomic: 'Atomic',
      bulk: 'Bulk',
      shelfLifeDays_one: '{{count}} day',
      shelfLifeDays_other: '{{count}} days',
      noShelfLife: 'Does not expire',
      reserved: '{{count}} reserved',
    },
    rowActions: {
      produce: 'Generate items',
      viewItems: 'View items',
      edit: 'Edit product',
      delete: 'Delete product',
    },
    modals: {
      create: 'New Product',
      update: 'Edit Product',
      delete: 'Delete Product',
    },
    delete: {
      confirm: 'Are you sure you want to delete the product "{{name}}"? This action cannot be undone.',
    },
  },
  items: {
    page: {
      title: 'Items',
      subtitle: 'Every stock record, with its code, production date and expiration',
    },
    actions: {
      new: 'Generate Items',
    },
    search: {
      placeholder: 'Search by code...',
    },
    filters: {
      product: 'All products',
      expiration: {
        all: 'All',
        expiring: 'Expiring',
        expired: 'Expired',
        date: 'Date',
      },
      byProduct: 'Filter by product',
      byStorage: 'Filter by storage',
      storage: 'All storages',
      expiresAt: 'Expiration date',
    },
    table: {
      count_one: '{{count}} item',
      count_other: '{{count}} items',
      columns: {
        code: 'Code',
        product: 'Product',
        quantity: 'Quantity',
        producedAt: 'Produced',
        expiresAt: 'Expires',
        storage: 'Storage',
      },
      empty: 'No items found. Generate items by clicking \'Generate Items\'.',
      reserved: '{{count}} reserved',
      reservedHint: 'Quantity reserved in pending delivery packages',
    },
    expiration: {
      expired: 'expired',
      expiring: 'Expires soon',
      valid: 'Within shelf life',
      none: 'Does not expire',
    },
    rowActions: {
      edit: 'Edit item',
      adjustStock: 'Adjust quantity',
      delete: 'Delete item',
      movements: 'View movements',
    },
    modals: {
      create: 'Generate Items',
      update: 'Edit Item {{code}}',
      updateQuantity: 'Adjust Quantity',
      delete: 'Delete Item',
    },
    delete: {
      confirm: 'Remove item "{{code}}" from the stock? Use it for losses, breakage or expired items.',
    },
  },

  movements: {
    page: {
      title: 'Movements',
      subtitle: 'Everything that came in, went out or moved around the stock, item by item',
    },
    search: {
      placeholder: 'Search by code or product...',
    },
    filters: {
      type: 'All types',
      product: 'All products',
      storage: 'All storages',
      period: 'Period',
      dateFrom: 'Start date',
      dateTo: 'End date',
    },
    types: {
      entry: 'Entry',
      production: 'Production',
      consumption: 'Consumption',
      adjustment: 'Adjustment',
      transfer: 'Transfer',
      delivery: 'Delivery',
      write_off: 'Write-off',
    },
    table: {
      count_one: '{{count}} movement',
      count_other: '{{count}} movements',
      empty: 'No movements found',
      columns: {
        date: 'Date',
        type: 'Type',
        item: 'Item',
        product: 'Product',
        quantity: 'Quantity',
        balance: 'Item balance',
        storage: 'Storage',
        user: 'User',
      },
      package: 'Package #{{id}}',
      openItem: 'Open in the items list',
      itemGone: 'This item has already left the stock',
      noStorage: 'No storage',
      to: 'to',
    },
  },

  deliveries: {
    page: {
      title: 'Deliveries',
      subtitle: 'Package products, see which items to pick and record deliveries',
    },
    actions: {
      new: 'New Package',
    },
    filters: {
      pending: 'Pending',
      delivered: 'Delivered',
      all: 'All',
    },
    table: {
      count_one: '{{count}} package',
      count_other: '{{count}} packages',
      columns: {
        package: 'Package',
        items: 'Items',
        notes: 'Notes',
        status: 'Status',
      },
      packageNumber: 'Package #{{id}}',
      empty: 'No packages found. Create the first one by clicking \'New Package\'.',
    },
    status: {
      pending: 'Pending',
      delivered: 'Delivered',
    },
    rowActions: {
      deliver: 'Mark as delivered',
      edit: 'Edit package',
      delete: 'Undo package',
    },
    modals: {
      create: 'New Delivery Package',
      update: 'Edit Package #{{id}}',
      deliver: 'Deliver Package #{{id}}',
      delete: 'Undo Package',
    },
    deliver: {
      confirm: 'When you confirm, these items leave the stock:',
      pick: 'Pick: {{codes}}',
      inStock: 'In stock: {{count}}',
      shortage: 'There is not enough stock for some item. Adjust the stock or edit the package before delivering.',
      submit: 'Confirm delivery',
    },
    delete: {
      submit: 'Undo',
      confirmPending: 'Are you sure you want to undo package #{{id}}? The items are no longer set aside and stay in the stock.',
      confirmDelivered: 'Are you sure you want to undo package #{{id}} and remove it from the history? Delivered items do not go back to the stock.',
    },
  },

  forms: {
    password: {
      show: 'Show password',
      hide: 'Hide password',
    },

    color: {
      swatches: 'Suggested colors',
    },

    select: {
      clear: 'Clear selection',
      empty: 'No options found',
    },

    unit: {
      name: {
        label: 'Name',
        placeholder: 'Enter a name',
      },
      abbreviation: {
        label: 'Abbreviation',
        placeholder: 'Enter an abbreviation',
      },
      validation: {
        nameRequired: 'Name is required',
        abbreviationRequired: 'Abbreviation is required',
      },
    },

    category: {
      name: {
        label: 'Name',
        placeholder: 'Enter a name',
      },
      color: {
        label: 'Color',
        placeholder: 'Enter a hex color code',
      },
      validation: {
        nameRequired: 'Name is required',
        colorRequired: 'Color is required',
      },
    },

    storage: {
      name: {
        label: 'Name',
        placeholder: 'Enter a name',
      },
      description: {
        label: 'Description',
        placeholder: 'Describe this storage location',
      },
      validation: {
        nameRequired: 'Name is required',
      },
    },

    product: {
      name: {
        label: 'Name',
        placeholder: 'E.g.: Cabinet model A',
      },
      sku: {
        label: 'SKU',
        placeholder: 'E.g.: CAB-A',
      },
      mode: {
        label: 'Tracking',
        atomic: 'Atomic',
        bulk: 'Bulk',
        atomicDescription: 'Each unit is an item with its own code (a cabinet, a cake).',
        bulkDescription: 'Each item is a lot holding a quantity (screws, flour).',
        locked: 'The product already has items: tracking can no longer change.',
      },
      unit: {
        label: 'Unit',
        placeholder: 'Select a unit',
      },
      shelfLife: {
        label: 'Shelf life (days)',
        placeholder: 'Does not expire',
        description: 'Days after production. Leave empty if it does not expire.',
      },
      categories: {
        label: 'Categories',
        placeholder: 'Select the categories',
      },
      components: {
        label: 'Recipe',
        description: 'Products used to make one unit. Can be consumed from the stock when generating items.',
        selectPlaceholder: 'Select a product',
        qtyPlaceholder: 'Quantity',
        quantityOf: 'Quantity of {{name}}',
        empty: 'No components: the product is not made from others.',
        add: 'Add component',
        remove: 'Remove component',
      },
      validation: {
        nameRequired: 'Name is required',
        unitRequired: 'Unit is required',
        sku: 'Use letters, numbers, dots, hyphens or underscores',
        shelfLife: 'Use a whole number of days, at least 1',
        componentQuantity: 'Each component needs a quantity greater than zero',
        componentInteger: 'Atomic components are counted per unit: use whole numbers',
      },
    },

    createItems: {
      product: {
        label: 'Product',
        placeholder: 'Select a product',
        locked: 'Producing from this product\'s row: the product cannot be changed here.',
      },
      quantity: {
        atomicLabel: 'How many items',
        atomicDescription: 'Each one gets its own code.',
        bulkLabel: 'Lot quantity ({{unit}})',
        bulkDescription: 'A single record with this quantity.',
      },
      producedAt: {
        label: 'Production date',
        expiresOn: 'Expires on {{date}} ({{count}} days).',
        noExpiration: 'This product does not expire.',
      },
      storage: {
        label: 'Storage',
        placeholder: 'Select a storage (optional)',
      },
      consume: {
        label: 'Consume the recipe from stock',
        description: 'Components leave the stock, first-expiring first.',
        line: 'Needs {{required}} · free {{free}}',
        max: 'You can produce up to {{count}} with the free stock.',
      },
      submit: 'Generate',
      validation: {
        productRequired: 'Product is required',
        quantityRequired: 'Quantity is required',
        quantityPositive: 'Quantity must be greater than zero',
        integer: 'Atomic items: use a whole number',
        max: 'At most {{count}} at a time',
        dateRequired: 'Production date is required',
      },
    },

    updateItem: {
      code: {
        label: 'Code',
        description: 'Generated automatically on creation; it cannot be changed.',
      },
      producedAt: {
        label: 'Production date',
        description: 'Changing it recalculates the expiration from the product shelf life.',
      },
      expiresAt: {
        label: 'Expiration',
        description: 'Empty = does not expire.',
      },
      storage: {
        label: 'Storage',
        placeholder: 'Select a storage (optional)',
      },
      validation: {
        dateRequired: 'Production date is required',
      },
    },

    updateQuantity: {
      description: {
        set: 'Set the new quantity of "{{name}}".',
        add: 'Enter how much came into stock for "{{name}}".',
        subtract: 'Enter how much left stock for "{{name}}".',
      },
      current: 'Current quantity: {{count}}',
      mode: {
        set: 'Set value',
        add: 'Add',
        subtract: 'Subtract',
      },
      quantity: {
        label: 'New quantity',
        placeholder: 'Enter a value',
      },
      amount: {
        label: 'Amount',
        placeholder: 'Enter a value',
      },
      preview: 'New quantity: {{count}}',
      validation: {
        required: 'Quantity is required',
        min: 'Quantity cannot be negative',
        positive: 'Amount must be greater than zero',
        max: 'Cannot subtract more than the current stock ({{count}})',
      },
      setWarning: {
        title: 'Careful: "Set value" erases what other people record at the same time',
        body: 'The number you type replaces the whole quantity of this lot. If someone records stock coming in or going out of it while this window is open, that movement is lost without warning and the stock ends up wrong.',
        advice: 'Prefer "Add" or "Subtract": they only apply the difference and never erase anyone\'s record. Use "Set value" only to fix the number after counting the lot by hand.',
      },
    },

    deliveryPackage: {
      items: {
        label: 'Package products',
        selectPlaceholder: 'Select a product',
        qtyPlaceholder: 'Quantity',
        add: 'Add product',
        remove: 'Remove product',
        empty: 'No products added.',
        free: 'Free: {{count}} {{unit}}',
        quantityOf: 'Quantity of {{name}}',
        option: '{{name}} · {{count}} {{unit}}',
        mode: {
          fefo: 'Oldest first',
          manual: 'Pick one by one',
          fefoDescription: 'The system sets aside the items that expire first.',
          manualDescription: 'Choose exactly which items go in the package, in the quantity entered.',
        },
        pickLabel: 'Selected items ({{selected}} of {{count}})',
        pickPlaceholder: 'Search by code',
        pickLoading: 'Loading items…',
        pickOption: '{{code}} · expires {{date}}',
        pickOptionNoExpiration: '{{code}} · does not expire',
      },
      notes: {
        label: 'Notes',
        placeholder: 'Address, customer, time, payment method...',
      },
      validation: {
        itemsRequired: 'Add at least one product to the package',
        quantityPositive: 'Each product needs a quantity greater than zero',
        integer: 'Atomic products are counted per unit: use whole numbers',
        notesMax: 'Notes can have at most {{count}} characters',
        selectionMismatch: 'In "Pick one by one", pick exactly the quantity entered for each product',
      },
    },
  },

  notifications: {
    errors: {
      createUnit: 'Could not create the unit. Please try again.',
      updateUnit: 'Could not update the unit. Please try again.',
      deleteUnit: 'Could not delete the unit. Please try again.',
      createCategory: 'Could not create the category. Please try again.',
      updateCategory: 'Could not update the category. Please try again.',
      deleteCategory: 'Could not delete the category. Please try again.',
      createProduct: 'Could not create the product. Please try again.',
      updateProduct: 'Could not update the product. Please try again.',
      deleteProduct: 'Could not delete the product. Please try again.',
      createItems: 'Could not generate the items.',
      deleteItem: 'Could not delete the item. Please try again.',
      updateQuantity: 'Could not update the quantity.',
      updateItem: 'Could not update the item. Please try again.',
      createStorage: 'Could not create the storage. Please try again.',
      updateStorage: 'Could not update the storage. Please try again.',
      deleteStorage: 'Could not delete the storage. Please try again.',
      createDeliveryPackage: 'Could not create the package. Please try again.',
      updateDeliveryPackage: 'Could not update the package. Please try again.',
      deleteDeliveryPackage: 'Could not undo the package. Please try again.',
      deliverDeliveryPackage: 'Could not deliver the package.',
      deleteUser: 'Could not delete the user. Please try again.',
      approveRegistrationRequest: 'Could not approve the request. Please try again.',
      rejectRegistrationRequest: 'Could not reject the request. Please try again.',
    },
  },
};
