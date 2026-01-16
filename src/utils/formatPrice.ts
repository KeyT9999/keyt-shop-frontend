export function formatPrice(price: number, currency: string = 'đ') {
  return new Intl.NumberFormat('vi-VN').format(price) + ' ' + currency;
}
