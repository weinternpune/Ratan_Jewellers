import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

export interface CustomJewelleryRequest {
  id: string
  name: string
  email: string
  phone: string
  category: string
  metal: string
  budget: string
  description: string
  referenceImages?: string[]
  status: 'new' | 'in_review' | 'replied' | 'completed' | 'rejected'
  submittedAt: string
  replies: Reply[]
  readByAdmin: boolean
  readByManager: boolean
}

export interface Reply {
  id: string
  from: string
  role: string
  message: string
  sentAt: string
}

export interface CustomJewelleryImage {
  id: string
  name: string
  image: string  // base64
  addedAt: string
  addedBy: string
}

interface CustomJewelleryStore {
  requests: CustomJewelleryRequest[]
  galleryImages: CustomJewelleryImage[]

  submitRequest: (data: Omit<CustomJewelleryRequest, 'id' | 'submittedAt' | 'replies' | 'status' | 'readByAdmin' | 'readByManager'>) => string
  updateStatus: (id: string, status: CustomJewelleryRequest['status']) => void
  addReply: (requestId: string, reply: Omit<Reply, 'id' | 'sentAt'>) => void
  markRead: (id: string, role: 'admin' | 'manager') => void

  addGalleryImage: (img: Omit<CustomJewelleryImage, 'id' | 'addedAt'>) => void
  removeGalleryImage: (id: string) => void
}

export const useCustomJewelleryStore = create<CustomJewelleryStore>()(
  persist(
    (set, get) => ({
      requests: [],
      galleryImages: [],

      submitRequest: (data) => {
        const id = `CJR-${Date.now()}`
        const req: CustomJewelleryRequest = {
          ...data,
          id,
          status: 'new',
          submittedAt: new Date().toLocaleString('en-IN'),
          replies: [],
          readByAdmin: false,
          readByManager: false,
        }
        set(s => ({ requests: [req, ...s.requests] }))
        // Also write directly to localStorage as a guaranteed backup
        try {
          const existing = JSON.parse(localStorage.getItem('ratan-custom-jewellery') || '{"state":{"requests":[],"galleryImages":[]}}')
          if (!existing.state) existing.state = { requests: [], galleryImages: [] }
          if (!existing.state.requests) existing.state.requests = []
          existing.state.requests = [req, ...existing.state.requests]
          localStorage.setItem('ratan-custom-jewellery', JSON.stringify(existing))
          // Trigger storage event for other tabs
          window.dispatchEvent(new StorageEvent('storage', { key: 'ratan-custom-jewellery' }))
        } catch {}
        return id
      },

      updateStatus: (id, status) =>
        set(s => ({ requests: s.requests.map(r => r.id === id ? { ...r, status } : r) })),

      addReply: (requestId, reply) => {
        const full: Reply = { ...reply, id: `R-${Date.now()}`, sentAt: new Date().toLocaleString('en-IN') }
        set(s => ({
          requests: s.requests.map(r =>
            r.id === requestId ? { ...r, replies: [...r.replies, full], status: 'replied' } : r
          )
        }))
        toast.success('Reply sent to customer')
      },

      markRead: (id, role) =>
        set(s => ({
          requests: s.requests.map(r =>
            r.id === id
              ? { ...r, readByAdmin: role === 'admin' ? true : r.readByAdmin, readByManager: role === 'manager' ? true : r.readByManager }
              : r
          )
        })),

      addGalleryImage: (img) => {
        const full: CustomJewelleryImage = { ...img, id: `CJI-${Date.now()}`, addedAt: new Date().toLocaleString('en-IN') }
        set(s => ({ galleryImages: [full, ...s.galleryImages] }))
        toast.success(`"${img.name}" added to custom jewellery gallery`)
      },

      removeGalleryImage: (id) => {
        set(s => ({ galleryImages: s.galleryImages.filter(i => i.id !== id) }))
        toast.success('Image removed')
      },
    }),
    { name: 'ratan-custom-jewellery', partialize: (s) => ({ requests: s.requests, galleryImages: s.galleryImages }) }
  )
)
