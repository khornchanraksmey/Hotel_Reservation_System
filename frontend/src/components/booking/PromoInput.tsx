import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Tag, X } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { toast } from '../ui/toast';

interface Props {
  roomId: number;
  onApply: (code: string, percent: number) => void;
  onClear: () => void;
  applied?: { code: string; percent: number };
}

export function PromoInput({ roomId, onApply, onClear, applied }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleApply() {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const result = await bookingService.validatePromo(code.trim().toUpperCase(), roomId);
      onApply(code.trim().toUpperCase(), result.discount_percent);
      toast('Promo code applied!');
    } catch {
      toast.error('Invalid or expired promo code.');
    } finally {
      setLoading(false);
    }
  }

  if (applied) {
    return (
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
        <Tag className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-700 font-medium flex-1">{applied.code} — {applied.percent}% off</span>
        <button onClick={onClear} className="text-green-600 hover:text-green-800">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        value={code}
        onChange={e => setCode(e.target.value.toUpperCase())}
        placeholder="Promo code"
        className="uppercase"
        onKeyDown={e => e.key === 'Enter' && handleApply()}
      />
      <Button onClick={handleApply} disabled={loading || !code.trim()} size="sm" variant="outline">
        Apply
      </Button>
    </div>
  );
}
