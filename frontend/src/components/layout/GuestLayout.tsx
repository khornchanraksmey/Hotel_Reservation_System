import { NavLink, Outlet } from 'react-router-dom';
import { BookOpen, User, CreditCard, Star } from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

const links = [
  { to: '/my/bookings', label: 'My Bookings', icon: BookOpen },
  { to: '/my/profile', label: 'Profile', icon: User },
  { to: '/my/payments', label: 'Payments', icon: CreditCard },
  { to: '/my/feedback', label: 'My Reviews', icon: Star },
];

export function GuestLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf8]">
      <Navbar />
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex gap-8">
        <aside className="hidden md:block w-56 flex-shrink-0">
          <nav className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">My Account</p>
            <ul className="space-y-1">
              {links.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? 'bg-navy text-white' : 'text-gray-600 hover:bg-gray-50'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        {/* Mobile tabs */}
        <div className="md:hidden w-full">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                    isActive ? 'bg-navy text-white' : 'bg-white text-gray-600 border border-gray-200'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
