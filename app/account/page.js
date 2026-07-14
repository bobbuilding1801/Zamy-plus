'use client'
import SiteChrome from '@/components/site/SiteChrome'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useShop, formatINR } from '@/lib/store'
import { useCustomer } from '@/lib/customer'
import Link from 'next/link'
import { LayoutDashboard, ShoppingBag, FileText, Heart, MapPin, CreditCard, RotateCcw, Wallet, Bell, LifeBuoy, Settings, Download, Package, TruckIcon, LogOut, LogIn, Send, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const TABS = [
  { k:'dashboard', t:'Dashboard', i:LayoutDashboard },
  { k:'orders', t:'Orders', i:ShoppingBag },
  { k:'invoices', t:'Invoices', i:FileText },
  { k:'wishlist', t:'Wishlist', i:Heart },
  { k:'addresses', t:'Saved Addresses', i:MapPin },
  { k:'payments', t:'Payment Methods', i:CreditCard },
  { k:'returns', t:'Returns', i:RotateCcw },
  { k:'refunds', t:'Refunds', i:Wallet },
  { k:'notifications', t:'Notifications', i:Bell },
  { k:'tickets', t:'Support Tickets', i:LifeBuoy },
  { k:'settings', t:'Account Settings', i:Settings },
]

function Inner() {
  const sp = useSearchParams()
  const tab = sp.get('tab') || 'dashboard'
  const { user, signOut, setModalOpen } = useCustomer()
  const { wishlist, notif, markNotifRead, orders: localOrders } = useShop()
  const [dbOrders, setDbOrders] = useState([])
  const [profile, setProfile] = useState({ name: '', mobile: '' })
  const [returns, setReturns] = useState([])
  const [tickets, setTickets] = useState([])

  const loadReturns = () => user && fetch('/api/customer/returns', { headers: { Authorization: `Bearer ${user.token}` } }).then(r=>r.json()).then(d => setReturns(d.items || []))
  const loadTickets = () => user && fetch('/api/customer/tickets', { headers: { Authorization: `Bearer ${user.token}` } }).then(r=>r.json()).then(d => setTickets(d.items || []))

  useEffect(() => {
    if (!user) return
    fetch('/api/customer/orders', { headers: { Authorization: `Bearer ${user.token}` } }).then(r=>r.json()).then(d => setDbOrders(d.items || []))
    fetch('/api/customer/me', { headers: { Authorization: `Bearer ${user.token}` } }).then(r=>r.json()).then(d => setProfile({ name: d.profile?.name || '', mobile: d.profile?.mobile || '' }))
    loadReturns()
    loadTickets()
  }, [user])

  const allOrders = user ? dbOrders : localOrders
  const totalSpend = allOrders.reduce((s,o) => s + (o.total || 0), 0)

  if (!user) {
    return (
      <div className="container px-4 md:px-6 py-16 max-w-lg mx-auto text-center">
        <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground grid place-items-center font-black text-3xl mx-auto">Z</div>
        <h1 className="text-3xl font-black mt-4">Sign in to your ZAMY account</h1>
        <p className="text-muted-foreground mt-2">Track your orders, save wishlists, and get member-only deals.</p>
        <Button onClick={() => setModalOpen(true)} className="mt-6 rounded-full h-12 px-8 font-bold"><LogIn size={16} className="mr-2" /> Sign in / Sign up</Button>
        <Link href="/" className="mt-4 block text-sm text-muted-foreground hover:text-primary">← Continue as guest</Link>
      </div>
    )
  }

  const saveProfile = async () => {
    const r = await fetch('/api/customer/update', { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${user.token}`}, body: JSON.stringify(profile) })
    const d = await r.json()
    if (d.ok) toast.success('Profile updated')
    else toast.error('Update failed')
  }

  const TabContent = () => {
    if (tab === 'dashboard') return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {l:'Total Orders', v:allOrders.length, i:Package},
          {l:'Wishlist', v:wishlist.length, i:Heart},
          {l:'Lifetime Spend', v:formatINR(totalSpend), i:Wallet},
          {l:'Unread Alerts', v:notif.filter(n=>n.unread).length, i:Bell},
        ].map(({l,v,i:I}) => (
          <div key={l} className="rounded-2xl border p-5 bg-card">
            <I className="text-primary" />
            <div className="text-3xl font-black mt-2">{v}</div>
            <div className="text-xs text-muted-foreground">{l}</div>
          </div>
        ))}
        <div className="col-span-2 md:col-span-4 rounded-2xl border p-5">
          <div className="flex items-center justify-between mb-3"><h3 className="font-bold">Recent Orders</h3><Link href="/account?tab=orders" className="text-primary text-sm font-semibold">View all</Link></div>
          {allOrders.length === 0 ? <p className="text-sm text-muted-foreground">No orders yet. Time to shop!</p> : (
            <div className="space-y-2">{allOrders.slice(0,3).map(o => (
              <div key={o.id} className="flex justify-between text-sm border-b last:border-0 pb-2 items-center">
                <div><b>#{o.id}</b> · {o.items?.length || 0} items · <span className="capitalize">{o.status || 'confirmed'}</span></div>
                <div className="flex items-center gap-3"><span className="font-bold">{formatINR(o.total)}</span><Link href={`/track/${o.id}`} className="text-xs text-primary font-semibold hover:underline">Track</Link></div>
              </div>
            ))}</div>
          )}
        </div>
      </div>
    )
    if (tab === 'orders') return (
      <div className="space-y-3">
        <h2 className="text-xl font-bold">My Orders</h2>
        {allOrders.length === 0 ? <p className="text-muted-foreground">You haven't placed any orders yet.</p> :
          allOrders.map(o => (
            <div key={o.id} className="rounded-2xl border p-5">
              <div className="flex flex-wrap justify-between gap-3">
                <div><div className="text-xs text-muted-foreground">Order</div><div className="font-black">#{o.id}</div></div>
                <div><div className="text-xs text-muted-foreground">Total</div><div className="font-bold">{formatINR(o.total)}</div></div>
                <div><div className="text-xs text-muted-foreground">Payment</div><div className="font-bold uppercase">{o.payment || 'upi'}</div></div>
                <div><div className="text-xs text-muted-foreground">Status</div><div className="font-bold text-green-600 capitalize">{o.status || 'confirmed'}</div></div>
                <div className="flex gap-2">
                  <Link href={`/track/${o.id}`}><Button variant="outline" size="sm"><TruckIcon size={14} className="mr-1" /> Track</Button></Link>
                  <Link href={`/invoice/${o.id}`}><Button size="sm"><Download size={14} className="mr-1" /> Invoice</Button></Link>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {o.items?.slice(0,4).map((i, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm border rounded-lg p-2">
                    {i.product?.images?.[0] && <img src={i.product.images[0]} className="h-10 w-10 rounded object-cover" alt="" />}
                    <span className="line-clamp-1 max-w-[180px]">{i.product?.name}</span>
                    <span className="text-xs text-muted-foreground">x{i.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        }
      </div>
    )
    if (tab === 'wishlist') return <Placeholder t="Wishlist" d={<Link className="text-primary underline" href="/wishlist">Open wishlist →</Link>} />
    if (tab === 'addresses') return (
      <div>
        <h2 className="text-xl font-bold mb-3">Saved Addresses</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border p-5"><div className="font-bold">Home</div><p className="text-sm text-muted-foreground mt-1">Set your default address at checkout — it'll be saved here.</p></div>
          <div className="rounded-2xl border p-5 border-dashed grid place-items-center text-muted-foreground">+ Add new address</div>
        </div>
      </div>
    )
    if (tab === 'notifications') { markNotifRead(); return (
      <div>
        <h2 className="text-xl font-bold mb-3">Notifications</h2>
        <div className="space-y-2">{notif.length === 0 ? <p className="text-muted-foreground">Nothing here.</p> : notif.map(n => (
          <div key={n.id} className="rounded-2xl border p-4"><div className="font-bold">{n.title}</div><div className="text-sm text-muted-foreground">{n.msg}</div><div className="text-[11px] text-muted-foreground mt-1">{new Date(n.ts).toLocaleString()}</div></div>
        ))}</div>
      </div>
    )}
    if (tab === 'invoices') return <Placeholder t="Invoices" d={<div>Open any order and click <b>Download Invoice</b>. Go to <Link className="text-primary underline" href="/account?tab=orders">Orders →</Link></div>} />
    if (tab === 'payments') return <Placeholder t="Payment Methods" d="Save cards after your first Razorpay transaction (requires signed-in checkout)." />
    if (tab === 'returns') return <ReturnsTab user={user} orders={allOrders} returns={returns} reload={loadReturns} />
    if (tab === 'refunds') return <RefundsTab returns={returns} />
    if (tab === 'tickets') return <TicketsTab user={user} tickets={tickets} reload={loadTickets} orders={allOrders} />
    if (tab === 'settings') return (
      <div className="max-w-xl space-y-4">
        <h2 className="text-xl font-bold">Account Settings</h2>
        <div><label className="text-xs font-semibold">Name</label><Input value={profile.name} onChange={e => setProfile({...profile, name:e.target.value})} placeholder="Your full name" /></div>
        <div><label className="text-xs font-semibold">Email</label><Input value={user.email} disabled /></div>
        <div><label className="text-xs font-semibold">Mobile</label><Input value={profile.mobile} onChange={e => setProfile({...profile, mobile:e.target.value})} placeholder="+91" /></div>
        <Button onClick={saveProfile} className="rounded-full">Save Changes</Button>
      </div>
    )
    return null
  }

  return (
    <div className="container px-4 md:px-6 py-8 grid grid-cols-12 gap-6">
      <aside className="col-span-12 md:col-span-3">
        <div className="rounded-2xl border p-4 bg-card">
          <div className="flex items-center gap-3 pb-3 border-b">
            <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground grid place-items-center font-black">{user.email.charAt(0).toUpperCase()}</div>
            <div className="min-w-0"><div className="font-bold truncate">{profile.name || user.email.split('@')[0]}</div><div className="text-xs text-muted-foreground truncate">{user.email}</div></div>
          </div>
          <nav className="mt-3 flex md:flex-col gap-1 overflow-x-auto no-scrollbar">
            {TABS.map(t => { const I = t.i; return (
              <Link key={t.k} href={`/account?tab=${t.k}`} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${tab===t.k?'bg-primary text-primary-foreground':'hover:bg-secondary'}`}>
                <I size={16} /> {t.t}
              </Link>
            )})}
            <button onClick={signOut} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-secondary text-red-500 mt-2"><LogOut size={16} /> Sign out</button>
          </nav>
        </div>
      </aside>
      <div className="col-span-12 md:col-span-9"><TabContent /></div>
    </div>
  )
}

