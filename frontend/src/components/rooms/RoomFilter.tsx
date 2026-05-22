import { useQuery } from '@tanstack/react-query';
import { roomService } from '../../services/roomService';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

interface Filters {
  types: number[];
  minPrice: number;
  maxPrice: number;
  capacity: number;
  amenities: number[];
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function RoomFilter({ filters, onChange }: Props) {
  const { data: roomTypes } = useQuery({ queryKey: ['room-types'], queryFn: roomService.getRoomTypes });
  const { data: amenities } = useQuery({ queryKey: ['amenities'], queryFn: roomService.getAmenities });

  function toggleType(id: number) {
    const types = filters.types.includes(id)
      ? filters.types.filter(t => t !== id)
      : [...filters.types, id];
    onChange({ ...filters, types });
  }

  function toggleAmenity(id: number) {
    const ams = filters.amenities.includes(id)
      ? filters.amenities.filter(a => a !== id)
      : [...filters.amenities, id];
    onChange({ ...filters, amenities: ams });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-navy mb-3 text-sm">Room Type</h3>
        <div className="space-y-2">
          {roomTypes?.map(rt => (
            <label key={rt.id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.types.includes(rt.id)}
                onCheckedChange={() => toggleType(rt.id)}
              />
              <span className="text-sm text-gray-700">{rt.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-navy mb-3 text-sm">Price Range (per night)</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Min $</Label>
            <Input
              type="number"
              min={0}
              value={filters.minPrice || ''}
              onChange={e => onChange({ ...filters, minPrice: Number(e.target.value) })}
              placeholder="0"
              className="h-9 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Max $</Label>
            <Input
              type="number"
              min={0}
              value={filters.maxPrice || ''}
              onChange={e => onChange({ ...filters, maxPrice: Number(e.target.value) })}
              placeholder="Any"
              className="h-9 text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-navy mb-3 text-sm">Guests</h3>
        <Input
          type="number"
          min={1}
          value={filters.capacity || ''}
          onChange={e => onChange({ ...filters, capacity: Number(e.target.value) })}
          placeholder="Min guests"
          className="h-9 text-sm"
        />
      </div>

      <div>
        <h3 className="font-semibold text-navy mb-3 text-sm">Amenities</h3>
        <div className="space-y-2">
          {amenities?.map(a => (
            <label key={a.id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.amenities.includes(a.id)}
                onCheckedChange={() => toggleAmenity(a.id)}
              />
              <span className="text-sm text-gray-700">{a.name}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={() => onChange({ types: [], minPrice: 0, maxPrice: 0, capacity: 0, amenities: [] })}
        className="text-sm text-navy underline"
      >
        Clear all filters
      </button>
    </div>
  );
}
