import { Badge } from '../ui/badge';

type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

const variants: Record<PaymentStatus, 'warning' | 'success' | 'danger' | 'info'> = {
  pending: 'warning',
  completed: 'success',
  failed: 'danger',
  refunded: 'info',
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={variants[status]}>{status}</Badge>;
}
