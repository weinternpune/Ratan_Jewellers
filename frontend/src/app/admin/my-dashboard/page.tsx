'use client'
import { useAuthStore } from '@/store/authStore'
import { useAdminStore } from '@/store/adminStore'
import { ShoppingCart, Receipt, Package, BarChart3, Users, Boxes, Crown, TrendingUp, Clock, CheckCircle2, AlertCircle, IndianRupee, Star, MessageCircle, Gem, LogOut } from 'lucide-react'
import { useCustomJewelleryStore } from '@/store/customJewelleryStore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function Card({ title, value, sub, icon: Icon, color, accent }: any) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={18} className={accent} />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{title}</div>
      {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

// ── Customer Dashboard — mirrors admin panel design ────────────────────────
function CustomerDash() {
  const { currentUser, logout } = useAuthStore()
  const { orders, invoices, customers } = useAdminStore()
  const { requests: cjRequests } = useCustomJewelleryStore()
  const router = useRouter()

  const myOrders   = orders.filter(o => o.email === currentUser?.email)
  const myInvoices = invoices.filter(i => i.email === currentUser?.email)
  const myCJ       = cjRequests.filter(r => r.email === currentUser?.email)
  const me         = customers.find(c => c.email === currentUser?.email)
  const tierColor  = me?.tier === 'platinum' ? 'bg-purple-100 text-purple-700' : me?.tier === 'gold' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-[#0D0700] to-[#2b1a00] rounded-2xl p-6 text-white flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#C9A84C]/20 border-2 border-[#C9A84C]/40 flex items-center justify-center text-[#C9A84C] font-bold text-xl flex-shrink-0">
          {currentUser?.avatar || currentUser?.name?.split(' ').map(n => n[0]).join('').slice(0,2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-lg font-bold truncate">Welcome, {currentUser?.name?.split(' ')[0]}!</div>
          <div className="text-white/50 text-sm">{currentUser?.email}</div>
          {me && <span className={'mt-1 inline-block text-xs font-bold px-2 py-0.5 rounded-full ' + tierColor}>{me.tier.toUpperCase()} Member</span>}
        </div>
        <button onClick={() => { logout(); router.replace('/') }} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl text-xs font-medium transition-colors flex-shrink-0">
          <LogOut size={13}/>Sign Out
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card title="My Orders"    value={myOrders.length}   icon={ShoppingCart} color="bg-blue-50"   accent="text-blue-600" />
        <Card title="Invoices"     value={myInvoices.length} icon={Receipt}      color="bg-amber-50"  accent="text-amber-600" />
        <Card title="Total Spent"  value={me ? '₹' + (me.totalSpend/100000).toFixed(1) + 'L' : '₹0'} icon={IndianRupee} color="bg-green-50" accent="text-green-600" />
        <Card title="Custom Reqs"  value={myCJ.length}       icon={Gem}          color="bg-purple-50" accent="text-purple-600" />
      </div>

      {/* My Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 text-sm">My Orders</h3>
          <a href="/products" className="text-xs text-[#C9A84C] hover:underline">Browse More</a>
        </div>
        {myOrders.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-400 text-sm">No orders yet — <a href="/products" className="text-amber-600 hover:underline">start shopping</a></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {myOrders.map(o => (
              <div key={o.id} className="flex items-center px-5 py-3 gap-4 hover:bg-gray-50/50">
                <span className="font-mono text-sm font-semibold text-[#C9A84C] w-20 flex-shrink-0">{o.id}</span>
                <div className="flex-1 min-w-0"><div className="text-sm text-gray-700 truncate">{o.items.map(i => i.name).join(', ')}</div><div className="text-xs text-gray-400">{o.date}</div></div>
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold text-gray-900 text-sm">₹{o.total.toLocaleString('en-IN')}</div>
                  <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + (o.status==='delivered'?'bg-green-50 text-green-600':o.status==='cancelled'?'bg-red-50 text-red-500':'bg-amber-50 text-amber-600')}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Invoices */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50"><h3 className="font-semibold text-gray-800 text-sm">My Invoices</h3></div>
        {myInvoices.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-400 text-sm">No invoices yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {myInvoices.map(inv => (
              <div key={inv.id} className="flex items-center px-5 py-3 gap-4 hover:bg-gray-50/50">
                <span className="font-mono text-sm font-semibold text-[#C9A84C] w-20 flex-shrink-0">{inv.id}</span>
                <div className="flex-1 text-sm text-gray-600">{inv.date}</div>
                <div className="font-bold text-gray-900">₹{inv.total.toLocaleString('en-IN')}</div>
                <span className={'text-xs px-2 py-1 rounded-full font-semibold ' + (inv.status==='paid'?'bg-green-50 text-green-600':'bg-amber-50 text-amber-600')}>{inv.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Jewellery Requests */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 text-sm">My Custom Jewellery Requests</h3>
          <a href="/custom-jewellery" className="text-xs text-[#C9A84C] hover:underline">Submit New</a>
        </div>
        {myCJ.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-400 text-sm">No requests yet — <a href="/custom-jewellery" className="text-amber-600 hover:underline">submit a custom design</a></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {myCJ.map(r => (
              <div key={r.id} className="px-5 py-4 hover:bg-gray-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-[#C9A84C]">{r.id}</span>
                  <span className={'text-xs px-2 py-0.5 rounded-full font-semibold ' + (r.status==='replied'?'bg-purple-50 text-purple-600':r.status==='completed'?'bg-green-50 text-green-600':'bg-blue-50 text-blue-600')}>{r.status}</span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{r.description}</p>
                <p className="text-xs text-gray-400 mt-1">{r.submittedAt}</p>
                {r.replies.length > 0 && (
                  <div className="mt-2 bg-amber-50 border border-amber-100 rounded-lg p-3">
                    <div className="text-xs font-semibold text-amber-700 mb-1">Reply from {r.replies[r.replies.length-1].from}:</div>
                    <p className="text-xs text-gray-700">{r.replies[r.replies.length-1].message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
        <MessageCircle size={20} className="text-green-600 flex-shrink-0"/>
        <div className="flex-1"><div className="font-semibold text-gray-800 text-sm">Need Help?</div><div className="text-xs text-gray-500">Contact us on WhatsApp for order support</div></div>
        <a href="https://wa.me/917507510948" target="_blank" rel="noreferrer" className="bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-green-600 whitespace-nowrap">WhatsApp Us</a>
      </div>
    </div>
  )
}

// ── Sales Staff Dashboard ─────────────────────────────────────────────────
function SalesStaffDash() {
  const { orders, invoices, customers } = useAdminStore()
  const todayOrders = orders.filter(o => ['placed', 'confirmed', 'processing'].includes(o.status))
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Sales Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Active Orders" value={todayOrders.length} icon={ShoppingCart} color="bg-blue-50" accent="text-blue-600" />
        <Card title="Invoices Pending" value={invoices.filter(i => i.status === 'pending').length} icon={Receipt} color="bg-amber-50" accent="text-amber-600" />
        <Card title="Customers" value={customers.length} icon={Users} color="bg-purple-50" accent="text-purple-600" />
        <Card title="Delivered Today" value={orders.filter(o => o.status === 'delivered').length} icon={CheckCircle2} color="bg-green-50" accent="text-green-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 text-sm">Active Orders</h3>
            <Link href="/admin/orders" className="text-xs text-[#C9A84C] hover:underline">Manage</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {todayOrders.slice(0, 5).map(o => (
              <div key={o.id} className="flex items-center px-5 py-3 gap-3">
                <span className="font-mono text-xs text-[#C9A84C] w-16">{o.id}</span>
                <span className="flex-1 text-sm text-gray-700">{o.customer}</span>
                <span className="text-sm font-semibold text-gray-900">₹{(o.total / 1000).toFixed(0)}K</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">{o.status}</span>
              </div>
            ))}
            {todayOrders.length === 0 && <div className="px-5 py-8 text-center text-gray-400 text-sm">No active orders</div>}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 text-sm">Recent Customers</h3>
            <Link href="/admin/crm" className="text-xs text-[#C9A84C] hover:underline">View CRM</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {customers.slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center px-5 py-3 gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs flex-shrink-0">{c.name.split(' ').map((n: string) => n[0]).join('')}</div>
                <div className="flex-1"><div className="text-sm text-gray-700">{c.name}</div><div className="text-xs text-gray-400">{c.phone}</div></div>
                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{c.tier}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Inventory Manager Dashboard ───────────────────────────────────────────
function InventoryManagerDash() {
  const { inventory, products } = useAdminStore()
  const lowStock = inventory.filter(i => i.stock < i.minStock)
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Inventory Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Total SKUs" value={inventory.length} icon={Boxes} color="bg-green-50" accent="text-green-600" />
        <Card title="Low Stock" value={lowStock.length} sub="Needs reorder" icon={AlertCircle} color="bg-amber-50" accent="text-amber-600" />
        <Card title="Out of Stock" value={inventory.filter(i => i.stock === 0).length} icon={Package} color="bg-red-50" accent="text-red-500" />
        <Card title="Stock Value" value={`₹${(inventory.reduce((a, i) => a + i.value, 0) / 10000000).toFixed(2)}Cr`} icon={IndianRupee} color="bg-blue-50" accent="text-blue-600" />
      </div>
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="text-sm font-semibold text-amber-800 mb-1">Low Stock Alerts</div>
          <div className="text-xs text-amber-700">{lowStock.map(i => `${i.name} (${i.stock} left)`).join(' • ')}</div>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 text-sm">All Stock</h3>
          <Link href="/admin/inventory" className="text-xs text-[#C9A84C] hover:underline">Manage</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {inventory.map(item => {
            const pct = Math.min((item.stock / item.maxStock) * 100, 100)
            const color = item.stock === 0 ? 'bg-red-400' : item.stock < item.minStock ? 'bg-amber-400' : 'bg-green-400'
            return (
              <div key={item.id} className="flex items-center px-5 py-3 gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
                <span className="flex-1 text-sm text-gray-700">{item.name}</span>
                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} /></div>
                <span className="text-xs font-semibold text-gray-700 w-12 text-right">{item.stock} pcs</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Store Manager Dashboard ───────────────────────────────────────────────
function StoreManagerDash() {
  const { orders, invoices, inventory, customers } = useAdminStore()
  const { requests: cjRequests } = useCustomJewelleryStore()
  const newCJRequests = cjRequests.filter(r => r.status === 'new').length
  const revenue = orders.filter(o => o.status === 'delivered').reduce((a, o) => a + o.total, 0)
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Store Manager Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Revenue" value={`₹${(revenue / 100000).toFixed(1)}L`} icon={IndianRupee} color="bg-amber-50" accent="text-amber-600" />
        <Card title="Total Orders" value={orders.length} icon={ShoppingCart} color="bg-blue-50" accent="text-blue-600" />
        <Card title="Customers" value={customers.length} icon={Users} color="bg-purple-50" accent="text-purple-600" />
        <Card title="Low Stock" value={inventory.filter(i => i.stock < i.minStock).length} icon={AlertCircle} color="bg-red-50" accent="text-red-500" />
        <Link href="/admin/custom-jewellery" className="bg-white rounded-xl p-4 border-2 border-amber-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-2"><Gem size={14} className="text-amber-500"/><span className="text-xs text-gray-500">Custom Orders</span></div>
          <div className="text-2xl font-bold text-amber-600">{newCJRequests}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">New requests</div>
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Link href="/admin/orders" className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
          <ShoppingCart size={20} className="text-blue-500" />
          <div className="font-semibold text-gray-800">Manage Orders</div>
          <div className="text-xs text-gray-400">{orders.filter(o => ['placed', 'confirmed', 'processing'].includes(o.status)).length} pending</div>
        </Link>
        <Link href="/admin/billing" className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
          <Receipt size={20} className="text-amber-500" />
          <div className="font-semibold text-gray-800">Billing</div>
          <div className="text-xs text-gray-400">{invoices.filter(i => i.status === 'pending').length} unpaid invoices</div>
        </Link>
        <Link href="/admin/inventory" className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
          <Boxes size={20} className="text-green-500" />
          <div className="font-semibold text-gray-800">Inventory</div>
          <div className="text-xs text-gray-400">{inventory.filter(i => i.stock < i.minStock).length} low stock alerts</div>
        </Link>
      </div>
    </div>
  )
}

// ── Router ────────────────────────────────────────────────────────────────
export default function MyDashboardPage() {
  const { getEffectiveRole } = useAuthStore()
  const role = getEffectiveRole()

  if (role === 'customer') return <CustomerDash />
  if (role === 'sales_staff') return <SalesStaffDash />
  if (role === 'inventory_manager') return <InventoryManagerDash />
  if (role === 'store_manager') return <StoreManagerDash />
  // admin / super_admin go to full dashboard
  return null
}