'use client'
import { useState, useEffect } from 'react'
import { TrendingUp, ShoppingCart, Users, Package, IndianRupee, BarChart3, ArrowUpRight, ArrowDownRight, Clock, AlertCircle, CheckCircle2, RefreshCw, Activity, Star, Boxes, FileText, Download, RotateCcw } from 'lucide-react'
import { useAdminStore } from '@/store/adminStore'
import { useCustomJewelleryStore } from '@/store/customJewelleryStore'
import Link from 'next/link'

const DASHBOARDS = ['Sales','Revenue','Inventory','Customer','GST','Profit','Orders'] as const
type DashType = typeof DASHBOARDS[number]

function StatCard({label,value,sub,trend,trendVal,icon:Icon,color,accent}:{label:string;value:string;sub?:string;trend?:'up'|'down'|'neutral';trendVal?:string;icon:any;color:string;accent:string}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}><Icon size={18} className={accent}/></div>
        {trend&&<div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend==='up'?'bg-green-50 text-green-600':trend==='down'?'bg-red-50 text-red-600':'bg-gray-50 text-gray-500'}`}>{trend==='up'?<ArrowUpRight size={11}/>:trend==='down'?<ArrowDownRight size={11}/>:null}{trendVal}</div>}
      </div>
      <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{value}</div>
      <div className="text-xs font-medium text-gray-500">{label}</div>
      {sub&&<div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

function MiniBar({data,color}:{data:number[];color:string}) {
  const max=Math.max(...data)
  return <div className="flex items-end gap-0.5 h-12">{data.map((v,i)=><div key={i} className={`flex-1 rounded-t ${color}`} style={{height:`${(v/max)*100}%`,minHeight:2}}/>)}</div>
}

function Progress({label,value,max,color}:{label:string;value:number;max:number;color:string}) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1"><span className="text-gray-600 font-medium">{label}</span><span className="text-gray-500">{value.toLocaleString('en-IN')}</span></div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${color}`} style={{width:`${max>0?(value/max)*100:0}%`}}/></div>
    </div>
  )
}

