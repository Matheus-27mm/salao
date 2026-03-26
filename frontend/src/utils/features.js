const mvpEnv = (import.meta.env.VITE_MVP_MODE ?? 'true').toLowerCase()

export const MVP_MODE = mvpEnv === 'true'
export const SHOW_ESTOQUE = !MVP_MODE
export const SHOW_RELATORIOS = !MVP_MODE
