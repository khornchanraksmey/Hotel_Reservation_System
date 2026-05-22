import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { parseISO } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { roomService } from '../../services/roomService';
import { format } from 'date-fns';
import 'react-day-picker/src/style.css';

interface Props {
  roomId: number;
}

export function AvailabilityCalendar({ roomId }: Props) {
  const [month, setMonth] = useState(new Date());

  const monthStr = format(month, 'yyyy-MM');

  const { data } = useQuery({
    queryKey: ['availability', roomId, monthStr],
    queryFn: () => roomService.getAvailability(roomId, monthStr),
  });

  const blocked = (data?.blocked_dates || []).map((d: string) => parseISO(d));

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h3 className="font-semibold text-navy mb-3">Availability Calendar</h3>
      <DayPicker
        month={month}
        onMonthChange={setMonth}
        disabled={[...blocked, { before: new Date() }]}
        modifiers={{ blocked }}
        modifiersClassNames={{ blocked: 'line-through opacity-40 cursor-not-allowed' }}
        className="!font-sans"
      />
      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-200 inline-block" /> Unavailable</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-white border border-gray-300 inline-block" /> Available</span>
      </div>
    </div>
  );
}
