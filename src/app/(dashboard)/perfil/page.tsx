'use client'

import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { getMotorista, atualizarMotorista } from '@/lib/api'
import { logout } from '@/lib/auth'

export default function PerfilPage() {
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
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
            cpf: m.cpf,
            email: m.email,
            telefone: m.telefone,
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
        <Input label="CPF *" name="cpf" type="text" value={form.cpf} onChange={onChange} />
        <Input label="Telefone *" name="telefone" type="text" value={form.telefone} onChange={onChange} />
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
    </div>
  )
}
