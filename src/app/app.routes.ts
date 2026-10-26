import type { Routes } from '@angular/router';
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
    path: 'inventory',
    canActivate: [authGuard],
    loadComponent: () => import('./inventory/layout').then((m) => m.InventoryLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'items' },
      {
        path: 'items',
        title: 'inventory.page.title',
        loadComponent: () => import('./inventory/items/page').then((m) => m.ItemsPage),
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
    ],
  },
  {
    path: '**',
    title: 'notFound.title',
    loadComponent: () => import('./not-found/page').then((m) => m.NotFoundPage),
  },
];
