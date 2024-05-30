import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'tasks'
    },
    {
        path: '',
        canActivateChild: [authGuard('REQUIRED_LOGGED_OUT')],
        children: [
            { path: 'login', loadComponent: () => import('./pages/login-page/login-page.component') },
            { path: 'signup', loadComponent: () => import('./pages/signup-page/signup-page.component') },
        ]
    },
    {
        path: '',
        canActivateChild: [authGuard('REQUIRED_LOGGED_IN')],
        children: [
            { path: 'tasks', loadComponent: () => import('./pages/tasks-page/tasks-page.component') }
        ]
    }
];
