export const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)

export const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

export const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export const formatTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export const statusLabel = (status) => {
  const map = {
    agendado: { label: 'Agendado', cls: 'badge-blue' },
    confirmado: { label: 'Confirmado', cls: 'badge-green' },
    concluido: { label: 'Concluído', cls: 'badge-gray' },
    cancelado: { label: 'Cancelado', cls: 'badge-red' },
  }
  return map[status] || { label: status, cls: 'badge-gray' }
}

export const pagamentoLabel = (p) => {
  const map = { pix: 'PIX', dinheiro: 'Dinheiro', credito: 'Crédito', debito: 'Débito' }
  return map[p] || p || '-'
}
