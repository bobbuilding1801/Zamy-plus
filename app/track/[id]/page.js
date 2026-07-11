'use client'
import { Suspense, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import SiteChrome from '@/components/site/SiteChrome'
import { Check, Package, Truck, MapPin, CircleCheck, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'

function TrackInner() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  useEffect(() => {
    if (!id) return
    fetch(`/api/track/${id}`).then(r=>r.json()).then(setData)
  }, [id])
  if (!data) return <div className="container py-16 text-center">Loading…</div>

  const currentIdx = data.stages.findIndex(s => !s.done)
  const progress = currentIdx === -1 ? 100 : (currentIdx / (data.stages.length-1))*100

  return (
    <div className="container px-4 md:px-6 py-8 max-w-3xl">
      <div className="rounded-2xl border p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Order</div>
            <div className="text-2xl font-black">#{data.orderId}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Tracking</div>
            <div className="inline-flex items-center gap-2 font-bold">{data.awb} <button onClick={()=>{navigator.clipboard.writeText(data.awb); toast.success('Copied')}}><Copy size={14} /></button></div>
            <div className="text-xs text-muted-foreground">via {data.courier}</div>
          </div>
        </div>

        <div className="mt-8">
          <div className="relative h-1 rounded-full bg-secondary overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-8 space-y-6">
            {data.stages.map((s,i) => {
              const Icon = i===0 ? Check : i===1 ? Package : i===2 ? Truck : i===3 ? MapPin : CircleCheck
              const active = s.done || i===currentIdx
              return (
                <div key={s.key} className="flex gap-4">
                  <div className={`h-10 w-10 shrink-0 rounded-full grid place-items-center ${s.done ? 'bg-primary text-primary-foreground' : (i===currentIdx ? 'bg-primary/20 text-primary ring-2 ring-primary animate-pulse' : 'bg-secondary text-muted-foreground')}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1">
                    <div className={`font-bold ${active ? '' : 'text-muted-foreground'}`}>{s.label}</div>
                    <div className="text-xs text-muted-foreground">{new Date(s.at).toLocaleString()}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <Link href={`/invoice/${data.orderId}`}><Button variant="outline">Download Invoice</Button></Link>
          <Link href="/account?tab=orders"><Button variant="outline">All Orders</Button></Link>
          <Link href="/help"><Button>Need Help?</Button></Link>
        </div>
      </div>
    </div>
  )
}
export default function Track() { return <SiteChrome><Suspense fallback={<div/>}><TrackInner /></Suspense></SiteChrome> }
