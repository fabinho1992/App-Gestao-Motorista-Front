interface BadgeProps {
  children: React.ReactNode
  color: 'blue' | 'yellow' | 'green' | 'red' | 'gray'
}

const colorMap = {
  blue: 'bg-blue-100 text-blue-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-800',
}

export default function Badge({ children, color }: BadgeProps) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[color]}`}>
      {children}
    </span>
  )
}

export function getStatusViagemColor(status: string): BadgeProps['color'] {
  switch (status) {
    case 'Aberta': return 'blue'
    case 'EmRota': return 'yellow'
    case 'Encerrada': return 'green'
    default: return 'gray'
  }
}

export function getStatusEntregaColor(status: string): BadgeProps['color'] {
  switch (status) {
    case 'Pendente': return 'yellow'
    case 'Entregue': return 'green'
    case 'TentativaFalha': return 'red'
    default: return 'gray'
  }
}
