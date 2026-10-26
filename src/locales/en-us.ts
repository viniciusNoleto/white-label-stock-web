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
    table: {
      emptyDefault: 'No data found',
      actionsColumn: 'Actions',
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
      validation: {
        emailRequired: 'Email is required',
        emailInvalid: 'Invalid email',
        passwordRequired: 'Password is required',
      },
      notifications: {
        error: 'Could not sign in. Please try again.',
      },
    },
    sessionExpired: 'Your session has expired. Please sign in again.',
  },

  sidebar: {
    section: 'Inventory',
    items: 'Items',
    categories: 'Categories',
    units: 'Units',
    storages: 'Storages',
  },

  units: {
    page: {
      title: 'Units',
      subtitle: 'Manage measurement units',
    },
    table: {
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

  inventory: {
    page: {
      title: 'Items',
      subtitle: 'Manage your stock items',
    },
    actions: {
      newUnit: 'New Unit',
      newCategory: 'New Category',
      newItem: 'New Item',
    },
    search: {
      placeholder: 'Search by name...',
    },
    table: {
      columns: {
        name: 'Name',
        categories: 'Categories',
        quantity: 'Quantity',
        unit: 'Unit',
        storage: 'Storage',
      },
      empty: 'No items found. Create the first one by clicking \'New Item\'.',
    },
    rowActions: {
      editQuantity: 'Edit quantity',
      editName: 'Edit name',
      editStorage: 'Edit storage',
      build: 'Build',
    },
    modals: {
      createUnit: 'New Unit',
      updateUnit: 'Edit Unit',
      deleteUnit: 'Delete Unit',
      createCategory: 'New Category',
      updateCategory: 'Edit Category',
      deleteCategory: 'Delete Category',
      createItem: 'New Inventory Item',
      updateQuantity: 'Edit Quantity',
      updateName: 'Edit Name',
      updateStorage: 'Edit Storage',
      build: 'Build: {{name}}',
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

    inventoryItem: {
      name: {
        label: 'Name',
        placeholder: 'Enter a name',
      },
      unit: {
        label: 'Unit',
        placeholder: 'Select a unit',
      },
      quantity: {
        label: 'Initial quantity',
        placeholder: 'Enter a quantity',
      },
      categories: {
        label: 'Categories',
        placeholder: 'Select categories',
      },
      storage: {
        label: 'Storage',
        placeholder: 'Select a storage location (optional)',
      },
      components: {
        label: 'Components',
        selectPlaceholder: 'Select an item',
        qtyPlaceholder: 'Enter a quantity',
        empty: 'No components added.',
        add: 'Add component',
        remove: 'Remove component',
      },
      validation: {
        nameRequired: 'Name is required',
        unitRequired: 'Unit is required',
      },
    },

    updateQuantity: {
      description: 'Set the new quantity for "{{name}}".',
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
      },
    },

    build: {
      noComponentsMessage: 'This item has no registered components. Add components when creating or editing the item.',
      requiredComponentsLabel: 'Components required per unit',
      requiredLabel: 'Required: {{count}}',
      availableLabel: 'Available: {{count}}',
      maxPossibleLabel: 'Max. possible: {{count}}',
      quantity: {
        label: 'Quantity to build',
        placeholder: 'Enter a quantity',
      },
      submit: 'Build',
      validation: {
        required: 'Quantity is required',
        min: 'Minimum of 1 unit',
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
      createItem: 'Could not create the item. Please try again.',
      updateQuantity: 'Could not update the quantity.',
      updateItemName: 'Could not update the name. Please try again.',
      updateItemStorage: 'Could not update the storage. Please try again.',
      build: 'Could not build the item.',
      createStorage: 'Could not create the storage. Please try again.',
      updateStorage: 'Could not update the storage. Please try again.',
      deleteStorage: 'Could not delete the storage. Please try again.',
    },
  },
};
