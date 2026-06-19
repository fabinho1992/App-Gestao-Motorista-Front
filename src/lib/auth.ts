'use client'

import { getDisplayName } from 'next/dist/shared/lib/utils'
import { useState, useEffect } from 'react'

interface AuthUser {
  token: string
  motoristaId: string
  nome: string
}

export function saveAuth(token: string, motoristaId: string, DisplayName: string) {
  localStorage.setItem('token', token)
  localStorage.setItem('motoristaId', motoristaId)
  localStorage.setItem('nome', DisplayName)
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('token')
}

export function logout() {
  localStorage.clear()
  document.cookie = 'token=; path=/; max-age=0'
  window.location.href = '/login'
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const motoristaId = localStorage.getItem('motoristaId')
    const nome = localStorage.getItem('nome')

    if (token && motoristaId && nome) {
      setUser({ token, motoristaId, nome })
    }
  }, [])

  return user
}
