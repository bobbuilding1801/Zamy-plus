'use client'
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mail, ShieldCheck, Sparkles, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useCustomer } from '@/lib/customer'

export default function CustomerLoginModal() {
  const { modalOpen, setModalOpen, signIn } = useCustomer()
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [devCode, setDevCode] = useState('')
  const [resendIn, setResendIn] = useState(0)

  useEffect(() => {
    if (!modalOpen) { setStep('email'); setEmail(''); setCode(''); setDevCode(''); setResendIn(0) }
  }, [modalOpen])

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setInterval(() => setResendIn(v => Math.max(0, v-1)), 1000)
    return () => clearInterval(t)
  }, [resendIn])

  const requestOtp = async () => {
    if (!email.includes('@')) return toast.error('Enter a valid email')
    setLoading(true)
    try {
      const r = await fetch('/api/customer/otp/request', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email })})
      const d = await r.json()
      if (!d.ok) throw new Error(d.error || 'Failed')
      setStep('otp')
      setResendIn(45)
      if (d.devCode) { setDevCode(d.devCode); toast.success('OTP: ' + d.devCode + ' (dev mode)') }
      else toast.success('Code sent to ' + email)
    } catch (e) { toast.error(String(e.message || e)) }
    finally { setLoading(false) }
  }

  const verifyOtp = async () => {
    if (code.length !== 6) return toast.error('Enter the 6-digit code')
    setLoading(true)
    try {
      const r = await fetch('/api/customer/otp/verify', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, code })})
      const d = await r.json()
      if (!d.ok) throw new Error(d.error || 'Failed')
      signIn(d)
      toast.success('Welcome to ZAMY, ' + d.email)
      setModalOpen(false)
    } catch (e) { toast.error(String(e.message || e)) }
    finally { setLoading(false) }
  }

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="relative bg-black text-white p-6">
          <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-yellow-400/25 blur-2xl" />
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2"><Sparkles className="text-yellow-400" size={16} /> Sign in to ZAMY</DialogTitle>
          </DialogHeader>
          <p className="text-white/70 text-sm mt-1">{step==='email' ? 'Enter your email — we’ll send you a 6-digit code.' : 'Enter the 6-digit code we just emailed you.'}</p>
        </div>
        <div className="p-6 space-y-4">
          {step === 'email' ? (
            <>
              <div>
                <label className="text-xs font-semibold flex items-center gap-1 mb-1"><Mail size={12} /> Email</label>
                <Input type="email" autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" onKeyDown={(e) => e.key === 'Enter' && requestOtp()} />
              </div>
              <Button onClick={requestOtp} disabled={loading} className="w-full h-11 rounded-full font-bold">{loading ? 'Sending…' : 'Send verification code'}</Button>
              <p className="text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1"><ShieldCheck size={12} /> No password needed. We use one-time codes.</p>
            </>
          ) : (
            <>
              <button onClick={() => setStep('email')} className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"><ArrowLeft size={12} /> Change email</button>
              <div className="text-sm">Code sent to <b>{email}</b></div>
              <div>
                <label className="text-xs font-semibold mb-1 block">6-digit code</label>
                <Input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoFocus value={code} onChange={e => setCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="••••••" className="text-center text-2xl tracking-[0.5em] font-bold h-14" onKeyDown={(e) => e.key === 'Enter' && verifyOtp()} />
                {devCode && <div className="mt-2 text-[11px] text-yellow-700 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded p-2">Dev mode (no email provider set): use code <b>{devCode}</b></div>}
              </div>
              <Button onClick={verifyOtp} disabled={loading || code.length !== 6} className="w-full h-11 rounded-full font-bold">{loading ? 'Verifying…' : 'Verify & sign in'}</Button>
              <div className="text-center">
                <button disabled={resendIn > 0 || loading} onClick={requestOtp} className="text-xs font-semibold text-primary disabled:text-muted-foreground">
                  {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
