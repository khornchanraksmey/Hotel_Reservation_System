import { Hotel, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-navy text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Hotel className="h-7 w-7 text-gold" />
              <span className="font-serif text-xl font-semibold">Grand Luxe Hotel</span>
            </div>
            <p className="text-sm text-gray-300 mb-4 max-w-sm">
              Experience unparalleled luxury and comfort at Grand Luxe Hotel. Your perfect stay awaits.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-gray-400 hover:text-gold transition-colors"><Globe className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors"><Globe className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors"><Globe className="h-5 w-5" /></a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/rooms" className="hover:text-gold transition-colors">Our Rooms</Link></li>
              <li><Link to="/login" className="hover:text-gold transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-gold transition-colors">Register</Link></li>
              <li><Link to="/my/bookings" className="hover:text-gold transition-colors">My Bookings</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gold">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                123 Luxury Avenue, Phnom Penh, Cambodia
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold flex-shrink-0" />
                +855 88 123 4567
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold flex-shrink-0" />
                info@grandluxe.com
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/20 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Grand Luxe Hotel. All rights reserved.</p>
          <Link to="/privacy" className="hover:text-gold mt-2 sm:mt-0">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
