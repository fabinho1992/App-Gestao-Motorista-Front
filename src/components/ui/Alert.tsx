interface AlertProps {
  children: React.ReactNode
  type: 'success' | 'error' | 'warning'
}

const typeMap = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
}

export default function Alert({ children, type }: AlertProps) {
  return (
    <div className={`px-4 py-3 rounded-lg border text-sm ${typeMap[type]}`}>
      {children}
    </div>
  )
}
