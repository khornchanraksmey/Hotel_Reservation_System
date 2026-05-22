const TAX_RATE = 0.10;

export function calcSubtotal(pricePerNight: number, nights: number): number {
  return pricePerNight * nights;
}

export function calcDiscount(subtotal: number, discountPercent: number): number {
  return subtotal * (discountPercent / 100);
}

export function calcTax(subtotal: number, discount: number): number {
  return (subtotal - discount) * TAX_RATE;
}

export function calcTotal(subtotal: number, discount: number, tax: number): number {
  return subtotal - discount + tax;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}
