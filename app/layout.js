import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'ZAMY — Premium Marketplace for Electronics, Computer Parts, Automotive & Tools',
  description: 'Shop electronics, computer parts, mobile accessories, automotive parts, tools and industrial products on ZAMY. Best prices, fast delivery, trusted sellers.',
  keywords: 'zamy, marketplace, electronics, laptops, smartphones, computer parts, automotive, tools, industrial, mobile accessories',
  openGraph: {
    title: 'ZAMY — Premium Marketplace',
    description: 'Electronics, Computer Parts, Automotive & Tools. Delivered.',
    type: 'website',
  },
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
