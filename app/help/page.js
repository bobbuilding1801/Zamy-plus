'use client'
import SiteChrome from '@/components/site/SiteChrome'
import { useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

const FAQS = [
  { q:'How do I track my order?', a:'Go to Account → Orders and click Track. You will also get email/SMS updates.' },
  { q:'What is the return policy?', a:'Most products are eligible for a 7-day return from the date of delivery.' },
  { q:'What payment methods do you accept?', a:'UPI, credit/debit cards, net banking, wallets, Razorpay, Stripe, PayPal, and COD (where available).' },
  { q:'Is same-day delivery available?', a:'Yes, in select pin codes. Choose Same Day Delivery at checkout before 12 PM.' },
  { q:'Do you offer no-cost EMI?', a:'Yes, on most orders above ₹5000 on major credit cards. Details at checkout.' },
  { q:'How do I become a seller?', a:'Head to “Sell on ZAMY” in the top bar or the Careers page for details.' },
  { q:'How do I contact customer support?', a:'Email support@zamy.market or call 1800-000-000 (24×7).' },
]

function Inner() {
  const [q, setQ] = useState('')
  const list = FAQS.filter(f => f.q.toLowerCase().includes(q.toLowerCase()) || f.a.toLowerCase().includes(q.toLowerCase()))
  return (
    <div>
      <section className="bg-gradient-to-r from-yellow-400 to-yellow-300 border-b">
        <div className="container px-4 md:px-6 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-black">Help Center</h1>
          <p className="text-black/80 mt-2">How can we help you today?</p>
          <div className="mt-6 relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search topics..." className="pl-10 h-12 rounded-full bg-white text-black" />
          </div>
        </div>
      </section>
      <div id="faqs" className="container px-4 md:px-6 py-10 max-w-3xl">
        <h2 className="text-2xl font-black mb-4">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {list.map((f,i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
export default function Help() { return <SiteChrome><Inner /></SiteChrome> }
