import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'
import { invoiceApi, orderApi, customerApi, adminApi, handleApiError } from '@/lib/billingApi'

// ── Types ─────────────────────────────────────────────────────────────────
export type AdminRole = 'customer' | 'sales_staff' | 'inventory_manager' | 'store_manager' | 'admin' | 'super_admin'
export type OrderStatus = 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'draft'
export type CustomerTier = 'bronze' | 'silver' | 'gold' | 'platinum'
export type ProductStatus = 'active' | 'out_of_stock' | 'draft'
export type LogType = 'auth' | 'order' | 'product' | 'billing' | 'settings' | 'crm' | 'inventory'

export interface AdminUser {
  id: number
  name: string
  email: string
  role: AdminRole
  status: 'active' | 'inactive'
  joined: string
  lastLogin: string
  avatar: string
  phone?: string
  
// Audit
addLog: (log: Omit<AuditLog, 'id' | 'time'>) => void
resetAll: () => void
}



export interface Product {
  id: string
  name: string
  category: string
  metal: string
  weight: string
  price: number
  stock: number
  status: ProductStatus
  rating: number
  sales: number
  description?: string
  images?: string[]
}

export interface Order {
  id: string
  customer: string
  email: string
  phone: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  date: string
  payment: string
  address?: string
  notes?: string
}

export interface OrderItem {
  name: string
  qty: number
  price: number
}

export interface Invoice {
  id: string
  order?: string
  customer: string
  phone?: string
  category?: string
  metal?: string
  purity?: string
  netWeight?: string
  price?: number
  goldRate?: number
  makingCharges?: number
  amount: number
  gst: number
  total: number
  status: InvoiceStatus
  date: string
  due: string
}

export interface InventoryItem {
  id: string
  name: string
  category: string
  metal: string
  stock: number
  minStock: number
  maxStock: number
  value: number
  location: string
  lastUpdated: string
  trend: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  city: string
  totalSpend: number
  orders: number
  tier: CustomerTier
  lastVisit: string
  birthday: string
  tags: string[]
  notes?: string
}

export interface AuditLog {
  id: number
  type: LogType
  action: string
  user: string
  role: string
  ip: string
  time: string
  details: string
}

export interface GoldRates {
  '24K': string
  '22K': string
  '18K': string
  '14K': string
}

// ── Initial Data ──────────────────────────────────────────────────────────
const initialUsers: AdminUser[] = [
  { id: 1, name: 'Rajesh Sharma', email: 'rajesh@ratanjewellers.com', role: 'super_admin', status: 'active', joined: 'Jan 2022', lastLogin: '2 hrs ago', avatar: 'RS', phone: '+91 98765 43210' },
  { id: 2, name: 'Priya Mehta', email: 'priya@ratanjewellers.com', role: 'admin', status: 'active', joined: 'Mar 2023', lastLogin: '1 day ago', avatar: 'PM', phone: '+91 87654 32109' },
]

const initialProducts: Product[] = [
  { id: 'RJ001', name: 'Kundan Bridal Necklace Set', category: 'Necklaces', metal: '22K Gold', weight: '45.2g', price: 285000, stock: 3, status: 'active', rating: 4.8, sales: 12 },
]

const initialOrders: Order[] = [
  { id: 'RJ-4821', customer: 'Demo Customer', email: 'demo@example.com', phone: '+91 98765 43210', items: [{ name: 'Gold Chain', qty: 1, price: 50000 }], total: 50000, status: 'delivered', date: '13 Jun 2026', payment: 'UPI' },
]

const initialInvoices: Invoice[] = [
  { id: 'INV-2049', customer: 'Demo Customer', phone: '+91 98765 43210', amount: 50000, gst: 1500, total: 51500, status: 'paid', date: '13 Jun 2026', due: '—', category: 'Necklaces', metal: '22K Gold', purity: '916', netWeight: '8.5', goldRate: 6520, makingCharges: 10, price: 5000 },
]

const initialInventory: InventoryItem[] = []

