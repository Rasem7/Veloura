import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'shop',
    loadComponent: () => import('./features/product-list/product-list.component').then((m) => m.ProductListComponent)
  },
  {
    path: 'product/:slug',
    loadComponent: () => import('./features/product-detail/product-detail.component').then((m) => m.ProductDetailComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart.component').then((m) => m.CartComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./features/user-dashboard/user-dashboard.component').then((m) => m.UserDashboardComponent)
  },
  {
    path: 'orders/:id/confirmation',
    loadComponent: () => import('./features/order-confirmation/order-confirmation.component').then((m) => m.OrderConfirmationComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/auth.component').then((m) => m.AuthComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/auth.component').then((m) => m.AuthComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./admin/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./admin/dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./admin/products/admin-products.component').then((m) => m.AdminProductsComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./admin/orders/admin-orders.component').then((m) => m.AdminOrdersComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./admin/users/admin-users.component').then((m) => m.AdminUsersComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

