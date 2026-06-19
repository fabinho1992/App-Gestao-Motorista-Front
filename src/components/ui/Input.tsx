'use client'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-[#111827]">{label}</label>
      <input
        className={`px-3 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-[#111827] text-sm placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
