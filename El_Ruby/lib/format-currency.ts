export function formatCurrency(amount: number, locale = "en-EG") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EGP",
  }).format(amount)
}

export default formatCurrency