const initialCustomers: Customer[] = [
  { id: 'CRM-001', name: 'Demo Customer', phone: '+91 98765 43210', email: 'demo@example.com', city: 'Bhubaneswar', totalSpend: 50000, orders: 1, tier: 'gold', lastVisit: '13 Jun 2026', birthday: '15 May 1990', tags: ['VIP'] },
]

const initialLogs: AuditLog[] = [
  { id: 1, type: 'auth', action: 'Admin login', user: 'Rajesh Sharma', role: 'Super Admin', ip: '192.168.1.10', time: '04 Jun 2026, 10:24 AM', details: 'Logged in from Chrome/Windows' },
]

// ── Store ─────────────────────────────────────────────────────────────────
interface AdminStore {
  // Data
  users: AdminUser[]
  products: Product[]
  orders: Order[]
  invoices: Invoice[]
  inventory: InventoryItem[]
  customers: Customer[]
  auditLogs: AuditLog[]
  goldRates: GoldRates
  currentRole: AdminRole

  // Loading states
  loading: {
    invoices: boolean
    orders: boolean
    customers: boolean
  }

  // Users
  addUser: (u: Omit<AdminUser, 'id'>) => void
  updateUser: (id: number, data: Partial<AdminUser>) => void
  deleteUser: (id: number) => void
  toggleUserStatus: (id: number) => void

  // Products
  addProduct: (p: Omit<Product, 'id' | 'rating' | 'sales'>) => void
  updateProduct: (id: string, data: Partial<Product>) => void
  deleteProduct: (id: string) => void
  clearSeedProducts: () => void

  // Orders
  addOrder: (o: Omit<Order, 'id' | 'date'>) => void
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>
  updateOrder: (id: string, data: Partial<Order>) => void
  deleteOrder: (id: string) => Promise<void>
  fetchOrders: () => Promise<void>

  // Invoices
  addInvoice: (inv: Omit<Invoice, 'id'>) => Promise<void>
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<void>
  deleteInvoice: (id: string) => Promise<void>
  fetchInvoices: () => Promise<void>
  generateInvoiceForOrder: (orderId: string) => void
  sendInvoiceEmail: (id: string) => Promise<void>
  exportInvoicePDF: (id: string) => void

