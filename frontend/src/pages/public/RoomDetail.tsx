import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, BedDouble, Maximize2, Star } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { roomService } from '../../services/roomService';
import { RoomGallery } from '../../components/rooms/RoomGallery';
import { AmenityBadge } from '../../components/rooms/AmenityBadge';
import { AvailabilityCalendar } from '../../components/rooms/AvailabilityCalendar';
import { PriceBreakdown } from '../../components/booking/PriceBreakdown';
import { PromoInput } from '../../components/booking/PromoInput';
import { RoomCard } from '../../components/rooms/RoomCard';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { countNights } from '../../utils/dateUtils';
import { calcSubtotal, calcDiscount, calcTax, calcTotal } from '../../utils/priceUtils';
import 'react-day-picker/src/style.css';

export default function RoomDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { setRoom, setDates, setNumGuests, setPromo, clearPromo, checkIn, checkOut, numGuests, promoCode, discountPercent } = useBookingStore();

  const [localCheckIn, setLocalCheckIn] = useState<Date | undefined>(checkIn || undefined);
  const [localCheckOut, setLocalCheckOut] = useState<Date | undefined>(checkOut || undefined);
  const [localGuests, setLocalGuests] = useState(numGuests || 1);
  const [promo, setPromoState] = useState<{ code: string; percent: number } | null>(
    promoCode ? { code: promoCode, percent: discountPercent } : null
  );
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);

  const { data: room, isLoading } = useQuery({
    queryKey: ['room', id],
    queryFn: () => roomService.getRoom(Number(id)),
    enabled: !!id,
  });

  const { data: similar } = useQuery({
    queryKey: ['similar-rooms', room?.room_type_id],
    queryFn: () => roomService.getRooms({ type: room!.room_type_id, per_page: 3 }),
    enabled: !!room,
  });

  const nights = localCheckIn && localCheckOut ? countNights(localCheckIn, localCheckOut) : 0;

  function handleBook() {
    if (!room) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/rooms/${id}` } });
      return;
    }
    if (!localCheckIn || !localCheckOut || nights === 0) {
      alert('Please select check-in and check-out dates.');
      return;
    }
    setRoom(room);
    setDates(localCheckIn, localCheckOut);
    setNumGuests(localGuests);
    if (promo) setPromo(promo.code, promo.percent);
    else clearPromo();
    navigate('/booking/confirm');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-10 w-full">
          <Skeleton className="h-80 w-full rounded-xl mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!room) return null;

  const subtotal = calcSubtotal(room.price_per_night, nights);
  const discount = calcDiscount(subtotal, promo?.percent || 0);
  const tax = calcTax(subtotal, discount);
  const total = calcTotal(subtotal, discount, tax);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf8]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-6">
          <RoomGallery images={room.images} alt={`Room ${room.room_number}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <Badge variant="gold" className="mb-2">{room.room_type?.name}</Badge>
                  <h1 className="font-serif text-3xl text-navy">Room {room.room_number}</h1>
                  <p className="text-gray-500 mt-1">Floor {room.floor}</p>
                </div>
                {room.rating && (
                  <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-amber-700">{room.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                {[
                  { icon: BedDouble, label: room.bed_type },
                  { icon: Users, label: `Up to ${room.max_capacity} guests` },
                  { icon: Maximize2, label: `${room.size_sqm} m²` },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-gray-600 text-sm bg-gray-100 px-3 py-1.5 rounded-full">
                    <Icon className="h-4 w-4 text-navy" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-serif text-xl text-navy mb-3">About This Room</h2>
              <p className="text-gray-600 leading-relaxed">{room.description}</p>
            </div>

            {room.amenities?.length > 0 && (
              <div>
                <h2 className="font-serif text-xl text-navy mb-3">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {room.amenities.map(a => <AmenityBadge key={a.id} name={a.name} icon={a.icon} />)}
                </div>
              </div>
            )}

            <AvailabilityCalendar roomId={room.id} />
          </div>

          {/* Right: Booking panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-navy">${room.price_per_night}</span>
                <span className="text-gray-400 text-sm">/ night</span>
              </div>

              <div className="space-y-3 mb-4">
                {/* Check-in */}
                <div className="relative">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Check-in</label>
                  <button
                    className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm text-left hover:border-navy transition-colors"
                    onClick={() => { setShowCheckIn(!showCheckIn); setShowCheckOut(false); }}
                  >
                    {localCheckIn ? format(localCheckIn, 'dd MMM yyyy') : 'Select date'}
                  </button>
                  {showCheckIn && (
                    <div className="absolute top-full left-0 z-50 bg-white shadow-xl rounded-xl mt-1 border border-gray-100">
                      <DayPicker
                        mode="single"
                        selected={localCheckIn}
                        onSelect={d => { setLocalCheckIn(d); setShowCheckIn(false); }}
                        disabled={{ before: new Date() }}
                      />
                    </div>
                  )}
                </div>

                {/* Check-out */}
                <div className="relative">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Check-out</label>
                  <button
                    className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm text-left hover:border-navy transition-colors"
                    onClick={() => { setShowCheckOut(!showCheckOut); setShowCheckIn(false); }}
                  >
                    {localCheckOut ? format(localCheckOut, 'dd MMM yyyy') : 'Select date'}
                  </button>
                  {showCheckOut && (
                    <div className="absolute top-full left-0 z-50 bg-white shadow-xl rounded-xl mt-1 border border-gray-100">
                      <DayPicker
                        mode="single"
                        selected={localCheckOut}
                        onSelect={d => { setLocalCheckOut(d); setShowCheckOut(false); }}
                        disabled={{ before: localCheckIn || new Date() }}
                      />
                    </div>
                  )}
                </div>

                {/* Guests */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Guests</label>
                  <select
                    value={localGuests}
                    onChange={e => setLocalGuests(Number(e.target.value))}
                    className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                  >
                    {Array.from({ length: room.max_capacity }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n} guest{n !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                {/* Promo */}
                <PromoInput
                  roomId={room.id}
                  applied={promo || undefined}
                  onApply={(code, percent) => setPromoState({ code, percent })}
                  onClear={() => setPromoState(null)}
                />
              </div>

              {nights > 0 && (
                <div className="border-t pt-4 mb-4">
                  <PriceBreakdown
                    pricePerNight={room.price_per_night}
                    checkIn={localCheckIn!}
                    checkOut={localCheckOut!}
                    discountPercent={promo?.percent}
                    promoCode={promo?.code}
                  />
                </div>
              )}

              <Button className="w-full h-12 text-base" onClick={handleBook}>
                {isAuthenticated ? 'Book Now' : 'Sign in to Book'}
              </Button>

              <p className="text-xs text-gray-400 text-center mt-2">You won't be charged yet</p>
            </div>
          </div>
        </div>

        {/* Similar rooms */}
        {similar && similar.data?.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl text-navy mb-6">Similar Rooms</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar.data.filter(r => r.id !== room.id).slice(0, 3).map(r => (
                <RoomCard key={r.id} room={r} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
