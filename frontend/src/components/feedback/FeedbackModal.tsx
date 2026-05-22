import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { StarRating } from './StarRating';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { feedbackService } from '../../services/feedbackService';
import { toast } from '../ui/toast';
import { Booking } from '../../types';

interface Props {
  booking: Booking | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function FeedbackModal({ booking, onClose, onSuccess }: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!booking) return;
    if (!comment.trim()) { toast.error('Please write a comment.'); return; }
    setLoading(true);
    try {
      await feedbackService.submitFeedback({
        booking_id: booking.id,
        room_id: booking.room_id,
        rating,
        comment,
      });
      toast.success('Review submitted!');
      onSuccess();
    } catch {
      toast.error('Failed to submit review.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={!!booking} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
        </DialogHeader>
        {booking && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Room {booking.room?.room_number} — {booking.room?.room_type?.name}
            </p>
            <div>
              <p className="text-sm font-medium mb-2">Rating</p>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Comment</p>
              <Textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
