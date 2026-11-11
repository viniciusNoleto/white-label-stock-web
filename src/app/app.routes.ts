import type { Routes } from '@angular/router';
import { adminGuard } from '@/resources/auth/guards/admin';
import { authGuard } from '@/resources/auth/guards/auth';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'home.subtitle',
    loadComponent: () => import('./page').then((m) => m.HomePage),
  },
  {
    path: 'auth/login',
    title: 'auth.login.title',
    loadComponent: () => import('./auth/login/page').then((m) => m.LoginPage),
  },
  {
    path: 'auth/register',
    title: 'auth.register.title',
    loadComponent: () => import('./auth/register/page').then((m) => m.RegisterPage),
  },
  {
    // Casca autenticada (AppShell) compartilhada pelo painel e pelo inventário.
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./inventory/layout').then((m) => m.InventoryLayout),
    children: [
      {
        path: 'dashboard',
        title: 'dashboard.page.title',
        loadComponent: () => import('./dashboard/page').then((m) => m.DashboardPage),
      },
      {
        path: 'inventory',
        children: [
          { path: '', pathMatch: 'full', redirectTo: '/dashboard' },
          {
            path: 'stock',
            title: 'stock.page.title',
            loadComponent: () => import('./inventory/stock/page').then((m) => m.StockPage),
          },
          {
            path: 'items',
            title: 'items.page.title',
            loadComponent: () => import('./inventory/items/page').then((m) => m.ItemsPage),
          },
          {
            path: 'products',
            title: 'products.page.title',
            loadComponent: () => import('./inventory/products/page').then((m) => m.ProductsPage),
          },
          {
            path: 'deliveries',
            title: 'deliveries.page.title',
            loadComponent: () => import('./inventory/deliveries/page').then((m) => m.DeliveriesPage),
          },
          {
            path: 'movements',
            title: 'movements.page.title',
            loadComponent: () => import('./inventory/movements/page').then((m) => m.MovementsPage),
          },
          {
            path: 'categories',
            title: 'categories.page.title',
            loadComponent: () => import('./inventory/categories/page').then((m) => m.CategoriesPage),
          },
          {
            path: 'units',
            title: 'units.page.title',
            loadComponent: () => import('./inventory/units/page').then((m) => m.UnitsPage),
          },
          {
            path: 'storages',
            title: 'storages.page.title',
            loadComponent: () => import('./inventory/storages/page').then((m) => m.StoragesPage),
          },
          {
            path: 'registration-requests',
            title: 'registrationRequests.page.title',
            canActivate: [adminGuard],
            loadComponent: () => import('./inventory/registration-requests/page').then((m) => m.RegistrationRequestsPage),
          },
          {
            path: 'users',
            title: 'users.page.title',
            canActivate: [adminGuard],
            loadComponent: () => import('./inventory/users/page').then((m) => m.UsersPage),
          },
        ],
      },
    ],
  },
  {
    path: '**',
    title: 'notFound.title',
    loadComponent: () => import('./not-found/page').then((m) => m.NotFoundPage),
  },
];
