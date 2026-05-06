import { Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-grid',
  standalone: true,
  template: `
    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      @for (item of placeholders; track item) {
        <div>
          <div class="skeleton aspect-[4/5]"></div>
          <div class="mt-4 h-4 w-2/3 skeleton"></div>
          <div class="mt-2 h-3 w-1/3 skeleton"></div>
        </div>
      }
    </div>
  `
})
export class SkeletonGridComponent {
  readonly placeholders = Array.from({ length: 8 }, (_, index) => index);
}

