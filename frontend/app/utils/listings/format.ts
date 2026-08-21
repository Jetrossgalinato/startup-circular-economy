export function formatPeso(amount: number | null | undefined) {
  if (amount == null || Number.isNaN(amount)) {
    return '—'
  }
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatRatePerKg(rate: number | null | undefined) {
  if (rate == null || Number.isNaN(rate)) {
    return '—'
  }
  return `${formatPeso(rate)} / kg`
}
