import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

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
  { id: 3, name: 'Suresh Patel', email: 'suresh@ratanjewellers.com', role: 'store_manager', status: 'active', joined: 'Jun 2023', lastLogin: '3 hrs ago', avatar: 'SP', phone: '+91 76543 21098' },
  { id: 4, name: 'Anita Das', email: 'anita@ratanjewellers.com', role: 'inventory_manager', status: 'active', joined: 'Aug 2023', lastLogin: '5 hrs ago', avatar: 'AD', phone: '+91 65432 10987' },
  { id: 5, name: 'Vikram Singh', email: 'vikram@ratanjewellers.com', role: 'sales_staff', status: 'active', joined: 'Sep 2023', lastLogin: '1 hr ago', avatar: 'VS', phone: '+91 54321 09876' },
  { id: 6, name: 'Kavya Reddy', email: 'kavya@ratanjewellers.com', role: 'sales_staff', status: 'inactive', joined: 'Nov 2023', lastLogin: '2 weeks ago', avatar: 'KR', phone: '+91 43210 98765' },
  { id: 7, name: 'Mohan Kumar', email: 'mohan@example.com', role: 'customer', status: 'active', joined: 'Dec 2023', lastLogin: '4 days ago', avatar: 'MK', phone: '+91 32109 87654' },
  { id: 8, name: 'Sunita Joshi', email: 'sunita@example.com', role: 'customer', status: 'active', joined: 'Jan 2024', lastLogin: '1 week ago', avatar: 'SJ', phone: '+91 21098 76543' },
]

const initialProducts: Product[] = [
  { id: 'RJ001', name: 'Kundan Bridal Necklace Set', category: 'Necklaces', metal: '22K Gold', weight: '45.2g', price: 285000, stock: 3, status: 'active', rating: 4.8, sales: 12, description: 'Exquisite Kundan bridal necklace with matching earrings' },
  { id: 'RJ002', name: 'Diamond Solitaire Ring', category: 'Rings', metal: '18K Gold', weight: '4.1g', price: 128000, stock: 8, status: 'active', rating: 4.9, sales: 28, description: '0.5 carat solitaire diamond engagement ring' },
  { id: 'RJ003', name: 'Temple Gold Bangles (2pc)', category: 'Bangles', metal: '22K Gold', weight: '28.6g', price: 172000, stock: 0, status: 'out_of_stock', rating: 4.7, sales: 19, description: 'Traditional temple design gold bangles pair' },
  { id: 'RJ004', name: 'Pearl Drop Earrings', category: 'Earrings', metal: '18K Gold', weight: '6.8g', price: 45000, stock: 15, status: 'active', rating: 4.6, sales: 34, description: 'South sea pearl drop earrings in 18K gold setting' },
  { id: 'RJ005', name: 'Gold Chain Necklace 22"', category: 'Chains', metal: '22K Gold', weight: '18.4g', price: 96000, stock: 6, status: 'active', rating: 4.5, sales: 41, description: '22 inch gold chain in Singapore design' },
  { id: 'RJ006', name: 'Bridal Mangalsutra Set', category: 'Mangalsutras', metal: '22K Gold', weight: '12.2g', price: 68000, stock: 11, status: 'active', rating: 4.9, sales: 23, description: 'Traditional black bead mangalsutra with 22K gold pendant' },
  { id: 'RJ007', name: 'Polki Diamond Choker', category: 'Necklaces', metal: '20K Gold', weight: '62.4g', price: 485000, stock: 1, status: 'active', rating: 5.0, sales: 4, description: 'Royal polki diamond choker necklace' },
  { id: 'RJ008', name: 'Silver Anklets Pair', category: 'Anklets', metal: 'Silver', weight: '32.1g', price: 8500, stock: 22, status: 'active', rating: 4.4, sales: 67, description: 'Traditional silver anklets with ghungroo' },
]

const initialOrders: Order[] = [
  { id: 'RJ-4821', customer: 'Priya Sharma', email: 'priya.s@email.com', phone: '+91 98765 11111', items: [{ name: 'Kundan Bridal Necklace Set', qty: 1, price: 285000 }], total: 285000, status: 'delivered', date: '03 Jun 2026', payment: 'UPI', address: '12 MG Road, Bhubaneswar' },
  { id: 'RJ-4820', customer: 'Rohit Gupta', email: 'rohit.g@email.com', phone: '+91 87654 22222', items: [{ name: 'Diamond Solitaire Ring', qty: 1, price: 128000 }], total: 128000, status: 'shipped', date: '02 Jun 2026', payment: 'Card', address: '45 Station Rd, Cuttack' },
  { id: 'RJ-4819', customer: 'Anita Joshi', email: 'anita.j@email.com', phone: '+91 76543 33333', items: [{ name: 'Gold Chain Necklace', qty: 1, price: 96000 }], total: 96000, status: 'processing', date: '02 Jun 2026', payment: 'Net Banking', address: '78 Gandhi Nagar, Puri' },
]

const initialInvoices: Invoice[] = [
  // Empty array - no mock data
]

