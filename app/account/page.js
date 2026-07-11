'use client'
import SiteChrome from '@/components/site/SiteChrome'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useShop, formatINR } from '@/lib/store'
import Link from 'next/link'
import { LayoutDashboard, ShoppingBag, FileText, Heart, MapPin, CreditCard, RotateCcw, Wallet, Bell, LifeBuoy, Settings, Download, Package, TruckIcon, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
  const { orders, wishlist, notif, markNotifRead } = useShop()

  const TabContent = () => {
    if (tab === 'dashboard') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {l:'Total Orders', v:orders.length, i:Package},
            {l:'Wishlist', v:wishlist.length, i:Heart},
            {l:'Unread Alerts', v:notif.filter(n=>n.unread).length, i:Bell},
            {l:'Zamy Points', v:'1,240', i:Wallet},
          ].map(({l,v,i:I}) => (
            <div key={l} className="rounded-2xl border p-5 bg-card">
              <I className="text-primary" />
              <div className="text-3xl font-black mt-2">{v}</div>
              <div className="text-xs text-muted-foreground">{l}</div>
            </div>
          ))}
          <div className="col-span-2 md:col-span-4 rounded-2xl border p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Recent Orders</h3>
              <Link href="/account?tab=orders" className="text-primary text-sm font-semibold">View all</Link>
            </div>
            {orders.length === 0 ? <p className="text-sm text-muted-foreground">No orders yet.</p> : (
              <div className="space-y-2">{orders.slice(0,3).map(o => (
                <div key={o.id} className="flex justify-between text-sm border-b last:border-0 pb-2">
                  <div><b>#{o.id}</b> · {o.items?.length} items</div><div className="font-bold">{formatINR(o.total)}</div>
                </div>
              ))}</div>
            )}
          </div>
        </div>
      )
    }
    if (tab === 'orders') return (
      <div className="space-y-3">
        <h2 className="text-xl font-bold">My Orders</h2>
        {orders.length === 0 ? <p className="text-muted-foreground">You haven’t placed any orders yet.</p> :
          orders.map(o => (
            <div key={o.id} className="rounded-2xl border p-5">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Order</div>
                  <div className="font-black">#{o.id}</div>
                </div>
                <div><div className="text-xs text-muted-foreground">Total</div><div className="font-bold">{formatINR(o.total)}</div></div>
                <div><div className="text-xs text-muted-foreground">Payment</div><div className="font-bold uppercase">{o.payment}</div></div>
                <div><div className="text-xs text-muted-foreground">Status</div><div className="font-bold text-green-600">Confirmed</div></div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><TruckIcon size={14} className="mr-1" /> Track</Button>
                  <Button size="sm"><Download size={14} className="mr-1" /> Invoice</Button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {o.items?.slice(0,4).map(i => (
                  <div key={i.id} className="flex items-center gap-2 text-sm border rounded-lg p-2">
                    <img src={i.product?.images?.[0]} className="h-10 w-10 rounded object-cover" alt="" />
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
    if (tab === 'invoices') return <Placeholder t="Invoices" d="Download PDF invoices for all your orders." />
    if (tab === 'wishlist') return <Placeholder t="Wishlist" d={<Link className="text-primary underline" href="/wishlist">Open wishlist →</Link>} />
    if (tab === 'addresses') return (
      <div>
        <h2 className="text-xl font-bold mb-3">Saved Addresses</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border p-5">
            <div className="font-bold">Home</div>
            <p className="text-sm text-muted-foreground mt-1">123 Zamy Street, Bengaluru 560001, India</p>
            <div className="flex gap-2 mt-3"><Button variant="outline" size="sm">Edit</Button><Button variant="outline" size="sm">Delete</Button></div>
          </div>
          <div className="rounded-2xl border p-5 border-dashed grid place-items-center text-muted-foreground">+ Add new address</div>
        </div>
      </div>
    )
    if (tab === 'payments') return (
      <div>
        <h2 className="text-xl font-bold mb-3">Payment Methods</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border p-5 bg-gradient-to-br from-black to-neutral-800 text-white">
            <div className="text-xs opacity-70">Visa •••• 4242</div>
            <div className="mt-6 font-black text-lg tracking-widest">**** **** **** 4242</div>
            <div className="mt-4 flex justify-between text-xs"><span>ZAMY MEMBER</span><span>12/28</span></div>
          </div>
          <div className="rounded-2xl border p-5 border-dashed grid place-items-center text-muted-foreground">+ Add new card</div>
        </div>
      </div>
    )
    if (tab === 'returns') return <Placeholder t="Returns" d="View return status of your orders." />
    if (tab === 'refunds') return <Placeholder t="Refunds" d="Track refund status of returned items." />
    if (tab === 'notifications') {
      markNotifRead()
      return (
        <div>
          <h2 className="text-xl font-bold mb-3">Notifications</h2>
          <div className="space-y-2">
            {notif.length === 0 ? <p className="text-muted-foreground">Nothing here.</p> : notif.map(n => (
              <div key={n.id} className="rounded-2xl border p-4">
                <div className="font-bold">{n.title}</div>
                <div className="text-sm text-muted-foreground">{n.msg}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{new Date(n.ts).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )
    }
    if (tab === 'tickets') return <Placeholder t="Support Tickets" d="Raise a ticket — our team responds within 24 hours." />
    if (tab === 'settings') return (
      <div className="max-w-xl space-y-4">
        <h2 className="text-xl font-bold">Account Settings</h2>
        <div><label className="text-xs font-semibold">Name</label><Input defaultValue="Guest User" /></div>
        <div><label className="text-xs font-semibold">Email</label><Input defaultValue="guest@zamy.market" /></div>
        <div><label className="text-xs font-semibold">Mobile</label><Input defaultValue="+91 90000 00000" /></div>
        <Button className="rounded-full">Save Changes</Button>
      </div>
    )
    return null
  }

  return (
    <div className="container px-4 md:px-6 py-8 grid grid-cols-12 gap-6">
      <aside className="col-span-12 md:col-span-3">
        <div className="rounded-2xl border p-4 bg-card">
          <div className="flex items-center gap-3 pb-3 border-b">
            <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground grid place-items-center font-black">Z</div>
            <div><div className="font-bold">Guest User</div><div className="text-xs text-muted-foreground">guest@zamy.market</div></div>
          </div>
          <nav className="mt-3 flex md:flex-col gap-1 overflow-x-auto no-scrollbar">
            {TABS.map(t => {
              const I = t.i
              return (
                <Link key={t.k} href={`/account?tab=${t.k}`} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${tab===t.k?'bg-primary text-primary-foreground':'hover:bg-secondary'}`}>
                  <I size={16} /> {t.t}
                </Link>
              )
            })}
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-secondary text-red-500 mt-2"><LogOut size={16} /> Sign out</button>
          </nav>
        </div>
      </aside>
      <div className="col-span-12 md:col-span-9"><TabContent /></div>
    </div>
  )
}

function Placeholder({ t, d }) {
  return (<div><h2 className="text-xl font-bold">{t}</h2><p className="text-muted-foreground mt-1">{d}</p></div>)
}

export default function Account() { return <SiteChrome><Suspense fallback={<div />}><Inner /></Suspense></SiteChrome> }
