'use client'

import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { getMotorista, atualizarMotorista, resetarDados } from '@/lib/api'
import { logout } from '@/lib/auth'
import { formatarCpf, parsearCpf, formatarTelefone, parsearTelefone } from '@/lib/masks'

export default function PerfilPage() {
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [etapaReset, setEtapaReset] = useState<'idle' | 'aviso' | 'confirmacao'>('idle')
  const [resetando, setResetando] = useState(false)
  const [erroReset, setErroReset] = useState('')
  const [textoConfirmacao, setTextoConfirmacao] = useState('')

  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    cnh: '',
    vencimentoCnh: '',
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await getMotorista()
        if (res.isSuccess) {
          const m = res.data
          setForm({
            nome: m.nome,
            cpf: parsearCpf(m.cpf),
            email: m.email,
            telefone: parsearTelefone(m.telefone),
            cnh: m.cnh,
            vencimentoCnh: m.vencimentoCnh ? m.vencimentoCnh.split('T')[0] : '',
          })
        } else {
          setErro(res.message)
        }
      } catch {
        setErro('Erro ao carregar perfil')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleResetar() {
    if (textoConfirmacao !== 'RESETAR') {
      setErroReset('Digite RESETAR para confirmar')
      return
    }
    setResetando(true)
    setErroReset('')
    try {
      const res = await resetarDados()
      if (res.isSuccess) {
        logout()
      } else {
        setErroReset(res.message)
        setEtapaReset('idle')
      }
    } catch {
      setErroReset('Erro ao resetar dados')
      setEtapaReset('idle')
    } finally {
      setResetando(false)
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    setSucesso('')
    try {
      const res = await atualizarMotorista({
        nome: form.nome,
        cpf: form.cpf,
        email: form.email,
        telefone: form.telefone,
        cnh: form.cnh,
        vencimentoCnh: form.vencimentoCnh,
      })
      if (res.isSuccess) {
        setSucesso('Alterações salvas com sucesso')
        setTimeout(() => setSucesso(''), 3000)
      } else {
        setErro(res.message)
      }
    } catch {
      setErro('Erro ao salvar alterações')
    } finally {
      setSalvando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-32 bg-gray-100 rounded animate-pulse" />
        <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-[#111827] mb-6">Meu Perfil</h1>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <Input label="Nome *" name="nome" type="text" value={form.nome} onChange={onChange} />
        <Input label="Email *" name="email" type="email" value={form.email} onChange={onChange} />
        <Input label="CPF *" name="cpf" type="text" inputMode="numeric" value={formatarCpf(form.cpf)} onChange={(e) => setForm({ ...form, cpf: parsearCpf(e.target.value) })} />
        <Input label="Telefone *" name="telefone" type="text" inputMode="numeric" value={formatarTelefone(form.telefone)} onChange={(e) => setForm({ ...form, telefone: parsearTelefone(e.target.value) })} />
        <Input label="CNH *" name="cnh" type="text" value={form.cnh} onChange={onChange} />
        <Input label="Vencimento CNH *" name="vencimentoCnh" type="date" value={form.vencimentoCnh} onChange={onChange} />

        {erro && <p className="text-sm text-red-600">{erro}</p>}
        {sucesso && <p className="text-sm text-green-600">{sucesso}</p>}

        <Button type="submit" loading={salvando} className="w-full min-h-[48px] mt-4">
          Salvar alterações
        </Button>
      </form>

      <div className="mt-8 border-t border-gray-200 mb-6" />
      <button
        type="button"
        onClick={logout}
        className="w-full h-12 border border-red-500 text-red-500 bg-transparent rounded-lg text-sm font-medium hover:bg-red-50 cursor-pointer transition-colors"
      >
        Sair da conta
      </button>

      <div className="mt-8 border-t border-gray-200 mb-6" />

      <p className="text-sm font-semibold text-red-600 mb-2">Zona de perigo</p>
      <p className="text-xs text-gray-500 mb-3">
        Esta ação irá deletar permanentemente todas as suas viagens, entregas e veículos cadastrados. Seus dados de acesso e perfil serão mantidos.
      </p>

      {etapaReset === 'idle' && (
        <button
          type="button"
          onClick={() => setEtapaReset('aviso')}
          className="w-full h-12 border border-red-300 text-red-500 bg-transparent rounded-lg cursor-pointer hover:bg-red-50 transition-colors font-medium text-sm"
        >
          Resetar todos os dados
        </button>
      )}

      {etapaReset === 'aviso' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#dc2626" width={24} height={24}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-base font-bold text-red-700 mt-2">Atenção — ação irreversível</p>
          <ul className="text-sm text-red-700 mt-3 mb-4 flex flex-col gap-1 list-disc list-inside">
            <li>Todas as viagens serão deletadas permanentemente</li>
            <li>Todas as entregas e comprovantes serão deletados</li>
            <li>Todos os veículos serão deletados</li>
            <li>Esta ação NÃO pode ser desfeita</li>
            <li>Você será desconectado após o reset</li>
            <li>Seus dados de acesso e perfil serão mantidos</li>
          </ul>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEtapaReset('idle')}
              className="flex-1 h-11 border border-gray-300 bg-white text-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 text-sm"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => setEtapaReset('confirmacao')}
              className="flex-1 h-11 bg-red-500 text-white rounded-lg cursor-pointer hover:bg-red-600 text-sm font-medium"
            >
              Entendo os riscos, continuar
            </button>
          </div>
        </div>
      )}

      {etapaReset === 'confirmacao' && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4">
          <p className="text-sm text-red-700 font-medium mb-3">
            Para confirmar, digite <strong>RESETAR</strong> no campo abaixo:
          </p>
          <input
            type="text"
            placeholder="Digite RESETAR"
            value={textoConfirmacao}
            onChange={(e) => setTextoConfirmacao(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-red-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-3"
          />
          {erroReset && <p className="text-sm text-red-600 mb-2">{erroReset}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setEtapaReset('idle'); setTextoConfirmacao('') }}
              className="flex-1 h-11 border border-gray-300 bg-white text-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 text-sm"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleResetar}
              disabled={resetando || textoConfirmacao !== 'RESETAR'}
              className={`flex-1 h-11 rounded-lg text-white font-medium text-sm ${
                textoConfirmacao === 'RESETAR'
                  ? 'bg-red-500 hover:bg-red-600 cursor-pointer'
                  : 'bg-red-200 cursor-not-allowed'
              }`}
            >
              {resetando ? 'Resetando...' : 'Confirmar reset'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
