'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { criarVeiculo } from '@/lib/api'
import BackButton from '@/components/ui/BackButton'
import { formatarNumero, parsearNumero } from '@/lib/masks'

const tiposCombustivel = ['Diesel', 'Gasolina', 'Etanol', 'GNV']

export default function NovoVeiculoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({
    placa: '',
    modelo: '',
    ano: '',
    tipoCombustivel: 'Diesel',
    kmAtual: '',
    kmUltimoOleo: '',
    dataUltimoOleo: '',
    intervaloOleo: 5000,
  })

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setErro('')
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.placa || !form.modelo || !form.ano || !form.kmAtual) {
      setErro('Preencha os campos obrigatórios')
      return
    }
    if (!form.placa || form.placa.trim().length === 0) {
      setErro('Placa é obrigatória.')
      return
    }
    if (!form.modelo || form.modelo.trim().length === 0) {
      setErro('Modelo é obrigatório.')
      return
    }
    const anoAtual = new Date().getFullYear()
    const anoNumerico = Number(form.ano)
    if (!form.ano || anoNumerico < 1950 || anoNumerico > anoAtual + 1) {
      setErro(`Ano inválido. Informe um ano entre 1950 e ${anoAtual + 1}.`)
      return
    }
    const kmAtualNumerico = Number(form.kmAtual)
    if (kmAtualNumerico < 0) {
      setErro('Km atual não pode ser negativo.')
      return
    }
    const kmUltimoOleoNumerico = Number(form.kmUltimoOleo) || 0
    if (kmUltimoOleoNumerico > kmAtualNumerico) {
      setErro('Km do último óleo não pode ser maior que o km atual.')
      return
    }
    if (kmUltimoOleoNumerico < 0) {
      setErro('Km do último óleo não pode ser negativo.')
      return
    }
    if (!form.intervaloOleo || form.intervaloOleo <= 0) {
      setErro('Intervalo de troca de óleo deve ser maior que zero.')
      return
    }
    if (form.dataUltimoOleo) {
      const dataOleo = new Date(form.dataUltimoOleo)
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      if (dataOleo > hoje) {
        setErro('Data do último óleo não pode ser uma data futura.')
        return
      }
    }
    setLoading(true)
    setErro('')
    try {
      const res = await criarVeiculo({
        placa: form.placa,
        modelo: form.modelo,
        ano: Number(form.ano),
        tipoCombustivel: form.tipoCombustivel,
        kmAtual: Number(form.kmAtual),
        kmUltimoOleo: Number(form.kmUltimoOleo) || 0,
        dataUltimoOleo: form.dataUltimoOleo || new Date().toISOString().split('T')[0],
        intervaloOleo: form.intervaloOleo,
      })
      if (!res.isSuccess) {
        setErro(res.message)
        return
      }
      router.push('/veiculos')
    } catch {
      setErro('Erro ao cadastrar veículo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <BackButton />
      <h2 className="text-lg font-bold mb-4">Novo veículo</h2>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <Input label="Placa *" name="placa" placeholder="ABC-1D23" value={form.placa} onChange={onChange} />
        <Input label="Modelo *" name="modelo" placeholder="Modelo do veículo" value={form.modelo} onChange={onChange} />
        <Input label="Ano *" name="ano" type="number" placeholder="2024" value={form.ano} onChange={onChange} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#111827]">Tipo de combustível</label>
          <select
            name="tipoCombustivel"
            value={form.tipoCombustivel}
            onChange={onChange}
            className="px-3 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
          >
            {tiposCombustivel.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <Input label="Km atual *" name="kmAtual" type="text" inputMode="numeric" value={formatarNumero(form.kmAtual)} onChange={(e) => { setErro(''); setForm({ ...form, kmAtual: String(parsearNumero(e.target.value)) }) }} className="min-h-[44px]" />
        <Input label="Km último óleo" name="kmUltimoOleo" type="text" inputMode="numeric" value={formatarNumero(form.kmUltimoOleo)} onChange={(e) => { setErro(''); setForm({ ...form, kmUltimoOleo: String(parsearNumero(e.target.value)) }) }} className="min-h-[44px]" />
        <Input label="Intervalo de troca de óleo (km)" name="intervaloOleo" type="text" inputMode="numeric" value={formatarNumero(form.intervaloOleo)} onChange={(e) => { setErro(''); setForm({ ...form, intervaloOleo: parsearNumero(e.target.value) }) }} className="min-h-[44px]" />

        <Input label="Data último óleo" name="dataUltimoOleo" type="date" value={form.dataUltimoOleo} onChange={onChange} />

        {erro && <p className="text-sm text-red-600">{erro}</p>}

        <Button type="submit" loading={loading} className="w-full mt-2">
          Cadastrar veículo
        </Button>
      </form>
    </div>
  )
}
