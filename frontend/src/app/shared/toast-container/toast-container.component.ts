import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="fixed right-4 top-24 z-50 grid w-[min(22rem,calc(100vw-2rem))] gap-3">
      @for (toast of toastService.toasts(); track toast.id) {
        <button type="button" class="rounded-2xl border px-4 py-3 text-left text-sm font-semibold shadow-xl backdrop-blur transition hover:-translate-y-0.5"
          [class.border-emerald-200]="toast.type === 'success'"
          [class.bg-emerald-50]="toast.type === 'success'"
          [class.text-emerald-900]="toast.type === 'success'"
          [class.border-red-200]="toast.type === 'error'"
          [class.bg-red-50]="toast.type === 'error'"
          [class.text-red-900]="toast.type === 'error'"
          [class.border-purple-100]="toast.type === 'info'"
          [class.bg-white]="toast.type === 'info'"
          [class.text-velvet]="toast.type === 'info'"
          (click)="toastService.dismiss(toast.id)">
          {{ toast.message }}
        </button>
      }
    </div>
  `
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}

