'use client'
import SiteChrome from '@/components/site/SiteChrome'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'

function OrderSuccessInner() {
  const sp = useSearchParams()
  const id = sp.get('id') || '000000'
  return (
    <div className="container px-4 md:px-6 py-16 text-center max-w-lg mx-auto">
      <div className="h-20 w-20 rounded-full bg-green-100 text-green-600 grid place-items-center mx-auto"><CheckCircle2 size={44} /></div>
      <h1 className="mt-4 text-3xl font-extrabold">Order Confirmed!</h1>
      <p className="text-muted-foreground mt-2">Thank you for shopping with ZAMY.</p>
      <div className="mt-6 rounded-2xl border p-6">
        <div className="text-sm text-muted-foreground">Order ID</div>
        <div className="text-2xl font-black">#{id}</div>
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground"><Package size={16} /> Estimated delivery: 3-5 business days</div>
      </div>
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/account?tab=orders"><Button className="rounded-full">Track Order</Button></Link>
        <Link href="/shop"><Button variant="outline" className="rounded-full">Continue Shopping</Button></Link>
      </div>
    </div>
  )
}

export default function OrderSuccess() { return <SiteChrome><Suspense fallback={<div />}><OrderSuccessInner /></Suspense></SiteChrome> }
