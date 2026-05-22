import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarCheck, DollarSign, BedDouble, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { StatCard } from '../../components/admin/StatCard';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { formatCurrency } from '../../utils/priceUtils';
import { formatDate } from '../../utils/dateUtils';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: adminService.getDashboardStats,
  });

  const { data: revenueChart } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: adminService.getRevenueChart,
  });

  const { data: bookingsByType } = useQuery({
    queryKey: ['bookings-by-type'],
    queryFn: adminService.getBookingsByType,
  });

  const { data: recentBookings } = useQuery({
    queryKey: ['recent-bookings'],
    queryFn: adminService.getRecentBookings,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-navy">Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/admin/rooms">
            <Button size="sm" className="flex items-center gap-1.5"><Plus className="h-4 w-4" /> Add Room</Button>
          </Link>
          <Link to="/admin/promotions">
            <Button size="sm" variant="outline">Add Promotion</Button>
          </Link>
          <Link to="/admin/payments">
            <Button size="sm" variant="outline">Pending Payments</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Bookings Today" value={stats?.bookings_today ?? 0} icon={CalendarCheck} color="navy" />
          <StatCard title="Revenue This Month" value={formatCurrency(stats?.revenue_this_month ?? 0)} icon={DollarSign} color="gold" />
          <StatCard title="Occupancy Rate" value={`${stats?.occupancy_rate ?? 0}%`} icon={TrendingUp} color="green" />
          <StatCard title="Available Rooms" value={stats?.available_rooms ?? 0} icon={BedDouble} color="blue" />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-semibold text-navy mb-4">Revenue (Last 30 Days)</h2>
          {revenueChart ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueChart}>
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
          <h2 className="font-semibold text-navy mb-4">Bookings by Room Type</h2>
          {bookingsByType ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bookingsByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="room_type" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Skeleton className="h-52 w-full" />}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-navy">Recent Bookings</h2>
          <Link to="/admin/bookings" className="text-sm text-navy hover:text-gold">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">Reference</th>
                <th className="pb-3 pr-4">Guest</th>
                <th className="pb-3 pr-4">Room</th>
                <th className="pb-3 pr-4">Check-in</th>
                <th className="pb-3 pr-4">Total</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {(recentBookings || []).map(b => (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 pr-4 font-mono text-xs">{b.booking_reference}</td>
                  <td className="py-3 pr-4">{b.guest?.first_name} {b.guest?.last_name}</td>
                  <td className="py-3 pr-4">Room {b.room?.room_number}</td>
                  <td className="py-3 pr-4">{formatDate(b.check_in_date)}</td>
                  <td className="py-3 pr-4 font-semibold">{formatCurrency(b.total_amount)}</td>
                  <td className="py-3">
                    <Badge variant={b.reservation_status === 'confirmed' ? 'success' : b.reservation_status === 'pending' ? 'warning' : 'default'}>
                      {b.reservation_status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {!recentBookings && [1,2,3].map(i => (
                <tr key={i}><td colSpan={6}><Skeleton className="h-10 w-full my-1" /></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
