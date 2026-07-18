// Render's fromService gives a bare hostname; add https:// if the scheme is missing.
const RAW = import.meta.env.VITE_API_URL || "";
const BASE = RAW && !/^https?:\/\//.test(RAW) ? "https://" + RAW : RAW;

export interface Product {
  id: number;
  categoryId: number;
  category?: Category;
  brand: string;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  price: number;
  wasPrice: number | null;
  tags: string[];
  badgeEn: string;
  badgeAr: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  related?: Product[];
}
export interface Category {
  id: number;
  slug: string;
  nameEn: string;
  nameAr: string;
  count?: number;
}
export interface OrderItem {
  id: number;
  nameEn: string;
  nameAr: string;
  brand: string;
  price: number;
  qty: number;
}
export interface Order {
  id: number;
  reference: string;
  customerName: string;
  phone: string;
  address: string;
  town: string;
  note: string;
  paymentMethod: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: OrderItem[];
  createdAt: string;
}

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(BASE + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let msg = "Something went wrong. Please try again.";
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json();
}

export const api = {
  categories: () => req<Category[]>("/api/categories"),
  products: (params?: { category?: string; featured?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set("category", params.category);
    if (params?.featured) q.set("featured", "1");
    const s = q.toString();
    return req<Product[]>("/api/products" + (s ? "?" + s : ""));
  },
  product: (id: number | string) => req<Product>(`/api/products/${id}`),
  createOrder: (body: unknown) =>
    req<{ ok: true; reference: string; total: number }>("/api/orders", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // admin
  login: (email: string, password: string) =>
    req<{ ok: true; name: string; email: string }>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => req<{ ok: true }>("/api/admin/logout", { method: "POST" }),
  me: () => req<{ name: string; email: string }>("/api/admin/me"),
  stats: () => req<AdminStats>("/api/admin/stats"),
  adminProducts: () => req<Product[]>("/api/admin/products"),
  createProduct: (body: unknown) => req<Product>("/api/admin/products", { method: "POST", body: JSON.stringify(body) }),
  updateProduct: (id: number, body: unknown) =>
    req<Product>(`/api/admin/products/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteProduct: (id: number) => req<{ ok: true }>(`/api/admin/products/${id}`, { method: "DELETE" }),
  adminOrders: () => req<Order[]>("/api/admin/orders"),
  setOrderStatus: (id: number, status: string) =>
    req<Order>(`/api/admin/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

export interface AdminStats {
  orders: number;
  revenue: number;
  products: number;
  lowStock: number;
  recent: {
    reference: string;
    customerName: string;
    town: string;
    total: number;
    status: string;
    items: number;
    firstItem: string;
    createdAt: string;
  }[];
}
