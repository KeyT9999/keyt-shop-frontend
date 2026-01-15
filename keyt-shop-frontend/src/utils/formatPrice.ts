export function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('vi-VN').format(price) + ' ' + currency;
}
