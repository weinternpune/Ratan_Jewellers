'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/store'
export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCartStore()
  const total = totalPrice(); const gst = total * 0.03; const grandTotal = total + gst
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeCart} className="fixed inset-0 bg-obsidian/50 backdrop-blur-sm z-50" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gold/15">
              <div className="flex items-center gap-3"><ShoppingBag size={20} className="text-gold" /><div><h2 className="font-display text-lg text-charcoal">Shopping Bag</h2><p className="text-xs text-warm-grey">{items.length} {items.length === 1 ? 'item' : 'items'}</p></div></div>
              <button onClick={closeCart} className="w-8 h-8 rounded-full hover:bg-gold/10 flex items-center justify-center transition-all"><X size={18} className="text-charcoal" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mb-4"><ShoppingBag size={32} className="text-gold/50" /></div>
                  <h3 className="font-display text-xl text-charcoal mb-2">Your bag is empty</h3>
                  <p className="text-sm text-warm-grey mb-6">Add some beautiful pieces to your collection</p>
                  <button onClick={closeCart} className="btn-gold px-6 py-2.5 rounded text-sm">Continue Shopping</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 rounded-xl border border-gold/10 hover:border-gold/25 transition-all">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-ivory flex-shrink-0">
                        {item.image ? <Image src={item.image} alt={item.name} width={80} height={80} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-champagne flex items-center justify-center"><span className="font-display text-2xl text-gold/30">✦</span></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-sm font-medium text-charcoal truncate">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5"><span className="purity-badge text-[9px]">{item.purity}</span><span className="text-xs text-warm-grey">{item.weight}g</span></div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gold/20 rounded-lg overflow-hidden">
                            <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gold/10 transition-colors"><Minus size={11} /></button>
                            <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gold/10 transition-colors"><Plus size={11} /></button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-display text-sm font-semibold text-charcoal">₹{(item.price * item.quantity).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                            <button onClick={() => removeItem(item.productId)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-gold/15 space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-warm-grey"><span>Subtotal</span><span>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></div>
                  <div className="flex justify-between text-warm-grey"><span>GST (3%)</span><span>₹{gst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></div>
                  <div className="flex justify-between font-display text-base font-semibold text-charcoal pt-2 border-t border-gold/10"><span>Total</span><span>₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></div>
                </div>
                <Link href="/checkout" onClick={closeCart} className="btn-gold w-full flex items-center justify-center gap-2 py-3.5 rounded text-sm font-medium">Proceed to Checkout<ArrowRight size={15} /></Link>
                <button onClick={closeCart} className="w-full text-center text-sm text-warm-grey hover:text-gold transition-colors py-1">Continue Shopping</button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
