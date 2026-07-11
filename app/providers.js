'use client'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { ShopProvider } from '@/lib/store'

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <ShopProvider>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </ShopProvider>
    </ThemeProvider>
  )
}