function Placeholder({ t, d }) { return (<div><h2 className="text-xl font-bold">{t}</h2><p className="text-muted-foreground mt-1">{d}</p></div>) }

function statusColor(s) {
  return {
    requested: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300',
    approved: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
    picked: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300',
    refunded: 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300',
    open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300',
    pending: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300',
  }[s] || 'bg-secondary text-foreground'
}

function ReturnsTab({ user, orders, returns, reload }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ orderId: '', productId: '', reason: '', mode: 'refund' })
  const eligible = orders.filter(o => ['delivered','shipped','out'].includes(o.status || 'confirmed'))
  const selOrder = eligible.find(o => o.id === form.orderId)

  const submit = async () => {
    if (!form.orderId) return toast.error('Choose an order')
    if (!form.reason.trim()) return toast.error('Tell us why you want to return')
    const r = await fetch('/api/customer/returns', { method:'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${user.token}` }, body: JSON.stringify(form) })
    const d = await r.json()
    if (!d.ok) return toast.error(d.error || 'Failed')
    toast.success('Return request submitted — ' + d.item.id)
    setOpen(false); setForm({ orderId: '', productId: '', reason: '', mode: 'refund' }); reload()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Returns</h2>
          <p className="text-xs text-muted-foreground">Return items within 7 days of delivery. Track your RMA below.</p>
        </div>
        <Button onClick={() => setOpen(v => !v)} className="rounded-full"><Plus size={14} className="mr-1" /> {open ? 'Cancel' : 'Request Return'}</Button>
      </div>

      {open && (
        <div className="rounded-2xl border p-5 space-y-3 bg-card">
          <div>
            <label className="text-xs font-semibold">Select Order</label>
            <select value={form.orderId} onChange={e => setForm({ ...form, orderId: e.target.value, productId: '' })} className="w-full h-10 rounded-md border bg-background px-3 text-sm">
              <option value="">— Pick a delivered order —</option>
              {eligible.map(o => <option key={o.id} value={o.id}>#{o.id} · {formatINR(o.total)} · {o.items?.length || 0} items</option>)}
            </select>
          </div>
          {selOrder && (
            <div>
              <label className="text-xs font-semibold">Item to return</label>
              <select value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })} className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                <option value="">— Choose an item —</option>
                {selOrder.items?.map((it, i) => <option key={i} value={it.product?.id}>{it.product?.name} × {it.qty}</option>)}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold">Mode</label>
              <select value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })} className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                <option value="refund">Refund</option>
                <option value="replace">Replace</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold">Reason</label>
            <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={3} placeholder="Damaged / Wrong item / Not as described / Better price elsewhere…" className="w-full rounded-md border bg-background p-3 text-sm" />
          </div>
          <Button onClick={submit} className="rounded-full w-full font-bold">Submit Return Request</Button>
        </div>
      )}

      {returns.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">No return requests yet.</div>
      ) : (
        <div className="space-y-2">
          {returns.map(r => (
            <div key={r.id} className="rounded-2xl border p-4 bg-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  {r.productImage && <img src={r.productImage} className="h-12 w-12 rounded object-cover" alt="" />}
                  <div className="min-w-0">
                    <div className="font-bold truncate">{r.productName}</div>
                    <div className="text-xs text-muted-foreground">RMA <b>{r.id}</b> · Order <b>#{r.orderId}</b> · {new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${statusColor(r.status)}`}>{r.status}</span>
              </div>
              {r.reason && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">Reason: {r.reason}</p>}
              <div className="text-xs mt-1"><b>Mode:</b> {r.mode === 'replace' ? 'Replacement' : 'Refund'} · <b>Amount:</b> {formatINR(r.amount || 0)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RefundsTab({ returns }) {
  const refunds = returns.filter(r => r.status === 'refunded' || r.status === 'approved' || r.status === 'picked')
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">Refunds</h2>
      <p className="text-xs text-muted-foreground">Refunds are auto-issued to the original payment method within 5-7 business days.</p>
      {refunds.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">No refunds in progress.</div>
      ) : refunds.map(r => (
        <div key={r.id} className="rounded-2xl border p-4 flex flex-wrap items-center gap-3 justify-between bg-card">
          <div className="min-w-0">
            <div className="font-bold">{formatINR(r.amount || 0)}</div>
            <div className="text-xs text-muted-foreground">RMA {r.id} · Order #{r.orderId} · {r.productName}</div>
          </div>
          <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${statusColor(r.status)}`}>{r.status}</span>
        </div>
      ))}
    </div>
  )
}

function TicketsTab({ user, tickets, reload, orders }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(null)
  const [form, setForm] = useState({ subject: '', category: 'general', orderId: '', message: '' })
  const [reply, setReply] = useState('')

  const create = async () => {
    if (!form.message.trim()) return toast.error('Type your message')
    const r = await fetch('/api/customer/tickets', { method:'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${user.token}` }, body: JSON.stringify(form) })
    const d = await r.json()
    if (!d.ok) return toast.error(d.error || 'Failed')
    toast.success('Ticket ' + d.item.id + ' created')
    setOpen(false); setForm({ subject: '', category: 'general', orderId: '', message: '' }); reload()
  }
  const sendReply = async () => {
    if (!reply.trim()) return
    const r = await fetch(`/api/customer/tickets/${active.id}/reply`, { method:'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${user.token}` }, body: JSON.stringify({ message: reply }) })
    const d = await r.json()
    if (!d.ok) return toast.error(d.error || 'Failed')
    setReply(''); reload(); setTimeout(() => setActive(tickets.find(t => t.id === active.id) || active), 300)
  }

  if (active) {
    const t = tickets.find(x => x.id === active.id) || active
    return (
      <div className="space-y-4">
        <button onClick={() => setActive(null)} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><X size={14} /> Back to tickets</button>
        <div className="rounded-2xl border bg-card">
          <div className="p-4 border-b flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="font-black">{t.subject}</div>
              <div className="text-xs text-muted-foreground">{t.id} · {t.category} · Opened {new Date(t.createdAt).toLocaleString()}</div>
            </div>
            <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${statusColor(t.status)}`}>{t.status}</span>
          </div>
          <div className="p-4 space-y-3 max-h-[420px] overflow-y-auto">
            {t.messages?.map(m => (
              <div key={m.id} className={`flex ${m.from === 'customer' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.from === 'customer' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-secondary rounded-bl-sm'}`}>
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  <div className="text-[10px] opacity-70 mt-1">{m.from === 'customer' ? 'You' : 'ZAMY Support'} · {new Date(m.at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
          {t.status !== 'closed' && (
            <div className="p-3 border-t flex gap-2">
              <Input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key==='Enter' && sendReply()} placeholder="Type your reply…" />
              <Button onClick={sendReply}><Send size={14} /></Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Support Tickets</h2>
          <p className="text-xs text-muted-foreground">Chat with our team about orders, delivery, refunds and more.</p>
        </div>
        <Button onClick={() => setOpen(v => !v)} className="rounded-full"><Plus size={14} className="mr-1" /> {open ? 'Cancel' : 'New Ticket'}</Button>
      </div>

      {open && (
        <div className="rounded-2xl border p-5 space-y-3 bg-card">
          <div>
            <label className="text-xs font-semibold">Subject</label>
            <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Short summary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                <option value="general">General</option>
                <option value="order">Order Issue</option>
                <option value="delivery">Delivery</option>
                <option value="product">Product</option>
                <option value="refund">Refund</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold">Related Order (optional)</label>
              <select value={form.orderId} onChange={e => setForm({ ...form, orderId: e.target.value })} className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                <option value="">— None —</option>
                {orders.map(o => <option key={o.id} value={o.id}>#{o.id}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold">Message</label>
            <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} placeholder="How can we help?" className="w-full rounded-md border bg-background p-3 text-sm" />
          </div>
          <Button onClick={create} className="rounded-full w-full font-bold">Submit Ticket</Button>
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">No tickets yet — start one above.</div>
      ) : (
        <div className="space-y-2">
          {tickets.map(t => (
            <button key={t.id} onClick={() => setActive(t)} className="w-full text-left rounded-2xl border p-4 hover:border-primary bg-card">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-bold truncate">{t.subject}</div>
                  <div className="text-xs text-muted-foreground">{t.id} · {t.category} · {t.messages?.length || 0} messages · Updated {new Date(t.updatedAt).toLocaleString()}</div>
                </div>
                <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${statusColor(t.status)}`}>{t.status}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Account() { return <SiteChrome><Suspense fallback={<div />}><Inner /></Suspense></SiteChrome> }
