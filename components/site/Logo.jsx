'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ZAMY_LOGO } from '@/lib/logo'

export default function Logo({ size=44, showText=false, className='' }) {
  return (
    <Link href="/" className={`flex items-center gap-2 group ${className}`} aria-label="ZAMY Home">
      <span className="relative inline-block rounded-full overflow-hidden bg-black ring-2 ring-primary/30 group-hover:ring-primary transition" style={{ width:size, height:size }}>
        <Image src={ZAMY_LOGO} alt="ZAMY" fill sizes={`${size}px`} className="object-cover" priority />
      </span>
      {showText && <span className="font-extrabold tracking-wider text-lg">ZAMY</span>}
    </Link>
  )
}
