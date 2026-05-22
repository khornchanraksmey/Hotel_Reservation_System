import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Hotel } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { toast } from '../../components/ui/toast';

const schema = z.object({
  first_name: z.string().min(1, 'First name required'),
  last_name: z.string().min(1, 'Last name required'),
  email: z.string().email('Invalid email'),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  date_of_birth: z.string().optional(),
  nationality: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  passport_number: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine(d => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    try {
      const { confirm_password, ...payload } = data;
      const result = await authService.register(payload);
      login(result.user, result.access_token);
      toast.success('Account created! Welcome to Grand Luxe Hotel.');
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Registration failed. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-navy hover:text-gold transition-colors">
            <Hotel className="h-8 w-8 text-gold" />
            <span className="font-serif text-2xl font-semibold">Grand Luxe Hotel</span>
          </Link>
          <h2 className="font-serif text-2xl text-navy mt-4">Create an Account</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input {...register('first_name')} className="mt-1" placeholder="John" />
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input {...register('last_name')} className="mt-1" placeholder="Doe" />
                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Email Address *</Label>
                <Input type="email" {...register('email')} className="mt-1" placeholder="you@example.com" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input type="tel" {...register('phone_number')} className="mt-1" placeholder="+66 81 234 5678" />
              </div>
            </div>

            <div>
              <Label>Address</Label>
              <Input {...register('address')} className="mt-1" placeholder="Your address" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Date of Birth</Label>
                <Input type="date" {...register('date_of_birth')} className="mt-1" />
              </div>
              <div>
                <Label>Nationality</Label>
                <Input {...register('nationality')} className="mt-1" placeholder="Thai" />
              </div>
              <div>
                <Label>Gender</Label>
                <select
                  {...register('gender')}
                  className="mt-1 w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Passport / ID Number</Label>
              <Input {...register('passport_number')} className="mt-1" placeholder="AB1234567" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Password *</Label>
                <Input type="password" {...register('password')} className="mt-1" placeholder="Min 8 characters" />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <Label>Confirm Password *</Label>
                <Input type="password" {...register('confirm_password')} className="mt-1" placeholder="Repeat password" />
                {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-navy font-medium hover:text-gold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
