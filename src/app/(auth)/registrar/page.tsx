'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { registrar, login } from '@/lib/api'
import { saveAuth } from '@/lib/auth'
import BackButton from '@/components/ui/BackButton'
import { formatarCpf, parsearCpf, formatarTelefone, parsearTelefone } from '@/lib/masks'

export default function RegistrarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [form, setForm] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    cnh: '',
    vencimentoCnh: '',
    senha: '',
  })

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setErro('')
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { nome, email, cpf, telefone, cnh, vencimentoCnh, senha } = form
    if (!nome || !email || !cpf || !telefone || !cnh || !vencimentoCnh || !senha) {
      setErro('Preencha todos os campos')
      return
    }
    if (!form.nome || form.nome.trim().length < 3) {
      setErro('Nome deve ter pelo menos 3 caracteres.')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.email || !emailRegex.test(form.email)) {
      setErro('Email inválido.')
      return
    }
    const cpfNumeros = form.cpf.replace(/\D/g, '')
    if (cpfNumeros.length !== 11) {
      setErro('CPF deve ter 11 dígitos.')
      return
    }
    const telefoneNumeros = form.telefone.replace(/\D/g, '')
    if (telefoneNumeros.length < 10) {
      setErro('Telefone inválido. Informe DDD + número.')
      return
    }
    if (!form.cnh || form.cnh.trim().length === 0) {
      setErro('CNH é obrigatória.')
      return
    }
    if (form.vencimentoCnh) {
      const vencimento = new Date(form.vencimentoCnh)
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      if (vencimento < hoje) {
        setErro('CNH vencida. Informe uma CNH com validade futura.')
        return
      }
    }
    if (!form.senha || form.senha.length < 6) {
      setErro('Senha deve ter pelo menos 6 caracteres.')
      return
    }
    setLoading(true)
    setErro('')
    try {
      const resRegistro = await registrar(form)
      if (!resRegistro.isSuccess) {
        setErro(resRegistro.message)
        return
      }
      const resLogin = await login({ email, senha })
      if (!resLogin.isSuccess) {
        setErro('Conta criada! Faça login manualmente.')
        router.push('/login')
        return
      }
      saveAuth(resLogin.data.token, resLogin.data.motoristaId, resLogin.data.displayName)
      document.cookie = `token=${resLogin.data.token}; path=/`
      router.push('/dashboard')
    } catch {
      setErro('Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-white">
      <div className="w-full max-w-sm">
        <BackButton href="/login" label="Login" />
        <h1 className="text-2xl font-bold text-center text-[#534AB7] mb-1">Criar conta</h1>
        <p className="text-sm text-[#6b7280] text-center mb-6">Cadastre-se para começar</p>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <Input label="Nome completo" name="nome" placeholder="Seu nome" value={form.nome} onChange={onChange} />
          <Input label="Email" name="email" type="email" placeholder="seu@email.com" value={form.email} onChange={onChange} />
          <Input label="CPF" name="cpf" placeholder="000.000.000-00" inputMode="numeric" value={formatarCpf(form.cpf)} onChange={(e) => { setErro(''); setForm({ ...form, cpf: parsearCpf(e.target.value) }) }} />
          <Input label="Telefone" name="telefone" placeholder="(00) 00000-0000" inputMode="numeric" value={formatarTelefone(form.telefone)} onChange={(e) => { setErro(''); setForm({ ...form, telefone: parsearTelefone(e.target.value) }) }} />
          <Input label="CNH" name="cnh" placeholder="Número da CNH" value={form.cnh} onChange={onChange} />
          <Input label="Vencimento CNH" name="vencimentoCnh" type="date" value={form.vencimentoCnh} onChange={onChange} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#111827]">Senha</label>
            <div className="relative">
              <input
                name="senha"
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Crie uma senha"
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

          <Button type="submit" loading={loading} className="w-full mt-2">
            Criar conta
          </Button>
        </form>

        <p className="text-sm text-[#6b7280] text-center mt-6">
          Já tem conta?{' '}
          <Link href="/login" className="text-[#534AB7] font-medium hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  )
}
