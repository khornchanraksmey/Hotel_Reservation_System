import api from './api';
import { User } from '../types';

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload {
  first_name: string; last_name: string; email: string; password: string;
  phone_number?: string; address?: string; date_of_birth?: string;
  nationality?: string; gender?: string; passport_number?: string;
}
// Backend returns { access_token, token_type, user }
export interface AuthResponse { access_token: string; token_type: string; user: User }

export const authService = {
  login: (data: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', data).then(r => r.data),

  register: (data: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', data).then(r => r.data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).then(r => r.data),

  getMe: () =>
    api.get<User>('/auth/me').then(r => r.data),

  updateMe: (data: Partial<User>) =>
    api.put<User>('/auth/me', data).then(r => r.data),

  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post('/auth/change-password', data).then(r => r.data),

  deleteAccount: (password: string) =>
    api.delete('/users/me', { data: { password } }).then(r => r.data),
};
