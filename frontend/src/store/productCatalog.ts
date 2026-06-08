import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── The canonical shape that ProductCard + FeaturedProducts expect ─────────
export interface StorefrontProduct {
  id: string
  name: string
  slug: string
  sku: string
  images: string[]           // base64 or URLs
  metal: string
  purity: string
  netWeight: number
  currentPrice: number
  goldRate: number
  makingCharges: number
  stoneCharges: number
  avgRating: number
  reviewCount: number
  inStock: boolean
  isFeatured: boolean
  isTrending: boolean
  description: string
  category: { name: string }
  keywords: string        // space-separated search keywords
  // extra admin fields
  addedBy: string
  addedAt: string
  source: 'manual' | 'pdf'
}

interface ProductCatalogStore {
  products: StorefrontProduct[]
  addProduct: (p: Omit<StorefrontProduct, 'addedAt'>) => void
  updateProduct: (id: string, data: Partial<StorefrontProduct>) => void
  deleteProduct: (id: string) => void
  toggleFeatured: (id: string) => void
  toggleTrending: (id: string) => void
  toggleStock: (id: string) => void
}

export const useProductCatalog = create<ProductCatalogStore>()(
  persist(
    (set) => ({
      products: [],

      addProduct: (p) => {
        const newProduct = { ...p, addedAt: new Date().toISOString() }
        set((s) => {
          const updated = [newProduct, ...s.products]
          // Write directly to localStorage immediately for cross-tab sync
          try {
            localStorage.setItem('ratan-product-catalog', JSON.stringify({ state: { products: updated }, version: 0 }))
          } catch {}
          return { products: updated }
        })
      },

      updateProduct: (id, data) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),

      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      toggleFeatured: (id) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, isFeatured: !p.isFeatured } : p
          ),
        })),

      toggleTrending: (id) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, isTrending: !p.isTrending } : p
          ),
        })),

      toggleStock: (id) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, inStock: !p.inStock } : p
          ),
        })),
    }),
    { name: 'ratan-product-catalog' }
  )
)
