'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Boxes, ShoppingBag, Wallet, TrendingUp, Package, Settings, LogOut, DollarSign, ClipboardList, Star } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatINR } from '@/lib/store'
import Logo from '@/components/site/Logo'
import { useAuthGate } from '@/lib/auth'
import AuthBar from '@/components/site/AuthBar'

const NAV = [
  { k:'dashboard', t:'Dashboard', i:LayoutDashboard },
  { k:'products', t:'Products', i:Boxes },
  { k:'orders', t:'Orders', i:ShoppingBag },
  { k:'earnings', t:'Earnings', i:Wallet },
  { k:'inventory', t:'Inventory', i:Package },
  { k:'analytics', t:'Analytics', i:TrendingUp },
  { k:'settings', t:'Settings', i:Settings },
]

function Inner() {
  const gate = useAuthGate('seller')
  const sp = useSearchParams()
  const tab = sp.get('tab') || 'dashboard'
  const [data, setData] = useState(null)
  const [orders, setOrders] = useState([])
  useEffect(() => {
    if (gate.loading || !gate.user) return
    const h = { Authorization: `Bearer ${gate.user.token}` }
    fetch('/api/seller/analytics', { headers: h }).then(r=>r.json()).then(setData)
    fetch('/api/seller/orders', { headers: h }).then(r=>r.json()).then(d => setOrders(d.items||[]))
  }, [gate.loading, gate.user])

  if (gate.loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Verifying access…</div>

  const KPI = ({ label, value, sub, Icon }) => (
    <div className="rounded-2xl border p-5 bg-card">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase font-bold">{label}</div>
          <div className="text-2xl md:text-3xl font-black mt-1">{value}</div>
          {sub && <div className="text-xs text-green-600 font-semibold mt-1">{sub}</div>}
        </div>
        <div className="h-11 w-11 grid place-items-center rounded-full bg-primary/15 text-primary"><Icon size={20} /></div>
      </div>
    </div>
  )

  const Content = () => {
    if (!data) return <div className="p-6 text-muted-foreground">Loading…</div>
    if (tab === 'dashboard' || tab === 'analytics') return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Sales (14d)" value={formatINR(data.totals.revenue)} sub="+22% vs prev" Icon={DollarSign} />
          <KPI label="Orders" value={data.totals.orders} sub="+14%" Icon={ShoppingBag} />
          <KPI label="Pending Payout" value={formatINR(data.totals.pendingPayout)} sub="Payout 15th" Icon={Wallet} />
          <KPI label="Seller Rating" value={data.totals.rating.toFixed(1) + ' ★'} sub="Top 5%" Icon={Star} />
        </div>
        <div className="rounded-2xl border p-5 bg-card">
          <div className="font-bold mb-2">Revenue Trend</div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={data.revenue}>
                <defs><linearGradient id="s1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFD400" stopOpacity={0.9}/><stop offset="100%" stopColor="#FFD400" stopOpacity={0.05}/></linearGradient></defs>
                <CartesianGrid stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="date" tick={{fontSize:10}} tickFormatter={(v)=>v.slice(5)} />
                <YAxis tick={{fontSize:10}} tickFormatter={(v)=>'₹'+(v/1000).toFixed(0)+'k'} />
                <Tooltip formatter={(v)=>['₹'+v.toLocaleString(),'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#111" strokeWidth={2} fill="url(#s1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
    if (tab === 'products') return (
      <div>
        <div className="flex items-center justify-between mb-3"><h2 className="text-xl font-black">My Products</h2><Button className="rounded-full">+ Add Product</Button></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.products.map(p => (
            <div key={p.id} className="rounded-2xl border p-4 bg-card">
              <img src={p.images[0]} className="h-32 w-full object-cover rounded-lg" alt="" />
              <div className="font-semibold mt-2 line-clamp-1">{p.name}</div>
              <div className="text-sm text-muted-foreground">Stock: {p.stock}</div>
              <div className="flex items-center justify-between mt-2">
                <div className="font-black">{formatINR(p.price)}</div>
                <Badge>{p.rating.toFixed(1)}★</Badge>
              </div>
              <div className="flex gap-2 mt-3"><Button size="sm" variant="outline" className="flex-1">Edit</Button><Button size="sm" variant="outline" className="flex-1">View</Button></div>
            </div>
          ))}
        </div>
      </div>
    )
    if (tab === 'orders') return (
      <div>
        <h2 className="text-xl font-black mb-3">Recent Seller Orders</h2>
        <div className="rounded-2xl border overflow-hidden"><table className="w-full text-sm">
          <thead className="bg-secondary/50 text-xs uppercase"><tr><th className="p-3 text-left">Order</th><th className="p-3 text-left">Product</th><th className="p-3 text-right">Qty</th><th className="p-3 text-right">Total</th><th className="p-3">Status</th></tr></thead>
          <tbody>{orders.map(o => (<tr key={o.id} className="border-t hover:bg-secondary/30">
            <td className="p-3 font-bold">#{o.id}</td>
            <td className="p-3"><div className="flex items-center gap-2"><img src={o.image} className="h-8 w-8 rounded object-cover" alt="" /><span className="line-clamp-1 max-w-[240px]">{o.product}</span></div></td>
            <td className="p-3 text-right">{o.qty}</td>
            <td className="p-3 text-right font-bold">{formatINR(o.total)}</td>
            <td className="p-3"><Badge className="capitalize" variant={o.status==='delivered'?'default':'secondary'}>{o.status}</Badge></td>
          </tr>))}</tbody>
        </table></div>
      </div>
    )
    if (tab === 'earnings') return (
      <div>
        <h2 className="text-xl font-black mb-3">Earnings & Payouts</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <KPI label="Lifetime" value={formatINR(1240000)} Icon={DollarSign} />
          <KPI label="This Month" value={formatINR(212800)} sub="+18%" Icon={TrendingUp} />
          <KPI label="Pending Payout" value={formatINR(45280)} sub="On the 15th" Icon={Wallet} />
        </div>
        <div className="rounded-2xl border p-5 bg-card">
          <h3 className="font-bold mb-2">Recent Payouts</h3>
          <table className="w-full text-sm"><tbody>
            {Array.from({length:5}).map((_,i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-3">Payout #P{2200+i}</td>
                <td className="py-3 text-muted-foreground">{new Date(Date.now()-i*30*86400000).toISOString().slice(0,10)}</td>
                <td className="py-3 text-right font-bold">{formatINR(120000 - i*4000)}</td>
                <td className="py-3 text-right"><Badge>Paid</Badge></td>
              </tr>
            ))}
          </tbody></table>
        </div>
      </div>
    )
    if (tab === 'inventory') return <div><h2 className="text-xl font-black">Inventory</h2><p className="text-muted-foreground mt-2">Manage stock across warehouses. <br />Coming soon.</p></div>
    if (tab === 'settings') return <div><h2 className="text-xl font-black">Seller Settings</h2><p className="text-muted-foreground mt-2">Bank details, GSTIN, KYC and profile. <br />Coming soon.</p></div>
    return null
  }

  return (
    <div className="grid grid-cols-12 min-h-screen">
      <aside className="col-span-12 md:col-span-3 lg:col-span-2 border-r bg-sidebar text-sidebar-foreground p-3 md:min-h-screen">
        <div className="flex items-center gap-2 p-2 mb-2"><Logo size={32} /><div className="font-black tracking-widest text-sm">SELLER</div></div>
        <nav className="flex md:flex-col gap-1 overflow-x-auto no-scrollbar">
          {NAV.map(n => { const I = n.i; return (
            <Link key={n.k} href={`/seller?tab=${n.k}`} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${tab===n.k?'bg-primary text-primary-foreground':'hover:bg-secondary'}`}>
              <I size={16} /> <span>{n.t}</span>
            </Link>
          )})}
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary mt-3"><LogOut size={16} /> Back to store</Link>
        </nav>
      </aside>
      <main className="col-span-12 md:col-span-9 lg:col-span-10 bg-background flex flex-col">
        <AuthBar role="seller" />
        <div className="p-4 md:p-6 flex-1"><Content /></div>
      </main>
    </div>
  )
}
export default function Seller() { return <Suspense fallback={<div />}><Inner /></Suspense> }
