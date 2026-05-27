import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Hotel, Menu, X, User, LogOut, Settings, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/button';

const NAV_LINKS = [
  { label: 'Rooms', href: '/rooms' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/');
    setDropdownOpen(false);
  }

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="bg-navy text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo — Left */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <Hotel className="h-7 w-7 text-gold" />
            <span className="font-serif text-xl font-semibold group-hover:text-gold transition-colors">
              Grand Luxe Hotel
            </span>
          </Link>

          {/* Desktop Nav — Right */}
          <div className="hidden md:flex items-center gap-1 ml-auto">

            {/* Main nav links */}
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                to={href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(href)
                    ? 'text-gold bg-white/10'
                    : 'text-white/80 hover:text-gold hover:bg-white/10'
                }`}
              >
                {label}
              </Link>
            ))}

            {/* My Bookings — only for logged in non-admin
            {isAuthenticated && !isAdmin && (
              <Link
                to="/my/bookings"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/my/bookings')
                    ? 'text-gold bg-white/10'
                    : 'text-white/80 hover:text-gold hover:bg-white/10'
                }`}
              >
                My Bookings
              </Link>
            )} */}

            {/* Admin Panel link */}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/admin/dashboard')
                    ? 'text-gold bg-white/10'
                    : 'text-white/80 hover:text-gold hover:bg-white/10'
                }`}
              >
                Admin Panel
              </Link>
            )}

            {/* Divider */}
            <div className="w-px h-5 bg-white/20 mx-2" />

            {/* Auth section */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-gold flex items-center justify-center text-white font-bold text-xs">
                    {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-white max-w-[100px] truncate">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <svg className={`h-3.5 w-3.5 text-white/60 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-semibold text-navy truncate">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/my/bookings"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-navy transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <BookOpen className="h-4 w-4 text-navy/60" /> My Bookings
                      </Link>
                      <Link
                        to="/my/profile"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-navy transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Settings className="h-4 w-4 text-navy/60" /> Profile Settings
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-navy transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <User className="h-4 w-4 text-navy/60" /> Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-gold hover:bg-gold/90 text-white border-0">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-white/20 space-y-0.5">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                to={href}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(href) ? 'text-gold bg-white/10' : 'text-white/80 hover:text-gold hover:bg-white/10'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            {isAuthenticated && !isAdmin && (
              <Link
                to="/my/bookings"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-gold hover:bg-white/10"
                onClick={() => setMenuOpen(false)}
              >
                <BookOpen className="h-4 w-4" /> My Bookings
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-gold hover:bg-white/10"
                onClick={() => setMenuOpen(false)}
              >
                <User className="h-4 w-4" /> Admin Panel
              </Link>
            )}
            <div className="border-t border-white/20 pt-3 mt-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 mb-1">
                    <div className="h-9 w-9 rounded-full bg-gold flex items-center justify-center text-white font-bold text-sm">
                      {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{user?.first_name} {user?.last_name}</p>
                      <p className="text-xs text-white/50 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Link to="/my/profile" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-white/80 hover:text-gold hover:bg-white/10" onClick={() => setMenuOpen(false)}>
                    <Settings className="h-4 w-4" /> Profile Settings
                  </Link>
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-red-300 hover:bg-white/10">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-1">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium border border-white/30 text-white hover:bg-white/10">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium bg-gold text-white hover:bg-gold/90">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}