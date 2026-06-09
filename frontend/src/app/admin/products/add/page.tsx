'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload, FileText, Plus, X, Image as ImageIcon,
  CheckCircle2, ArrowLeft, Sparkles, Package,
  AlertCircle, Star, TrendingUp
} from 'lucide-react'
import { useProductCatalog, StorefrontProduct } from '@/store/productCatalog'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const categories = ['Necklaces','Rings','Bangles','Earrings','Chains','Mangalsutras','Anklets','Pendants','Bracelets','Nose Pins','Pooja Items','Silver']
const metals     = ['Gold','Silver','Platinum','Rose Gold','White Gold']
const purities   = ['24KT','22KT','20KT','18KT','14KT','9KT','92.5','Sterling Silver','950 Platinum']

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const empty = {
  name: '', sku: '', category: 'Necklaces', metal: 'Gold', purity: '22KT',
  netWeight: '', currentPrice: '', goldRate: '6520', makingCharges: '',
  stoneCharges: '0', description: '', isNewArrival: true, isFeatured: false, isTrending: false,
  inStock: true,
}

type Tab = 'manual' | 'pdf'

export default function AddProductPage() {
  const router = useRouter()
  const { addProduct } = useProductCatalog()
  const { currentUser } = useAuthStore()

  const [tab, setTab]       = useState<Tab>('manual')
  const [form, setForm]     = useState(empty)
  const [images, setImages] = useState<string[]>([])   // base64
  const [saving, setSaving] = useState(false)
  const [pdfParsing, setPdfParsing] = useState(false)
  const [pdfData, setPdfData] = useState<Partial<typeof empty> | null>(null)

  const imgRef = useRef<HTMLInputElement>(null)
  const pdfRef = useRef<HTMLInputElement>(null)

  // ── Image upload ─────────────────────────────────────────────────────────
  const handleImages = (files: FileList | null) => {
    if (!files) return
    Array.from(files).slice(0, 6 - images.length).forEach(file => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = e => {
        const b64 = e.target?.result as string
        setImages(prev => [...prev, b64])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (idx: number) =>
    setImages(prev => prev.filter((_, i) => i !== idx))

  // ── PDF parsing via Claude API ───────────────────────────────────────────
  const handlePDF = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file')
      return
    }
    setPdfParsing(true)
    try {
      // Convert PDF to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => resolve((e.target?.result as string).split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const prompt = `You are a jewellery product data extractor. Extract product details from this PDF document and return ONLY a valid JSON object with these exact keys (use empty string "" if not found):
{
  "name": "full product name",
  "sku": "SKU or item code",
  "category": "one of: Necklaces, Rings, Bangles, Earrings, Chains, Mangalsutras, Anklets, Pendants, Bracelets, Nose Pins, Pooja Items, Silver",
  "metal": "one of: Gold, Silver, Platinum, Rose Gold, White Gold",
  "purity": "one of: 24KT, 22KT, 20KT, 18KT, 14KT, 9KT, 92.5, Sterling Silver, 950 Platinum",
  "netWeight": "numeric value only in grams e.g. 15.25",
  "currentPrice": "numeric value only in INR e.g. 145000",
  "goldRate": "numeric gold rate per gram if mentioned e.g. 6520",
  "makingCharges": "numeric making charge value if mentioned",
  "stoneCharges": "numeric stone charge value if mentioned, else 0",
  "description": "detailed product description from the document"
}
Return ONLY the JSON, no markdown, no explanation.`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'document',
                source: { type: 'base64', media_type: 'application/pdf', data: base64 }
              },
              { type: 'text', text: prompt }
            ]
          }]
        })
      })

      const data = await response.json()
      const text = data.content?.find((c: any) => c.type === 'text')?.text || '{}'

      // Parse the JSON response
      let parsed: Partial<typeof empty> = {}
      try {
        const clean = text.replace(/```json|```/g, '').trim()
        parsed = JSON.parse(clean)
      } catch {
        // Try to extract JSON from within the text
        const match = text.match(/\{[\s\S]*\}/)
        if (match) parsed = JSON.parse(match[0])
      }

      // Remove empty strings so they don't overwrite form defaults
      const cleaned = Object.fromEntries(
        Object.entries(parsed).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      ) as Partial<typeof empty>

      setPdfData(cleaned)
      setForm(prev => ({ ...prev, ...cleaned }))

      const filledCount = Object.values(cleaned).filter(v => v).length
      if (filledCount >= 3) {
        toast.success(`PDF parsed — ${filledCount} fields extracted automatically`)
      } else {
        toast('PDF scanned — some fields could not be detected, please fill manually', { icon: '⚠️' })
      }
    } catch (err) {
      console.error('PDF parse error:', err)
      toast.error('Could not parse PDF. Please fill in the details manually.')
    } finally {
      setPdfParsing(false)
    }
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Product name is required'); return }
    if (!form.currentPrice) { toast.error('Price is required'); return }
    if (!form.netWeight)    { toast.error('Weight is required'); return }
    if (images.length === 0) { toast.error('Please upload at least one image'); return }

    setSaving(true)
    await new Promise(r => setTimeout(r, 500))

    const product: Omit<StorefrontProduct, 'addedAt'> = {
      id:            `rj-${Date.now()}`,
      name:          form.name.trim(),
      slug:          slugify(form.name),
      sku:           form.sku || `RJ${String(Date.now()).slice(-5)}`,
      images,
      metal:         form.metal,
      purity:        form.purity,
      netWeight:     parseFloat(form.netWeight) || 0,
      currentPrice:  parseFloat(form.currentPrice) || 0,
      goldRate:      parseFloat(form.goldRate) || 6520,
      makingCharges: parseFloat(form.makingCharges) || 0,
      stoneCharges:  parseFloat(form.stoneCharges) || 0,
      avgRating:     0,
      reviewCount:   0,
      inStock:       form.inStock,
      isNewArrival:  form.isNewArrival,
      isFeatured:    form.isFeatured,
      isTrending:    form.isTrending,
      description:   form.description,
      category:      { name: form.category },
      keywords:      [
        form.name,
        form.category,
        form.metal,
        form.purity,
        form.sku,
        form.description,
      ].filter(Boolean).join(' ').toLowerCase(),
      addedBy:       currentUser?.name || 'Super Admin',
      source:        tab === 'pdf' ? 'pdf' : 'manual',
    }

    addProduct(product)
    toast.success(`"${product.name}" added to catalogue`)
    setSaving(false)
    router.push('/admin/products')
  }

  const set = (k: keyof typeof empty, v: any) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Add Product to Catalogue</h1>
          <p className="text-sm text-gray-500 mt-0.5">Products appear live on the website immediately</p>
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex gap-3">
        {([['manual', 'Manual Entry', Package], ['pdf', 'Upload PDF', FileText]] as const).map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${tab === t ? 'border-[#C9A84C] bg-[#C9A84C]/5 text-[#0D0700]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
            <Icon size={16} />{label}
          </button>
        ))}
      </div>

      {/* PDF Upload Panel */}
      {tab === 'pdf' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2"><FileText size={16} className="text-amber-500" />Upload Product PDF</h2>
          <p className="text-xs text-gray-500">Upload a product specification sheet, catalogue PDF, or invoice. We'll extract the product details automatically.</p>

          <div
            onClick={() => pdfRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#C9A84C] hover:bg-amber-50/30 transition-all"
          >
            {pdfParsing ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-500">Parsing PDF…</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                  <Upload size={20} className="text-amber-500" />
                </div>
                <div className="text-sm font-medium text-gray-700">Click to upload PDF</div>
                <div className="text-xs text-gray-400">Product spec sheets, invoices, catalogues</div>
              </div>
            )}
            <input ref={pdfRef} type="file" accept=".pdf" className="hidden"
              onChange={e => e.target.files?.[0] && handlePDF(e.target.files[0])} />
          </div>

          {pdfData && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={14} className="text-green-600" />
                <span className="text-xs font-semibold text-green-700">PDF parsed — fields pre-filled below. Review and complete any missing info.</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(pdfData).filter(([, v]) => v).map(([k, v]) => (
                  <span key={k} className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full capitalize">{k}: {String(v).slice(0, 20)}</span>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-amber-600 flex items-center gap-1.5"><AlertCircle size={12} />After uploading, fill in any missing fields below and add product images.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-900 text-sm">Product Details</h2>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Product Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]"
                placeholder="e.g. Kundan Bridal Necklace Set" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">SKU</label>
                <input value={form.sku} onChange={e => set('sku', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] font-mono"
                  placeholder="RJ00001" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Category</label>
                <select value={form.category} onChange={e => set('category', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] cursor-pointer">
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Metal</label>
                <select value={form.metal} onChange={e => set('metal', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] cursor-pointer">
                  {metals.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Purity</label>
                <select value={form.purity} onChange={e => set('purity', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] cursor-pointer">
                  {purities.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Net Weight (g) *</label>
                <input type="number" step="0.001" value={form.netWeight} onChange={e => set('netWeight', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]"
                  placeholder="e.g. 15.250" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Price (₹) *</label>
                <input type="number" value={form.currentPrice} onChange={e => set('currentPrice', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]"
                  placeholder="e.g. 145000" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Gold Rate (₹/g)</label>
                <input type="number" value={form.goldRate} onChange={e => set('goldRate', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Making Charges</label>
                <input type="number" value={form.makingCharges} onChange={e => set('makingCharges', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]"
                  placeholder="0" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Stone Charges</label>
                <input type="number" value={form.stoneCharges} onChange={e => set('stoneCharges', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]"
                  placeholder="0" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] resize-none h-24"
                placeholder="Detailed product description for the product page..." />
            </div>

            {/* Flags */}
            <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
              {[
                { k: 'inStock', label: 'In Stock', icon: Package, color: 'text-green-600' },
                { k: 'isNewArrival', label: 'Show in New Arrivals', icon: Sparkles, color: 'text-blue-500' },
                { k: 'isFeatured', label: 'Show in Featured Products', icon: Star, color: 'text-amber-500' },
                { k: 'isTrending', label: 'Show in Trending Products', icon: TrendingUp, color: 'text-purple-500' },
              ].map(({ k, label, icon: Icon, color }) => (
                <label key={k} className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-2 text-sm text-gray-700">
                    <Icon size={14} className={color} />{label}
                  </span>
                  <button
                    onClick={() => set(k as keyof typeof empty, !(form as any)[k])}
                    className={`relative w-10 h-5 rounded-full transition-colors ${(form as any)[k] ? 'bg-[#C9A84C]' : 'bg-gray-200'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${(form as any)[k] ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <ImageIcon size={15} className="text-blue-500" />Product Images *
              <span className="text-xs text-gray-400 font-normal ml-auto">{images.length}/6</span>
            </h2>

            {/* Drop zone */}
            <div
              onClick={() => imgRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleImages(e.dataTransfer.files) }}
              className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-[#C9A84C] hover:bg-amber-50/20 transition-all"
            >
              <ImageIcon size={24} className="text-gray-300 mx-auto mb-2" />
              <div className="text-xs font-medium text-gray-500">Click or drag & drop images</div>
              <div className="text-[10px] text-gray-400 mt-1">JPG, PNG, WebP — up to 6 images</div>
              <input ref={imgRef} type="file" accept="image/*" multiple className="hidden"
                onChange={e => handleImages(e.target.files)} />
            </div>

            {/* Preview grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group">
                    <img src={src} alt={`img-${i}`} className="w-full h-full object-cover" />
                    {i === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5">Main</div>
                    )}
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {images.length < 6 && (
                  <button onClick={() => imgRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:border-[#C9A84C] hover:text-amber-400 transition-all">
                    <Plus size={20} />
                  </button>
                )}
              </div>
            )}

            <p className="text-[10px] text-gray-400">First image is the main thumbnail. Drag to reorder.</p>
          </div>

          {/* Preview card */}
          {images.length > 0 && form.name && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Live Preview</div>
              <div className="rounded-2xl border border-gray-100 overflow-hidden">
                <div className="aspect-square bg-gray-50 relative overflow-hidden">
                  <img src={images[0]} alt="preview" className="w-full h-full object-cover" />
                  {form.isTrending && (
                    <span className="absolute top-2 left-2 bg-[#1a1a1a] text-[#C9A84C] text-[9px] px-2 py-0.5 rounded font-medium uppercase">Trending</span>
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <div className="text-xs font-semibold text-gray-900 line-clamp-2">{form.name}</div>
                  <div className="text-[10px] text-gray-400">{form.purity} {form.metal}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">
                      {form.currentPrice ? `₹${Number(form.currentPrice).toLocaleString('en-IN')}` : '₹—'}
                    </span>
                    <span className="text-[10px] text-gray-400">{form.netWeight || '—'} gm</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save */}
      <div className="flex gap-3 pb-6">
        <button onClick={() => router.back()} className="flex-1 border border-gray-200 rounded-xl py-3 text-sm text-gray-600 hover:bg-gray-50 font-medium">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-[#0D0700] text-[#C9A84C] rounded-xl py-3 text-sm font-bold hover:bg-[#1a0e00] disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? <span className="w-4 h-4 border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin" /> : <Sparkles size={15} />}
          {saving ? 'Publishing…' : 'Publish Product'}
        </button>
      </div>
    </div>
  )
}
