import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/consulta/consulta.component').then((m) => m.ConsultaComponent),
  },
  {
    path: 'historial',
    loadComponent: () =>
      import('./features/historial/historial.component').then((m) => m.HistorialComponent),
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component').then((m) => m.AdminComponent),
  },
  { path: '**', redirectTo: '' },
];
