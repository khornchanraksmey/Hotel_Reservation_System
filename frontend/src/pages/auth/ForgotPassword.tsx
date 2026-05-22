import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Hotel, CheckCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-navy hover:text-gold">
            <Hotel className="h-8 w-8 text-gold" />
            <span className="font-serif text-2xl font-semibold">Grand Luxe Hotel</span>
          </Link>
          <h2 className="font-serif text-2xl text-navy mt-4">Reset Password</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg text-navy">Check your email</h3>
              <p className="text-gray-500 text-sm mt-2">
                If an account with <strong>{email}</strong> exists, we've sent a password reset link.
              </p>
              <Link to="/login" className="mt-6 inline-block text-navy font-medium hover:text-gold text-sm">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-gray-500">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <div>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="mt-1"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <p className="text-center text-sm text-gray-500">
                <Link to="/login" className="text-navy hover:text-gold">Back to Sign In</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
