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
          <Input
            label="Senha"
            name="senha"
            type="password"
            placeholder="Sua senha"
            value={form.senha}
            onChange={onChange}
          />

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
