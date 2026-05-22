import api from './api';
import { Room, RoomType, Amenity, PaginatedResponse } from '../types';

export interface RoomFilters {
  type?: number;
  min_price?: number;
  max_price?: number;
  capacity?: number;
  amenity?: number;
  floor?: number;
  page?: number;
  per_page?: number;
  sort?: string;
}

export const roomService = {
  getRooms: (filters: RoomFilters = {}) =>
    api.get<PaginatedResponse<Room>>('/rooms', { params: filters }).then(r => r.data),

  getRoom: (id: number) =>
    api.get<Room>(`/rooms/${id}`).then(r => r.data),

  getAvailability: (id: number, month: string) =>
    api.get<{ blocked_dates: string[] }>(`/rooms/${id}/availability`, { params: { month } }).then(r => r.data),

  getRoomTypes: () =>
    api.get<RoomType[]>('/room-types').then(r => r.data),

  getAmenities: () =>
    api.get<Amenity[]>('/amenities').then(r => r.data),

  getFeaturedRooms: () =>
    api.get<PaginatedResponse<Room>>('/rooms', { params: { page: 1, per_page: 4 } })
      .then(r => r.data.data),
};
