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
  email?: string
  phone?: string
  hallmarkId?: string // BIS Hallmark Unique ID
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
  amountPaid?: number // Amount paid so far
  balanceDue?: number // Remaining balance
  paymentHistory?: Array<{amount: number; date: string; mode: string; notes?: string}> // Payment tracking
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

interface BackendOrder {
  orderNumber?: string
  _id?: string
  id?: string
  customerName?: string
  customer?: string
  customerEmail?: string
  email?: string
  customerPhone?: string
  phone?: string
  items?: OrderItem[]
  totalAmount?: number
  total?: number
  status?: string
  createdAt?: string
  paymentMode?: string
  payment?: string
}

interface BackendInvoice {
  invoiceNumber?: string
  _id: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  subtotal?: number
  cgst?: number
  sgst?: number
  totalAmount?: number
  status?: string
  createdAt?: string
  notes?: string
  items?: Array<{
    purity?: string
    netWeight?: number
    goldRate?: number
    makingCharges?: number
  }>
}

interface BackendCustomer {
  _id?: string
  id?: string
  name?: string
  phone?: string
  email?: string
  city?: string
  totalPurchases?: number
  segment?: string
  updatedAt?: string
  dateOfBirth?: string
  tags?: string[]
}

// ── Initial Data ──────────────────────────────────────────────────────────
const initialUsers: AdminUser[] = [
  { id: 1, name: 'Rajesh Sharma', email: 'rajesh@ratanjewellers.com', role: 'super_admin', status: 'active', joined: 'Jan 2022', lastLogin: '2 hrs ago', avatar: 'RS', phone: '+91 98765 43210' },
  { id: 2, name: 'Priya Mehta', email: 'priya@ratanjewellers.com', role: 'admin', status: 'active', joined: 'Mar 2023', lastLogin: '1 day ago', avatar: 'PM', phone: '+91 87654 32109' },
]

const initialProducts: Product[] = []

const SEED_PRODUCT_IDS = new Set(['RJ001', 'RJ002', 'RJ003', 'RJ004', 'RJ005', 'RJ006', 'RJ007', 'RJ008'])

const stripSeedProducts = (products: Product[] | undefined) =>
  (products ?? []).filter(product => !SEED_PRODUCT_IDS.has(product.id))

const initialOrders: Order[] = [
  { id: 'RJ-4821', customer: 'Demo Customer', email: 'demo@example.com', phone: '+91 98765 43210', items: [{ name: 'Gold Chain', qty: 1, price: 50000 }], total: 50000, status: 'delivered', date: '13 Jun 2026', payment: 'UPI' },
]

const initialInvoices: Invoice[] = [
  { id: 'INV-2049', customer: 'Demo Customer', phone: '+91 98765 43210', amount: 50000, gst: 1500, total: 51500, status: 'paid', date: '13 Jun 2026', due: '—', category: 'Necklaces', metal: '22K Gold', purity: '916', netWeight: '8.5', goldRate: 14525, makingCharges: 10, price: 5000 },
]

const initialInventory: InventoryItem[] = []

