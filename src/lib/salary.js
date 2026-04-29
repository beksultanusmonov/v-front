export function parseSalary(value) {
  const digitsOnly = String(value ?? '').replace(/[^\d]/g, '')
  if (!digitsOnly) return null
  const amount = Number(digitsOnly)
  return Number.isFinite(amount) && amount > 0 ? amount : null
}

export function formatSalaryUzs(value) {
  const amount = parseSalary(value)
  if (!amount) return 'Kelishiladi'
  return `${new Intl.NumberFormat('ru-RU').format(amount)} UZS`
}
