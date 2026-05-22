import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/bookingStore';
import { paymentService } from '../../services/paymentService';
import { QRPaymentCard } from '../../components/payment/QRPaymentCard';
import { SlipUploader } from '../../components/payment/SlipUploader';
import { BookingSummary } from '../../components/booking/BookingSummary';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { toast } from '../../components/ui/toast';
import { countNights } from '../../utils/dateUtils';
import { calcSubtotal, calcDiscount, calcTax, calcTotal } from '../../utils/priceUtils';

export default function BookingPayment() {
  const navigate = useNavigate();
  const store = useBookingStore();
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [txRef, setTxRef] = useState('');
  const [loading, setLoading] = useState(false);

  if (!store.room || !store.checkIn || !store.checkOut || !store.bookingId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">No booking found.</p>
            <Button className="mt-4" onClick={() => navigate('/rooms')}>Browse Rooms</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const nights = countNights(store.checkIn, store.checkOut);
  const subtotal = calcSubtotal(store.room.price_per_night, nights);
  const discount = calcDiscount(subtotal, store.discountPercent);
  const tax = calcTax(subtotal, discount);
  const total = calcTotal(subtotal, discount, tax);

  async function handleSubmit() {
    if (!slipFile) {
      toast.error('Please upload your payment slip.');
      return;
    }
    setLoading(true);
    try {
      const payment = await paymentService.createPayment(store.bookingId!, slipFile, txRef || undefined);
      store.setPaymentId(payment.id);
      navigate('/booking/success');
    } catch {
      toast.error('Failed to submit payment. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf8]">
      <Navbar />
      <div className="max-w-5xl mx-auto w-full px-4 py-10">
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500 font-mono">Booking Reference</p>
          <h2 className="font-serif text-3xl text-navy">{store.bookingReference}</h2>
          <p className="text-2xl font-bold text-gold mt-2">Total: ${total.toFixed(2)}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <QRPaymentCard amount={total} reference={store.bookingReference} />

            <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
              <h3 className="font-serif text-lg text-navy">Upload Payment Slip</h3>
              <SlipUploader onFile={setSlipFile} />

              <div>
                <Label>Transaction Reference Number (optional)</Label>
                <Input
                  value={txRef}
                  onChange={e => setTxRef(e.target.value)}
                  className="mt-1"
                  placeholder="From your bank receipt"
                />
              </div>

              <Button
                className="w-full h-11"
                onClick={handleSubmit}
                disabled={loading || !slipFile}
              >
                {loading ? 'Submitting...' : 'Submit Payment Slip'}
              </Button>
            </div>
          </div>

          <div>
            <BookingSummary
              room={store.room}
              checkIn={store.checkIn}
              checkOut={store.checkOut}
              numGuests={store.numGuests}
              promoCode={store.promoCode}
              discountPercent={store.discountPercent}
              total={total}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
