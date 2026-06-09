'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, Eye, X, Send, Plus, Image as ImageIcon, Trash2, CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import { useCustomJewelleryStore, CustomJewelleryRequest } from '@/store/customJewelleryStore'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const statusConfig = {
  new:       { label: 'New',       color: 'bg-blue-50 text-blue-600',    icon: AlertCircle  },
  in_review: { label: 'In Review', color: 'bg-amber-50 text-amber-600',  icon: Clock        },
  replied:   { label: 'Replied',   color: 'bg-purple-50 text-purple-600',icon: MessageCircle},
  completed: { label: 'Completed', color: 'bg-green-50 text-green-600',  icon: CheckCircle2 },
  rejected:  { label: 'Rejected',  color: 'bg-red-50 text-red-600',      icon: X            },
}

// ── Read ALL custom jewellery requests from localStorage directly ──────────
function readRequestsFromStorage(): CustomJewelleryRequest[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('ratan-custom-jewellery')
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return parsed?.state?.requests ?? []
  } catch {
    return []
  }
}

// ── Fetch requests from backend API ──────────
async function fetchRequestsFromBackend(): Promise<CustomJewelleryRequest[]> {
  try {
    const response = await fetch('http://localhost:5000/api/custom-jewellery')
    const data = await response.json()
    if (data.success && Array.isArray(data.data)) {
      // Transform backend format to match frontend format
      return data.data.map((item: any) => ({
        id: item.id || `CJR-${Date.now()}-${Math.random()}`,
        name: item.name || '',
        email: item.email || '',
        phone: item.phone || '',
        category: item.category || '',
        metal: 'Not specified',
        budget: 'Not specified',
        description: item.message || '',
        status: item.status === 'pending' ? 'new' : (item.status === 'inprogress' ? 'in_review' : item.status),
        submittedAt: item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN') : '',
        replies: [],
        readByAdmin: false,
        readByManager: false,
      }))
    }
    return []
  } catch (error) {
    console.error('Error fetching from backend:', error)
    return []
  }
}

