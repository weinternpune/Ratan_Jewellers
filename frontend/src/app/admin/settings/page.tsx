'use client'
import { useState } from 'react'
import { Settings, Bell, Shield, ChevronRight, Save, RefreshCw, CreditCard, Truck } from 'lucide-react'
import { useAdminStore } from '@/store/adminStore'
import toast from 'react-hot-toast'

const settingGroups = [
  {id:'general',label:'General',icon:Settings},{id:'gold',label:'Gold Rate',icon:RefreshCw},
  {id:'payment',label:'Payment',icon:CreditCard},{id:'shipping',label:'Shipping',icon:Truck},
  {id:'notifications',label:'Notifications',icon:Bell},{id:'security',label:'Security & RBAC',icon:Shield},
]

function Toggle({ checked, onChange }: { checked:boolean; onChange:()=>void }) {
  return (
    <button onClick={onChange} className={`relative w-10 h-5 rounded-full transition-colors ${checked?'bg-[#C9A84C]':'bg-gray-200'}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${checked?'left-5':'left-0.5'}`}/>
    </button>
  )
}

export default function SettingsPage() {
  const { goldRates, updateGoldRates } = useAdminStore()
  const [activeGroup, setActiveGroup] = useState('general')
  const [localRates, setLocalRates] = useState(goldRates)
  const [storeInfo, setStoreInfo] = useState({ name:'Ratan Jewellers', tagline:'Purity You Can Trust Since 1975', email:'info@ratanjewellers.com', phone:'+91 98765 43210', address:'123 Gold Market, Bhubaneswar, Odisha 751001', gstin:'21AAAAA0000A1Z5' })
  const [toggles, setToggles] = useState({ autoGoldRate:true, emailNotif:true, smsNotif:false, whatsappNotif:true, maintenanceMode:false, guestCheckout:true, twoFactor:false, sessionTimeout:true })
  const toggle = (key: keyof typeof toggles) => setToggles(p=>({...p,[key]:!p[key]}))

  const saveGeneral = () => { toast.success('Store settings saved'); }
  const saveGoldRates = () => { updateGoldRates(localRates) }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6"><h1 className="text-xl font-bold text-gray-900">Settings</h1><p className="text-sm text-gray-500 mt-0.5">System configuration & preferences</p></div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {settingGroups.map(g=>{
              const Icon=g.icon
              return <button key={g.id} onClick={()=>setActiveGroup(g.id)} className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b border-gray-50 last:border-0 ${activeGroup===g.id?'bg-[#0D0700] text-[#C9A84C]':'text-gray-600 hover:bg-gray-50'}`}><Icon size={15}/><span className="font-medium">{g.label}</span>{activeGroup!==g.id&&<ChevronRight size={12} className="ml-auto text-gray-300"/>}</button>
            })}
          </div>
        </div>

        <div className="flex-1 space-y-4">
          {activeGroup==='general' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-900">General Settings</h2>
              {(Object.entries(storeInfo) as [keyof typeof storeInfo, string][]).map(([k,v])=>(
                <div key={k}><label className="text-xs font-semibold text-gray-600 mb-1.5 block capitalize">{k.replace(/([A-Z])/g,' $1')}</label>
                  <input value={v} onChange={e=>setStoreInfo(p=>({...p,[k]:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]"/>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100"><span className="text-sm text-gray-500">Maintenance Mode</span><Toggle checked={toggles.maintenanceMode} onChange={()=>toggle('maintenanceMode')}/></div>
              <button onClick={saveGeneral} className="flex items-center gap-2 bg-[#0D0700] text-[#C9A84C] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a0e00]"><Save size={14}/>Save Changes</button>
            </div>
          )}

          {activeGroup==='gold' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-900">Gold Rate Settings</h2>
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div><div className="text-sm font-semibold text-amber-800">Auto-update Gold Rate</div><div className="text-xs text-amber-600 mt-0.5">Fetches live rates from MCX every 5 minutes</div></div>
                <Toggle checked={toggles.autoGoldRate} onChange={()=>toggle('autoGoldRate')}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {(Object.entries(localRates) as [keyof typeof localRates, string][]).map(([purity,rate])=>(
                  <div key={purity}><label className="text-xs font-semibold text-gray-600 mb-1.5 block">{purity} Gold Rate (₹/g)</label>
                    <input value={rate} onChange={e=>setLocalRates(p=>({...p,[purity]:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] font-mono"/>
                  </div>
                ))}
              </div>
              <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Making Charge (%)</label><input defaultValue="12" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]"/></div>
              <button onClick={saveGoldRates} className="flex items-center gap-2 bg-[#0D0700] text-[#C9A84C] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a0e00]"><Save size={14}/>Update Rates</button>
            </div>
          )}

          {activeGroup==='notifications' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="font-bold text-gray-900">Notification Settings</h2>
              {[{k:'emailNotif' as const,l:'Email Notifications',d:'Order updates, invoices via email'},{k:'smsNotif' as const,l:'SMS Notifications',d:'OTP and order updates via SMS'},{k:'whatsappNotif' as const,l:'WhatsApp Notifications',d:'Order tracking and offers via WhatsApp'}].map(n=>(
                <div key={n.k} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div><div className="text-sm font-medium text-gray-800">{n.l}</div><div className="text-xs text-gray-400">{n.d}</div></div>
                  <Toggle checked={toggles[n.k]} onChange={()=>toggle(n.k)}/>
                </div>
              ))}
              <button onClick={()=>toast.success('Notification settings saved')} className="flex items-center gap-2 bg-[#0D0700] text-[#C9A84C] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a0e00]"><Save size={14}/>Save</button>
            </div>
          )}

          {activeGroup==='security' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="font-bold text-gray-900">Security & Access Control</h2>
              {[{k:'twoFactor' as const,l:'Two-Factor Authentication',d:'Require 2FA for admin logins'},{k:'sessionTimeout' as const,l:'Session Timeout',d:'Auto-logout after 30 min inactivity'}].map(s=>(
                <div key={s.k} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div><div className="text-sm font-medium text-gray-800">{s.l}</div><div className="text-xs text-gray-400">{s.d}</div></div>
                  <Toggle checked={toggles[s.k]} onChange={()=>toggle(s.k)}/>
                </div>
              ))}
              <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Session Timeout (minutes)</label><input defaultValue="30" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]"/></div>
              <button onClick={()=>toast.success('Security settings saved')} className="flex items-center gap-2 bg-[#0D0700] text-[#C9A84C] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a0e00]"><Save size={14}/>Save</button>
            </div>
          )}

          {activeGroup==='payment' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-900">Payment Settings</h2>
              {[{l:'Razorpay Key ID',v:'rzp_live_xxxxxxxxxxxxx',t:'password'},{l:'Razorpay Secret',v:'••••••••••••••••',t:'password'},{l:'UPI ID',v:'ratanjewellers@hdfcbank',t:'text'},{l:'IFSC Code',v:'HDFC0001234',t:'text'}].map(f=>(
                <div key={f.l}><label className="text-xs font-semibold text-gray-600 mb-1.5 block">{f.l}</label><input defaultValue={f.v} type={f.t} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] font-mono"/></div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100"><span className="text-sm text-gray-500">Enable Guest Checkout</span><Toggle checked={toggles.guestCheckout} onChange={()=>toggle('guestCheckout')}/></div>
              <button onClick={()=>toast.success('Payment config saved')} className="flex items-center gap-2 bg-[#0D0700] text-[#C9A84C] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a0e00]"><Save size={14}/>Save Payment Config</button>
            </div>
          )}

          {activeGroup==='shipping' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-900">Shipping Settings</h2>
              {[{l:'Free Shipping Above (₹)',v:'50000'},{l:'Standard Delivery (days)',v:'5'},{l:'Express Delivery (days)',v:'2'},{l:'Express Delivery Charge (₹)',v:'500'}].map(f=>(
                <div key={f.l}><label className="text-xs font-semibold text-gray-600 mb-1.5 block">{f.l}</label><input defaultValue={f.v} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]"/></div>
              ))}
              <button onClick={()=>toast.success('Shipping settings saved')} className="flex items-center gap-2 bg-[#0D0700] text-[#C9A84C] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a0e00]"><Save size={14}/>Save</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
