import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { adminService } from '../../services/adminService';
import { toast } from '../ui/toast';
import { Booking } from '../../types';

interface Props {
  booking: Booking;
  onUpdated: () => void;
}

const transitions: Record<string, { label: string; next: string }[]> = {
  pending: [{ label: 'Confirm Booking', next: 'confirmed' }],
  confirmed: [
    { label: 'Check In', next: 'checked_in' },
    { label: 'Cancel', next: 'cancelled' },
  ],
  checked_in: [{ label: 'Check Out', next: 'checked_out' }],
  checked_out: [],
  cancelled: [],
};

export function BookingStatusUpdater({ booking, onUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);

  const actions = transitions[booking.reservation_status] || [];

  async function handleAction(next: string) {
    if (next === 'cancelled') { setShowCancel(true); return; }
    setLoading(true);
    try {
      await adminService.updateBookingStatus(booking.id, { status: next });
      toast.success('Status updated!');
      onUpdated();
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    setLoading(true);
    try {
      await adminService.updateBookingStatus(booking.id, { status: 'cancelled', cancel_reason: cancelReason });
      toast.success('Booking cancelled.');
      onUpdated();
      setShowCancel(false);
    } catch {
      toast.error('Failed to cancel booking.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {actions.map(a => (
          <Button
            key={a.next}
            size="sm"
            variant={a.next === 'cancelled' ? 'destructive' : 'default'}
            onClick={() => handleAction(a.next)}
            disabled={loading}
          >
            {a.label}
          </Button>
        ))}
      </div>
      {showCancel && (
        <div className="space-y-2 p-3 bg-red-50 rounded-lg">
          <Textarea
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation..."
            rows={2}
          />
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={handleCancel} disabled={loading}>Confirm Cancel</Button>
            <Button size="sm" variant="outline" onClick={() => setShowCancel(false)}>Back</Button>
          </div>
        </div>
      )}
    </div>
  );
}
