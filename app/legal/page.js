'use client'
import SiteChrome from '@/components/site/SiteChrome'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const CONTENT = {
  privacy: { t:'Privacy Policy', b:'At ZAMY, we respect your privacy. We collect only the minimum data needed to fulfill your orders and improve your experience. We never sell your personal data. Cookies and analytics are used to personalize content and measure performance. You can request deletion of your account and data at any time by contacting support@zamy.market.' },
  terms:   { t:'Terms & Conditions', b:'By using ZAMY you agree to comply with our terms of service. All products listed are subject to availability. Prices, taxes and shipping fees are calculated at checkout. Disputes are handled under Indian jurisdiction. Fraudulent orders will be reported to authorities.' },
  returns: { t:'Return Policy', b:'Most items are eligible for return within 7 days of delivery, in original condition and packaging. Certain categories such as opened consumables or personalized goods may not be returnable. Initiate a return from Account → Orders.' },
  refunds: { t:'Refund Policy', b:'Approved refunds are credited to the original payment method within 5-7 business days. For COD orders, refunds are issued via bank transfer or ZAMY wallet with a bonus 5% credit.' },
  shipping:{ t:'Shipping Policy', b:'Standard delivery in 2-4 business days across serviceable pin codes. Express (1-2 days) and same-day options available at checkout. Free shipping on orders above ₹999.' },
}
function Inner() {
  const sp = useSearchParams()
  const p = sp.get('p') || 'privacy'
  const c = CONTENT[p] || CONTENT.privacy
  return (
    <div className="container px-4 md:px-6 py-12 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-black">{c.t}</h1>
      <p className="text-muted-foreground mt-4 leading-relaxed">{c.b}</p>
      <p className="mt-6 text-sm text-muted-foreground">Last updated: June 2025</p>
    </div>
  )
}
export default function L() { return <SiteChrome><Suspense fallback={<div />}><Inner /></Suspense></SiteChrome> }
