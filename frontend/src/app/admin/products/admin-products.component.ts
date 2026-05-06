import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product, ProductCategory } from '../../core/models';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';

interface ProductForm {
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  compareAtPrice?: number;
  colorsText: string;
  sizesText: string;
  imagesText: string;
  benefitsText: string;
  tagsText: string;
  material: string;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  template: `
    <div>
      <div class="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.34em] text-royal">Product CRUD</p>
          <h1 class="mt-2 text-4xl font-black text-ink dark:text-white">Products</h1>
        </div>
        <button class="btn-secondary" type="button" (click)="resetForm()">New product</button>
      </div>

      <div class="grid gap-6 xl:grid-cols-[1fr_25rem]">
        <section class="panel overflow-x-auto p-4">
          <table class="w-full min-w-[720px] text-left text-sm">
            <thead class="text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th class="p-3">Product</th>
                <th class="p-3">Category</th>
                <th class="p-3">Price</th>
                <th class="p-3">Stock</th>
                <th class="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (product of products(); track product._id) {
                <tr class="border-t border-purple-100 dark:border-white/10">
                  <td class="p-3">
                    <div class="flex items-center gap-3">
                      <img class="h-14 w-11 object-cover" [src]="product.images[0]?.url" [alt]="product.name">
                      <div>
                        <p class="font-black">{{ product.name }}</p>
                        <p class="text-xs text-slate-500">{{ product.slug }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="p-3">{{ product.category }}</td>
                  <td class="p-3">{{ product.price | currency }}</td>
                  <td class="p-3">{{ stock(product) }}</td>
                  <td class="p-3">
                    <div class="flex gap-2">
                      <button class="rounded-full bg-purple-50 px-3 py-2 font-bold text-royal dark:bg-white/8" type="button" (click)="edit(product)">Edit</button>
                      <button class="rounded-full bg-red-50 px-3 py-2 font-bold text-red-600" type="button" (click)="remove(product)">Delete</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </section>

        <form class="panel p-5" (ngSubmit)="save()">
          <h2 class="text-xl font-black">{{ editingId() ? 'Edit product' : 'Create product' }}</h2>
          <input class="input mt-4" name="name" [(ngModel)]="form.name" placeholder="Name" required>
          <textarea class="input mt-3 min-h-24" name="description" [(ngModel)]="form.description" placeholder="Description" required></textarea>
          <select class="input mt-3" name="category" [(ngModel)]="form.category">
            <option value="Women">Women</option>
            <option value="Men">Men</option>
            <option value="Accessories">Accessories</option>
          </select>
          <div class="mt-3 grid grid-cols-2 gap-3">
            <input class="input" type="number" name="price" [(ngModel)]="form.price" placeholder="Price" required>
            <input class="input" type="number" name="compareAtPrice" [(ngModel)]="form.compareAtPrice" placeholder="Compare price">
          </div>
          <input class="input mt-3" name="colorsText" [(ngModel)]="form.colorsText" placeholder="Colors, comma separated">
          <input class="input mt-3" name="sizesText" [(ngModel)]="form.sizesText" placeholder="Sizes, e.g. S:8,M:12,L:4">
          <textarea class="input mt-3 min-h-20" name="imagesText" [(ngModel)]="form.imagesText" placeholder="Image URLs, one per line"></textarea>
          <textarea class="input mt-3 min-h-20" name="benefitsText" [(ngModel)]="form.benefitsText" placeholder="Benefits, one per line"></textarea>
          <input class="input mt-3" name="tagsText" [(ngModel)]="form.tagsText" placeholder="Tags, comma separated">
          <input class="input mt-3" name="material" [(ngModel)]="form.material" placeholder="Material">
          <button class="btn-primary mt-5 w-full" type="submit">Save product</button>
        </form>
      </div>
    </div>
  `
})
export class AdminProductsComponent implements OnInit {
  private readonly productsApi = inject(ProductService);
  private readonly toast = inject(ToastService);

  readonly products = signal<Product[]>([]);
  readonly editingId = signal<string | null>(null);

  form: ProductForm = this.emptyForm();

  ngOnInit() {
    this.load();
  }

  load() {
    this.productsApi.getProducts({ limit: 48, sort: 'latest' }).subscribe((response) => this.products.set(response.products));
  }

  stock(product: Product) {
    return product.sizes.reduce((sum, size) => sum + size.stock, 0);
  }

  edit(product: Product) {
    this.editingId.set(product._id);
    this.form = {
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      colorsText: product.colors.join(', '),
      sizesText: product.sizes.map((size) => `${size.label}:${size.stock}`).join(', '),
      imagesText: product.images.map((image) => image.url).join('\n'),
      benefitsText: product.benefits.join('\n'),
      tagsText: product.tags.join(', '),
      material: product.material || ''
    };
  }

  save() {
    const payload = this.toPayload();
    const request = this.editingId()
      ? this.productsApi.updateProduct(this.editingId() as string, payload)
      : this.productsApi.createProduct(payload);

    request.subscribe({
      next: () => {
        this.toast.show('Product saved', 'success');
        this.resetForm();
        this.load();
      },
      error: (error) => this.toast.show(error.error?.message || 'Could not save product', 'error')
    });
  }

  remove(product: Product) {
    this.productsApi.deleteProduct(product._id).subscribe({
      next: () => {
        this.toast.show('Product deleted', 'info');
        this.load();
      },
      error: (error) => this.toast.show(error.error?.message || 'Could not delete product', 'error')
    });
  }

  resetForm() {
    this.editingId.set(null);
    this.form = this.emptyForm();
  }

  private emptyForm(): ProductForm {
    return {
      name: '',
      description: '',
      category: 'Women',
      price: 0,
      colorsText: 'Black, Purple',
      sizesText: 'S:8, M:12, L:6',
      imagesText: '',
      benefitsText: '',
      tagsText: '',
      material: ''
    };
  }

  private toPayload(): Partial<Product> {
    return {
      name: this.form.name,
      description: this.form.description,
      category: this.form.category,
      price: Number(this.form.price),
      compareAtPrice: this.form.compareAtPrice ? Number(this.form.compareAtPrice) : undefined,
      colors: this.csv(this.form.colorsText),
      sizes: this.csv(this.form.sizesText).map((row) => {
        const [label, stock] = row.split(':');
        return { label: label.trim(), stock: Number(stock || 0) };
      }),
      images: this.form.imagesText.split('\n').map((url) => url.trim()).filter(Boolean).map((url) => ({ url })),
      benefits: this.form.benefitsText.split('\n').map((row) => row.trim()).filter(Boolean),
      tags: this.csv(this.form.tagsText),
      material: this.form.material
    };
  }

  private csv(value: string) {
    return value.split(',').map((row) => row.trim()).filter(Boolean);
  }
}

