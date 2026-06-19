interface CardProps {
  children: React.ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border border-[#e5e7eb] p-4 ${className}`}>
      {children}
    </div>
  )
}
