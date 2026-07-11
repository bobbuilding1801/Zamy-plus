'use client'
import { clearAuth, getAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function AuthBar({ role }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  useEffect(() => { setUser(getAuth()) }, [])
  const doLogout = () => { clearAuth(); router.push(`/login?role=${role}`) }
  return (
    <div className="flex items-center justify-end gap-3 px-4 md:px-6 py-2 border-b bg-card">
      <div className="text-xs text-muted-foreground">Signed in as <b className="text-foreground">{user?.email || '…'}</b> · <span className="uppercase font-bold text-primary">{role}</span></div>
      <button onClick={doLogout} className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600">
        <LogOut size={14} /> Sign out
      </button>
    </div>
  )
}
