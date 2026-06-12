'use client'
import { useState } from 'react'
import { Search, ScrollText, Shield, ShoppingCart, Package, Receipt, Settings, User, Download, Trash2 } from 'lucide-react'
import { useAdminStore, LogType } from '@/store/adminStore'
import toast from 'react-hot-toast'

const logTypeConfig: Record<LogType,{label:string;color:string;icon:any}> = {
  auth:{label:'Auth',color:'bg-blue-50 text-blue-600',icon:Shield},
  order:{label:'Order',color:'bg-green-50 text-green-600',icon:ShoppingCart},
  product:{label:'Product',color:'bg-amber-50 text-amber-600',icon:Package},
  billing:{label:'Billing',color:'bg-purple-50 text-purple-600',icon:Receipt},
  settings:{label:'Settings',color:'bg-red-50 text-red-600',icon:Settings},
  crm:{label:'CRM',color:'bg-pink-50 text-pink-600',icon:User},
  inventory:{label:'Inventory',color:'bg-orange-50 text-orange-600',icon:Package},
}

export default function AuditLogsPage() {
  const { auditLogs } = useAdminStore()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<LogType|'all'>('all')
  const [expanded, setExpanded] = useState<number|null>(null)

  const filtered = auditLogs.filter(l =>
    (typeFilter==='all'||l.type===typeFilter) &&
    (l.action.toLowerCase().includes(search.toLowerCase())||l.user.toLowerCase().includes(search.toLowerCase())||l.details.toLowerCase().includes(search.toLowerCase()))
  )

  const exportLogs = () => {
    const csv = ['ID,Type,Action,User,Role,IP,Time,Details',...filtered.map(l=>`${l.id},${l.type},"${l.action}","${l.user}","${l.role}","${l.ip}","${l.time}","${l.details}"`)].join('\n')
    const blob = new Blob([csv], {type:'text/csv'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `audit-logs-${Date.now()}.csv`; a.click()
    URL.revokeObjectURL(url)
    toast.success('Audit logs exported as CSV')
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-gray-900">Audit Logs</h1><p className="text-sm text-gray-500 mt-0.5">Complete system activity trail for compliance & security</p></div>
        <button onClick={exportLogs} className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"><Download size={14}/>Export CSV</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[{l:'Total Events',v:auditLogs.length,c:'text-gray-900'},{l:'Today',v:auditLogs.filter(l=>l.time.includes('04 Jun')||l.time.includes('just now')).length,c:'text-blue-600'},{l:'Auth Events',v:auditLogs.filter(l=>l.type==='auth').length,c:'text-red-600'},{l:'Setting Changes',v:auditLogs.filter(l=>l.type==='settings').length,c:'text-amber-600'}].map(s=>(
          <div key={s.l} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><div className={`text-2xl font-bold ${s.c}`}>{s.v}</div><div className="text-xs text-gray-500 mt-0.5">{s.l}</div></div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5"><Search size={14} className="text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search logs..." className="flex-1 text-sm outline-none placeholder-gray-400 text-gray-700"/></div>
        <div className="flex flex-wrap gap-2">
          <button onClick={()=>setTypeFilter('all')} className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${typeFilter==='all'?'bg-[#0D0700] text-[#C9A84C]':'bg-white border border-gray-200 text-gray-600'}`}>All</button>
          {(Object.keys(logTypeConfig) as LogType[]).map(t=>(
            <button key={t} onClick={()=>setTypeFilter(t)} className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${typeFilter===t?'bg-[#0D0700] text-[#C9A84C]':'bg-white border border-gray-200 text-gray-600'}`}>{logTypeConfig[t].label}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50">
          {filtered.length===0 ? (
            <div className="px-5 py-12 text-center text-gray-400 text-sm">No logs found</div>
          ) : filtered.map(log=>{
            const cfg=logTypeConfig[log.type]; const Icon=cfg.icon; const isExp=expanded===log.id
            return (
              <div key={log.id} className="hover:bg-gray-50/40 transition-colors">
                <button onClick={()=>setExpanded(isExp?null:log.id)} className="w-full flex items-center gap-4 px-5 py-4 text-left">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}><Icon size={14}/></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap"><span className="text-sm font-semibold text-gray-900">{log.action}</span><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span></div>
                    <div className="text-xs text-gray-400 mt-0.5"><span className="font-medium text-gray-500">{log.user}</span><span className="mx-1">·</span><span>{log.role}</span><span className="mx-1">·</span><span className="font-mono">{log.ip}</span></div>
                  </div>
                  <div className="text-xs text-gray-400 flex-shrink-0 text-right">{log.time}</div>
                </button>
                {isExp && <div className="px-5 pb-4 ml-12"><div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 font-mono border border-gray-100">{log.details}</div></div>}
              </div>
            )
          })}
        </div>
        <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">Showing {filtered.length} of {auditLogs.length} log entries</div>
      </div>
    </div>
  )
}
