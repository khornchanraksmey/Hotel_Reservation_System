import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Download } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { BookingStatusUpdater } from '../../components/admin/BookingStatusUpdater';
import { AdminTable } from '../../components/admin/AdminTable';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/priceUtils';
import { Booking } from '../../types';

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gold'> = {
  pending: 'warning', confirmed: 'info', checked_in: 'gold', checked_out: 'success', cancelled: 'danger',
};
const paymentVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gold'> = {
  pending: 'warning', completed: 'success', failed: 'danger', refunded: 'info',
};

export default function AdminBookings() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [payFilter, setPayFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Booking | null>(null);

  const params: Record<string, unknown> = { page, per_page: 20 };
  if (search) params.search = search;
  if (statusFilter) params.status = statusFilter;
  if (payFilter) params.payment_status = payFilter;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', params],
    queryFn: () => adminService.getAdminBookings(params),
  });

  const columns = [
    { key: 'booking_reference', label: 'Reference', render: (b: Booking) => <span className="font-mono text-xs">{b.booking_reference}</span> },
    { key: 'guest', label: 'Guest', render: (b: Booking) => `${b.guest?.first_name || ''} ${b.guest?.last_name || ''}`.trim() || '—' },
    { key: 'room', label: 'Room', render: (b: Booking) => `Room ${b.room?.room_number || '?'}` },
    { key: 'check_in_date', label: 'Check-in', render: (b: Booking) => formatDate(b.check_in_date) },
    { key: 'check_out_date', label: 'Check-out', render: (b: Booking) => formatDate(b.check_out_date) },
    { key: 'nights', label: 'Nights' },
    { key: 'total_amount', label: 'Total', render: (b: Booking) => formatCurrency(b.total_amount) },
    { key: 'reservation_status', label: 'Status', render: (b: Booking) => <Badge variant={statusVariants[b.reservation_status]}>{b.reservation_status.replace('_', ' ')}</Badge> },
    { key: 'payment_status', label: 'Payment', render: (b: Booking) => <Badge variant={paymentVariants[b.payment_status]}>{b.payment_status}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-navy">Booking Management</h1>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search by ref, guest, or room..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy">
          <option value="">All Statuses</option>
          {['pending','confirmed','checked_in','checked_out','cancelled'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
        <select value={payFilter} onChange={e => setPayFilter(e.target.value)} className="h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy">
          <option value="">All Payments</option>
          {['pending','completed','failed','refunded'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <AdminTable
        columns={columns}
        data={(data?.data || [])}
        loading={isLoading}
        keyField="id"
        onRowClick={(row) => setSelected(row as unknown as Booking)}
      />

      {(data?.total_pages || 1) > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</Button>
          <span className="flex items-center px-4 text-sm">{page} / {data?.total_pages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === data?.total_pages}>Next</Button>
        </div>
      )}

      {/* Detail drawer */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking: {selected?.booking_reference}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-400">Guest</p><p className="font-medium">{selected.guest?.first_name} {selected.guest?.last_name}</p></div>
                <div><p className="text-gray-400">Email</p><p className="font-medium">{selected.guest?.email}</p></div>
                <div><p className="text-gray-400">Room</p><p className="font-medium">Room {selected.room?.room_number} — {selected.room?.room_type?.name}</p></div>
                <div><p className="text-gray-400">Floor</p><p className="font-medium">{selected.room?.floor}</p></div>
                <div><p className="text-gray-400">Check-in</p><p className="font-medium">{formatDate(selected.check_in_date)}</p></div>
                <div><p className="text-gray-400">Check-out</p><p className="font-medium">{formatDate(selected.check_out_date)}</p></div>
                <div><p className="text-gray-400">Nights</p><p className="font-medium">{selected.nights}</p></div>
                <div><p className="text-gray-400">Guests</p><p className="font-medium">{selected.num_guests}</p></div>
                <div><p className="text-gray-400">Total</p><p className="font-bold text-navy">{formatCurrency(selected.total_amount)}</p></div>
                <div><p className="text-gray-400">Payment</p><Badge variant={paymentVariants[selected.payment_status]}>{selected.payment_status}</Badge></div>
                {selected.check_in_actual && <div><p className="text-gray-400">Checked In At</p><p className="font-medium">{formatDateTime(selected.check_in_actual)}</p></div>}
                {selected.check_out_actual && <div><p className="text-gray-400">Checked Out At</p><p className="font-medium">{formatDateTime(selected.check_out_actual)}</p></div>}
                {selected.special_requests && <div className="col-span-2"><p className="text-gray-400">Special Requests</p><p className="font-medium">{selected.special_requests}</p></div>}
                {selected.cancel_reason && <div className="col-span-2"><p className="text-gray-400">Cancel Reason</p><p className="font-medium text-red-600">{selected.cancel_reason}</p></div>}
              </div>

              <div>
                <h3 className="font-semibold text-navy mb-2">Update Status</h3>
                <BookingStatusUpdater
                  booking={selected}
                  onUpdated={() => {
                    qc.invalidateQueries({ queryKey: ['admin-bookings'] });
                    setSelected(null);
                  }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
