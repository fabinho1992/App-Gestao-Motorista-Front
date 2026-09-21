'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import RenovarAssinatura from '@/components/features/assinatura/RenovarAssinatura'
import {
  getStatusAssinatura,
  assinaturaBloqueada,
  type AssinaturaStatusDto,
} from '@/lib/api'
import { logout } from '@/lib/auth'

function formatarData(data: string | null): string {
  if (!data) return '—'
  const d = new Date(data)
  if (isNaN(d.getTime())) return data
  return d.toLocaleDateString('pt-BR')
}

export default function AssinaturaVencidaPage() {
  const router = useRouter()
  const [assinatura, setAssinatura] = useState<AssinaturaStatusDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [verificando, setVerificando] = useState(false)

  async function carregarStatus(): Promise<boolean> {
    try {
      const res = await getStatusAssinatura()
      if (res.isSuccess) {
        // assinatura já regularizada — volta para o app
        if (!assinaturaBloqueada(res.data.status)) {
          router.replace('/dashboard')
          return true
        }
        setAssinatura(res.data)
      }
    } catch {
      // mantém a página de bloqueio visível
    }
    return false
  }

  useEffect(() => {
    let ativo = true
    carregarStatus().then((liberada) => {
      if (ativo && !liberada) setLoading(false)
    })
    return () => {
      ativo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function verificarNovamente() {
    setVerificando(true)
    await carregarStatus()
    setVerificando(false)
  }

  const inadimplente = assinatura?.status === 'Inadimplente'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-white">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="#dc2626"
            width={40}
            height={40}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>

          <h1 className="text-2xl font-bold text-[#111827] mt-3 mb-1">
            {inadimplente ? 'Pagamento pendente' : 'Assinatura vencida'}
          </h1>
          <p className="text-sm text-[#6b7280]">
            {inadimplente
              ? 'Não conseguimos confirmar seu último pagamento. Regularize para voltar a usar o Rota Certa.'
              : 'Sua assinatura expirou. Renove para voltar a usar o Rota Certa.'}
          </p>

          {!loading && assinatura?.proximaCobrancaEm && (
            <p className="text-xs text-[#6b7280] mt-2">
              Vencimento em {formatarData(assinatura.proximaCobrancaEm)}.
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#e5e7eb] p-4">
          <RenovarAssinatura label="Renovar assinatura" />
        </div>

        <p className="text-xs text-[#6b7280] text-center mt-4">
          Após o pagamento, a liberação pode levar alguns instantes.
        </p>

        <button
          type="button"
          onClick={verificarNovamente}
          disabled={verificando}
          className="w-full min-h-[48px] mt-4 border border-[#e5e7eb] bg-white text-[#111827] rounded-lg text-sm font-medium hover:bg-[#f9fafb] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {verificando ? 'Verificando...' : 'Já paguei, verificar novamente'}
        </button>

        <button
          type="button"
          onClick={logout}
          className="w-full h-12 mt-3 border border-red-500 text-red-500 bg-transparent rounded-lg text-sm font-medium hover:bg-red-50 cursor-pointer transition-colors"
        >
          Sair da conta
        </button>
      </div>
    </div>
  )
}
