import { formatDate, countNights } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/priceUtils';
import { getImageUrl } from '../../utils/imageUtils';
import { Room } from '../../types';
import { Badge } from '../ui/badge';

interface Props {
  room: Room;
  checkIn: Date;
  checkOut: Date;
  numGuests: number;
  promoCode?: string;
  discountPercent?: number;
  total?: number;
}

export function BookingSummary({ room, checkIn, checkOut, numGuests, promoCode, discountPercent, total }: Props) {
  const nights = countNights(checkIn, checkOut);
  const image = getImageUrl(room.images?.[0]) || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&auto=format&fit=crop';

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <img src={image} alt={`Room ${room.room_number}`} className="w-full h-40 object-cover" />
      <div className="p-5 space-y-3">
        <div>
          <Badge variant="gold">{room.room_type?.name}</Badge>
          <h3 className="font-serif font-semibold text-navy mt-1">Room {room.room_number}</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500 text-xs">Check-in</p>
            <p className="font-medium">{formatDate(checkIn)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Check-out</p>
            <p className="font-medium">{formatDate(checkOut)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Nights</p>
            <p className="font-medium">{nights}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Guests</p>
            <p className="font-medium">{numGuests}</p>
          </div>
        </div>
        {promoCode && discountPercent && (
          <div className="bg-green-50 rounded-lg px-3 py-2 text-sm text-green-700">
            Promo <span className="font-mono font-bold">{promoCode}</span> — {discountPercent}% off
          </div>
        )}
        {total !== undefined && (
          <div className="border-t pt-3 flex justify-between items-center">
            <span className="text-gray-600">Total</span>
            <span className="font-bold text-lg text-navy">{formatCurrency(total)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
