import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Wifi, Waves, Dumbbell, Coffee, Car, Utensils, Star, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { roomService } from '../../services/roomService';
import { feedbackService } from '../../services/feedbackService';
import { RoomCard } from '../../components/rooms/RoomCard';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/button';
import { StarRating } from '../../components/feedback/StarRating';
import { toISODateString } from '../../utils/dateUtils';
import 'react-day-picker/src/style.css';

const AMENITIES = [
  { icon: Wifi, label: 'Free WiFi' },
  { icon: Waves, label: 'Swimming Pool' },
  { icon: Dumbbell, label: 'Fitness Center' },
  { icon: Coffee, label: 'Breakfast' },
  { icon: Car, label: 'Free Parking' },
  { icon: Utensils, label: 'Restaurant' },
];

const GALLERY = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&auto=format&fit=crop',
];

export default function Home() {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState(2);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);

  const { data: featuredRooms } = useQuery({
    queryKey: ['featured-rooms'],
    queryFn: roomService.getFeaturedRooms,
  });

  const { data: reviews } = useQuery({
    queryKey: ['featured-reviews'],
    queryFn: feedbackService.getFeaturedReviews,
  });

  function handleSearch() {
    const params = new URLSearchParams();
    if (checkIn) params.set('check_in', toISODateString(checkIn));
    if (checkOut) params.set('check_out', toISODateString(checkOut));
    if (guests) params.set('capacity', String(guests));
    navigate(`/rooms?${params.toString()}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section
        className="relative flex items-center justify-center min-h-[85vh] bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1920&auto=format&fit=crop')` }}
      >
        <div className="absolute inset-0 bg-navy/60" />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <p className="text-gold font-medium tracking-widest uppercase text-sm mb-4">Welcome to</p>
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-4 leading-tight">
            Grand Luxe Hotel
          </h1>
          <p className="text-xl text-white/80 mb-12">Where every stay becomes an unforgettable memory</p>

          {/* Search bar */}
          <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 text-left max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="relative md:col-span-1">
                <label className="block text-xs font-semibold text-navy mb-1 uppercase tracking-wide">Check-in</label>
                <button
                  className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm text-left text-gray-700 hover:border-navy transition-colors"
                  onClick={() => { setShowCheckIn(!showCheckIn); setShowCheckOut(false); }}
                >
                  {checkIn ? format(checkIn, 'dd MMM yyyy') : 'Select date'}
                </button>
                {showCheckIn && (
                  <div className="absolute top-full left-0 z-50 bg-white shadow-xl rounded-xl mt-1 border border-gray-100">
                    <DayPicker
                      mode="single"
                      selected={checkIn}
                      onSelect={d => { setCheckIn(d); setShowCheckIn(false); }}
                      disabled={{ before: new Date() }}
                    />
                  </div>
                )}
              </div>
              <div className="relative md:col-span-1">
                <label className="block text-xs font-semibold text-navy mb-1 uppercase tracking-wide">Check-out</label>
                <button
                  className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm text-left text-gray-700 hover:border-navy transition-colors"
                  onClick={() => { setShowCheckOut(!showCheckOut); setShowCheckIn(false); }}
                >
                  {checkOut ? format(checkOut, 'dd MMM yyyy') : 'Select date'}
                </button>
                {showCheckOut && (
                  <div className="absolute top-full left-0 z-50 bg-white shadow-xl rounded-xl mt-1 border border-gray-100">
                    <DayPicker
                      mode="single"
                      selected={checkOut}
                      onSelect={d => { setCheckOut(d); setShowCheckOut(false); }}
                      disabled={{ before: checkIn || new Date() }}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy mb-1 uppercase tracking-wide">Guests</label>
                <select
                  value={guests}
                  onChange={e => setGuests(Number(e.target.value))}
                  className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy"
                >
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} guest{n !== 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <Button onClick={handleSearch} className="h-10 flex items-center gap-2">
                <Search className="h-4 w-4" /> Search Rooms
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-gold text-sm font-medium uppercase tracking-widest">Our Rooms</p>
            <h2 className="font-serif text-3xl md:text-4xl text-navy mt-1">Featured Accommodations</h2>
          </div>
          <button
            onClick={() => navigate('/rooms')}
            className="hidden md:flex items-center gap-1 text-navy font-medium text-sm hover:text-gold transition-colors"
          >
            View All <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredRooms?.slice(0, 4).map(room => (
            <RoomCard key={room.id} room={room} />
          ))}
          {!featuredRooms && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-72 animate-pulse" />
          ))}
        </div>
        <div className="text-center mt-8 md:hidden">
          <Button variant="outline" onClick={() => navigate('/rooms')}>View All Rooms</Button>
        </div>
      </section>

      {/* Amenities */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-gold text-sm font-medium uppercase tracking-widest mb-2">What We Offer</p>
            <h2 className="font-serif text-3xl md:text-4xl">World-Class Amenities</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {AMENITIES.map(({ icon: Icon, label }) => (
              <div key={label} className="text-center group">
                <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-gold transition-colors duration-300">
                  <Icon className="h-7 w-7 text-gold group-hover:text-white transition-colors" />
                </div>
                <p className="text-sm font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <section className="py-20 px-4 max-w-7xl mx-auto w-full">
          <div className="text-center mb-12">
            <p className="text-gold text-sm font-medium uppercase tracking-widest mb-2">Testimonials</p>
            <h2 className="font-serif text-3xl md:text-4xl text-navy">Guest Reviews</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map(review => (
              <div key={review.id} className="bg-white rounded-xl shadow-md p-6">
                <StarRating value={review.rating} size="sm" />
                <p className="text-gray-600 mt-3 text-sm leading-relaxed">"{review.comment}"</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold">
                    {review.guest_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-navy">{review.guest_name}</p>
                    {review.room_type && <p className="text-xs text-gray-400">{review.room_type}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Gallery */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-gold text-sm font-medium uppercase tracking-widest mb-2">Gallery</p>
            <h2 className="font-serif text-3xl md:text-4xl text-navy">Experience the Luxury</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {GALLERY.map((src, i) => (
              <div key={i} className={`overflow-hidden rounded-xl ${i === 0 ? 'row-span-2' : ''}`}>
                <img
                  src={src}
                  alt={`Gallery ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 min-h-40"
                  style={{ height: i === 0 ? '100%' : '200px' }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
