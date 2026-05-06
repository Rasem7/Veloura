import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 1;

  show(message: string, type: Toast['type'] = 'info') {
    const toast = { id: this.nextId++, type, message };
    this.toasts.update((items) => [...items, toast]);
    window.setTimeout(() => this.dismiss(toast.id), 3500);
  }

  dismiss(id: number) {
    this.toasts.update((items) => items.filter((toast) => toast.id !== id));
  }
}