const initialInventory: InventoryItem[] = []

const initialCustomers: Customer[] = [
  // Empty array - no mock data
]

const initialLogs: AuditLog[] = []

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
  updateOrderStatus: (id: string, status: OrderStatus) => void
  updateOrder: (id: string, data: Partial<Order>) => void
  deleteOrder: (id: string) => void

  // Invoices
  addInvoice: (inv: Omit<Invoice, 'id'>) => void
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void
  generateInvoiceForOrder: (orderId: string) => void
  sendInvoiceEmail: (id: string) => void
  exportInvoicePDF: (id: string) => void

  // Inventory
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) => void
  deleteInventoryItem: (id: string) => void

  // Customers
  addCustomer: (c: Omit<Customer, 'id'>) => void
  updateCustomer: (id: string, data: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  addCustomerTag: (id: string, tag: string) => void
  removeCustomerTag: (id: string, tag: string) => void

  // Gold Rates
  updateGoldRates: (rates: GoldRates) => void

  // Settings
  setCurrentRole: (role: AdminRole) => void

  // Audit
  addLog: (log: Omit<AuditLog, 'id' | 'time'>) => void
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
        get().addLog({ type: 'product', action: 'Product updated', user: 'Admin', role: 'Admin', ip: '—', details: `Updated: ${id}` })
        toast.success('Product updated')
      },
      deleteProduct: (id) => {
        const p = get().products.find(p => p.id === id)
        set(s => ({ products: s.products.filter(p => p.id !== id) }))
        get().addLog({ type: 'product', action: 'Product deleted', user: 'Admin', role: 'Admin', ip: '—', details: `Deleted: ${p?.name}` })
        toast.success('Product deleted')
      },
      clearSeedProducts: () => {
        const cleaned = stripSeedProducts(get().products)
        if (cleaned.length !== get().products.length) {
          set({ products: cleaned })
        }
      },

      // ── Orders ─────────────────────────────────────────────────────────
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
      updateOrderStatus: (id, status) => {
        set(s => ({ orders: s.orders.map(o => o.id === id ? { ...o, status } : o) }))
        get().addLog({ type: 'order', action: 'Order status updated', user: 'Admin', role: 'Admin', ip: '—', details: `${id} → ${status}` })
        toast.success(`Order ${id} → ${status}`)
      },
      updateOrder: (id, data) => {
        set(s => ({ orders: s.orders.map(o => o.id === id ? { ...o, ...data } : o) }))
        toast.success('Order updated')
      },
      deleteOrder: (id) => {
        set(s => ({ orders: s.orders.filter(o => o.id !== id) }))
        toast.success('Order deleted')
      },

      // ── Invoices ───────────────────────────────────────────────────────
      addInvoice: (invData) => {
        const newInv: Invoice = { ...invData, id: `INV-${2049 + get().invoices.length}` }
        set(s => ({ invoices: [newInv, ...s.invoices] }))
        get().addLog({ type: 'billing', action: 'Invoice created', user: 'Admin', role: 'Admin', ip: '—', details: `${newInv.id} — ₹${newInv.total.toLocaleString('en-IN')}` })
        toast.success(`Invoice ${newInv.id} created`)
      },
      updateInvoiceStatus: (id, status) => {
        set(s => ({ invoices: s.invoices.map(i => i.id === id ? { ...i, status } : i) }))
        toast.success(`Invoice marked as ${status}`)
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
      sendInvoiceEmail: (id) => {
        const inv = get().invoices.find(i => i.id === id)
        get().addLog({ type: 'billing', action: 'Invoice emailed', user: 'Admin', role: 'Admin', ip: '—', details: `${id} sent to customer` })
        toast.success(`Invoice emailed to customer`)
      },
      exportInvoicePDF: (id) => {
        const inv = get().invoices.find(i => i.id === id)
        if (!inv) return
        // Build printable HTML
        const html = `
          <html><head><title>${inv.id}</title>
          <style>
            body{font-family:Arial,sans-serif;padding:40px;color:#111;max-width:700px;margin:auto}
            h1{color:#C9A84C;font-size:28px;margin:0}
            .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #C9A84C}
            .label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
            .value{font-size:14px;font-weight:600}
            table{width:100%;border-collapse:collapse;margin:24px 0}
            th{background:#0D0700;color:#C9A84C;padding:10px 14px;text-align:left;font-size:12px}
            td{padding:10px 14px;border-bottom:1px solid #eee;font-size:13px}
            .total-row td{font-weight:700;font-size:15px;border-top:2px solid #C9A84C}
            .badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;background:${inv.status === 'paid' ? '#dcfce7' : '#fef3c7'};color:${inv.status === 'paid' ? '#166534' : '#92400e'}}
            .footer{margin-top:40px;padding-top:20px;border-top:1px solid #eee;font-size:11px;color:#999;text-align:center}
          </style></head>
          <body>
          <div class="header">
            <div><h1>RATAN JEWELLERS</h1><div style="font-size:12px;color:#888;margin-top:4px">123 Gold Market, Bhubaneswar, Odisha 751001</div><div style="font-size:12px;color:#888">GSTIN: 21AAAAA0000A1Z5 | Phone: +91 98765 43210</div></div>
            <div style="text-align:right"><div style="font-size:22px;font-weight:700;color:#C9A84C">${inv.id}</div><div class="badge">${inv.status.toUpperCase()}</div><div style="font-size:12px;color:#888;margin-top:4px">Date: ${inv.date}</div><div style="font-size:12px;color:#888">Due: ${inv.due}</div></div>
          </div>
          <div style="margin-bottom:24px"><div class="label">Bill To</div><div class="value">${inv.customer}</div>${inv.phone ? `<div style="font-size:12px;color:#888">Phone: ${inv.phone}</div>` : ''}</div>
          <table>
            <tr><th>Description</th><th>HSN</th><th style="text-align:right">Amount</th></tr>
            <tr><td>Jewellery Purchase (Order ${inv.order})</td><td>7113</td><td style="text-align:right">₹${inv.amount.toLocaleString('en-IN')}</td></tr>
            <tr><td style="color:#888">CGST @ 1.5%</td><td></td><td style="text-align:right;color:#888">₹${(inv.gst / 2).toLocaleString('en-IN')}</td></tr>
            <tr><td style="color:#888">SGST @ 1.5%</td><td></td><td style="text-align:right;color:#888">₹${(inv.gst / 2).toLocaleString('en-IN')}</td></tr>
            <tr class="total-row"><td colspan="2">TOTAL</td><td style="text-align:right">₹${inv.total.toLocaleString('en-IN')}</td></tr>
          </table>
          <div class="footer">Thank you for shopping with Ratan Jewellers | BIS Hallmarked Jewellery | www.ratanjewellers.com</div>
          </body></html>`
        const w = window.open('', '_blank')
        if (w) { w.document.write(html); w.document.close(); w.print() }
        get().addLog({ type: 'billing', action: 'Invoice PDF exported', user: 'Admin', role: 'Admin', ip: '—', details: `${id} exported to PDF` })
        toast.success(`PDF opened for ${id}`)
      },

      // ── Inventory ──────────────────────────────────────────────────────
      addInventoryItem: (itemData) => {
        const newItem: InventoryItem = { ...itemData, id: `INV-${String(Date.now()).slice(-3)}`, lastUpdated: 'just now' }
        set(s => ({ inventory: [newItem, ...s.inventory] }))
        get().addLog({ type: 'inventory', action: 'Stock item added', user: 'Admin', role: 'Admin', ip: '—', details: `Added: ${newItem.name}` })
        toast.success(`"${newItem.name}" added to inventory`)
      },
      updateInventoryItem: (id, data) => {
        const prev = get().inventory.find(i => i.id === id)
        set(s => ({ inventory: s.inventory.map(i => i.id === id ? { ...i, ...data, lastUpdated: 'just now' } : i) }))
        if (data.stock !== undefined && prev) {
          get().addLog({ type: 'inventory', action: 'Stock adjusted', user: 'Admin', role: 'Admin', ip: '—', details: `${prev.name}: ${prev.stock} → ${data.stock} pcs` })
        }
        toast.success('Inventory updated')
      },
      deleteInventoryItem: (id) => {
        const item = get().inventory.find(i => i.id === id)
        set(s => ({ inventory: s.inventory.filter(i => i.id !== id) }))
        toast.success(`"${item?.name}" removed`)
      },

      // ── Customers ──────────────────────────────────────────────────────
      addCustomer: (customerData) => {
        const newCustomer: Customer = { ...customerData, id: `CRM-${String(Date.now()).slice(-3)}` }
        set(s => ({ customers: [newCustomer, ...s.customers] }))
        get().addLog({ type: 'crm', action: 'Customer added', user: 'Admin', role: 'Admin', ip: '—', details: `${newCustomer.name} — ${newCustomer.city}` })
        toast.success(`Customer "${newCustomer.name}" added`)
      },
      updateCustomer: (id, data) => {
        set(s => ({ customers: s.customers.map(c => c.id === id ? { ...c, ...data } : c) }))
        get().addLog({ type: 'crm', action: 'Customer updated', user: 'Admin', role: 'Admin', ip: '—', details: `Updated: ${id}` })
        toast.success('Customer updated')
      },
      deleteCustomer: (id) => {
        const c = get().customers.find(c => c.id === id)
        set(s => ({ customers: s.customers.filter(c => c.id !== id) }))
        toast.success(`Customer "${c?.name}" deleted`)
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
        const prev = get().goldRates
        set({ goldRates: rates })
        get().addLog({ type: 'settings', action: 'Gold rate updated', user: 'Admin', role: 'Admin', ip: '—', details: `22K: ₹${prev['22K']} → ₹${rates['22K']}/g` })
        toast.success('Gold rates updated')
      },

      // ── Settings ───────────────────────────────────────────────────────
      setCurrentRole: (role) => set({ currentRole: role }),

      // ── Audit Log ──────────────────────────────────────────────────────
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
