import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Skeleton } from '../../components/ui/skeleton';
import { formatCurrency } from '../../utils/priceUtils';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

type Preset = 'week' | 'month' | 'last_month' | 'custom';

function toISO(d: Date) { return format(d, 'yyyy-MM-dd'); }

export default function AdminReports() {
  const today = new Date();
  const [preset, setPreset] = useState<Preset>('month');
  const [customFrom, setCustomFrom] = useState(toISO(subDays(today, 30)));
  const [customTo, setCustomTo] = useState(toISO(today));

  function getRange(): { from: string; to: string } {
    if (preset === 'week') return { from: toISO(subDays(today, 7)), to: toISO(today) };
    if (preset === 'month') return { from: toISO(startOfMonth(today)), to: toISO(today) };
    if (preset === 'last_month') {
      const last = subMonths(today, 1);
      return { from: toISO(startOfMonth(last)), to: toISO(endOfMonth(last)) };
    }
    return { from: customFrom, to: customTo };
  }

  const range = getRange();

  const { data: report, isLoading } = useQuery({
    queryKey: ['admin-reports', range],
    queryFn: () => adminService.getReports(range),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-navy">Reports & Analytics</h1>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Date range selector */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-end gap-4">
        <div className="flex gap-2">
          {([['week', 'This Week'], ['month', 'This Month'], ['last_month', 'Last Month'], ['custom', 'Custom']] as [Preset, string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setPreset(val)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${preset === val ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {label}
            </button>
          ))}
        </div>
        {preset === 'custom' && (
          <div className="flex items-end gap-3">
            <div><Label className="text-xs">From</Label><Input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="mt-1 h-9 text-sm" /></div>
            <div><Label className="text-xs">To</Label><Input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="mt-1 h-9 text-sm" /></div>
          </div>
        )}
      </div>

      {/* KPI summary */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4"><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-24 rounded-xl" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Revenue', value: formatCurrency(report?.total_revenue || 0) },
            { label: 'Total Bookings', value: report?.total_bookings || 0 },
            { label: 'Avg Booking Value', value: formatCurrency(report?.average_booking_value || 0) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl shadow-md p-5">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-navy mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-semibold text-navy mb-4">Revenue by Day</h2>
          {report?.revenue_by_day ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={report.revenue_by_day}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Line type="monotone" dataKey="revenue" stroke="#c9a84c" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <Skeleton className="h-52 w-full" />}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-semibold text-navy mb-4">Revenue by Room Type</h2>
          {report?.revenue_by_type ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={report.revenue_by_type}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="room_type" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Bar dataKey="revenue" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Skeleton className="h-52 w-full" />}
        </div>
      </div>

      {/* Occupancy + most booked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-semibold text-navy mb-4">Occupancy by Room Type</h2>
          <div className="space-y-3">
            {(report?.occupancy_by_type || []).map(o => (
              <div key={o.room_type}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{o.room_type}</span>
                  <span className="font-semibold">{o.rate}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${o.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-semibold text-navy mb-4">Most Booked Rooms</h2>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-gray-500 text-xs"><th className="pb-2 text-left">Room</th><th className="pb-2 text-left">Type</th><th className="pb-2 text-right">Bookings</th></tr></thead>
            <tbody>
              {(report?.most_booked_rooms || []).map(r => (
                <tr key={r.room_number} className="border-b border-gray-50">
                  <td className="py-2">{r.room_number}</td>
                  <td className="py-2 text-gray-500">{r.room_type}</td>
                  <td className="py-2 text-right font-semibold">{r.bookings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promo report */}
      {report?.promo_usage && report.promo_usage.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-semibold text-navy mb-4">Promotions Usage</h2>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-gray-500 text-xs"><th className="pb-2 text-left">Code</th><th className="pb-2 text-right">Times Used</th><th className="pb-2 text-right">Discount Given</th></tr></thead>
            <tbody>
              {report.promo_usage.map(p => (
                <tr key={p.promo_code} className="border-b border-gray-50">
                  <td className="py-2 font-mono font-bold">{p.promo_code}</td>
                  <td className="py-2 text-right">{p.times_used}</td>
                  <td className="py-2 text-right text-green-600">-{formatCurrency(p.discount_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
