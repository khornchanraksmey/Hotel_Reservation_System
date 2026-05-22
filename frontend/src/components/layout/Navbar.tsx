import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hotel, Menu, X, User, LogOut, Settings, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/button';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="bg-navy text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Hotel className="h-7 w-7 text-gold" />
            <span className="font-serif text-xl font-semibold group-hover:text-gold transition-colors">
              Grand Luxe Hotel
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/rooms" className="text-sm hover:text-gold transition-colors">Rooms</Link>
            {isAuthenticated && !isAdmin && (
              <Link to="/my/bookings" className="text-sm hover:text-gold transition-colors">My Bookings</Link>
            )}
            {isAdmin && (
              <Link to="/admin/dashboard" className="text-sm hover:text-gold transition-colors">Admin Panel</Link>
            )}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-sm hover:text-gold transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-gold flex items-center justify-center text-white font-semibold text-xs">
                    {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                  </div>
                  <span>{user?.first_name}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50">
                    <Link
                      to="/my/bookings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <BookOpen className="h-4 w-4" /> My Bookings
                    </Link>
                    <Link
                      to="/my/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4" /> Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="h-4 w-4" /> Admin Panel
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm">Book Now</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-white/20 space-y-2">
            <Link to="/rooms" className="block py-2 text-sm hover:text-gold" onClick={() => setMenuOpen(false)}>Rooms</Link>
            {isAuthenticated && (
              <>
                <Link to="/my/bookings" className="block py-2 text-sm hover:text-gold" onClick={() => setMenuOpen(false)}>My Bookings</Link>
                <Link to="/my/profile" className="block py-2 text-sm hover:text-gold" onClick={() => setMenuOpen(false)}>Profile</Link>
                {isAdmin && (
                  <Link to="/admin/dashboard" className="block py-2 text-sm hover:text-gold" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
                )}
                <button onClick={handleLogout} className="block py-2 text-sm text-red-300">Sign Out</button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link to="/login" className="block py-2 text-sm hover:text-gold" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link to="/register" className="block py-2 text-sm hover:text-gold" onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
