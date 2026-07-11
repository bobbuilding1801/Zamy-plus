import Header from './Header'
import Footer from './Footer'
import BackToTop from './BackToTop'
import ChatWidget from './ChatWidget'

export default function SiteChrome({ children, hideChrome=false }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {!hideChrome && <Header />}
      <main className="flex-1">{children}</main>
      {!hideChrome && <Footer />}
      {!hideChrome && <BackToTop />}
      {!hideChrome && <ChatWidget />}
    </div>
  )
}
