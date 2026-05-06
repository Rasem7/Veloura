export type Role = 'user' | 'admin';
export type ProductCategory = 'Men' | 'Women' | 'Accessories';
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash_on_delivery' | 'stripe';

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: Role;
  addresses?: ShippingAddress[];
  createdAt?: string;
}

export interface ProductImage {
  url: string;
  alt?: string;
  variant?: string;
}

export interface ProductSize {
  label: string;
  stock: number;
}

export interface Product {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  category: ProductCategory;
  price: number;
  compareAtPrice?: number;
  colors: string[];
  sizes: ProductSize[];
  images: ProductImage[];
  benefits: string[];
  tags: string[];
  material?: string;
  ratingAverage: number;
  reviewCount: number;
  viewCount: number;
  orderCount: number;
  stock?: number;
  isPublished: boolean;
  createdAt?: string;
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CartItem {
  _id?: string;
  localId?: string;
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
  priceSnapshot: number;
}

export interface Cart {
  _id?: string;
  items: CartItem[];
  couponCode?: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  _id?: string;
  product: Product | string;
  productName: string;
  image?: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
}

export interface Order {
  _id: string;
  user: User | string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  couponCode?: string;
  timeline: { status: OrderStatus; at: string; note?: string }[];
  createdAt: string;
}

export interface RecommendationResponse {
  recentlyViewed: Product[];
  frequentlyBoughtTogether: Product[];
  similarProducts: Product[];
  trendingProducts: Product[];
  recommendedForYou: Product[];
}

export interface Review {
  _id: string;
  user: User;
  product: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

