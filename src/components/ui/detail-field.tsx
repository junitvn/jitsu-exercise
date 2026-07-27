import type { ReactNode } from 'react'

interface DetailFieldProps {
  label: string
  value: ReactNode
}

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}

export { DetailField }
