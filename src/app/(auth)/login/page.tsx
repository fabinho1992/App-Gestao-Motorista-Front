'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { login } from '@/lib/api'
import { saveAuth } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', senha: '' })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email || !form.senha) {
      setErro('Preencha todos os campos')
      return
    }
    setLoading(true)
    setErro('')
    try {
      const res = await login(form)
      if (!res.isSuccess) {
        setErro(res.message)
        return
      }
      saveAuth(res.data.token, res.data.motoristaId, res.data.displayName)
      document.cookie = `token=${res.data.token}; path=/`
      router.push('/dashboard')
    } catch {
      setErro('Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-[#534AB7] mb-1">Rota Certa</h1>
        <p className="text-sm text-[#6b7280] text-center mb-8">Faça login para continuar</p>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="seu@email.com"
            value={form.email}
            onChange={onChange}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#111827]">Senha</label>
            <div className="relative">
              <input
                name="senha"
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Sua senha"
                value={form.senha}
                onChange={onChange}
                className="w-full px-3 py-2.5 pr-10 rounded-lg border border-[#e5e7eb] bg-white text-[#111827] text-sm placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0 text-[#6b7280] hover:text-[#111827]"
              >
                {mostrarSenha ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <path d="M1 1l22 22" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {erro && <p className="text-sm text-red-600">{erro}</p>}

          <Button type="submit" loading={loading} className="w-full">
            Entrar
          </Button>
        </form>

        <p className="text-sm text-[#6b7280] text-center mt-6">
          Não tem conta?{' '}
          <Link href="/registrar" className="text-[#534AB7] font-medium hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}
