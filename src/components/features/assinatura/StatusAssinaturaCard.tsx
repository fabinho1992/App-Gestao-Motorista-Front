'use client'

import { useState, useEffect, useCallback } from 'react'
import Card from '@/components/ui/Card'
import RenovarAssinatura from './RenovarAssinatura'
import { getStatusAssinatura, type AssinaturaStatusDto } from '@/lib/api'

function formatarData(data: string | null): string {
  if (!data) return '—'
  const d = new Date(data)
  if (isNaN(d.getTime())) return data
  return d.toLocaleDateString('pt-BR')
}

function mensagemStatus(a: AssinaturaStatusDto) {
  const dias = a.diasRestantes
  const plural = dias === 1 ? 'dia' : 'dias'

  switch (a.status) {
    case 'TrialAtivo':
      return {
        titulo: 'Período de teste',
        texto:
          dias > 0
            ? `Faltam ${dias} ${plural} para o fim do seu teste gratuito.`
            : 'Seu teste gratuito terminou.',
        detalhe: `Teste válido até ${formatarData(a.trialFimEm)}.`,
        cor: 'text-[#534AB7]',
        fundo: 'bg-[#f5f3ff] border-[#ddd6fe]',
      }
    case 'Ativa':
      return {
        titulo: 'Assinatura ativa',
        texto:
          dias > 0
            ? `Faltam ${dias} ${plural} para a próxima cobrança.`
            : 'Sua próxima cobrança é hoje.',
        detalhe: `Próxima cobrança em ${formatarData(a.proximaCobrancaEm)}.`,
        cor: 'text-green-700',
        fundo: 'bg-green-50 border-green-200',
      }
    case 'Vencida':
      return {
        titulo: 'Assinatura vencida',
        texto: 'Renove para continuar usando o Rota Certa.',
        detalhe: `Vencida desde ${formatarData(a.proximaCobrancaEm)}.`,
        cor: 'text-red-700',
        fundo: 'bg-red-50 border-red-200',
      }
    case 'Inadimplente':
      return {
        titulo: 'Pagamento pendente',
        texto: 'Não conseguimos confirmar seu último pagamento.',
        detalhe: `Vencimento em ${formatarData(a.proximaCobrancaEm)}.`,
        cor: 'text-red-700',
        fundo: 'bg-red-50 border-red-200',
      }
    default:
      return {
        titulo: 'Assinatura cancelada',
        texto: 'Reative sua assinatura para voltar a usar o app.',
        detalhe: '',
        cor: 'text-gray-700',
        fundo: 'bg-gray-50 border-gray-200',
      }
  }
}

export default function StatusAssinaturaCard() {
  const [assinatura, setAssinatura] = useState<AssinaturaStatusDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [verificando, setVerificando] = useState(false)
  const [pixGerado, setPixGerado] = useState(false)
  const [erro, setErro] = useState('')

  const carregarStatus = useCallback(async (mostrarLoadingPrincipal: boolean) => {
    if (mostrarLoadingPrincipal) setLoading(true)
    try {
      const res = await getStatusAssinatura()
      if (res.isSuccess) {
        setAssinatura(res.data)
        setErro('')
        if (res.data.status === 'Ativa') setPixGerado(false)
      } else {
        setErro(res.message)
      }
    } catch {
      setErro('Erro ao carregar status da assinatura')
    } finally {
      if (mostrarLoadingPrincipal) setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarStatus(true)
  }, [carregarStatus])

  async function onVerificarPagamento() {
    setVerificando(true)
    await carregarStatus(false)
    setVerificando(false)
  }

  if (loading) {
    return <div className="h-32 bg-gray-100 rounded-xl animate-pulse mb-6" />
  }

  if (erro || !assinatura) {
    return (
      <Card className="mb-6">
        <p className="text-sm font-semibold text-[#111827] mb-1">Assinatura</p>
        <p className="text-sm text-red-600">
          {erro || 'Não foi possível carregar o status da assinatura'}
        </p>
      </Card>
    )
  }

  const info = mensagemStatus(assinatura)
  const mostrarBotaoVerificar =
    pixGerado || assinatura.status === 'Vencida' || assinatura.status === 'Inadimplente'

  return (
    <Card className="mb-6">
      <p className="text-sm font-semibold text-[#111827] mb-3">Assinatura</p>

      <div className={`rounded-lg border px-4 py-3 mb-4 ${info.fundo}`}>
        <p className={`text-sm font-semibold ${info.cor}`}>{info.titulo}</p>
        <p className="text-sm text-[#111827] mt-1">{info.texto}</p>
        {info.detalhe && (
          <p className="text-xs text-[#6b7280] mt-1">{info.detalhe}</p>
        )}
      </div>

      <RenovarAssinatura
        modo={assinatura.status === 'TrialAtivo' ? 'checkout' : 'renovar'}
        onPixGerado={() => setPixGerado(true)}
      />

      {mostrarBotaoVerificar && (
        <button
          type="button"
          onClick={onVerificarPagamento}
          disabled={verificando}
          className="w-full min-h-[44px] mt-3 border border-[#e5e7eb] bg-white text-[#534AB7] rounded-lg text-sm font-medium hover:bg-[#f9fafb] cursor-pointer disabled:opacity-50 transition-colors"
        >
          {verificando ? 'Verificando...' : 'Já paguei, verificar status'}
        </button>
      )}
    </Card>
  )
}