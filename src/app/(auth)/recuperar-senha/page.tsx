'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { solicitarResetSenha, alterarSenha } from '@/lib/api'

export default function RecuperarSenhaPage() {
  const router = useRouter()
  const [etapa, setEtapa] = useState<'email' | 'codigo'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  async function onSolicitar(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      setErro('Informe seu e-mail')
      return
    }
    setLoading(true)
    setErro('')
    try {
      const res = await solicitarResetSenha(email)
      if (!res.isSuccess) {
        setErro(res.message)
        return
      }
      setSucesso('Enviamos um código para o seu e-mail')
      setEtapa('codigo')
    } catch {
      setErro('Erro ao solicitar a recuperação de senha')
    } finally {
      setLoading(false)
    }
  }

  async function onAlterar(e: React.FormEvent) {
    e.preventDefault()
    if (!code || !password) {
      setErro('Preencha o código e a nova senha')
      return
    }
    if (password !== confirmacao) {
      setErro('As senhas não conferem')
      return
    }
    setLoading(true)
    setErro('')
    setSucesso('')
    try {
      const res = await alterarSenha({ email, code, password })
      if (!res.isSuccess) {
        setErro(res.message)
        return
      }
      setSucesso('Senha alterada com sucesso. Redirecionando para o login...')
      setTimeout(() => router.push('/login'), 2000)
    } catch {
      setErro('Erro ao alterar a senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="w-full max-w-sm">
        <Link
          href="/login"
          className="flex items-center gap-1 text-sm text-[#6b7280] hover:text-[#111827] mb-6"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Voltar
        </Link>

        <h1 className="text-2xl font-bold text-center text-[#534AB7] mb-1">
          Recuperar senha
        </h1>
        <p className="text-sm text-[#6b7280] text-center mb-8">
          {etapa === 'email'
            ? 'Informe seu e-mail para receber o código de recuperação'
            : `Digite o código enviado para ${email} e escolha uma nova senha`}
        </p>

        {etapa === 'email' ? (
          <form onSubmit={onSolicitar} className="flex flex-col gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {erro && <p className="text-sm text-red-600">{erro}</p>}

            <Button type="submit" loading={loading} className="w-full">
              Enviar código
            </Button>
          </form>
        ) : (
          <form onSubmit={onAlterar} className="flex flex-col gap-4">
            <Input
              label="Código recebido"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Input
              label="Nova senha"
              name="password"
              type="password"
              placeholder="Sua nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirmar nova senha"
              name="confirmacao"
              type="password"
              placeholder="Repita a nova senha"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
            />

            {erro && <p className="text-sm text-red-600">{erro}</p>}
            {sucesso && <p className="text-sm text-green-600">{sucesso}</p>}

            <Button type="submit" loading={loading} className="w-full">
              Alterar senha
            </Button>

            <button
              type="button"
              onClick={() => {
                setEtapa('email')
                setErro('')
                setSucesso('')
              }}
              className="text-sm text-[#534AB7] font-medium hover:underline cursor-pointer border-0 bg-transparent"
            >
              Usar outro e-mail
            </button>
          </form>
        )}

        {etapa === 'email' && sucesso && (
          <p className="text-sm text-green-600 text-center mt-4">{sucesso}</p>
        )}

        <p className="text-sm text-[#6b7280] text-center mt-6">
          Lembrou a senha?{' '}
          <Link
            href="/login"
            className="text-[#534AB7] font-medium hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
