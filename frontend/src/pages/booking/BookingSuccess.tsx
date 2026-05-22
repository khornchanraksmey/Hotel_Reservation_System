import { CheckCircle, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBookingStore } from '../../store/bookingStore';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/button';
import { formatDate, countNights } from '../../utils/dateUtils';
import { calcSubtotal, calcDiscount, calcTax, calcTotal, formatCurrency } from '../../utils/priceUtils';
import { toast } from '../../components/ui/toast';
import { useEffect } from 'react';

export default function BookingSuccess() {
  const store = useBookingStore();

  function copyRef() {
    navigator.clipboard.writeText(store.bookingReference);
    toast.success('Reference copied!');
  }

  const nights = store.checkIn && store.checkOut ? countNights(store.checkIn, store.checkOut) : 0;
  const subtotal = store.room ? calcSubtotal(store.room.price_per_night, nights) : 0;
  const discount = calcDiscount(subtotal, store.discountPercent);
  const tax = calcTax(subtotal, discount);
  const total = calcTotal(subtotal, discount, tax);

  // Reset store after viewing
  useEffect(() => {
    return () => {
      // Keep data visible while on this page, clear on unmount
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf8]">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center">
          <div className="mb-6">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
          </div>

          <h1 className="font-serif text-3xl text-navy mb-3">Payment Slip Submitted!</h1>
          <p className="text-gray-500 mb-6">
            Your payment slip has been submitted. We will confirm your booking within 24 hours.
            You'll receive a confirmation email once verified.
          </p>

          {store.bookingReference && (
            <div className="bg-navy/5 border border-navy/20 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-1">Booking Reference</p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-2xl font-bold text-navy">{store.bookingReference}</span>
                <button onClick={copyRef} className="text-gold hover:text-gold-600">
                  <Copy className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {store.room && store.checkIn && store.checkOut && (
            <div className="bg-white rounded-xl shadow-md p-5 text-left mb-8">
              <h3 className="font-semibold text-navy mb-3">Booking Summary</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Room</span>
                  <span className="font-medium">{store.room.room_type?.name} — Room {store.room.room_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-in</span>
                  <span className="font-medium">{formatDate(store.checkIn)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out</span>
                  <span className="font-medium">{formatDate(store.checkOut)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="font-bold text-navy">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment</span>
                  <span className="font-medium">QR Bank Transfer</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/my/bookings">
              <Button variant="navy" className="w-full sm:w-auto">View My Bookings</Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
