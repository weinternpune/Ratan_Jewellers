import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface User {
  id: string; email: string; name: string; role: string; phone?: string; avatar?: string
}
export interface CartItem {
  id: string; productId: string; name: string; sku: string
  image: string; purity: string; weight: number; price: number; quantity: number
}
export interface WishlistItem {
  id: string; productId: string; name: string; sku: string
  image: string; metal: string; category: string; purity: string
  currentPrice: number; addedAt: string
}

// ─── Auth Store ───────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (u: User, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  updateUser: (u: Partial<User>) => void
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null, accessToken: null, isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)
        }
        set({ user, accessToken, isAuthenticated: true })
      },
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
        set({ user: null, accessToken: null, isAuthenticated: false })
      },
      updateUser: (userData) =>
        set((s) => ({ user: s.user ? { ...s.user, ...userData } : null })),
    }),
    { name: 'ratan-auth', partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }) }
  )
)

// ─── Cart Store ───────────────────────────────────────────────────────────────
interface CartState {
  items: CartItem[]; isOpen: boolean
  addItem: (i: CartItem) => void; removeItem: (id: string) => void
  updateQuantity: (id: string, q: number) => void; clearCart: () => void
  toggleCart: () => void; closeCart: () => void
  totalItems: () => number; totalPrice: () => number
}
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [], isOpen: false,
      addItem: (item) => set((s) => {
        const existing = s.items.find((i) => i.productId === item.productId)
        return existing
          ? { items: s.items.map((i) => i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i) }
          : { items: [...s.items, item] }
      }),
      removeItem: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      updateQuantity: (productId, quantity) => set((s) => ({
        items: quantity <= 0
          ? s.items.filter((i) => i.productId !== productId)
          : s.items.map((i) => i.productId === productId ? { ...i, quantity } : i)
      })),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      closeCart: () => set({ isOpen: false }),
      totalItems: () => get().items.reduce((a, i) => a + i.quantity, 0),
      totalPrice: () => get().items.reduce((a, i) => a + i.price * i.quantity, 0),
    }),
    { name: 'ratan-cart', partialize: (s) => ({ items: s.items }) }
  )
)

// ─── UI Store ─────────────────────────────────────────────────────────────────
interface UIState {
  isSearchOpen: boolean; isMobileMenuOpen: boolean
  goldRate: number; goldRateUpdatedAt: string | null
  toggleSearch: () => void; toggleMobileMenu: () => void
  setGoldRate: (r: number) => void
}
export const useUIStore = create<UIState>((set) => ({
  isSearchOpen: false, isMobileMenuOpen: false, goldRate: 6500, goldRateUpdatedAt: null,
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  setGoldRate: (rate) => set({ goldRate: rate, goldRateUpdatedAt: new Date().toISOString() }),
}))

// ─── Wishlist Store ───────────────────────────────────────────────────────────
interface WishlistState {
  items: WishlistItem[]
  addItem: (i: WishlistItem) => void; removeItem: (productId: string) => void
  toggleItem: (i: WishlistItem) => void; clearWishlist: () => void
  isInWishlist: (productId: string) => boolean; totalItems: () => number
}
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((s) => s.items.find((i) => i.productId === item.productId) ? s : { items: [...s.items, { ...item, addedAt: new Date().toISOString() }] }),
      removeItem: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      toggleItem: (item) => set((s) => {
        const exists = s.items.find((i) => i.productId === item.productId)
        return exists
          ? { items: s.items.filter((i) => i.productId !== item.productId) }
          : { items: [...s.items, { ...item, addedAt: new Date().toISOString() }] }
      }),
      clearWishlist: () => set({ items: [] }),
      isInWishlist: (productId) => get().items.some((i) => i.productId === productId),
      totalItems: () => get().items.length,
    }),
    { name: 'ratan-wishlist', partialize: (s) => ({ items: s.items }) }
  )
)
