'use client'
import { useEffect, useState } from 'react'
import { ChevronUp } from 'lucide-react'

export default function BackToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  if (!show) return null
  return (
    <button onClick={() => window.scrollTo({ top:0, behavior:'smooth' })} className="fixed bottom-24 right-5 z-40 h-11 w-11 rounded-full bg-black text-yellow-300 shadow-premium hover:brightness-95 hover:scale-105 transition grid place-items-center" aria-label="Back to top">
      <ChevronUp size={20} />
    </button>
  )
}
