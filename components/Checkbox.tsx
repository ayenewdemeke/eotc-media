import { InputHTMLAttributes } from 'react'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export default function Checkbox({ label, className = '', ...props }: CheckboxProps) {
  return (
    <label className="flex items-center">
      <input
        type="checkbox"
        className={`rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500 ${className}`}
        {...props}
      />
      {label && <span className="ml-2 text-sm text-gray-600">{label}</span>}
    </label>
  )
}
