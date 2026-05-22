import api from './api';
import {
  Room, RoomType, Amenity, Booking, Payment, Staff, Promotion,
  User, DashboardStats, RevenueChartData, BookingsByTypeData,
  PaginatedResponse, ReportData,
} from '../types';

export const adminService = {
  // Dashboard
  getDashboardStats: () =>
    api.get<DashboardStats>('/admin/dashboard/stats').then(r => r.data),
  getRevenueChart: () =>
    api.get<RevenueChartData[]>('/admin/dashboard/revenue-chart').then(r => r.data),
  getBookingsByType: () =>
    api.get<BookingsByTypeData[]>('/admin/dashboard/bookings-by-type').then(r => r.data),
  getRecentBookings: () =>
    api.get<Booking[]>('/admin/dashboard/recent-bookings').then(r => r.data),

  // Rooms
  getAdminRooms: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Room>>('/admin/rooms', { params }).then(r => r.data),
  createRoom: (data: Record<string, unknown>) =>
    api.post<Room>('/admin/rooms', data).then(r => r.data),
  updateRoom: (id: number, data: Record<string, unknown>) =>
    api.put<Room>(`/admin/rooms/${id}`, data).then(r => r.data),
  deleteRoom: (id: number) =>
    api.delete(`/admin/rooms/${id}`).then(r => r.data),
  updateRoomStatus: (id: number, status: string) =>
    api.patch(`/admin/rooms/${id}/status`, { status }).then(r => r.data),
  uploadRoomImage: (id: number, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post<{ url: string; images: string[] }>(`/admin/rooms/${id}/upload-image`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  // Room Types
  getRoomTypes: () =>
    api.get<RoomType[]>('/admin/room-types').then(r => r.data),
  createRoomType: (data: Partial<RoomType>) =>
    api.post<RoomType>('/admin/room-types', data).then(r => r.data),
  updateRoomType: (id: number, data: Partial<RoomType>) =>
    api.put<RoomType>(`/admin/room-types/${id}`, data).then(r => r.data),
  deleteRoomType: (id: number) =>
    api.delete(`/admin/room-types/${id}`).then(r => r.data),

  // Amenities
  getAmenities: () =>
    api.get<Amenity[]>('/admin/amenities').then(r => r.data),
  createAmenity: (data: Partial<Amenity>) =>
    api.post<Amenity>('/admin/amenities', data).then(r => r.data),
  updateAmenity: (id: number, data: Partial<Amenity>) =>
    api.put<Amenity>(`/admin/amenities/${id}`, data).then(r => r.data),
  deleteAmenity: (id: number) =>
    api.delete(`/admin/amenities/${id}`).then(r => r.data),

  // Bookings
  getAdminBookings: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Booking>>('/admin/bookings', { params }).then(r => r.data),
  getAdminBooking: (id: number) =>
    api.get<Booking>(`/admin/bookings/${id}`).then(r => r.data),
  updateBookingStatus: (id: number, data: { status: string; cancel_reason?: string }) =>
    api.patch(`/admin/bookings/${id}/status`, data).then(r => r.data),

  // Guests
  getGuests: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<User>>('/admin/guests', { params }).then(r => r.data),
  getGuest: (id: number) =>
    api.get<User>(`/admin/guests/${id}`).then(r => r.data),
  updateGuest: (id: number, data: Partial<User>) =>
    api.put<User>(`/admin/guests/${id}`, data).then(r => r.data),

  // Staff
  getStaff: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Staff>>('/admin/staff', { params }).then(r => r.data),
  createStaff: (data: Partial<Staff>) =>
    api.post<Staff>('/admin/staff', data).then(r => r.data),
  updateStaff: (id: number, data: Partial<Staff>) =>
    api.put<Staff>(`/admin/staff/${id}`, data).then(r => r.data),
  deleteStaff: (id: number) =>
    api.delete(`/admin/staff/${id}`).then(r => r.data),

  // Promotions
  getPromotions: () =>
    api.get<Promotion[]>('/admin/promotions').then(r => r.data),
  createPromotion: (data: Partial<Promotion>) =>
    api.post<Promotion>('/admin/promotions', data).then(r => r.data),
  updatePromotion: (id: number, data: Partial<Promotion>) =>
    api.put<Promotion>(`/admin/promotions/${id}`, data).then(r => r.data),
  deletePromotion: (id: number) =>
    api.delete(`/admin/promotions/${id}`).then(r => r.data),

  // Payments
  getAdminPayments: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Payment>>('/admin/payments', { params }).then(r => r.data),
  confirmPayment: (id: number) =>
    api.patch(`/admin/payments/${id}/confirm`).then(r => r.data),
  rejectPayment: (id: number) =>
    api.patch(`/admin/payments/${id}/reject`).then(r => r.data),
  refundPayment: (id: number) =>
    api.patch(`/admin/payments/${id}/refund`).then(r => r.data),

  // Reports
  getReports: (params: { from: string; to: string }) =>
    api.get<ReportData>('/admin/reports', { params }).then(r => r.data),
};
