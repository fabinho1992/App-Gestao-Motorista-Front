import Card from '@/components/ui/Card'

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
}

export default function MetricCard({ title, value, subtitle }: MetricCardProps) {
  return (
    <Card>
      <p className="text-xs text-[#6b7280] mb-1">{title}</p>
      <p className="text-xl font-bold text-[#111827]">{value}</p>
      {subtitle && <p className="text-xs text-[#6b7280] mt-0.5">{subtitle}</p>}
    </Card>
  )
}
