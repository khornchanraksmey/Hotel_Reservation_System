import api from './api';
import { Feedback, Review } from '../types';

export const feedbackService = {
  getFeaturedReviews: () =>
    api.get<Review[]>('/reviews/featured').then(r => r.data),

  getMyFeedback: () =>
    api.get<Feedback[]>('/feedback/my').then(r => r.data),

  submitFeedback: (data: { booking_id: number; room_id: number; rating: number; comment: string }) =>
    api.post<Feedback>('/feedback', data).then(r => r.data),
};