  // Inventory
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) => void
  deleteInventoryItem: (id: string) => void

  // Customers
  addCustomer: (c: Omit<Customer, 'id'>) => void
  updateCustomer: (id: string, data: Partial<Customer>) => void
  deleteCustomer: (id: string) => Promise<void>
  fetchCustomers: () => Promise<void>
  addCustomerTag: (id: string, tag: string) => void
  removeCustomerTag: (id: string, tag: string) => void

  // Gold Rates
  updateGoldRates: (rates: GoldRates) => void

  // Settings
  setCurrentRole: (role: AdminRole) => void

  // Audit
  addLog: (log: Omit<AuditLog, 'id' | 'time'>) => void
  
  // Clear data
  clearAllBillingData: () => Promise<void>
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      users: initialUsers,
      products: initialProducts,
      orders: initialOrders,
      invoices: initialInvoices,
      inventory: initialInventory,
      customers: initialCustomers,
      auditLogs: initialLogs,
      goldRates: { '24K': '6520', '22K': '5980', '18K': '4890', '14K': '3810' },
      currentRole: 'super_admin',
      loading: {
        invoices: false,
        orders: false,
        customers: false
      },

      // ── Users ──────────────────────────────────────────────────────────
      addUser: (userData) => {
        const newUser: AdminUser = { ...userData, id: Date.now() }
        set(s => ({ users: [...s.users, newUser] }))
        get().addLog({ type: 'auth', action: 'New user created', user: 'Admin', role: 'Admin', ip: '—', details: `${newUser.name} (${newUser.role})` })
        toast.success(`User "${newUser.name}" created`)
      },
      updateUser: (id, data) => {
        set(s => ({ users: s.users.map(u => u.id === id ? { ...u, ...data } : u) }))
        toast.success('User updated')
      },
      deleteUser: (id) => {
        const user = get().users.find(u => u.id === id)
        set(s => ({ users: s.users.filter(u => u.id !== id) }))
        get().addLog({ type: 'auth', action: 'User deleted', user: 'Admin', role: 'Admin', ip: '—', details: `Deleted: ${user?.name}` })
        toast.success('User deleted')
      },
      toggleUserStatus: (id) => {
        set(s => ({
          users: s.users.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u)
        }))
        toast.success('User status updated')
      },

      // ── Products ───────────────────────────────────────────────────────
      addProduct: (productData) => {
        const newProduct: Product = { ...productData, id: `RJ${String(Date.now()).slice(-3)}`, rating: 0, sales: 0 }
        set(s => ({ products: [newProduct, ...s.products] }))
        get().addLog({ type: 'product', action: 'Product added', user: 'Admin', role: 'Admin', ip: '—', details: `Added: ${newProduct.name}` })
        toast.success(`"${newProduct.name}" added`)
      },
      updateProduct: (id, data) => {
        set(s => ({ products: s.products.map(p => p.id === id ? { ...p, ...data } : p) }))
        toast.success('Product updated')
      },
      deleteProduct: (id) => {
        set(s => ({ products: s.products.filter(p => p.id !== id) }))
        toast.success('Product deleted')
      },
      clearSeedProducts: () => {
        const cleaned = stripSeedProducts(get().products)
        if (cleaned.length !== get().products.length) {
          set({ products: cleaned })
        }
      },

      // ── Orders ─────────────────────────────────────────────────────────
      fetchOrders: async () => {
        try {
          set(s => ({ loading: { ...s.loading, orders: true } }))
          const result = await orderApi.getAll()
          
          const frontendOrders: Order[] = (result.orders || []).map((order: any) => ({
            id: order.orderNumber || order._id || order.id,
            customer: order.customerName || order.customer || 'Unknown Customer',
            email: order.customerEmail || order.email || '',
            phone: order.customerPhone || order.phone || '',
            items: order.items || [],
            total: order.totalAmount || order.total || 0,
            status: (order.status || 'pending').toLowerCase() as OrderStatus,
            date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            payment: order.paymentMode || order.payment || 'Unknown'
          }))
          
          set(s => ({ 
            orders: frontendOrders,
            loading: { ...s.loading, orders: false }
          }))
        } catch (error) {
          handleApiError(error)
          set(s => ({ loading: { ...s.loading, orders: false } }))
        }
      },

      addOrder: (orderData) => {
        const newOrder: Order = {
          ...orderData,
          id: `RJ-${4822 + get().orders.length}`,
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        }
        set(s => ({ orders: [newOrder, ...s.orders] }))
        get().addLog({ type: 'order', action: 'New order created', user: 'Admin', role: 'Admin', ip: '—', details: `${newOrder.id} for ${newOrder.customer}` })
        toast.success(`Order ${newOrder.id} created`)
      },
      updateOrderStatus: async (id, status) => {
        try {
          await orderApi.updateStatus(id, status.toUpperCase())
          set(s => ({ orders: s.orders.map(o => o.id === id ? { ...o, status } : o) }))
          get().addLog({ type: 'order', action: 'Order status updated', user: 'Admin', role: 'Admin', ip: '—', details: `${id} → ${status}` })
          toast.success(`Order ${id} → ${status}`)
        } catch (error) {
          handleApiError(error)
        }
      },
      updateOrder: (id, data) => {
        set(s => ({ orders: s.orders.map(o => o.id === id ? { ...o, ...data } : o) }))
        toast.success('Order updated')
      },
      deleteOrder: async (id) => {
        try {
          await orderApi.delete(id)
          set(s => ({ orders: s.orders.filter(o => o.id !== id) }))
          get().addLog({ type: 'order', action: 'Order deleted', user: 'Admin', role: 'Admin', ip: '—', details: `Deleted order ${id}` })
          toast.success(`Order ${id} deleted`)
        } catch (error) {
          handleApiError(error)
        }
      },

      // ── Invoices ───────────────────────────────────────────────────────
      fetchInvoices: async () => {
        try {
          set(s => ({ loading: { ...s.loading, invoices: true } }))
          const result = await invoiceApi.getAll()
          
          const frontendInvoices: Invoice[] = (result.invoices || []).map((invoice: any) => ({
            id: invoice.invoiceNumber || invoice._id,
            customer: invoice.customerName || 'Unknown Customer',
            phone: invoice.customerPhone || '',
            amount: invoice.subtotal || 0,
            gst: (invoice.cgst || 0) + (invoice.sgst || 0),
            total: invoice.totalAmount || 0,
            status: (invoice.status || 'pending').toLowerCase() as InvoiceStatus,
            date: invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            due: '—',
            // Extract category and other details from notes if available
            category: invoice.notes?.includes('Category:') ? invoice.notes.split('Category: ')[1]?.split(',')[0] : undefined,
            metal: invoice.notes?.includes('Metal:') ? invoice.notes.split('Metal: ')[1] : undefined,
            purity: invoice.items?.[0]?.purity,
            netWeight: invoice.items?.[0]?.netWeight?.toString(),
            goldRate: invoice.items?.[0]?.goldRate,
            makingCharges: invoice.items?.[0]?.makingCharges,
            price: 0
          }))
          
          set(s => ({ 
            invoices: frontendInvoices,
            loading: { ...s.loading, invoices: false }
          }))
        } catch (error) {
          handleApiError(error)
          set(s => ({ loading: { ...s.loading, invoices: false } }))
        }
      },

      addInvoice: async (invData) => {
        try {
          const backendData = {
            customerName: invData.customer,
            customerPhone: invData.phone || '',
            paymentMode: 'CASH',
            items: [{
              name: 'Jewellery Item',
              purity: invData.purity || '22K',
              netWeight: parseFloat(invData.netWeight || '0'),
              goldRate: invData.goldRate || 6520,
              makingCharges: invData.makingCharges || 0,
              stoneCharges: 0,
              cgstRate: 1.5,
              sgstRate: 1.5,
              quantity: 1
            }],
            discountAmount: 0,
            oldGoldExchange: 0,
            notes: invData.category ? `Category: ${invData.category}, Metal: ${invData.metal}` : ''
          }
          
          const result = await invoiceApi.create(backendData)
          const newInvoice = result.data
          
          const frontendInvoice: Invoice = {
            id: newInvoice.invoiceNumber,
            customer: newInvoice.customerName,
            phone: newInvoice.customerPhone,
            amount: newInvoice.subtotal,
            gst: (newInvoice.cgst || 0) + (newInvoice.sgst || 0),
            total: newInvoice.totalAmount,
            status: 'paid',
            date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            due: '—',
            category: invData.category,
            metal: invData.metal,
            purity: invData.purity,
            netWeight: invData.netWeight,
            goldRate: invData.goldRate,
            makingCharges: invData.makingCharges,
            price: invData.price
          }
          
          set(s => ({ invoices: [frontendInvoice, ...s.invoices] }))
          get().addLog({ type: 'billing', action: 'Invoice created', user: 'Admin', role: 'Admin', ip: '—', details: `${frontendInvoice.id} — ₹${frontendInvoice.total.toLocaleString('en-IN')}` })
          toast.success(`Invoice ${frontendInvoice.id} created`)
        } catch (error) {
          handleApiError(error)
        }
      },

      updateInvoiceStatus: async (id, status) => {
        try {
          await invoiceApi.update(id, { status })
          set(s => ({ invoices: s.invoices.map(i => i.id === id ? { ...i, status } : i) }))
          toast.success(`Invoice marked as ${status}`)
        } catch (error) {
          handleApiError(error)
        }
      },

      deleteInvoice: async (id) => {
        try {
          await invoiceApi.delete(id)
          set(s => ({ invoices: s.invoices.filter(i => i.id !== id) }))
          get().addLog({ type: 'billing', action: 'Invoice deleted', user: 'Admin', role: 'Admin', ip: '—', details: `Deleted invoice ${id}` })
          // Toast will be handled by the calling function
        } catch (error) {
          handleApiError(error)
          throw error // Re-throw so the calling function can handle it
        }
      },

      generateInvoiceForOrder: (orderId) => {
        const order = get().orders.find(o => o.id === orderId)
        if (!order) return
        const existing = get().invoices.find(i => i.order === orderId)
        if (existing) { toast.error('Invoice already exists for this order'); return }
        const gst = Math.round(order.total * 0.03)
        get().addInvoice({
          order: orderId,
          customer: order.customer,
          phone: order.phone,
          amount: order.total,
          gst,
          total: order.total + gst,
          status: 'pending',
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          due: new Date(Date.now() + 10 * 86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        })
      },

      sendInvoiceEmail: async (id) => {
        try {
          await invoiceApi.resendWhatsApp(id)
          get().addLog({ type: 'billing', action: 'Invoice emailed', user: 'Admin', role: 'Admin', ip: '—', details: `${id} sent to customer` })
          toast.success(`Invoice emailed to customer`)
        } catch (error) {
          handleApiError(error)
        }
      },

      exportInvoicePDF: (id) => {
        const inv = get().invoices.find(i => i.id === id)
        if (!inv) return
        const html = `<html><head><title>${inv.id}</title></head><body><h1>RATAN JEWELLERS</h1><p>Invoice: ${inv.id}</p><p>Customer: ${inv.customer}</p><p>Total: ₹${inv.total}</p></body></html>`
        const w = window.open('', '_blank')
        if (w) { 
          w.document.write(html)
          w.document.close()
          w.print() 
        }
        toast.success(`PDF opened for ${inv.id}`)
      },

      // ── Inventory ──────────────────────────────────────────────────────
      addInventoryItem: (itemData) => {
        const newItem: InventoryItem = { ...itemData, id: `INV-${String(Date.now()).slice(-3)}`, lastUpdated: 'just now' }
        set(s => ({ inventory: [newItem, ...s.inventory] }))
        toast.success(`"${newItem.name}" added to inventory`)
      },
      updateInventoryItem: (id, data) => {
        set(s => ({ inventory: s.inventory.map(i => i.id === id ? { ...i, ...data, lastUpdated: 'just now' } : i) }))
        toast.success('Inventory updated')
      },
      deleteInventoryItem: (id) => {
        const item = get().inventory.find(i => i.id === id)
        set(s => ({ inventory: s.inventory.filter(i => i.id !== id) }))
        toast.success(`"${item?.name}" removed`)
      },

      // ── Customers ──────────────────────────────────────────────────────
      fetchCustomers: async () => {
        try {
          set(s => ({ loading: { ...s.loading, customers: true } }))
          const result = await customerApi.getAll()
          
          const frontendCustomers: Customer[] = (result.customers || []).map((customer: any) => ({
            id: customer._id || customer.id,
            name: customer.name || 'Unknown Customer',
            phone: customer.phone || '',
            email: customer.email || '',
            city: customer.city || '',
            totalSpend: customer.totalPurchases || 0,
            orders: 0,
            tier: (customer.segment?.toLowerCase() || 'bronze') as CustomerTier,
            lastVisit: customer.updatedAt ? new Date(customer.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            birthday: customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
            tags: customer.tags || []
          }))
          
          set(s => ({ 
            customers: frontendCustomers,
            loading: { ...s.loading, customers: false }
          }))
        } catch (error) {
          handleApiError(error)
          set(s => ({ loading: { ...s.loading, customers: false } }))
        }
      },

      addCustomer: (customerData) => {
        const newCustomer: Customer = { ...customerData, id: `CRM-${String(Date.now()).slice(-3)}` }
        set(s => ({ customers: [newCustomer, ...s.customers] }))
        toast.success(`Customer "${newCustomer.name}" added`)
      },
      updateCustomer: (id, data) => {
        set(s => ({ customers: s.customers.map(c => c.id === id ? { ...c, ...data } : c) }))
        toast.success('Customer updated')
      },
      deleteCustomer: async (id) => {
        try {
          await customerApi.delete(id)
          const c = get().customers.find(c => c.id === id)
          set(s => ({ customers: s.customers.filter(c => c.id !== id) }))
          toast.success(`Customer "${c?.name}" deleted`)
        } catch (error) {
          handleApiError(error)
        }
      },
      addCustomerTag: (id, tag) => {
        set(s => ({
          customers: s.customers.map(c => c.id === id ? { ...c, tags: [...new Set([...c.tags, tag])] } : c)
        }))
        toast.success(`Tag "${tag}" added`)
      },
      removeCustomerTag: (id, tag) => {
        set(s => ({
          customers: s.customers.map(c => c.id === id ? { ...c, tags: c.tags.filter(t => t !== tag) } : c)
        }))
      },

      // ── Gold Rates ─────────────────────────────────────────────────────
      updateGoldRates: (rates) => {
        set({ goldRates: rates })
        toast.success('Gold rates updated')
      },

      // ── Settings ───────────────────────────────────────────────────────
      setCurrentRole: (role) => set({ currentRole: role }),

      // ── Audit Log ──────────────────────────────────────────────────────
<<<<<<< HEAD
    //   addLog: (logData) => {
    //     const newLog: AuditLog = {
    //       ...logData,
    //       id: Date.now(),
    //       time: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    //     }
    //     set(s => ({ auditLogs: [newLog, ...s.auditLogs] }))
    //   },
    // }),

    // ── Audit Log ──────────────────────────────────────────────────────
addLog: (logData) => {
  const newLog: AuditLog = {
    ...logData,
    id: Date.now(),
    time: new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }

  set((s) => ({
    auditLogs: [newLog, ...s.auditLogs],
  }))
},

// ── Reset Store ────────────────────────────────────────────────────
resetAll: () => {
  set({
    products: [],
    orders: [],
    invoices: [],
    inventory: [],
    customers: [],
    auditLogs: [],

    goldRates: {
      '24K': '6520',
      '22K': '5980',
      '18K': '4890',
      '14K': '3810',
    },

    currentRole: 'super_admin',
  })

  toast.success('Dashboard reset successfully')
},
=======
      addLog: (logData) => {
        const newLog: AuditLog = {
          ...logData,
          id: Date.now(),
          time: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        }
        set(s => ({ auditLogs: [newLog, ...s.auditLogs] }))
      },

      // ── Clear Data ─────────────────────────────────────────────────────
      clearAllBillingData: async () => {
        try {
          await adminApi.clearBillingData()
          set({
            orders: [],
            invoices: [],
            customers: [],
            auditLogs: initialLogs.slice(0, 3),
          })
          get().addLog({ 
            type: 'settings', 
            action: 'Billing data cleared', 
            user: 'Admin', 
            role: 'Admin', 
            ip: '—', 
            details: 'All orders, invoices, and customers cleared globally' 
          })
          toast.success('All billing data cleared globally')
        } catch (error) {
          handleApiError(error)
        }
      },
>>>>>>> origin/development-init-dev
    }),
    {
      name: 'ratan-admin-store',
      version: 2,
      migrate: (persistedState, version) => {
        const state = persistedState as { products?: Product[] } | undefined
        if (!state) return persistedState
        if (version < 2) {
          state.products = []
        }
        return state
      },
      onRehydrateStorage: () => (state) => {
        if (!state?.products?.length) return
        const cleaned = stripSeedProducts(state.products)
        if (cleaned.length !== state.products.length) {
          useAdminStore.setState({ products: cleaned })
        }
      },
      partialize: (s) => ({
        users: s.users,
        products: s.products,
        orders: s.orders,
        invoices: s.invoices,
        inventory: s.inventory,
        customers: s.customers,
        auditLogs: s.auditLogs,
        goldRates: s.goldRates,
        currentRole: s.currentRole,
      }),
    }
  )
)