export default function CustomJewelleryAdminPage() {
  const store = useCustomJewelleryStore()
  const { currentUser, getEffectiveRole } = useAuthStore()
  const role = getEffectiveRole()
  const canManage = ['store_manager', 'admin', 'super_admin'].includes(role)
  const canAddImages = role === 'super_admin'

  // ── Always read from both localStorage and backend — guaranteed fresh ─────────────
  const [requests, setRequests] = useState<CustomJewelleryRequest[]>(() => readRequestsFromStorage())
  const [lastRefresh, setLastRefresh] = useState(0)

  const refresh = useCallback(async () => {
    const localData = readRequestsFromStorage()
    const backendData = await fetchRequestsFromBackend()
    
    // Merge both sources, deduplicate by ID
    const allRequests = [...localData, ...backendData]
    const uniqueRequests = Array.from(
      new Map(allRequests.map(req => [req.id, req])).values()
    ).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    
    setRequests(uniqueRequests)
    setLastRefresh(Date.now())
  }, [])

  // Poll every 1.5 seconds + on focus + on storage event
  useEffect(() => {
    setLastRefresh(Date.now()) // safe — runs after mount
    const interval = setInterval(refresh, 1500)
    const onFocus = () => refresh()
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === 'ratan-custom-jewellery') refresh()
    }
    window.addEventListener('focus', onFocus)
    window.addEventListener('storage', onStorage)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) refresh()
    })
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('storage', onStorage)
    }
  }, [refresh])

  const [selected, setSelected] = useState<CustomJewelleryRequest | null>(null)
  const [replyText, setReplyText] = useState('')
  const [tab, setTab] = useState<'requests' | 'gallery'>('requests')
  const [newImgName, setNewImgName] = useState('')
  const [newImgSrc, setNewImgSrc] = useState('')
  const imgRef = useRef<HTMLInputElement>(null)

  const handleReply = () => {
    if (!replyText.trim() || !selected) return
    store.addReply(selected.id, {
      from: currentUser?.name || 'Manager',
      role: currentUser?.role || 'store_manager',
      message: replyText,
    })
    setReplyText('')
    setTimeout(refresh, 100) // re-read after reply saved
    toast.success('Reply sent')
  }

  const handleImageUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => setNewImgSrc(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleAddImage = () => {
    if (!newImgName.trim() || !newImgSrc) { toast.error('Add name and image'); return }
    store.addGalleryImage({ name: newImgName, image: newImgSrc, addedBy: currentUser?.name || 'Super Admin' })
    setNewImgName('')
    setNewImgSrc('')
  }

  const unread = requests.filter(r => !r.readByManager && r.status === 'new').length
  const galleryImages = store.galleryImages

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Custom Jewellery</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {requests.length} request{requests.length !== 1 ? 's' : ''} · Last synced {new Date(lastRefresh).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              {unread} New Request{unread > 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={refresh}
            className="flex items-center gap-2 bg-[#0D0700] text-[#C9A84C] rounded-xl px-4 py-2 text-xs font-semibold hover:bg-[#1a0e00] transition-colors"
          >
            <RefreshCw size={12} /> Refresh Now
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(['requests', 'gallery'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all relative ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
            {t === 'requests' && unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unread}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'requests' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {requests.length === 0 ? (
            <div className="px-5 py-16 text-center text-gray-400">
              <MessageCircle size={32} className="mx-auto mb-3 text-gray-200" />
              <div className="text-sm font-medium">No custom jewellery requests yet</div>
              <div className="text-xs text-gray-300 mt-1">When customers submit requests, they appear here automatically</div>
              <button onClick={refresh} className="mt-4 text-xs text-[#C9A84C] hover:underline flex items-center gap-1 mx-auto">
                <RefreshCw size={11} /> Click to refresh
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {requests.map(req => {
                const cfg = statusConfig[req.status as keyof typeof statusConfig] || statusConfig.new
                const Icon = cfg.icon
                return (
                  <div
                    key={req.id}
                    className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors cursor-pointer ${!req.readByManager ? 'bg-blue-50/30' : ''}`}
                    onClick={() => { setSelected(req); store.markRead(req.id, 'manager'); setTimeout(refresh, 100) }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">{req.name}</span>
                        {!req.readByManager && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                        <span className="font-mono text-[10px] text-gray-400">{req.id}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate">{req.description}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{req.submittedAt} · {req.phone} · {req.email}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${cfg.color}`}>
                        <Icon size={11} />{cfg.label}
                      </span>
                      <Eye size={15} className="text-gray-400" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'gallery' && (
        <div className="space-y-4">
          {canAddImages && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="font-semibold text-gray-800 text-sm">Add Gallery Image</h3>
              <div className="flex gap-3 flex-wrap">
                <input value={newImgName} onChange={e => setNewImgName(e.target.value)}
                  placeholder="Image name e.g. Rose Gold Pendant"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] min-w-[200px]" />
                <button onClick={() => imgRef.current?.click()}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border-2 border-dashed transition-colors ${newImgSrc ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-[#C9A84C]'}`}>
                  <ImageIcon size={15} />{newImgSrc ? 'Image ready ✓' : 'Upload Image'}
                </button>
                <input ref={imgRef} type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                <button onClick={handleAddImage}
                  className="bg-[#0D0700] text-[#C9A84C] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a0e00] flex items-center gap-2">
                  <Plus size={14} />Add to Gallery
                </button>
              </div>
              {newImgSrc && <img src={newImgSrc} alt="preview" className="h-24 rounded-xl object-cover" />}
            </div>
          )}
          {galleryImages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
              No custom gallery images yet{canAddImages ? ' — add one above' : ''}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {galleryImages.map(img => (
                <div key={img.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
                  <div className="aspect-square relative">
                    <img src={img.image} alt={img.name} className="w-full h-full object-cover" />
                    {canAddImages && (
                      <button onClick={() => store.removeGalleryImage(img.id)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={11} />
                      </button>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-medium text-gray-800 truncate">{img.name}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{img.addedAt}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Request Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative ml-auto w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-bold text-gray-900">{selected.name}</h2>
                <p className="text-xs text-gray-400">{selected.id} · {selected.submittedAt}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-6 flex-1 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { l: 'Email',    v: selected.email    },
                  { l: 'Phone',    v: selected.phone    },
                  { l: 'Category', v: selected.category },
                  { l: 'Metal',    v: selected.metal    },
                  { l: 'Budget',   v: selected.budget   },
                  { l: 'Status',   v: selected.status   },
                ].map(d => (
                  <div key={d.l} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-[10px] text-gray-400 mb-1">{d.l}</div>
                    <div className="text-sm font-semibold text-gray-900 break-all">{d.v}</div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs font-semibold text-gray-500 mb-2">Request Details</div>
                <p className="text-sm text-gray-700 leading-relaxed">{selected.description}</p>
              </div>

              {canManage && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Update Status</label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(statusConfig) as (keyof typeof statusConfig)[]).map(s => (
                      <button key={s} onClick={() => { store.updateStatus(selected.id, s); setSelected({ ...selected, status: s }); setTimeout(refresh, 100) }}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${selected.status === s ? 'bg-[#0D0700] text-[#C9A84C] border-transparent' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        {statusConfig[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selected.replies && selected.replies.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Conversation</div>
                  {selected.replies.map((r, i) => (
                    <div key={i} className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-amber-800">{r.from}</span>
                        <span className="text-[10px] text-amber-600">{r.sentAt}</span>
                      </div>
                      <p className="text-sm text-gray-700">{r.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {canManage && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 block">Reply to Customer</label>
                  <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] resize-none h-24"
                    placeholder="Type your reply..." />
                  <div className="flex gap-2">
                    <a href={`https://wa.me/${selected.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${selected.name}, regarding your custom jewellery request ${selected.id}: `)}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-600">
                      WhatsApp
                    </a>
                    <button onClick={handleReply}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#0D0700] text-[#C9A84C] rounded-xl py-2.5 text-sm font-semibold hover:bg-[#1a0e00]">
                      <Send size={14} />Send Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}