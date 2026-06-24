'use client'

import { useAuth, logout } from '@/lib/auth'

export default function Header() {
  const user = useAuth()

  return (
    <header className="bg-white border-b border-[#e5e7eb] px-4 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-[#534AB7]">Rota Certa</h1>
        {user && <p className="text-xs text-[#6b7280]">Olá, {user.nome}</p>}
      </div>
      <button
        onClick={logout}
        className="text-sm text-[#6b7280] hover:text-[#111827] cursor-pointer"
      >
        Sair
      </button>
    </header>
  )
}
