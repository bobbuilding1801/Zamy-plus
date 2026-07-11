'use client'
import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, X, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useShop } from '@/lib/store'

function linkify(text) {
  return text.split(/(\/product\/\d+)/g).map((part,i) => {
    if (part.startsWith('/product/')) return <Link key={i} href={part} className="text-primary font-semibold hover:underline">{part}</Link>
    return <span key={i}>{part}</span>
  })
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState([
    { role:'assistant', content:'Hi! I’m ZAMY Assistant 👋 I can help you find products, compare specs, or check orders. What are you looking for today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const boxRef = useRef(null)
  const { recent, cart, wishlist } = useShop()

  useEffect(() => { if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight }, [msgs, open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const next = [...msgs, { role:'user', content: text }]
    setMsgs(next); setLoading(true)
    try {
      const r = await fetch('/api/ai/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ messages: next, productContext: { recent, cartCount: cart.length, wishlistCount: wishlist.length } })})
      const d = await r.json()
      setMsgs(m => [...m, { role:'assistant', content: d.reply || 'Sorry, I could not respond right now.' }])
    } catch { setMsgs(m => [...m, { role:'assistant', content:'Something went wrong. Please try again.' }]) }
    finally { setLoading(false) }
  }

  const quick = ['Suggest a gaming laptop','Best deal on smartphones','Track my order','Return policy']

  return (
    <>
      <button onClick={() => setOpen(v => !v)} className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-premium hover:scale-105 transition grid place-items-center" aria-label="Open chat">
        {open ? <X /> : <MessageCircle />}
      </button>
      {open && (
        <div className="fixed bottom-24 right-5 z-40 w-[92vw] sm:w-[380px] h-[540px] max-h-[80vh] rounded-2xl border shadow-premium bg-card flex flex-col overflow-hidden">
          <div className="p-4 bg-black text-white flex items-center gap-2">
            <Sparkles className="text-primary" size={18} />
            <div className="flex-1">
              <div className="font-bold text-sm">ZAMY Assistant</div>
              <div className="text-[11px] text-white/70">AI powered · online</div>
            </div>
            <button onClick={() => setOpen(false)} className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/10"><X size={16} /></button>
          </div>
          <div ref={boxRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-secondary/30">
            {msgs.map((m,i) => (
              <div key={i} className={m.role==='user' ? 'flex justify-end' : 'flex justify-start'}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${m.role==='user' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-card border rounded-bl-sm'}`}>
                  {linkify(m.content)}
                </div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className="px-3 py-2 rounded-2xl bg-card border text-sm"><span className="inline-flex gap-1"><span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{animationDelay:'0ms'}} /><span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{animationDelay:'150ms'}} /><span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{animationDelay:'300ms'}} /></span></div></div>}
          </div>
          <div className="px-3 pt-2 flex gap-2 overflow-x-auto no-scrollbar">
            {quick.map(q => <button key={q} onClick={() => { setInput(q); setTimeout(send, 10) }} className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full border hover:bg-secondary">{q}</button>)}
          </div>
          <form onSubmit={e => { e.preventDefault(); send() }} className="p-3 border-t flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask anything about ZAMY..." className="flex-1 h-10 rounded-full border px-4 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
            <button type="submit" className="h-10 w-10 rounded-full bg-primary text-primary-foreground grid place-items-center disabled:opacity-50" disabled={loading || !input.trim()} aria-label="Send"><Send size={16} /></button>
          </form>
        </div>
      )}
    </>
  )
}
