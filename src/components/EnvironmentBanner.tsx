import React from 'react'

const env = import.meta.env.VITE_ENVIRONMENT ?? import.meta.env.MODE

const config: Record<string, { label: string; className: string }> = {
  development: {
    label: 'Ambiente de Desenvolvimento',
    className: 'bg-red-600 text-white',
  },
  homolog: {
    label: 'Ambiente de Homologação',
    className: 'bg-yellow-400 text-yellow-900',
  },
}

const EnvironmentBanner: React.FC = () => {
  const current = config[env]
  if (!current) return null

  return (
    <div
      className={`w-full py-1 text-center text-xs font-semibold tracking-wide ${current.className}`}
    >
      {current.label}
    </div>
  )
}

export default EnvironmentBanner
