import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '../../services/paymentService';
import { PaymentStatusBadge } from '../../components/payment/PaymentStatusBadge';
import { SlipViewer } from '../../components/admin/SlipViewer';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/priceUtils';
import { CreditCard } from 'lucide-react';

export default function MyPayments() {
  const [viewSlip, setViewSlip] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-payments'],
    queryFn: paymentService.getMyPayments,
  });

  const payments = data?.data || [];

  return (
    <div>
      <h1 className="font-serif text-2xl text-navy mb-6">Payment History</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CreditCard className="h-14 w-14 mx-auto mb-3 opacity-40" />
          <p>No payments yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map(payment => (
            <div key={payment.id} className="bg-white rounded-xl shadow-sm p-5 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-mono">#{payment.booking?.booking_reference}</p>
                <p className="font-medium text-navy">{payment.booking?.room?.room_type?.name} — Room {payment.booking?.room?.room_number}</p>
                <p className="text-xs text-gray-500 mt-1">{formatDateTime(payment.submitted_at)}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="font-bold text-navy">{formatCurrency(payment.amount)}</p>
                <PaymentStatusBadge status={payment.status} />
              </div>
              {payment.slip_image && (
                <Button size="sm" variant="outline" onClick={() => setViewSlip(payment.slip_image!)}>
                  View Slip
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <SlipViewer url={viewSlip} onClose={() => setViewSlip(null)} />
    </div>
  );
}
