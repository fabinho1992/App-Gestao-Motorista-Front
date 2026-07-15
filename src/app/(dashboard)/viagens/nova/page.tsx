"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { criarViagem, getVeiculos } from "@/lib/api";
import type { Veiculo } from "@/lib/api";
import BackButton from "@/components/ui/BackButton";
import {
  formatarNumero,
  parsearNumero,
  formatarDinheiro,
  parsearDinheiro,
} from "@/lib/masks";

const formasPagamento = ["Dinheiro", "Pix", "Transferencia", "Boleto"];

export default function NovaViagemPage() {
  const router = useRouter();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingVeiculos, setLoadingVeiculos] = useState(true);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({
    veiculoId: "",
    origem: "",
    empresaContratante: "",
    kmInicial: "",
    valorFrete: "",
    formaPagamento: "Pix",
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await getVeiculos();
        if (res.isSuccess) {
          setVeiculos(res.data);
          if (res.data.length > 0) {
            setForm((f) => ({
              ...f,
              veiculoId: res.data[0].id,
              kmInicial: String(res.data[0].kmAtual),
            }));
          }
        }
      } catch {
        // ignore
      } finally {
        setLoadingVeiculos(false);
      }
    }
    load();
  }, []);

  function onChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setErro("");
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function onChangeVeiculo(e: React.ChangeEvent<HTMLSelectElement>) {
    setErro("");
    const veiculoSelecionado = veiculos.find((v) => v.id === e.target.value);
    setForm({
      ...form,
      veiculoId: e.target.value,
      kmInicial: veiculoSelecionado
        ? String(veiculoSelecionado.kmAtual)
        : form.kmInicial,
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.veiculoId ||
      !form.origem ||
      !form.empresaContratante ||
      !form.kmInicial ||
      !form.valorFrete
    ) {
      setErro("Preencha todos os campos obrigatórios");
      return;
    }
    if (!form.veiculoId) {
      setErro("Selecione um veículo.");
      return;
    }
    if (!form.origem || form.origem.trim().length === 0) {
      setErro("Origem é obrigatória.");
      return;
    }
    if (!form.empresaContratante || form.empresaContratante.trim().length === 0) {
      setErro("Empresa contratante é obrigatória.");
      return;
    }
    const kmInicialNumerico = Number(form.kmInicial);
    if (kmInicialNumerico < 0) {
      setErro("Km inicial não pode ser negativo.");
      return;
    }
    const valorFreteNumerico = parsearDinheiro(form.valorFrete);
    if (!valorFreteNumerico || valorFreteNumerico <= 0) {
      setErro("Valor do frete deve ser maior que zero.");
      return;
    }
    setLoading(true);
    setErro("");
    try {
      const res = await criarViagem({
        veiculoId: form.veiculoId,
        origem: form.origem,
        empresaContratante: form.empresaContratante,
        kmInicial: Number(form.kmInicial),
        valorFrete: Number(form.valorFrete) / 100,  // ← divide por 100
        formaPagamento: form.formaPagamento,
      });
      if (!res.isSuccess) {
        setErro(res.message);
        return;
      }
      router.push("/dashboard");
    } catch {
      setErro("Erro ao criar viagem");
    } finally {
      setLoading(false);
    }
  }

  if (loadingVeiculos) {
    return (
      <p className="text-sm text-[#6b7280] text-center py-8">Carregando...</p>
    );
  }

  const veiculoAtual = veiculos.find((v) => v.id === form.veiculoId);

  return (
    <div>
      <BackButton href="/viagens" label="Viagens" />
      <h2 className="text-lg font-bold mb-4">Nova viagem</h2>

      {veiculos.length === 0 && (
        <p className="text-sm text-yellow-700 bg-yellow-50 px-4 py-3 rounded-lg mb-4">
          Cadastre um veículo antes de abrir uma viagem.
        </p>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#111827]">
            Veículo *
          </label>
          <select
            name="veiculoId"
            value={form.veiculoId}
            onChange={onChangeVeiculo}
            className="px-3 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
          >
            {veiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.placa} - {v.modelo}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Origem *"
          name="origem"
          placeholder="Cidade de origem"
          value={form.origem}
          onChange={onChange}
        />
        <Input
          label="Empresa contratante *"
          name="empresaContratante"
          placeholder="Nome da empresa"
          value={form.empresaContratante}
          onChange={onChange}
        />
        <Input
          label="Km inicial *"
          name="kmInicial"
          type="text"
          inputMode="numeric"
          value={formatarNumero(form.kmInicial)}
          onChange={(e) =>
            setForm({
              ...form,
              kmInicial: String(parsearNumero(e.target.value)),
            })
          }
          readOnly={true}
          className="min-h-[44px] bg-gray-100 cursor-not-allowed text-gray-500"
        />
        <p className="text-xs text-gray-400 -mt-1">
          Preenchido automaticamente com o km atual do veículo
        </p>
        {veiculoAtual && (
          <p className="text-xs text-gray-500 -mt-1">
            Km atual do veículo: {veiculoAtual.kmAtual.toLocaleString("pt-BR")} km
          </p>
        )}
        <Input
          label="Valor do frete (R$) *"
          name="valorFrete"
          type="text"
          inputMode="numeric"
          placeholder="0,00"
          value={formatarDinheiro(form.valorFrete)}
          onChange={(e) => {
            setErro("");
            // extrai só os números do que foi digitado
            const apenasNumeros = e.target.value.replace(/\D/g, "");
            setForm({ ...form, valorFrete: apenasNumeros });
          }}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#111827]">
            Forma de pagamento
          </label>
          <select
            name="formaPagamento"
            value={form.formaPagamento}
            onChange={onChange}
            className="px-3 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
          >
            {formasPagamento.map((fp) => (
              <option key={fp} value={fp}>
                {fp}
              </option>
            ))}
          </select>
        </div>

        {erro && <p className="text-sm text-red-600">{erro}</p>}

        <Button
          type="submit"
          loading={loading}
          className="w-full mt-2"
          disabled={veiculos.length === 0}
        >
          Abrir viagem
        </Button>
      </form>
    </div>
  );
}