const initialCustomers: Customer[] = [
  { id: 'CRM-001', name: 'Demo Customer', phone: '+91 98765 43210', email: 'demo@example.com', city: 'Pune', totalSpend: 50000, orders: 1, tier: 'gold', lastVisit: '13 Jun 2026', birthday: '15 May 1990', tags: ['VIP'] },
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
  updateInvoice: (id: string, data: Partial<Invoice>) => Promise<void>
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

  // Reset
  resetAll: () => void

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
      goldRates: { '24K': '14525', '22K': '13314', '18K': '10893', '14K': '8349' },
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
          
          const frontendOrders: Order[] = (result.orders || []).map((order: BackendOrder) => ({
            id: order.orderNumber || order._id || order.id || '',
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
          
          console.log('=== FETCH INVOICES DEBUG ===')
          console.log('Raw backend response:', result.invoices?.[0])
          console.log('Total invoices:', result.invoices?.length)
          
          const frontendInvoices: Invoice[] = (result.invoices || []).map((invoice: any) => {
            // Recalculate balance to ensure correctness (backend might have wrong data)
            const total = invoice.totalAmount || 0
            const paid = invoice.amountPaid || 0
            const correctBalance = total - paid
            
            // If backend balance doesn't match calculated balance, log warning and use correct value
            if (invoice.balanceDue !== undefined && Math.abs(invoice.balanceDue - correctBalance) > 0.01) {
              console.warn(`⚠️ Balance mismatch for invoice ${invoice.invoiceNumber}:`, {
                total,
                paid,
                backendBalance: invoice.balanceDue,
                correctBalance
              })
            }
            
            // Determine correct status based on balance
            let correctStatus: InvoiceStatus = 'pending'
            if (correctBalance <= 0) {
              correctStatus = 'paid'
            } else if (invoice.status === 'overdue') {
              correctStatus = 'overdue'
            }
            
            // Log if status needs correction
            if (invoice.status !== correctStatus) {
              console.warn(`⚠️ Status correction for ${invoice.invoiceNumber}: ${invoice.status} → ${correctStatus}`)
            }
            
            const mapped = {
              id: invoice.invoiceNumber || invoice._id,
              customer: invoice.customerName || 'Unknown Customer',
              email: invoice.customerEmail || '',
              phone: invoice.customerPhone || '',
              hallmarkId: invoice.hallmarkId || '',
              amount: invoice.subtotal || 0,
              gst: (invoice.cgst || 0) + (invoice.sgst || 0),
              total: total,
              amountPaid: paid, // Map payment fields
              balanceDue: correctBalance, // Always use correctly calculated balance
              paymentHistory: invoice.paymentHistory || [], // Map payment history
              status: correctStatus, // Use corrected status
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
            }
            
            console.log('Backend invoice:', invoice.invoiceNumber, {
              amountPaid: invoice.amountPaid,
              balanceDue: invoice.balanceDue,
              totalAmount: invoice.totalAmount
            })
            console.log('Mapped to frontend:', mapped.id, {
              amountPaid: mapped.amountPaid,
              balanceDue: mapped.balanceDue,
              total: mapped.total
            })
            
            return mapped
          })
          
          set(s => ({ 
            invoices: frontendInvoices,
            loading: { ...s.loading, invoices: false }
          }))
        } catch (error) {
          console.error('Failed to fetch invoices:', error)
          handleApiError(error)
          set(s => ({ 
            invoices: [], // Set empty array on error
            loading: { ...s.loading, invoices: false } 
          }))
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
              goldRate: invData.goldRate || 7069,
              makingCharges: invData.makingCharges || 0,
              stoneCharges: 0,
              cgstRate: 1.5,
              sgstRate: 1.5,
              quantity: 1
            }],
            discountAmount: 0,
            oldGoldExchange: 0,
            amountPaid: invData.amountPaid || 0, // Partial payment
            balanceDue: invData.balanceDue !== undefined ? invData.balanceDue : invData.total, // Balance
            paymentHistory: invData.paymentHistory || [], // Payment tracking
            notes: invData.category ? `Category: ${invData.category}, Metal: ${invData.metal}` : ''
          }
          
          const result = await invoiceApi.create(backendData)
          const newInvoice = result.data
          
          const frontendInvoice: Invoice = {
            id: newInvoice.invoiceNumber,
            customer: newInvoice.customerName,
            email: newInvoice.customerEmail || '',
            phone: newInvoice.customerPhone,
            amount: newInvoice.subtotal,
            gst: (newInvoice.cgst || 0) + (newInvoice.sgst || 0),
            total: newInvoice.totalAmount,
            amountPaid: newInvoice.amountPaid || invData.amountPaid || 0, // Map paid amount
            balanceDue: newInvoice.balanceDue !== undefined ? newInvoice.balanceDue : (invData.balanceDue !== undefined ? invData.balanceDue : invData.total), // Map balance
            paymentHistory: newInvoice.paymentHistory || invData.paymentHistory || [], // Map payment history
            status: invData.status || 'paid',
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
          get().addLog({ type: 'billing', action: 'Invoice created', user: 'Admin', role: 'Admin', ip: '—', details: `${frontendInvoice.id} — ₹${frontendInvoice.total.toLocaleString('en-IN')} (Paid: ₹${frontendInvoice.amountPaid?.toLocaleString('en-IN') || 0})` })
          toast.success(`Invoice ${frontendInvoice.id} created`)
        } catch (error) {
          handleApiError(error)
        }
      },

      updateInvoice: async (id, data) => {
        try {
          console.log('=== UPDATE INVOICE DEBUG ===')
          console.log('Invoice ID:', id)
          console.log('Update data being sent:', data)
          
          const response = await invoiceApi.update(id, data)
          console.log('Update response received:', response)
          
          // Update local state with the response data
          if (response && response.data) {
            const updatedInvoice = response.data
            console.log('Updated invoice from backend:', {
              amountPaid: updatedInvoice.amountPaid,
              balanceDue: updatedInvoice.balanceDue,
              status: updatedInvoice.status
            })
            
            set(s => ({ 
              invoices: s.invoices.map(i => {
                if (i.id === id) {
                  const updated = { 
                    ...i, 
                    amountPaid: updatedInvoice.amountPaid !== undefined ? updatedInvoice.amountPaid : data.amountPaid,
                    balanceDue: updatedInvoice.balanceDue !== undefined ? updatedInvoice.balanceDue : data.balanceDue,
                    status: updatedInvoice.status || data.status,
                    paymentHistory: updatedInvoice.paymentHistory || i.paymentHistory
                  }
                  console.log('Updated invoice in state:', {
                    id: updated.id,
                    amountPaid: updated.amountPaid,
                    balanceDue: updated.balanceDue,
                    status: updated.status
                  })
                  return updated
                }
                return i
              }) 
            }))
          } else {
            // Fallback to just updating with the data we sent
            console.log('No response.data, using fallback update')
            set(s => ({ invoices: s.invoices.map(i => i.id === id ? { ...i, ...data } : i) }))
          }
          
          get().addLog({ type: 'billing', action: 'Invoice updated', user: 'Admin', role: 'Admin', ip: '—', details: `${id} - Payment updated` })
        } catch (error) {
          console.error('Update invoice error:', error)
          handleApiError(error)
          throw error
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
        
        // Calculate balance and format amounts
        const amountPaid = inv.amountPaid || 0
        const balanceDue = inv.balanceDue !== undefined ? inv.balanceDue : (inv.total - amountPaid)
        
        // Create detailed HTML for print/PDF (matching preview design)
        const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${inv.id} - Ratan Jewellers</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 40px; color: #0D0700; }
    .invoice-container { max-width: 800px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; }
    .header { display: flex; justify-content: space-between; padding: 24px; background: #FEFCE8; border-bottom: 2px solid #C9A84C; }
    .company-info { flex: 1; }
    .company-name { font-size: 20px; font-weight: bold; color: #0D0700; margin-bottom: 8px; }
    .company-details { font-size: 12px; color: #6B7280; line-height: 1.6; }
    .invoice-info { text-align: right; }
    .invoice-number { font-family: monospace; font-weight: bold; font-size: 18px; color: #C9A84C; margin-bottom: 8px; }
    .invoice-date { font-size: 12px; color: #6B7280; }
    .status-badge { display: inline-block; margin-top: 8px; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .status-paid { background: #DCFCE7; color: #166534; }
    .status-pending { background: #FEF3C7; color: #92400E; }
    .status-overdue { background: #FEE2E2; color: #991B1B; }
    .customer-section { padding: 24px; background: #F9FAFB; border-bottom: 1px solid #E5E7EB; }
    .section-title { font-size: 13px; font-weight: 600; color: #6B7280; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; }
    .customer-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .detail-item { }
    .detail-label { font-size: 11px; color: #9CA3AF; margin-bottom: 4px; }
    .detail-value { font-size: 14px; color: #1F2937; font-weight: 500; }
    .product-section { padding: 24px; }
    .product-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
    .amounts-section { padding: 24px; background: #F9FAFB; border-top: 1px solid #E5E7EB; }
    .amounts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; max-width: 400px; margin-left: auto; }
    .amount-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
    .amount-label { color: #6B7280; }
    .amount-value { font-weight: 600; color: #1F2937; }
    .amount-row.total { padding-top: 12px; border-top: 2px solid #C9A84C; margin-top: 8px; }
    .amount-row.total .amount-label { font-size: 16px; font-weight: 700; color: #0D0700; }
    .amount-row.total .amount-value { font-size: 18px; font-weight: 700; color: #C9A84C; }
    .payment-section { padding: 24px; border-top: 1px solid #E5E7EB; }
    .payment-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .footer { padding: 20px 24px; background: #0D0700; color: #C9A84C; text-align: center; font-size: 11px; }
    @media print {
      body { padding: 0; }
      .invoice-container { border: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="header">
      <div class="company-info">
        <div class="company-name">RATAN JEWELLERS</div>
        <div class="company-details">
          123 Gold Market, Pune, Maharashtra 411001<br>
          GSTIN: 27AAAAA0000A1Z5<br>
          Phone: +91 98765 43210<br>
          Email: info@ratanjeweller.in
        </div>
      </div>
      <div class="invoice-info">
        <div class="invoice-number">${inv.id}</div>
        <div class="invoice-date">Date: ${inv.date}</div>
        ${inv.due && inv.due !== '—' ? `<div class="invoice-date">Due: ${inv.due}</div>` : ''}
        <span class="status-badge status-${inv.status}">${inv.status}</span>
      </div>
    </div>

    <!-- Customer Info -->
    <div class="customer-section">
      <div class="section-title">Customer Information</div>
      <div class="customer-grid">
        <div class="detail-item">
          <div class="detail-label">Customer Name</div>
          <div class="detail-value">${inv.customer}</div>
        </div>
        ${inv.phone ? `
        <div class="detail-item">
          <div class="detail-label">Phone Number</div>
          <div class="detail-value">${inv.phone}</div>
        </div>` : ''}
        ${inv.hallmarkId ? `
        <div class="detail-item">
          <div class="detail-label">Hallmark ID</div>
          <div class="detail-value">${inv.hallmarkId}</div>
        </div>` : ''}
        ${inv.email ? `
        <div class="detail-item">
          <div class="detail-label">Email</div>
          <div class="detail-value">${inv.email}</div>
        </div>` : ''}
      </div>
    </div>

    <!-- Product Details -->
    ${inv.category || inv.metal || inv.purity ? `
    <div class="product-section">
      <div class="section-title">Product Details</div>
      <div class="product-grid">
        ${inv.category ? `
        <div class="detail-item">
          <div class="detail-label">Category</div>
          <div class="detail-value">${inv.category}</div>
        </div>` : ''}
        ${inv.metal ? `
        <div class="detail-item">
          <div class="detail-label">Metal</div>
          <div class="detail-value">${inv.metal}</div>
        </div>` : ''}
        ${inv.purity ? `
        <div class="detail-item">
          <div class="detail-label">Purity</div>
          <div class="detail-value">${inv.purity}</div>
        </div>` : ''}
        ${inv.netWeight ? `
        <div class="detail-item">
          <div class="detail-label">Net Weight</div>
          <div class="detail-value">${inv.netWeight} grams</div>
        </div>` : ''}
        ${inv.goldRate ? `
        <div class="detail-item">
          <div class="detail-label">Gold Rate</div>
          <div class="detail-value">₹${inv.goldRate.toLocaleString('en-IN')}/gram</div>
        </div>` : ''}
        ${inv.makingCharges ? `
        <div class="detail-item">
          <div class="detail-label">Making Charges</div>
          <div class="detail-value">${inv.makingCharges}%</div>
        </div>` : ''}
      </div>
    </div>` : ''}

    <!-- Amounts -->
    <div class="amounts-section">
      <div class="section-title">Amount Breakdown</div>
      <div class="amounts-grid">
        <div class="amount-row">
          <span class="amount-label">Subtotal</span>
          <span class="amount-value">₹${inv.amount.toLocaleString('en-IN')}</span>
        </div>
        <div class="amount-row">
          <span class="amount-label">GST (3%)</span>
          <span class="amount-value">₹${inv.gst.toLocaleString('en-IN')}</span>
        </div>
        <div class="amount-row total">
          <span class="amount-label">Total Amount</span>
          <span class="amount-value">₹${inv.total.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>

    <!-- Payment Info -->
    <div class="payment-section">
      <div class="section-title">Payment Information</div>
      <div class="payment-grid">
        <div class="detail-item">
          <div class="detail-label">Amount Paid</div>
          <div class="detail-value" style="color: #059669;">₹${amountPaid.toLocaleString('en-IN')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Balance Due</div>
          <div class="detail-value" style="color: ${balanceDue > 0 ? '#DC2626' : '#059669'};">₹${balanceDue.toLocaleString('en-IN')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Payment Status</div>
          <div class="detail-value">${balanceDue <= 0 ? 'Fully Paid ✓' : 'Payment Pending'}</div>
        </div>
      </div>
      ${inv.paymentHistory && inv.paymentHistory.length > 0 ? `
      <div style="margin-top: 16px;">
        <div class="detail-label" style="margin-bottom: 8px;">Payment History:</div>
        ${inv.paymentHistory.map((p: any) => `
          <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">
            • ₹${p.amount.toLocaleString('en-IN')} paid on ${new Date(p.date).toLocaleDateString('en-IN')} via ${p.mode}
          </div>
        `).join('')}
      </div>` : ''}
    </div>

    <!-- Footer -->
    <div class="footer">
      Thank you for your business! | BIS Hallmarked Jewellery | Lifetime Buyback Guarantee<br>
      www.ratanjewellers.com | Purity You Can Trust Since 1975
    </div>
  </div>

  <script>
    // Auto-print when page loads
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`
        
        const w = window.open('', '_blank')
        if (w) { 
          w.document.write(html)
          w.document.close()
        }
        toast.success(`Invoice ${inv.id} ready for print`)
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
    set((s) => ({
      loading: {
        ...s.loading,
        customers: true,
      },
    }))

    const customersResponse = await customerApi.getAll()

    const frontendCustomers: Customer[] = (customersResponse?.customers || []).map(
      (customer: any) => ({
        id: customer.id || customer._id || "",
        name: customer.name || "Unknown Customer",
        phone: customer.phone || "",
        email: customer.email || "",
        city: customer.city || "",
        totalSpend: customer.totalSpend || 0,
        orders: customer.orders || 0,
        tier: (
          customer.segment?.toLowerCase() || "bronze"
        ) as CustomerTier,
        lastVisit: customer.updatedAt
          ? new Date(customer.updatedAt).toLocaleDateString("en-IN")
          : "Not Available",
        birthday: customer.birthday
          ? new Date(customer.birthday).toLocaleDateString("en-IN")
          : "Not Available",
        tags: customer.tags || [],
      })
    )

    set((s) => ({
      customers: frontendCustomers,
      loading: {
        ...s.loading,
        customers: false,
      },
    }))
  } catch (error) {
    console.error(error)

    set((s) => ({
      loading: {
        ...s.loading,
        customers: false,
      },
    }))
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

      // ── Settings ──────────────────────────────────────────────────────
      setCurrentRole: (role) => set({ currentRole: role }),

      // ── Audit Log ─────────────────────────────────────────────────────
      addLog: (logData) => {
        const newLog: AuditLog = {
          ...logData,
          id: Date.now(),
          time: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        }
        set(s => ({ auditLogs: [newLog, ...s.auditLogs] }))
      },

      // ── Reset Store ───────────────────────────────────────────────────
      resetAll: () => {
        set({
          products: [],
          orders: [],
          invoices: [],
          inventory: [],
          customers: [],
          auditLogs: [],
          goldRates: { '24K': '14525', '22K': '13314', '18K': '10893', '14K': '8349' },
          currentRole: 'super_admin',
          loading: { invoices: false, orders: false, customers: false },
        })
        toast.success('Dashboard reset successfully')
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
