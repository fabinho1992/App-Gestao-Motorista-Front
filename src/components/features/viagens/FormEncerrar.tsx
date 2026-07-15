'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { encerrarViagem } from '@/lib/api'
import { formatarNumero, parsearNumero, formatarDinheiro, parsearDinheiro } from '@/lib/masks'

interface FormEncerrarProps {
  viagemId: string
  kmInicial: number
  onSuccess: () => void
  onCancel: () => void
}

export default function FormEncerrar({ viagemId, kmInicial, onSuccess, onCancel }: FormEncerrarProps) {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({
    kmFinal: '',
    gastoCombustivel: '',  // ← guarda só os números ex: "32312" = R$ 323,12
    precoCombustivelLitro: '',
    gastoPedagio: '',
    gastoAlimentacao: '',
    gastoOutros: '',
    obsEncerramento: '',
  })

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setErro('')
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // extrai só números do input de dinheiro
  function onChangeDinheiro(campo: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setErro('')
      const apenasNumeros = e.target.value.replace(/\D/g, '')
      setForm({ ...form, [campo]: apenasNumeros })
    }
  }

  // converte string de centavos para number ex: "32312" → 323.12
  function centavosParaNumero(valor: string): number {
    if (!valor || valor === '') return 0
    return Number(valor) / 100
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.kmFinal || form.kmFinal === '0') {
      setErro('Km final é obrigatório.')
      return
    }
    const kmFinalNumerico = parsearNumero(form.kmFinal)
    if (kmFinalNumerico < kmInicial) {
      setErro(`Km final não pode ser menor que o km inicial (${kmInicial.toLocaleString('pt-BR')} km).`)
      return
    }
    const combustivel = parsearDinheiro(form.gastoCombustivel)
    const pedagio = parsearDinheiro(form.gastoPedagio)
    const alimentacao = parsearDinheiro(form.gastoAlimentacao)
    const outros = parsearDinheiro(form.gastoOutros)
    if (combustivel < 0 || pedagio < 0 || alimentacao < 0 || outros < 0) {
      setErro('Os valores de gastos não podem ser negativos.')
      return
    }
    const precoPorLitro = parsearDinheiro(form.precoCombustivelLitro || '0')
    if (precoPorLitro < 0) {
      setErro('Preço do combustível por litro não pode ser negativo.')
      return
    }
    setLoading(true)
    setErro('')
    try {
      const res = await encerrarViagem(viagemId, {
        kmFinal:          Number(form.kmFinal.replace(/\D/g, '')),
        gastoCombustivel: centavosParaNumero(form.gastoCombustivel),
        precoCombustivelLitro: centavosParaNumero(form.precoCombustivelLitro),
        gastoPedagio:     centavosParaNumero(form.gastoPedagio),
        gastoAlimentacao: centavosParaNumero(form.gastoAlimentacao),
        gastoOutros:      centavosParaNumero(form.gastoOutros),
        obsEncerramento:  form.obsEncerramento,
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

        <Input
          label="Km Final *"
          name="kmFinal"
          type="text"
          inputMode="numeric"
          value={formatarNumero(form.kmFinal)}
          onChange={(e) => { setErro(''); setForm({ ...form, kmFinal: String(parsearNumero(e.target.value)) }) }}
          className="min-h-[44px]"
        />

        <Input
          label="Gasto Combustível (R$)"
          name="gastoCombustivel"
          type="text"
          inputMode="numeric"
          placeholder="0,00"
          value={formatarDinheiro(form.gastoCombustivel)}
          onChange={onChangeDinheiro('gastoCombustivel')}
          className="min-h-[44px]"
        />

        <Input
          label="Preço do combustível por litro (R$)"
          name="precoCombustivelLitro"
          type="text"
          inputMode="decimal"
          placeholder="Ex: 6,50"
          value={formatarDinheiro(form.precoCombustivelLitro)}
          onChange={onChangeDinheiro('precoCombustivelLitro')}
          className="min-h-[44px]"
        />
        <p className="text-xs text-gray-400">
          Informe o preço por litro para calcular a média km/litro
        </p>

        <Input
          label="Gasto Pedágio (R$)"
          name="gastoPedagio"
          type="text"
          inputMode="numeric"
          placeholder="0,00"
          value={formatarDinheiro(form.gastoPedagio)}
          onChange={onChangeDinheiro('gastoPedagio')}
          className="min-h-[44px]"
        />

        <Input
          label="Gasto Alimentação (R$)"
          name="gastoAlimentacao"
          type="text"
          inputMode="numeric"
          placeholder="0,00"
          value={formatarDinheiro(form.gastoAlimentacao)}
          onChange={onChangeDinheiro('gastoAlimentacao')}
          className="min-h-[44px]"
        />

        <Input
          label="Outros gastos (R$)"
          name="gastoOutros"
          type="text"
          inputMode="numeric"
          placeholder="0,00"
          value={formatarDinheiro(form.gastoOutros)}
          onChange={onChangeDinheiro('gastoOutros')}
          className="min-h-[44px]"
        />

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