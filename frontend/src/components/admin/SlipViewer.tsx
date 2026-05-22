import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { X } from 'lucide-react';

interface Props {
  url: string | null;
  onClose: () => void;
}

export function SlipViewer({ url, onClose }: Props) {
  return (
    <Dialog open={!!url} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle>Payment Slip</DialogTitle>
        </DialogHeader>
        {url && (
          url.endsWith('.pdf') ? (
            <iframe src={url} className="w-full h-[70vh] rounded-lg" title="Payment slip PDF" />
          ) : (
            <img src={url} alt="Payment slip" className="w-full max-h-[70vh] object-contain rounded-lg" />
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
