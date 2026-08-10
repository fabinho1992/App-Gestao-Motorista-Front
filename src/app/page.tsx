'use client'

import Link from 'next/link'

const FEATURES = [
  {
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    title: 'Dashboard financeiro',
    desc: 'Ganhos, gastos e lucro do mês em tempo real. Separa o que já foi pago do que está a receber.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20V10" />
        <path d="M10.5 20V4" />
        <path d="M17 20v-7" />
      </svg>
    ),
  },
  {
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    title: 'Controle de viagens',
    desc: 'Registre cada viagem com km, frete e empresa. Encerre com todos os custos detalhados.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3L4 21" />
        <path d="M16 3l4 18" />
        <path d="M12 4v3" />
        <path d="M12 11v2" />
        <path d="M12 17v3" />
      </svg>
    ),
  },
  {
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-700',
    title: 'Entregas com comprovante',
    desc: 'Confirme entregas com foto tirada na hora. Registre falhas com motivo. Tudo salvo na nuvem.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8l-9-5-9 5 9 5 9-5z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </svg>
    ),
  },
  {
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    title: 'Relatório em PDF',
    desc: 'Relatório mensal completo com gastos por categoria. Baixe em PDF para guardar ou imprimir.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2h9l5 5v15H6z" />
        <path d="M15 2v5h5" />
        <path d="M9 13h6" />
        <path d="M9 17h6" />
      </svg>
    ),
  },
  {
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    title: 'Manutenções e óleo',
    desc: 'Alerta automático de troca de óleo. Histórico completo de revisões e manutenções.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a4 4 0 00-5.4 5.4L2.7 19.3a1 1 0 001.4 1.4L11.7 13a4 4 0 005.4-5.4l-2.83 2.83-2-2z" />
      </svg>
    ),
  },
  {
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: 'Controle de pagamentos',
    desc: 'Marque fretes como pago, pendente ou cancelado. Saiba exatamente quem ainda te deve.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
]

const STEPS = [
  {
    n: 1,
    title: 'Crie sua conta',
    desc: 'Cadastre nome, CPF, CNH e senha. Leva menos de 2 minutos e é feito uma única vez.',
  },
  {
    n: 2,
    title: 'Cadastre seu veículo',
    desc: 'Informe placa, modelo, km atual e intervalo de troca de óleo.',
  },
  {
    n: 3,
    title: 'Comece a registrar',
    desc: 'Crie viagens, adicione entregas e confirme com foto. O dashboard atualiza automaticamente.',
  },
]

const GREEN_RULES = [
  {
    title: 'Múltiplas viagens simultâneas',
    desc: 'Pode ter várias viagens abertas, desde que em veículos diferentes.',
  },
  {
    title: 'Histórico preservado',
    desc: 'Mesmo ao excluir um veículo, todos os dados históricos continuam disponíveis.',
  },
]

const RED_RULES = [
  {
    title: 'Um veículo, uma viagem por vez',
    desc: 'Não é possível abrir duas viagens com o mesmo veículo.',
  },
  {
    title: 'Entrega confirmada não pode ser removida',
    desc: 'Somente entregas pendentes podem ser excluídas.',
  },
]

const PWA_STEPS = [
  {
    text: 'Abra no Chrome',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a14 14 0 010 18" />
        <path d="M12 3a14 14 0 000 18" />
      </svg>
    ),
  },
  {
    text: 'Menu ⋮',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="5" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="12" cy="19" r="1.5" />
      </svg>
    ),
  },
  {
    text: 'Instalar e criar atalho',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    ),
  },
]

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-[28px] h-[28px] bg-[#534AB7] rounded-lg flex items-center justify-center flex-shrink-0">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 8h11v8H2z" />
          <path d="M13 11h4l4 3v2h-8z" />
          <circle cx="6.5" cy="18" r="1.5" fill="white" />
          <circle cx="17.5" cy="18" r="1.5" fill="white" />
        </svg>
      </div>
      <span className="text-[16px] font-medium">Rota Certa</span>
    </div>
  )
}

