import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { User } from '../../core/models';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div>
      <div class="mb-6">
        <p class="text-xs font-black uppercase tracking-[0.34em] text-royal">Customers</p>
        <h1 class="mt-2 text-4xl font-black text-ink dark:text-white">Users</h1>
      </div>

      <section class="panel overflow-x-auto p-4">
        <table class="w-full min-w-[680px] text-left text-sm">
          <thead class="text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th class="p-3">Name</th>
              <th class="p-3">Email</th>
              <th class="p-3">Role</th>
              <th class="p-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            @for (user of users(); track user._id || user.id) {
              <tr class="border-t border-purple-100 dark:border-white/10">
                <td class="p-3 font-black">{{ user.name }}</td>
                <td class="p-3">{{ user.email }}</td>
                <td class="p-3"><span class="rounded-full bg-purple-50 px-3 py-1 text-xs font-black uppercase text-royal dark:bg-white/8">{{ user.role }}</span></td>
                <td class="p-3">{{ user.createdAt | date:'mediumDate' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </section>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  private readonly admin = inject(AdminService);
  readonly users = signal<User[]>([]);

  ngOnInit() {
    this.admin.users().subscribe((response) => this.users.set(response.users));
  }
}

