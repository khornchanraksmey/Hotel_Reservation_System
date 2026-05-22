import { calcSubtotal, calcDiscount, calcTax, calcTotal, formatCurrency } from '../../utils/priceUtils';
import { countNights } from '../../utils/dateUtils';

interface Props {
  pricePerNight: number;
  checkIn: Date;
  checkOut: Date;
  discountPercent?: number;
  promoCode?: string;
}

export function PriceBreakdown({ pricePerNight, checkIn, checkOut, discountPercent = 0, promoCode }: Props) {
  const nights = countNights(checkIn, checkOut);
  const subtotal = calcSubtotal(pricePerNight, nights);
  const discount = calcDiscount(subtotal, discountPercent);
  const tax = calcTax(subtotal, discount);
  const total = calcTotal(subtotal, discount, tax);

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">{formatCurrency(pricePerNight)} × {nights} night{nights !== 1 ? 's' : ''}</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Discount {promoCode && <span className="font-mono text-xs bg-green-50 px-1 rounded">{promoCode}</span>} ({discountPercent}%)</span>
          <span>-{formatCurrency(discount)}</span>
        </div>
      )}
      <div className="flex justify-between text-gray-600">
        <span>Tax (10%)</span>
        <span>{formatCurrency(tax)}</span>
      </div>
      <hr className="border-gray-200" />
      <div className="flex justify-between font-bold text-navy text-base">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );
}

export { calcSubtotal, calcDiscount, calcTax, calcTotal };
