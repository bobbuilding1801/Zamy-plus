'use client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const CustomerCtx = createContext(null)
const KEY = 'zamy_customer_v1'

function load() {
  if (typeof window === 'undefined') return null
  try { const v = localStorage.getItem(KEY); return v ? JSON.parse(v) : null } catch { return null }
}
function save(v) {
  if (typeof window === 'undefined') return
  try { v ? localStorage.setItem(KEY, JSON.stringify(v)) : localStorage.removeItem(KEY) } catch {}
}

export function CustomerProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const u = load()
    if (u) {
      // Verify token in background
      fetch('/api/auth/verify', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ token: u.token }) })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d && d.ok) setUser(u); else { save(null); setUser(null) } })
        .finally(() => setReady(true))
    } else setReady(true)
  }, [])

  const signIn = useCallback((data) => { save(data); setUser(data) }, [])
  const signOut = useCallback(() => { save(null); setUser(null) }, [])
  const requireAuth = useCallback((onDone) => {
    if (user) { onDone?.(user); return true }
    setModalOpen(true)
    return false
  }, [user])

  return (
    <CustomerCtx.Provider value={{ user, ready, signIn, signOut, requireAuth, modalOpen, setModalOpen }}>
      {children}
    </CustomerCtx.Provider>
  )
}

export function useCustomer() {
  const ctx = useContext(CustomerCtx)
  if (!ctx) throw new Error('useCustomer must be inside CustomerProvider')
  return ctx
}
