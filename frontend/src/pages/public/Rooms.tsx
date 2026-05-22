import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X } from 'lucide-react';
import { roomService } from '../../services/roomService';
import { RoomCard } from '../../components/rooms/RoomCard';
import { RoomFilter } from '../../components/rooms/RoomFilter';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';

const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
  { value: 'newest', label: 'Newest' },
];

interface Filters {
  types: number[];
  minPrice: number;
  maxPrice: number;
  capacity: number;
  amenities: number[];
}

export default function Rooms() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('price_asc');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    types: [],
    minPrice: 0,
    maxPrice: 0,
    capacity: Number(searchParams.get('capacity')) || 0,
    amenities: [],
  });

  const params: Record<string, unknown> = { page, per_page: 20, sort };
  if (filters.types.length) params.type = filters.types.join(',');
  if (filters.minPrice) params.min_price = filters.minPrice;
  if (filters.maxPrice) params.max_price = filters.maxPrice;
  if (filters.capacity) params.capacity = filters.capacity;
  if (filters.amenities.length) params.amenity = filters.amenities.join(',');

  const { data, isLoading } = useQuery({
    queryKey: ['rooms', params],
    queryFn: () => roomService.getRooms(params as Parameters<typeof roomService.getRooms>[0]),
  });

  const rooms = data?.data || [];
  const totalPages = data?.total_pages || 1;

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf8]">
      <Navbar />

      <div className="bg-navy text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold">Browse Our Rooms</h1>
          <p className="text-white/70 mt-2">Find your perfect accommodation</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 py-8 flex gap-8 flex-1">
        {/* Desktop filter */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm p-5 sticky top-24">
            <h2 className="font-semibold text-navy mb-4">Filters</h2>
            <RoomFilter filters={filters} onChange={setFilters} />
          </div>
        </aside>

        {/* Mobile filter drawer */}
        {showFilter && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="w-72 bg-white h-full overflow-y-auto p-5 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-navy">Filters</h2>
                <button onClick={() => setShowFilter(false)}><X className="h-5 w-5" /></button>
              </div>
              <RoomFilter filters={filters} onChange={f => { setFilters(f); setPage(1); }} />
              <Button className="w-full mt-4" onClick={() => setShowFilter(false)}>Apply Filters</Button>
            </div>
            <div className="flex-1 bg-black/40" onClick={() => setShowFilter(false)} />
          </div>
        )}

        <main className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilter(true)}
                className="lg:hidden flex items-center gap-2 text-sm text-navy border border-navy rounded-lg px-3 py-2"
              >
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
              <p className="text-sm text-gray-500">
                {data?.total ?? 0} rooms found
              </p>
            </div>
            <select
              value={sort}
              onChange={e => { setSort(e.target.value); setPage(1); }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden">
                  <Skeleton className="h-52 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No rooms match your filters.</p>
              <Button variant="outline" className="mt-4" onClick={() => setFilters({ types: [], minPrice: 0, maxPrice: 0, capacity: 0, amenities: [] })}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {rooms.map(room => <RoomCard key={room.id} room={room} />)}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</Button>
                  <span className="flex items-center px-4 text-sm text-gray-600">Page {page} of {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next</Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
