import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  image: string;
  purity: string;
  weight: number;
  price: number;
  quantity: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (u: User, a: string, r: string) => void;
  clearAuth: () => void;
  updateUser: (u: Partial<User>) => void;
  registerCustomer: (user: User) => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
        }
        set({ user, accessToken, isAuthenticated: true });
      },
      clearAuth: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      registerCustomer: (user) => {
        try {
          const key = 'ratan-admin-store'
          const raw = localStorage.getItem(key)
          const store = raw ? JSON.parse(raw) : { state: { customers: [] } }
          const customers = store?.state?.customers ?? []
          if (!customers.find((c: any) => c.email === user.email)) {
            customers.unshift({
              id: 'CRM-W' + Date.now(),
              name: user.name,
              phone: '',
              email: user.email,
              city: '',
              totalSpend: 0,
              orders: 0,
              tier: 'bronze',
              lastVisit: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
              birthday: '',
              tags: ['Website'],
              notes: 'Registered via website',
            })
            store.state.customers = customers
            localStorage.setItem(key, JSON.stringify(store))
          }
        } catch (e) {
          console.warn('Could not sync customer', e)
        }
      },
    }),
    {
      name: "ratan-auth",
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    },
  ),
);

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (i: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, q: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) =>
        set((state) => {
          const e = state.items.find((i) => i.productId === item.productId);
          return e
            ? {
                items: state.items.map((i) =>
                  i.productId === item.productId
                    ? { ...i, quantity: i.quantity + item.quantity }
                    : i,
                ),
              }
            : { items: [...state.items, item] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity } : i,
                ),
        })),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      closeCart: () => set({ isOpen: false }),
      totalItems: () => get().items.reduce((a, i) => a + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((a, i) => a + i.price * i.quantity, 0),
    }),
    { name: "ratan-cart", partialize: (s) => ({ items: s.items }) },
  ),
);

interface UIState {
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  goldRate: number;
  goldRateUpdatedAt: string | null;
  toggleSearch: () => void;
  toggleMobileMenu: () => void;
  setGoldRate: (r: number) => void;
}
export const useUIStore = create<UIState>((set) => ({
  isSearchOpen: false,
  isMobileMenuOpen: false,
  goldRate: 6500,
  goldRateUpdatedAt: null,
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  toggleMobileMenu: () =>
    set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  setGoldRate: (rate) =>
    set({ goldRate: rate, goldRateUpdatedAt: new Date().toISOString() }),
}));

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  image: string;
  metal: string;
  category: string;
  purity: string;
  currentPrice: number;
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (i: WishlistItem) => void;
  removeItem: (productId: string) => void;
  toggleItem: (i: WishlistItem) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  totalItems: () => number;
}
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const exists = state.items.find(
            (i) => i.productId === item.productId,
          );
          return exists
            ? state
            : {
                items: [
                  ...state.items,
                  { ...item, addedAt: new Date().toISOString() },
                ],
              };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      toggleItem: (item) =>
        set((state) => {
          const exists = state.items.find(
            (i) => i.productId === item.productId,
          );
          return exists
            ? {
                items: state.items.filter(
                  (i) => i.productId !== item.productId,
                ),
              }
            : {
                items: [
                  ...state.items,
                  { ...item, addedAt: new Date().toISOString() },
                ],
              };
        }),
      clearWishlist: () => set({ items: [] }),
      isInWishlist: (productId) =>
        get().items.some((i) => i.productId === productId),
      totalItems: () => get().items.length,
    }),
    { name: "ratan-wishlist", partialize: (s) => ({ items: s.items }) },
  ),
);
