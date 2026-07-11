'use client'
import { useEffect, useState } from 'react'

export default function Countdown({ endsAt, className='' }) {
  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState(endsAt)
  useEffect(() => {
    setMounted(true)
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  // Render a stable placeholder on SSR/first-paint to avoid hydration mismatch
  const diff = Math.max(0, endsAt - (mounted ? now : endsAt))
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  const pad = (n) => String(n).padStart(2,'0')
  return (
    <div className={`inline-flex items-center gap-2 ${className}`} aria-label="Time remaining" suppressHydrationWarning>
      {[{l:'H',v:h},{l:'M',v:m},{l:'S',v:s}].map((x,i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="min-w-[46px] h-11 grid place-items-center rounded-lg bg-black text-yellow-300 font-black text-lg shadow-inner tabular-nums" suppressHydrationWarning>{mounted ? pad(x.v) : '00'}</div>
          <div className="text-[10px] font-bold text-black/70 mt-0.5">{x.l}</div>
        </div>
      ))}
    </div>
  )
}