export default function Home() {
  return (
    <div className="bg-white">
      {/* SEÇÃO 1 — NAVBAR */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-3.5 flex justify-between items-center">
        <Logo />
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="min-h-[44px] flex items-center border border-gray-200 rounded-lg px-3.5 py-1.5 text-sm cursor-pointer"
          >
            Entrar
          </Link>
          <Link
            href="/registrar"
            className="min-h-[44px] flex items-center bg-[#534AB7] text-white border-0 rounded-lg px-3.5 py-1.5 text-sm font-medium cursor-pointer"
          >
            Cadastrar
          </Link>
        </div>
      </div>

      {/* SEÇÃO 2 — HERO + SEÇÃO 3 — PREVIEW DO DASHBOARD */}
      <div className="bg-[#534AB7] px-6 pt-12 pb-14 text-center">
        <span className="inline-block bg-white/15 border border-white/25 rounded-full px-3 py-1.5 text-sm text-white">
          ⭐ Gratuito para motoristas autônomos
        </span>

        <h1 className="text-[28px] font-medium text-white leading-tight mt-3.5 mb-3.5">
          Controle total das suas <span className="text-[#AFA9EC]">finanças</span> na estrada
        </h1>

        <p className="text-sm text-white/75 leading-relaxed mb-8 max-w-[320px] mx-auto">
          Registre viagens, acompanhe entregas com foto, controle gastos e saiba exatamente quanto entrou no seu bolso.
        </p>

        <div className="flex flex-col gap-3 max-w-[300px] mx-auto">
          <Link
            href="/registrar"
            className="min-h-[44px] flex items-center justify-center bg-white text-[#534AB7] border-0 rounded-xl px-4 py-[15px] w-full text-base font-medium"
          >
            Criar conta grátis
          </Link>
          <Link
            href="/login"
            className="min-h-[44px] flex items-center justify-center bg-transparent text-white border-[1.5px] border-white/40 rounded-xl px-4 py-[15px] w-full text-base"
          >
            Já tenho conta, entrar
          </Link>
        </div>

        <p className="text-xs text-white/50 mt-4">
          Sem cartão de crédito. Sem mensalidade.
        </p>
      </div>

      <div className="bg-[#534AB7] pb-8 px-0">
        <div className="bg-white mx-6 rounded-2xl overflow-hidden border border-gray-200 shadow-lg -mt-5 relative z-10">
          <div className="bg-[#534AB7] px-4 py-3 flex justify-between items-center">
            <span className="text-sm font-medium text-white">Rota Certa — Julho 2026</span>
            <span className="text-xs text-white/70">← →</span>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3.5">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Ganhos</p>
              <p className="text-base font-semibold text-green-600">R$ 1.300</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Gastos</p>
              <p className="text-base font-semibold text-red-600">R$ 185</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Lucro</p>
              <p className="text-base font-semibold text-green-600">R$ 1.115</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Km</p>
              <p className="text-base font-semibold text-[#534AB7]">300 km</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 mx-3.5 mb-3.5 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Pulman Transportes</p>
              <p className="text-xs text-gray-500">Viagem em andamento · 2 entregas</p>
            </div>
            <span className="bg-yellow-100 text-yellow-800 text-xs rounded-full px-2 py-1">
              Em rota
            </span>
          </div>
        </div>
      </div>

      {/* SEÇÃO 4 — FUNCIONALIDADES */}
      <div className="px-6 py-10">
        <p className="text-xs font-medium text-purple-700 uppercase tracking-wide mb-2">
          Funcionalidades
        </p>
        <h2 className="text-[22px] font-medium mb-2.5">
          Tudo que você precisa para gerenciar seu trabalho
        </h2>
        <p className="text-sm text-gray-500 mb-7">
          Do controle de viagens ao relatório mensal, tudo no celular, simples e rápido.
        </p>

        <div className="flex flex-col gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="border border-gray-100 rounded-xl p-[18px] flex gap-4 items-start">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${f.iconBg} ${f.iconColor}`}>
                {f.icon}
              </div>
              <div>
                <p className="font-medium mb-1">{f.title}</p>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEÇÃO 5 — COMO FUNCIONA */}
      <div className="px-6 py-10 bg-gray-50">
        <p className="text-xs font-medium text-purple-700 uppercase tracking-wide mb-2">
          Como funciona
        </p>
        <h2 className="text-[22px] font-medium mb-6">Comece em 3 passos</h2>

        <div className="flex flex-col">
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              className={`flex gap-4 items-start py-5 ${i < STEPS.length - 1 ? 'border-b border-gray-200' : ''}`}
            >
              <div className="w-8 h-8 rounded-full bg-[#534AB7] text-white flex items-center justify-center flex-shrink-0 font-medium text-sm">
                {step.n}
              </div>
              <div>
                <p className="font-medium mb-1">{step.title}</p>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEÇÃO 6 — REGRAS IMPORTANTES */}
      <div className="px-6 py-10">
        <p className="text-xs font-medium text-purple-700 uppercase tracking-wide mb-2">
          Regras importantes
        </p>
        <h2 className="text-[22px] font-medium mb-5">Entenda como funciona</h2>

        <div className="flex flex-col gap-3">
          {GREEN_RULES.map((rule) => (
            <div key={rule.title} className="bg-green-50 border border-green-200 rounded-xl p-3 flex gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 flex-shrink-0 mt-0.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <div>
                <p className="font-medium text-sm mb-1">{rule.title}</p>
                <p className="text-sm text-gray-600">{rule.desc}</p>
              </div>
            </div>
          ))}
          {RED_RULES.map((rule) => (
            <div key={rule.title} className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 flex-shrink-0 mt-0.5">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
              <div>
                <p className="font-medium text-sm mb-1">{rule.title}</p>
                <p className="text-sm text-gray-600">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEÇÃO 7 — INSTALAR COMO PWA */}
      <div className="px-6 py-8 bg-gray-50 text-center">
        <p className="text-xs font-medium text-purple-700 uppercase tracking-wide mb-2">
          PWA
        </p>
        <h2 className="text-[22px] font-medium mb-2">Instale como app no celular</h2>
        <p className="text-sm text-gray-500 mb-5">
          Sem baixar da loja. Abre direto da tela inicial.
        </p>

        <div className="flex justify-center gap-2 flex-wrap">
          {PWA_STEPS.map((chip) => (
            <div
              key={chip.text}
              className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-500 flex items-center gap-2"
            >
              {chip.icon}
              {chip.text}
            </div>
          ))}
        </div>
      </div>

      {/* SEÇÃO 8 — CTA FINAL */}
      <div className="bg-[#534AB7] px-6 py-12 text-center">
        <h2 className="text-2xl font-medium text-white mb-2.5">
          Pronto para ter controle das suas finanças?
        </h2>
        <p className="text-sm text-white/75 mb-7">
          Junte-se aos motoristas que já usam o Rota Certa para saber exatamente quanto ganham e gastam.
        </p>

        <div className="flex flex-col gap-3 max-w-[300px] mx-auto">
          <Link
            href="/registrar"
            className="min-h-[44px] flex items-center justify-center bg-white text-[#534AB7] border-0 rounded-xl px-4 py-[15px] w-full text-base font-medium"
          >
            Criar conta grátis
          </Link>
          <Link
            href="/login"
            className="min-h-[44px] flex items-center justify-center bg-transparent text-white border-[1.5px] border-white/40 rounded-xl px-4 py-[15px] w-full text-base"
          >
            Já tenho conta
          </Link>
        </div>
      </div>

      {/* SEÇÃO 9 — FOOTER */}
      <div className="px-6 py-6 border-t border-gray-100">
        <div className="mb-3">
          <Logo />
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Gestão financeira simples e eficiente para motoristas autônomos. Controle suas viagens, entregas e gastos direto do celular.
        </p>
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-400">
            © 2026 Rota Certa. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
