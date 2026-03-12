export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  isAvailable: boolean;
  category: Category;
}

export interface CartItem {
  productId: number;
  name: string;
  price: string;
  quantity: number;
  total: string;
}

export interface Cart {
  items: CartItem[];
  totalPrice: string;
  totalItems: number;
}