// ── PDF Export ─────────────────────────────────────────────────────────────
function exportDashboardPDF(data: {
  totalRevenue: number
  pendingOrders: number
  lowStock: number
  unpaidInvoices: number
  orders: any[]
  products: any[]
  customers: any[]
  inventory: any[]
  invoices: any[]
  auditLogs: any[]
}) {
  const now = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const deliveredOrders = data.orders.filter(o => o.status === 'delivered')
  const totalGST = data.invoices.reduce((a, i) => a + i.gst, 0)
  const totalBilled = data.invoices.reduce((a, i) => a + i.total, 0)
  const collected = data.invoices.filter(i => i.status === 'paid').reduce((a, i) => a + i.total, 0)
  const netRevenue = data.totalRevenue - data.invoices.filter(i => i.status === 'paid').reduce((a, i) => a + i.gst, 0)
  const estProfit = data.totalRevenue * 0.22
  const stockValue = data.inventory.reduce((a, i) => a + i.value, 0)
  const avgSpend = data.customers.length > 0 ? data.customers.reduce((a, c) => a + c.totalSpend, 0) / data.customers.length : 0
  const platinumCount = data.customers.filter(c => c.tier === 'platinum').length
  const goldCount = data.customers.filter(c => c.tier === 'gold').length

  const orderRows = data.orders.slice(0, 8).map(o => `
    <tr>
      <td>${o.id}</td><td>${o.customer}</td>
      <td>Rs.${o.total.toLocaleString('en-IN')}</td>
      <td>${o.date}</td>
      <td><span class="badge badge-${o.status==='delivered'?'green':o.status==='cancelled'?'red':'amber'}">${o.status}</span></td>
    </tr>`).join('')

  const topProducts = [...data.products].sort((a, b) => b.sales - a.sales).slice(0, 5)
  const productRows = topProducts.map(p => `
    <tr>
      <td>${p.id}</td><td>${p.name}</td><td>${p.category}</td>
      <td>Rs.${p.price.toLocaleString('en-IN')}</td>
      <td>${p.sales} units</td>
      <td>Rs.${(p.price * p.sales).toLocaleString('en-IN')}</td>
    </tr>`).join('')

  const inventoryRows = data.inventory.map(i => {
    const status = i.stock === 0 ? 'Out of Stock' : i.stock < i.minStock ? 'Low Stock' : 'OK'
    const sc = i.stock === 0 ? 'red' : i.stock < i.minStock ? 'amber' : 'green'
    return `<tr>
      <td>${i.name}</td><td>${i.category}</td><td>${i.stock} pcs</td>
      <td>${i.minStock} pcs</td><td>Rs.${i.value.toLocaleString('en-IN')}</td>
      <td><span class="badge badge-${sc}">${status}</span></td>
    </tr>`
  }).join('')

  const customerRows = [...data.customers].sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 5).map(c => `
    <tr>
      <td>${c.name}</td><td>${c.city}</td><td>${c.orders}</td>
      <td>Rs.${c.totalSpend.toLocaleString('en-IN')}</td>
      <td><span class="badge badge-${c.tier==='platinum'?'purple':c.tier==='gold'?'amber':'gray'}">${c.tier}</span></td>
    </tr>`).join('')

  const invoiceRows = data.invoices.slice(0, 6).map(inv => `
    <tr>
      <td>${inv.id}</td><td>${inv.customer}</td>
      <td>Rs.${inv.amount.toLocaleString('en-IN')}</td>
      <td>Rs.${(inv.gst/2).toLocaleString('en-IN')}</td>
      <td>Rs.${(inv.gst/2).toLocaleString('en-IN')}</td>
      <td>Rs.${inv.total.toLocaleString('en-IN')}</td>
      <td><span class="badge badge-${inv.status==='paid'?'green':inv.status==='overdue'?'red':'amber'}">${inv.status}</span></td>
    </tr>`).join('')

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <title>Ratan Jewellers - Dashboard Report ${now}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;color:#111;padding:40px;max-width:900px;margin:auto}
    .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:3px solid #C9A84C;margin-bottom:28px}
    .brand h1{font-size:26px;color:#C9A84C;font-weight:800;letter-spacing:1px}
    .brand p{font-size:11px;color:#888;margin-top:3px}
    .meta{text-align:right}
    .meta h2{font-size:16px;font-weight:700}
    .meta p{font-size:11px;color:#888;margin-top:2px}
    .meta .gen{font-size:10px;color:#aaa;margin-top:6px;background:#f9f9f9;padding:3px 8px;border-radius:4px;display:inline-block}
    .section{margin-bottom:32px}
    .section-title{font-size:13px;font-weight:800;color:#0D0700;text-transform:uppercase;letter-spacing:1px;padding:6px 12px;background:#fef3c7;border-left:4px solid #C9A84C;margin-bottom:14px}
    .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:8px}
    .kpi{background:#f9f9f9;border:1px solid #eee;border-radius:10px;padding:14px;text-align:center}
    .kpi .val{font-size:20px;font-weight:800;color:#0D0700;line-height:1}
    .kpi .lbl{font-size:10px;color:#888;margin-top:5px;text-transform:uppercase;letter-spacing:.5px}
    .kpi.hi{background:#0D0700}.kpi.hi .val{color:#C9A84C}.kpi.hi .lbl{color:#C9A84C88}
    .sum-row{display:flex;gap:10px;margin-bottom:12px}
    .sum-item{flex:1;background:#f9f9f9;border:1px solid #eee;border-radius:8px;padding:10px 14px}
    .sum-item .sv{font-size:15px;font-weight:700;color:#0D0700}
    .sum-item .sl{font-size:10px;color:#888;margin-top:2px}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th{background:#0D0700;color:#C9A84C;padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.5px}
    td{padding:7px 10px;border-bottom:1px solid #f0f0f0;color:#333}
    .badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700;text-transform:capitalize}
    .badge-green{background:#dcfce7;color:#166534}
    .badge-red{background:#fee2e2;color:#991b1b}
    .badge-amber{background:#fef3c7;color:#92400e}
    .badge-purple{background:#f3e8ff;color:#6b21a8}
    .badge-gray{background:#f3f4f6;color:#4b5563}
    .footer{margin-top:40px;padding-top:14px;border-top:1px solid #eee;display:flex;justify-content:space-between;font-size:10px;color:#aaa}
    .empty{color:#aaa;font-size:12px;padding:10px;font-style:italic}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.section{page-break-inside:avoid}}
  </style></head><body>

  <div class="header">
    <div class="brand">
      <h1>RATAN JEWELLERS</h1>
      <p>123 Gold Market, Bhubaneswar, Odisha 751001</p>
      <p>GSTIN: 21AAAAA0000A1Z5 | +91 98765 43210</p>
    </div>
    <div class="meta">
      <h2>Analytics Dashboard Report</h2>
      <p>Complete Business Summary</p>
      <div class="gen">Generated: ${now}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Sales Overview</div>
    <div class="kpi-grid">
      <div class="kpi hi"><div class="val">Rs.${(data.totalRevenue/100000).toFixed(2)}L</div><div class="lbl">Total Revenue</div></div>
      <div class="kpi"><div class="val">${data.orders.length}</div><div class="lbl">Total Orders</div></div>
      <div class="kpi"><div class="val">${deliveredOrders.length}</div><div class="lbl">Delivered</div></div>
      <div class="kpi"><div class="val">${data.pendingOrders}</div><div class="lbl">Pending Orders</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Revenue & Profit</div>
    <div class="kpi-grid">
      <div class="kpi"><div class="val">Rs.${(totalBilled/100000).toFixed(2)}L</div><div class="lbl">Total Billed</div></div>
      <div class="kpi"><div class="val">Rs.${(collected/100000).toFixed(2)}L</div><div class="lbl">Collected</div></div>
      <div class="kpi"><div class="val">Rs.${(netRevenue/100000).toFixed(2)}L</div><div class="lbl">Net Revenue</div></div>
      <div class="kpi hi"><div class="val">Rs.${(estProfit/100000).toFixed(2)}L</div><div class="lbl">Est. Profit (22%)</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Inventory Summary</div>
    <div class="sum-row">
      <div class="sum-item"><div class="sv">${data.products.length}</div><div class="sl">Total SKUs</div></div>
      <div class="sum-item"><div class="sv">Rs.${(stockValue/10000000).toFixed(2)}Cr</div><div class="sl">Stock Value</div></div>
      <div class="sum-item"><div class="sv">${data.lowStock}</div><div class="sl">Low Stock Alerts</div></div>
      <div class="sum-item"><div class="sv">${data.inventory.filter(i=>i.stock===0).length}</div><div class="sl">Out of Stock</div></div>
    </div>
    ${data.inventory.length > 0
      ? `<table><thead><tr><th>Item</th><th>Category</th><th>Stock</th><th>Min Stock</th><th>Value</th><th>Status</th></tr></thead><tbody>${inventoryRows}</tbody></table>`
      : '<p class="empty">No inventory data recorded</p>'}
  </div>

  <div class="section">
    <div class="section-title">Customer Summary</div>
    <div class="sum-row">
      <div class="sum-item"><div class="sv">${data.customers.length}</div><div class="sl">Total Customers</div></div>
      <div class="sum-item"><div class="sv">${platinumCount}</div><div class="sl">Platinum Tier</div></div>
      <div class="sum-item"><div class="sv">${goldCount}</div><div class="sl">Gold Tier</div></div>
      <div class="sum-item"><div class="sv">${data.customers.length>0?`Rs.${(avgSpend/100000).toFixed(1)}L`:'—'}</div><div class="sl">Avg. Spend</div></div>
    </div>
    ${data.customers.length > 0
      ? `<table><thead><tr><th>Customer</th><th>City</th><th>Orders</th><th>Total Spend</th><th>Tier</th></tr></thead><tbody>${customerRows}</tbody></table>`
      : '<p class="empty">No customer data recorded</p>'}
  </div>

  <div class="section">
    <div class="section-title">GST Summary</div>
    <div class="kpi-grid" style="margin-bottom:12px">
      <div class="kpi hi"><div class="val">Rs.${(totalGST/1000).toFixed(1)}K</div><div class="lbl">Total GST</div></div>
      <div class="kpi"><div class="val">Rs.${(data.invoices.filter(i=>i.status==='paid').reduce((a,i)=>a+i.gst,0)/1000).toFixed(1)}K</div><div class="lbl">Paid GST</div></div>
      <div class="kpi"><div class="val">Rs.${(data.invoices.filter(i=>i.status==='pending').reduce((a,i)=>a+i.gst,0)/1000).toFixed(1)}K</div><div class="lbl">Pending GST</div></div>
      <div class="kpi"><div class="val">Rs.${(data.unpaidInvoices/100000).toFixed(1)}L</div><div class="lbl">Unpaid Amount</div></div>
    </div>
    ${data.invoices.length > 0
      ? `<table><thead><tr><th>Invoice</th><th>Customer</th><th>Amount</th><th>CGST 1.5%</th><th>SGST 1.5%</th><th>Total</th><th>Status</th></tr></thead><tbody>${invoiceRows}</tbody></table>`
      : '<p class="empty">No invoice data recorded</p>'}
  </div>

  <div class="section">
    <div class="section-title">Top Products by Sales</div>
    ${data.products.length > 0
      ? `<table><thead><tr><th>SKU</th><th>Product</th><th>Category</th><th>Price</th><th>Units Sold</th><th>Revenue</th></tr></thead><tbody>${productRows}</tbody></table>`
      : '<p class="empty">No product data recorded</p>'}
  </div>

  <div class="section">
    <div class="section-title">Recent Orders</div>
    ${data.orders.length > 0
      ? `<table><thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead><tbody>${orderRows}</tbody></table>`
      : '<p class="empty">No order data recorded</p>'}
  </div>

  <div class="footer">
    <span>Ratan Jewellers | BIS Hallmarked | www.ratanjewellers.com</span>
    <span>Auto-generated before data reset</span>
    <span>${now}</span>
  </div>

  </body></html>`

  const w = window.open('', '_blank', 'width=950,height=750')
  if (w) {
    w.document.write(html)
    w.document.close()
    setTimeout(() => { w.focus(); w.print() }, 700)
  }
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { orders, products, customers, invoices, inventory, auditLogs, resetAll } = useAdminStore()
  const { requests: cjStore } = useCustomJewelleryStore()

  const [cjLocal, setCjLocal] = useState<any[]>([])
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [activeTab, setActiveTab] = useState<DashType>('Sales')

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem('ratan-custom-jewellery')
        if (raw) { const p = JSON.parse(raw); setCjLocal(p?.state?.requests ?? []) }
      } catch {}
    }
    read()
    const t = setInterval(read, 3000)
    window.addEventListener('storage', read)
    window.addEventListener('focus', read)
    return () => { clearInterval(t); window.removeEventListener('storage', read); window.removeEventListener('focus', read) }
  }, [])

  const cjRequests = cjLocal.length > 0 ? cjLocal : cjStore
  const newCJCount = cjRequests.filter((r: any) => r.status === 'new').length

  // ── Computed values ──────────────────────────────────────────────────────
  const totalRevenue    = orders.filter(o => o.status === 'delivered').reduce((a, o) => a + o.total, 0)
  const pendingOrders   = orders.filter(o => ['placed','confirmed','processing'].includes(o.status)).length
  const lowStock        = inventory.filter(i => i.stock < i.minStock).length
  const unpaidInvoices  = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((a, i) => a + i.total, 0)

  // ── Export + Reset handler ───────────────────────────────────────────────
  
  // const handleExportAndReset = async () => {
  //   setResetting(true)
  //   // 1. Generate and open PDF
  //   exportDashboardPDF({ totalRevenue, pendingOrders, lowStock, unpaidInvoices, orders, products, customers, inventory, invoices, auditLogs })
  //   // 2. Wait a moment so print dialog opens before we wipe state
  //   await new Promise(r => setTimeout(r, 900))
  //   // 3. Clear Zustand store (also clears persisted localStorage via persist middleware)
  //   resetAll()
  //   // 4. Clear custom jewellery store from localStorage
  //   localStorage.removeItem('ratan-custom-jewellery')
  //   setResetting(false)
  //   setShowResetModal(false)
  // }

  const handleExportAndReset = async () => {
  setResetting(true)

  // First export PDF
  exportDashboardPDF({
    totalRevenue,
    pendingOrders,
    lowStock,
    unpaidInvoices,
    orders,
    products,
    customers,
    inventory,
    invoices,
    auditLogs
  })

  await new Promise(resolve => setTimeout(resolve, 1000))

  // Reset everything
  resetAll()

  // Remove persisted data
  localStorage.removeItem('ratan-custom-jewellery')
  localStorage.removeItem('admin-storage') // change this to your Zustand persist key

  // Reload page so all cards become zero
  window.location.reload()
}

  // ── Tab content ───────────────────────────────────────────────────────────
  const dashData = {
    Sales: () => (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Revenue" value={`₹${(totalRevenue/100000).toFixed(1)}L`} trendVal="+12%" trend="up" icon={IndianRupee} color="bg-amber-50" accent="text-amber-600" sub="Delivered orders"/>
          <StatCard label="Total Orders" value={orders.length.toString()} trendVal="+8%" trend="up" icon={ShoppingCart} color="bg-blue-50" accent="text-blue-600"/>
          <StatCard label="Pending Orders" value={pendingOrders.toString()} trendVal={pendingOrders>5?"High":"Normal"} trend={pendingOrders>5?"down":"neutral"} icon={Clock} color="bg-orange-50" accent="text-orange-600"/>
          <StatCard label="Customers" value={customers.length.toString()} trendVal="+15%" trend="up" icon={Users} color="bg-purple-50" accent="text-purple-600"/>
          {newCJCount > 0 && (
            <Link href="/admin/custom-jewellery" className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#C9A84C' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'/></svg>
              </div>
              <div className='text-2xl font-bold text-amber-700'>{newCJCount}</div>
              <div className='text-xs font-medium text-gray-500'>Custom Requests</div>
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 text-sm">Revenue Trend (14 Days)</h3>
              <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-full">Live</span>
            </div>
            <MiniBar data={[45,62,38,71,55,82,68,91,73,88,65,79,94,87]} color="bg-amber-400"/>
            <div className="flex justify-between text-[9px] text-gray-400 mt-1"><span>14 days ago</span><span>Today</span></div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Top Products by Sales</h3>
            {products.length > 0
              ? products.sort((a,b)=>b.sales-a.sales).slice(0,5).map(p=>(
                  <Progress key={p.id} label={p.name} value={p.price*p.sales} max={products.reduce((a,p)=>Math.max(a,p.price*p.sales),1)} color="bg-amber-400"/>
                ))
              : <p className="text-xs text-gray-400 text-center py-6">No products yet</p>
            }
          </div>
        </div>
      </div>
    ),

    Orders: () => (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Orders" value={orders.length.toString()} icon={ShoppingCart} color="bg-orange-50" accent="text-orange-600"/>
          <StatCard label="Delivered" value={orders.filter(o=>o.status==='delivered').length.toString()} icon={CheckCircle2} color="bg-green-50" accent="text-green-600"/>
          <StatCard label="In Progress" value={orders.filter(o=>['placed','confirmed','processing','shipped'].includes(o.status)).length.toString()} icon={Clock} color="bg-amber-50" accent="text-amber-600"/>
          <StatCard label="Cancelled/Returned" value={orders.filter(o=>o.status==='cancelled'||o.status==='returned').length.toString()} icon={RefreshCw} color="bg-red-50" accent="text-red-500"/>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 text-sm">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs text-[#C9A84C] hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {orders.length > 0
              ? orders.slice(0,5).map(o=>(
                  <div key={o.id} className="flex items-center px-5 py-3 hover:bg-gray-50/50 gap-4">
                    <span className="font-mono text-sm font-semibold text-[#C9A84C] w-20">{o.id}</span>
                    <span className="flex-1 text-sm text-gray-700">{o.customer}</span>
                    <span className="text-sm font-semibold text-gray-900">₹{o.total.toLocaleString('en-IN')}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${o.status==='delivered'?'bg-green-50 text-green-600':o.status==='cancelled'?'bg-red-50 text-red-500':'bg-amber-50 text-amber-600'}`}>{o.status}</span>
                  </div>
                ))
              : <p className="text-xs text-gray-400 text-center py-8">No orders yet</p>
            }
          </div>
        </div>
      </div>
    ),

    Inventory: () => (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total SKUs" value={products.length.toString()} icon={Package} color="bg-green-50" accent="text-green-600"/>
          <StatCard label="Stock Value" value={`₹${(inventory.reduce((a,i)=>a+i.value,0)/10000000).toFixed(2)}Cr`} icon={IndianRupee} color="bg-emerald-50" accent="text-emerald-600"/>
          <StatCard label="Low Stock Alerts" value={lowStock.toString()} trendVal={lowStock>0?"Action Needed":"OK"} trend={lowStock>0?"down":"neutral"} icon={AlertCircle} color="bg-red-50" accent="text-red-500"/>
          <StatCard label="Out of Stock" value={inventory.filter(i=>i.stock===0).length.toString()} icon={Boxes} color="bg-orange-50" accent="text-orange-600"/>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 text-sm">Stock Levels</h3>
            <Link href="/admin/inventory" className="text-xs text-[#C9A84C] hover:underline">Manage</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {inventory.length > 0
              ? inventory.map(item=>{
                  const pct=Math.min((item.stock/item.maxStock)*100,100)
                  const color=item.stock===0?'bg-red-400':item.stock<item.minStock?'bg-amber-400':'bg-green-400'
                  return (
                    <div key={item.id} className="flex items-center px-5 py-3 hover:bg-gray-50/50 gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`}/>
                      <span className="flex-1 text-sm text-gray-700">{item.name}</span>
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full`} style={{width:`${pct}%`}}/></div>
                      <span className="text-sm font-semibold text-gray-900 w-14 text-right">{item.stock} pcs</span>
                    </div>
                  )
                })
              : <p className="text-xs text-gray-400 text-center py-8">No inventory data</p>
            }
          </div>
        </div>
      </div>
    ),

    Customer: () => (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Customers" value={customers.length.toString()} icon={Users} color="bg-purple-50" accent="text-purple-600"/>
          <StatCard label="Platinum" value={customers.filter(c=>c.tier==='platinum').length.toString()} icon={Star} color="bg-yellow-50" accent="text-yellow-600"/>
          <StatCard label="Gold" value={customers.filter(c=>c.tier==='gold').length.toString()} icon={Star} color="bg-amber-50" accent="text-amber-600"/>
          <StatCard label="Avg Spend" value={customers.length>0?`₹${((customers.reduce((a,c)=>a+c.totalSpend,0)/customers.length)/100000).toFixed(1)}L`:'—'} icon={IndianRupee} color="bg-green-50" accent="text-green-600"/>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 text-sm">Top Customers</h3>
            <Link href="/admin/crm" className="text-xs text-[#C9A84C] hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {customers.length > 0
              ? customers.sort((a,b)=>b.totalSpend-a.totalSpend).slice(0,5).map(c=>(
                  <div key={c.id} className="flex items-center px-5 py-3 hover:bg-gray-50/50 gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs flex-shrink-0">{c.name.split(' ').map((n:string)=>n[0]).join('')}</div>
                    <span className="flex-1 text-sm text-gray-700">{c.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.tier==='platinum'?'bg-purple-100 text-purple-700':c.tier==='gold'?'bg-amber-100 text-amber-700':'bg-gray-100 text-gray-600'}`}>{c.tier}</span>
                    <span className="text-sm font-semibold text-gray-900">₹{(c.totalSpend/100000).toFixed(1)}L</span>
                  </div>
                ))
              : <p className="text-xs text-gray-400 text-center py-8">No customers yet</p>
            }
          </div>
        </div>
      </div>
    ),

    GST: () => (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total GST Collected" value={`₹${(invoices.reduce((a,i)=>a+i.gst,0)/1000).toFixed(1)}K`} icon={FileText} color="bg-blue-50" accent="text-blue-600"/>
          <StatCard label="Paid Invoices GST" value={`₹${(invoices.filter(i=>i.status==='paid').reduce((a,i)=>a+i.gst,0)/1000).toFixed(1)}K`} icon={CheckCircle2} color="bg-green-50" accent="text-green-600"/>
          <StatCard label="Pending GST" value={`₹${(invoices.filter(i=>i.status==='pending').reduce((a,i)=>a+i.gst,0)/1000).toFixed(1)}K`} icon={Clock} color="bg-amber-50" accent="text-amber-600"/>
          <StatCard label="Unpaid Amount" value={`₹${(unpaidInvoices/100000).toFixed(1)}L`} icon={AlertCircle} color="bg-red-50" accent="text-red-500"/>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50"><h3 className="font-semibold text-gray-800 text-sm">Invoice GST Summary</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>{['Invoice','Customer','Amount','CGST 1.5%','SGST 1.5%','Total GST','Status'].map(h=><th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.slice(0,6).map(inv=>(
                  <tr key={inv.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-mono text-xs text-[#C9A84C]">{inv.id}</td>
                    <td className="px-5 py-3 text-gray-700">{inv.customer}</td>
                    <td className="px-5 py-3 text-gray-700">₹{inv.amount.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3 text-gray-600 text-xs">₹{(inv.gst/2).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3 text-gray-600 text-xs">₹{(inv.gst/2).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3 font-semibold text-green-700">₹{inv.gst.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${inv.status==='paid'?'bg-green-50 text-green-600':inv.status==='overdue'?'bg-red-50 text-red-600':'bg-amber-50 text-amber-600'}`}>{inv.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {invoices.length === 0 && <p className="text-xs text-gray-400 text-center py-8">No invoices yet</p>}
          </div>
        </div>
      </div>
    ),

    Revenue: () => (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Billed" value={`₹${(invoices.reduce((a,i)=>a+i.total,0)/100000).toFixed(1)}L`} icon={IndianRupee} color="bg-blue-50" accent="text-blue-600"/>
          <StatCard label="Collected" value={`₹${(invoices.filter(i=>i.status==='paid').reduce((a,i)=>a+i.total,0)/100000).toFixed(1)}L`} icon={TrendingUp} color="bg-green-50" accent="text-green-600"/>
          <StatCard label="Outstanding" value={`₹${(unpaidInvoices/100000).toFixed(1)}L`} icon={AlertCircle} color="bg-red-50" accent="text-red-500"/>
          <StatCard label="Avg Invoice" value={invoices.length>0?`₹${(invoices.reduce((a,i)=>a+i.total,0)/invoices.length/1000).toFixed(0)}K`:'—'} icon={BarChart3} color="bg-amber-50" accent="text-amber-600"/>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 text-sm mb-4">Revenue Trend (12 months)</h3>
          <MiniBar data={[52,61,74,68,83,91,78,85,94,88,102,84]} color="bg-blue-400"/>
          <div className="flex justify-between text-[9px] text-gray-400 mt-2">{['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'].map(m=><span key={m}>{m}</span>)}</div>
        </div>
      </div>
    ),

    Profit: () => (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Gross Revenue" value={`₹${(totalRevenue/100000).toFixed(1)}L`} icon={TrendingUp} color="bg-teal-50" accent="text-teal-600"/>
          <StatCard label="GST Paid Out" value={`₹${(invoices.filter(i=>i.status==='paid').reduce((a,i)=>a+i.gst,0)/1000).toFixed(0)}K`} icon={FileText} color="bg-orange-50" accent="text-orange-500"/>
          <StatCard label="Net Revenue" value={`₹${((totalRevenue-invoices.filter(i=>i.status==='paid').reduce((a,i)=>a+i.gst,0))/100000).toFixed(1)}L`} icon={IndianRupee} color="bg-green-50" accent="text-green-600"/>
          <StatCard label="Est. Net Profit" value={`₹${((totalRevenue*0.22)/100000).toFixed(1)}L`} sub="~22% margin" icon={Star} color="bg-purple-50" accent="text-purple-600"/>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 text-sm mb-4">Profit Trend</h3>
          <MiniBar data={[18,22,16,28,24,31,27,35,29,38,32,41,36,42,38,44,41,46,43,48,45,51,47,53,49,55,52,58,54,60]} color="bg-teal-400"/>
        </div>
      </div>
    ),
  }

  const ActiveDash = dashData[activeTab]

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">

      {/* ── Reset Confirmation Modal ── */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border border-gray-100">
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <RotateCcw size={22} className="text-red-500"/>
            </div>
            {/* Title */}
            <h2 className="text-lg font-bold text-gray-900 text-center mb-1">Export &amp; Reset Dashboard</h2>
            <p className="text-sm text-gray-500 text-center mb-4">This will perform two actions in order:</p>
            {/* Action list */}
            <ul className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-700">
                <Download size={14} className="text-[#C9A84C] mt-0.5 flex-shrink-0"/>
                <span><strong>Download a PDF</strong> with all current dashboard data — revenue, orders, inventory, customers, GST &amp; profit</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-700">
                <RotateCcw size={14} className="text-red-400 mt-0.5 flex-shrink-0"/>
                <span><strong>Reset all values to zero</strong> — orders, invoices, inventory, customers &amp; audit logs are cleared</span>
              </li>
            </ul>
            {/* Warning */}
            <div className="bg-red-50 rounded-xl p-3 mb-5 text-xs text-red-500 text-center">
              ⚠️ This cannot be undone. Make sure the PDF downloads before closing the print dialog.
            </div>
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                disabled={resetting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleExportAndReset}
                disabled={resetting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#0D0700] text-[#C9A84C] text-sm font-semibold hover:bg-[#1a0f00] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {resetting
                  ? <><RefreshCw size={13} className="animate-spin"/>Processing...</>
                  : <><Download size={13}/>Export PDF &amp; Reset</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Live data across all modules</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Live badge */}
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <Clock size={13} className="text-[#C9A84C]"/>
            <span>Live data</span>
          </div>
          {/* Export & Reset button */}
          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D0700] text-[#C9A84C] text-xs font-semibold hover:bg-[#1a0f00] transition-all shadow-sm hover:shadow-md"
            title="Export dashboard as PDF then reset all data to zero"
          >
            <Download size={13}/>
            <span className="hidden sm:inline">Export &amp; Reset</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {DASHBOARDS.map(d => (
          <button
            key={d}
            onClick={() => setActiveTab(d)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab===d?'bg-[#0D0700] text-[#C9A84C] shadow-md':'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* ── Active Tab Content ── */}
      <ActiveDash/>

      {/* ── Recent Activity ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
            <Activity size={14} className="text-[#C9A84C]"/>
            Recent Activity
          </h3>
          <Link href="/admin/audit-logs" className="text-xs text-[#C9A84C] hover:underline">View All</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {auditLogs.length > 0
            ? auditLogs.slice(0,5).map(a => {
                const colors: Record<string,string> = {
                  auth:'bg-blue-100 text-blue-600', order:'bg-green-100 text-green-600',
                  billing:'bg-amber-100 text-amber-600', crm:'bg-purple-100 text-purple-600',
                  settings:'bg-red-100 text-red-600', inventory:'bg-orange-100 text-orange-600',
                  product:'bg-yellow-100 text-yellow-700'
                }
                return (
                  <div key={a.id} className="flex items-center px-5 py-3 hover:bg-gray-50/50 gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors[a.type]}`}>{a.type}</span>
                    <span className="flex-1 text-sm text-gray-700">{a.action}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{a.time}</span>
                  </div>
                )
              })
            : <p className="text-xs text-gray-400 text-center py-8">No activity logs yet</p>
          }
        </div>
      </div>
    </div>
  )
}
