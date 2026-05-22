import { create } from 'zustand';
import { Room } from '../types';

interface BookingState {
  room: Room | null;
  checkIn: Date | null;
  checkOut: Date | null;
  numGuests: number;
  promoCode: string;
  discountPercent: number;
  bookingId: number | null;
  paymentId: number | null;
  bookingReference: string;

  setRoom: (room: Room) => void;
  setDates: (checkIn: Date, checkOut: Date) => void;
  setNumGuests: (n: number) => void;
  setPromo: (code: string, percent: number) => void;
  clearPromo: () => void;
  setBookingId: (id: number, reference: string) => void;
  setPaymentId: (id: number) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  room: null,
  checkIn: null,
  checkOut: null,
  numGuests: 1,
  promoCode: '',
  discountPercent: 0,
  bookingId: null,
  paymentId: null,
  bookingReference: '',

  setRoom: (room) => set({ room }),
  setDates: (checkIn, checkOut) => set({ checkIn, checkOut }),
  setNumGuests: (numGuests) => set({ numGuests }),
  setPromo: (promoCode, discountPercent) => set({ promoCode, discountPercent }),
  clearPromo: () => set({ promoCode: '', discountPercent: 0 }),
  setBookingId: (bookingId, bookingReference) => set({ bookingId, bookingReference }),
  setPaymentId: (paymentId) => set({ paymentId }),
  reset: () =>
    set({
      room: null, checkIn: null, checkOut: null, numGuests: 1,
      promoCode: '', discountPercent: 0, bookingId: null,
      paymentId: null, bookingReference: '',
    }),
}));
