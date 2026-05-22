import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';
import { formatCurrency } from '../../utils/priceUtils';

interface PaymentSettings {
  qr_code_url: string | null;
  bank_name: string;
  account_name: string;
  account_number: string;
}

interface Props {
  amount: number;
  reference: string;
}

export function QRPaymentCard({ amount, reference }: Props) {
  const { data: settings } = useQuery<PaymentSettings>({
    queryKey: ['payment-settings'],
    queryFn: () => api.get<PaymentSettings>('/settings/payment').then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="bg-gradient-to-br from-navy to-navy-800 text-white rounded-2xl p-6 shadow-xl">
      <h3 className="font-serif text-lg font-semibold mb-4">Payment Details</h3>

      <div className="bg-white rounded-xl p-4 flex items-center justify-center mb-4">
        {settings?.qr_code_url ? (
          <img
            src={getImageUrl(settings.qr_code_url)}
            alt="QR Code"
            className="w-48 h-48 object-contain"
          />
        ) : (
          <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-xs text-gray-400 text-center px-4">
              No QR code uploaded yet.<br />Admin → Settings to add one.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-white/70">Bank</span>
          <span className="font-medium">{settings?.bank_name ?? '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Account Name</span>
          <span className="font-medium">{settings?.account_name ?? '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Account No.</span>
          <span className="font-medium font-mono">{settings?.account_number ?? '—'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/70">Amount</span>
          <span className="text-gold font-bold text-lg">{formatCurrency(amount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Reference</span>
          <span className="font-mono text-xs">{reference}</span>
        </div>
      </div>

      <p className="text-xs text-white/60 mt-4 text-center">
        Transfer the exact amount and upload your slip below
      </p>
    </div>
  );
}
