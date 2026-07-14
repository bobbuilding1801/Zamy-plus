'use client'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { ShopProvider } from '@/lib/store'
import { CustomerProvider } from '@/lib/customer'
import CustomerLoginModal from '@/components/site/CustomerLoginModal'

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <CustomerProvider>
        <ShopProvider>
          {children}
          <CustomerLoginModal />
          <Toaster position="top-right" richColors closeButton />
        </ShopProvider>
      </CustomerProvider>
    </ThemeProvider>
  )
}
