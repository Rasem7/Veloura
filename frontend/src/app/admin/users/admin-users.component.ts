import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountType, ProviderStatus, Role, User } from '../../core/models';
import { AdminService, UserPayload, UserStats } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: Role;
  accountType: AccountType;
  phone: string;
  companyName: string;
  website: string;
  providerStatus: ProviderStatus;
  isActive: boolean;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [DatePipe, FormsModule],
  template: `
    <div>
      <div class="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.34em] text-royal">Users CRUD</p>
          <h1 class="mt-2 text-4xl font-black text-ink dark:text-white">Clients & Providers</h1>
          <p class="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">Manage buyers, supplier accounts, admin access, status, and onboarding data from one place.</p>
        </div>
        <button class="btn-secondary px-5 py-3" type="button" (click)="resetForm()">New user</button>
      </div>

      <section class="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div class="panel p-4">
          <p class="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Clients</p>
          <p class="mt-3 text-3xl font-black text-ink dark:text-white">{{ stats()?.clients || 0 }}</p>
        </div>
        <div class="panel p-4">
          <p class="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Providers</p>
          <p class="mt-3 text-3xl font-black text-ink dark:text-white">{{ stats()?.providers || 0 }}</p>
        </div>
        <div class="panel p-4">
          <p class="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Active</p>
          <p class="mt-3 text-3xl font-black text-emerald-600">{{ stats()?.active || 0 }}</p>
        </div>
        <div class="panel p-4">
          <p class="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Disabled</p>
          <p class="mt-3 text-3xl font-black text-red-600">{{ stats()?.disabled || 0 }}</p>
        </div>
      </section>

      <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <section class="panel p-4">
          <div class="grid gap-3 lg:grid-cols-[1fr_10rem_10rem_10rem]">
            <input class="input" name="search" [(ngModel)]="filters.search" (keyup.enter)="load()" placeholder="Search users">
            <select class="input" name="accountType" [(ngModel)]="filters.accountType" (change)="load()">
              <option value="all">All types</option>
              <option value="client">Clients</option>
              <option value="provider">Providers</option>
            </select>
            <select class="input" name="role" [(ngModel)]="filters.role" (change)="load()">
              <option value="all">All roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
            <select class="input" name="status" [(ngModel)]="filters.status" (change)="load()">
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Disabled</option>
            </select>
          </div>

          <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm font-bold text-slate-500">{{ totalUsers() }} users found</p>
            <button class="rounded-full bg-purple-50 px-4 py-2 text-sm font-black text-royal transition hover:bg-purple-100 dark:bg-white/8 dark:hover:bg-white/12" type="button" (click)="load()">Apply filters</button>
          </div>

          <div class="mt-4 overflow-x-auto">
            <table class="w-full min-w-[920px] text-left text-sm">
              <thead class="text-xs uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th class="p-3">User</th>
                  <th class="p-3">Type</th>
                  <th class="p-3">Provider profile</th>
                  <th class="p-3">Role</th>
                  <th class="p-3">Status</th>
                  <th class="p-3">Auth</th>
                  <th class="p-3">Joined</th>
                  <th class="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (user of users(); track user._id || user.id) {
                  <tr class="border-t border-purple-100 align-top dark:border-white/10">
                    <td class="p-3">
                      <p class="font-black text-ink dark:text-white">{{ user.name }}</p>
                      <p class="mt-1 text-xs text-slate-500">{{ user.email }}</p>
                      @if (user.phone) {
                        <p class="mt-1 text-xs text-slate-500">{{ user.phone }}</p>
                      }
                    </td>
                    <td class="p-3">
                      <span [class]="'rounded-full px-3 py-1 text-xs font-black uppercase ' + typeClass(user)">
                        {{ user.accountType || 'client' }}
                      </span>
                    </td>
                    <td class="p-3">
                      @if ((user.accountType || 'client') === 'provider') {
                        <p class="font-bold">{{ user.providerProfile?.companyName || 'Provider' }}</p>
                        <p class="mt-1 text-xs capitalize text-slate-500">{{ user.providerProfile?.status || 'pending' }}</p>
                      } @else {
                        <span class="text-xs text-slate-400">Buyer account</span>
                      }
                    </td>
                    <td class="p-3">
                      <span class="rounded-full bg-purple-50 px-3 py-1 text-xs font-black uppercase text-royal dark:bg-white/8">{{ user.role }}</span>
                    </td>
                    <td class="p-3">
                      <span [class]="'rounded-full px-3 py-1 text-xs font-black uppercase ' + statusClass(user)">
                        {{ user.isActive === false ? 'disabled' : 'active' }}
                      </span>
                    </td>
                    <td class="p-3 capitalize">{{ (user.authProvider || 'local').replace('_', ' ') }}</td>
                    <td class="p-3">{{ user.createdAt | date:'mediumDate' }}</td>
                    <td class="p-3">
                      <div class="flex flex-wrap gap-2">
                        <button class="rounded-full bg-purple-50 px-3 py-2 font-bold text-royal transition hover:bg-purple-100 dark:bg-white/8" type="button" (click)="edit(user)">Edit</button>
                        <button class="rounded-full bg-red-50 px-3 py-2 font-bold text-red-600 transition hover:bg-red-100" type="button" (click)="disable(user)" [disabled]="user.isActive === false">Disable</button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="p-8 text-center text-sm font-bold text-slate-500">No users match these filters.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>

        <form class="panel p-5" (ngSubmit)="save()">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-black uppercase tracking-[0.2em] text-royal">Account</p>
              <h2 class="mt-2 text-2xl font-black text-ink dark:text-white">{{ editingId() ? 'Edit user' : 'Create user' }}</h2>
            </div>
            @if (editingId()) {
              <button class="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600 dark:bg-white/8 dark:text-slate-200" type="button" (click)="resetForm()">Clear</button>
            }
          </div>

          <input class="input mt-5" name="name" [(ngModel)]="form.name" placeholder="Full name" required>
          <input class="input mt-3" type="email" name="email" [(ngModel)]="form.email" placeholder="Email" required>
          <input class="input mt-3" type="password" name="password" [(ngModel)]="form.password" [placeholder]="editingId() ? 'New password optional' : 'Temporary password'" [required]="!editingId()">

          <div class="mt-3 grid grid-cols-2 gap-3">
            <select class="input" name="accountTypeForm" [(ngModel)]="form.accountType">
              <option value="client">Client</option>
              <option value="provider">Provider</option>
            </select>
            <select class="input" name="roleForm" [(ngModel)]="form.role">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <input class="input mt-3" name="phone" [(ngModel)]="form.phone" placeholder="Phone optional">

          @if (form.accountType === 'provider') {
            <div class="mt-4 border-t border-purple-100 pt-4 dark:border-white/10">
              <input class="input" name="companyName" [(ngModel)]="form.companyName" placeholder="Company name">
              <input class="input mt-3" name="website" [(ngModel)]="form.website" placeholder="Website">
              <select class="input mt-3" name="providerStatus" [(ngModel)]="form.providerStatus">
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          }

          <label class="mt-4 flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
            <input class="h-5 w-5 accent-purple-700" type="checkbox" name="isActive" [(ngModel)]="form.isActive">
            Active account
          </label>

          <button class="btn-primary mt-5 w-full" type="submit" [disabled]="saving()">
            {{ saving() ? 'Saving...' : 'Save user' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly toast = inject(ToastService);

  readonly users = signal<User[]>([]);
  readonly stats = signal<UserStats | null>(null);
  readonly editingId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly totalUsers = computed(() => this.users().length);

  filters = {
    accountType: 'all' as AccountType | 'all',
    role: 'all' as Role | 'all',
    status: 'all' as 'active' | 'inactive' | 'all',
    search: ''
  };

  form: UserForm = this.emptyForm();

  ngOnInit() {
    this.load();
  }

  load() {
    this.admin.users({ ...this.filters, limit: 100 }).subscribe({
      next: (response) => this.users.set(response.users),
      error: (error) => this.toast.show(error.error?.message || 'Could not load users', 'error')
    });

    this.admin.userStats().subscribe({
      next: (stats) => this.stats.set(stats),
      error: () => this.stats.set(null)
    });
  }

  edit(user: User) {
    this.editingId.set(this.userId(user));
    this.form = {
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      accountType: user.accountType || 'client',
      phone: user.phone || '',
      companyName: user.providerProfile?.companyName || '',
      website: user.providerProfile?.website || '',
      providerStatus: user.providerProfile?.status || 'pending',
      isActive: user.isActive !== false
    };
  }

  save() {
    this.saving.set(true);
    const payload = this.toPayload();
    const request = this.editingId()
      ? this.admin.updateUser(this.editingId() as string, payload)
      : this.admin.createUser(payload as UserPayload);

    request.subscribe({
      next: () => {
        this.toast.show('User saved', 'success');
        this.resetForm();
        this.load();
      },
      error: (error) => {
        this.saving.set(false);
        this.toast.show(error.error?.message || 'Could not save user', 'error');
      }
    });
  }

  disable(user: User) {
    const id = this.userId(user);
    if (!id || !confirm(`Disable ${user.name}?`)) return;

    this.admin.deleteUser(id).subscribe({
      next: () => {
        this.toast.show('User disabled', 'info');
        this.load();
      },
      error: (error) => this.toast.show(error.error?.message || 'Could not disable user', 'error')
    });
  }

  resetForm() {
    this.editingId.set(null);
    this.saving.set(false);
    this.form = this.emptyForm();
  }

  statusClass(user: User) {
    return user.isActive === false
      ? 'bg-red-50 text-red-600 dark:bg-red-500/10'
      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300';
  }

  typeClass(user: User) {
    return (user.accountType || 'client') === 'provider'
      ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200'
      : 'bg-purple-50 text-royal dark:bg-white/8';
  }

  private emptyForm(): UserForm {
    return {
      name: '',
      email: '',
      password: '',
      role: 'user',
      accountType: 'client',
      phone: '',
      companyName: '',
      website: '',
      providerStatus: 'pending',
      isActive: true
    };
  }

  private toPayload(): Partial<UserPayload> {
    const payload: Partial<UserPayload> = {
      name: this.form.name,
      email: this.form.email,
      role: this.form.role,
      accountType: this.form.accountType,
      phone: this.form.phone || undefined,
      isActive: this.form.isActive
    };

    if (this.form.password) {
      payload.password = this.form.password;
    }

    if (this.form.accountType === 'provider') {
      payload.companyName = this.form.companyName || undefined;
      payload.website = this.form.website || undefined;
      payload.providerStatus = this.form.providerStatus;
    }

    return payload;
  }

  private userId(user: User) {
    return user._id || user.id || '';
  }
}
