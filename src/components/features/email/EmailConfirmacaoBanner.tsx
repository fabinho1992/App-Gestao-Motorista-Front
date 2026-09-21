'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { getStatusEmail, solicitarConfirmacaoEmail, confirmarEmail } from '@/lib/api'

export default function EmailConfirmacaoBanner() {
  const [confirmado, setConfirmado] = useState<boolean | null>(null)
  const [etapa, setEtapa] = useState<'inicial' | 'codigo'>('inicial')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    async function load() {
      const res = await getStatusEmail()
      if (res.isSuccess) setConfirmado(res.data.emailConfirmado)
    }
    load()
  }, [])

  async function onEnviarCodigo() {
    setLoading(true)
    setErro('')
    try {
      const res = await solicitarConfirmacaoEmail()
      if (res.isSuccess) {
        setEtapa('codigo')
        setSucesso('Código enviado para o seu e-mail')
      } else {
        setErro(res.message)
      }
    } catch {
      setErro('Erro ao enviar o código')
    } finally {
      setLoading(false)
    }
  }

  async function onConfirmar() {
    setLoading(true)
    setErro('')
    try {
      const res = await confirmarEmail(code)
      if (res.isSuccess) {
        setConfirmado(true)
      } else {
        setErro(res.message)
      }
    } catch {
      setErro('Erro ao confirmar o e-mail')
    } finally {
      setLoading(false)
    }
  }

  if (confirmado === null || confirmado === true) return null

  return (
    <Card className="mb-6 border-yellow-200 bg-yellow-50">
      <p className="text-sm font-semibold text-yellow-800 mb-1">Confirme seu e-mail</p>
      <p className="text-sm text-yellow-700 mb-3">
        Isso garante que você receba lembretes importantes sobre sua assinatura.
      </p>

      {etapa === 'inicial' ? (
        <Button type="button" onClick={onEnviarCodigo} loading={loading} className="w-full">
          Enviar código de confirmação
        </Button>
      ) : (
        <div className="flex flex-col gap-3">
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
          <Button type="button" onClick={onConfirmar} loading={loading} className="w-full">
            Confirmar e-mail
          </Button>
        </div>
      )}

      {erro && <p className="text-sm text-red-600 mt-2">{erro}</p>}
      {sucesso && etapa === 'codigo' && <p className="text-sm text-green-600 mt-2">{sucesso}</p>}
    </Card>
  )
}