'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { encerrarViagem } from '@/lib/api'

interface FormEncerrarProps {
  viagemId: string
  onSuccess: () => void
  onCancel: () => void
}

export default function FormEncerrar({ viagemId, onSuccess, onCancel }: FormEncerrarProps) {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({
    kmFinal: '',
    gastoCombustivel: '',
    gastoPedagio: '',
    gastoAlimentacao: '',
    gastoOutros: '',
    obsEncerramento: '',
  })

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.kmFinal) {
      setErro('Km final é obrigatório')
      return
    }
    setLoading(true)
    setErro('')
    try {
      const res = await encerrarViagem(viagemId, {
        kmFinal: Number(form.kmFinal),
        gastoCombustivel: Number(form.gastoCombustivel) || 0,
        gastoPedagio: Number(form.gastoPedagio) || 0,
        gastoAlimentacao: Number(form.gastoAlimentacao) || 0,
        gastoOutros: Number(form.gastoOutros) || 0,
        obsEncerramento: form.obsEncerramento,
      })
      if (!res.isSuccess) {
        setErro(res.message)
        return
      }
      onSuccess()
    } catch {
      setErro('Erro ao encerrar viagem')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#f9fafb] rounded-xl border border-[#e5e7eb] p-4 mt-4">
      <h3 className="font-semibold text-sm mb-3">Encerrar viagem</h3>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <Input label="Km Final *" name="kmFinal" type="number" value={form.kmFinal} onChange={onChange} />
        <Input label="Gasto Combustível (R$)" name="gastoCombustivel" type="number" step="0.01" value={form.gastoCombustivel} onChange={onChange} />
        <Input label="Gasto Pedágio (R$)" name="gastoPedagio" type="number" step="0.01" value={form.gastoPedagio} onChange={onChange} />
        <Input label="Gasto Alimentação (R$)" name="gastoAlimentacao" type="number" step="0.01" value={form.gastoAlimentacao} onChange={onChange} />
        <Input label="Outros gastos (R$)" name="gastoOutros" type="number" step="0.01" value={form.gastoOutros} onChange={onChange} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#111827]">Observações</label>
          <textarea
            name="obsEncerramento"
            value={form.obsEncerramento}
            onChange={onChange}
            rows={3}
            className="px-3 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
          />
        </div>
        {erro && <p className="text-sm text-red-600">{erro}</p>}
        <div className="flex gap-2">
          <Button type="submit" loading={loading} className="flex-1">Encerrar</Button>
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
