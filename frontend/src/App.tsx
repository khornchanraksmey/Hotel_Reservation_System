import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GuestLayout } from './components/layout/GuestLayout';
import { AdminLayout } from './components/layout/AdminLayout';

import Home from './pages/public/Home';
import Rooms from './pages/public/Rooms';
import RoomDetail from './pages/public/RoomDetail';
import AboutUs from './pages/public/AboutUs';
import Contact from './pages/public/Contact';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import BookingConfirm from './pages/booking/BookingConfirm';
import BookingPayment from './pages/booking/BookingPayment';
import BookingSuccess from './pages/booking/BookingSuccess';
import MyBookings from './pages/guest/MyBookings';
import MyProfile from './pages/guest/MyProfile';
import MyPayments from './pages/guest/MyPayments';
import MyFeedback from './pages/guest/MyFeedback';
import Dashboard from './pages/admin/Dashboard';
import AdminRooms from './pages/admin/AdminRooms';
import AdminRoomTypes from './pages/admin/AdminRoomTypes';
import AdminAmenities from './pages/admin/AdminAmenities';
import AdminBookings from './pages/admin/AdminBookings';
import AdminGuests from './pages/admin/AdminGuests';
import AdminStaff from './pages/admin/AdminStaff';
import AdminPromotions from './pages/admin/AdminPromotions';
import AdminPayments from './pages/admin/AdminPayments';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/about" element={<AboutUs />} />    {/* ADD THIS */}
          <Route path="/contact" element={<Contact />} />  {/* ADD THIS */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Booking flow (requires auth) */}
          <Route path="/booking/confirm" element={<ProtectedRoute><BookingConfirm /></ProtectedRoute>} />
          <Route path="/booking/payment" element={<ProtectedRoute><BookingPayment /></ProtectedRoute>} />
          <Route path="/booking/success" element={<ProtectedRoute><BookingSuccess /></ProtectedRoute>} />

          {/* Guest dashboard */}
          <Route path="/my" element={<ProtectedRoute><GuestLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/my/bookings" replace />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="payments" element={<MyPayments />} />
            <Route path="feedback" element={<MyFeedback />} />
          </Route>

          {/* Admin panel */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="room-types" element={<AdminRoomTypes />} />
            <Route path="amenities" element={<AdminAmenities />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="guests" element={<AdminGuests />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="promotions" element={<AdminPromotions />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
