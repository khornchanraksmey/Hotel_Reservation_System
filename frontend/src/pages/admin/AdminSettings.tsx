import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Save } from 'lucide-react';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from '../../components/ui/toast';

interface PaymentSettings {
  qr_code_url: string | null;
  bank_name: string;
  account_name: string;
  account_number: string;
}

export default function AdminSettings() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ bank_name: '', account_name: '', account_number: '' });
  const [formLoaded, setFormLoaded] = useState(false);

  const { data: settings } = useQuery<PaymentSettings>({
    queryKey: ['payment-settings'],
    queryFn: () => api.get<PaymentSettings>('/settings/payment').then(r => r.data),
    onSuccess: (d: PaymentSettings) => {
      if (!formLoaded) {
        setForm({ bank_name: d.bank_name, account_name: d.account_name, account_number: d.account_number });
        setFormLoaded(true);
      }
    },
  } as any);

  async function handleQRUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await api.post('/admin/settings/payment/qr', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('QR code updated!');
      qc.invalidateQueries({ queryKey: ['payment-settings'] });
    } catch {
      toast.error('Failed to upload QR code.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleSaveBankInfo() {
    setSaving(true);
    try {
      const params = new URLSearchParams(form as any).toString();
      await api.put(`/admin/settings/payment?${params}`);
      toast.success('Bank info updated!');
      qc.invalidateQueries({ queryKey: ['payment-settings'] });
    } catch {
      toast.error('Failed to update bank info.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-serif text-2xl text-navy">Payment Settings</h1>

      {/* QR Code */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-navy">QR Code</h2>
        <p className="text-sm text-gray-500">This QR code is shown to guests on the payment page.</p>

        <div className="flex items-start gap-6">
          <div className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 flex-shrink-0 overflow-hidden">
            {settings?.qr_code_url ? (
              <img src={getImageUrl(settings.qr_code_url)} alt="QR Code" className="w-full h-full object-contain p-2" />
            ) : (
              <div className="text-center text-gray-400 text-xs px-2">No QR code</div>
            )}
          </div>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Upload a PNG or JPG of your bank QR code.<br />
              It will immediately appear on the guest payment page.
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2"
            >
              <ImagePlus className="h-4 w-4" />
              {uploading ? 'Uploading...' : settings?.qr_code_url ? 'Replace QR Code' : 'Upload QR Code'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleQRUpload}
            />
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-navy">Bank Details</h2>
        <p className="text-sm text-gray-500">Shown alongside the QR code on the payment page.</p>

        <div className="space-y-3">
          <div>
            <Label>Bank Name</Label>
            <Input
              className="mt-1"
              value={form.bank_name}
              onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))}
              placeholder="e.g. ABA Bank"
            />
          </div>
          <div>
            <Label>Account Name</Label>
            <Input
              className="mt-1"
              value={form.account_name}
              onChange={e => setForm(f => ({ ...f, account_name: e.target.value }))}
              placeholder="e.g. Grand Luxe Hotel Co."
            />
          </div>
          <div>
            <Label>Account Number</Label>
            <Input
              className="mt-1"
              value={form.account_number}
              onChange={e => setForm(f => ({ ...f, account_number: e.target.value }))}
              placeholder="e.g. 123-4-56789-0"
            />
          </div>
        </div>

        <Button onClick={handleSaveBankInfo} disabled={saving} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Bank Info'}
        </Button>
      </div>
    </div>
  );
}
