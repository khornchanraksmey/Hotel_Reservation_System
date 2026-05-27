import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: 'Address',
    value: '123 Luxury Avenue, Phnom Penh, Cambodia',
    sub: 'Near the central park & business district',
    href:'https://maps.app.goo.gl/Fi3n27cPcJXk6XT19',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+(855) 712-294-974',
    sub: 'Available 7 days a week',
    href: 'tel:+855712294974',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'info@grandluxe.com',
    sub: 'We reply within 24 hours',
    href: 'mailto:info@grandluxe.com',
  },
  {
    icon: Clock,
    label: 'Front Desk Hours',
    value: '24 / 7',
    sub: 'Always here when you need us',

  },
];

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf8]">
      <Navbar />

      {/* Hero */}
      <section className="relative h-64 md:h-80 bg-navy overflow-hidden flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&q=80')` }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <p className="text-gold text-sm font-medium uppercase tracking-widest mb-3">Get in Touch</p>
          <h1 className="font-serif text-4xl md:text-5xl text-white font-bold leading-tight">
            We'd love to hear from you
          </h1>
          <p className="text-white/60 mt-3 max-w-md">
            Whether it's a question, a special request, or just a hello — we're here.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="mb-10">
          <p className="text-gold text-sm font-medium uppercase tracking-widest mb-2">Contact Details</p>
          <h2 className="font-serif text-3xl text-navy">Find us or reach out anytime</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {CONTACT_INFO.map(({ icon: Icon, label, value, sub, href }) => {
            const content = (
              <div className="flex gap-4 p-5 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-lg bg-navy/10 group-hover:bg-navy/20 flex items-center justify-center flex-shrink-0 transition-colors">
                  <Icon className="h-4 w-4 text-navy" />
               </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className={`font-medium text-sm mt-0.5 ${href ? 'text-navy group-hover:text-gold transition-colors' : 'text-navy'}`}>
                  {value}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            </div>
          );

          return href ? (
            <a key={label} href={href} target={href.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer">
              {content}
            </a>
          ) : (
            <div key={label}>{content}</div>
          );
        })}
        </div>

        {/* Map */}
        <div className="rounded-2xl overflow-hidden border border-gray-200 h-80 bg-gray-100 relative">
          <img
            src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80"
            
            alt="City location"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <a
              href="https://maps.app.goo.gl/Fi3n27cPcJXk6XT19"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl px-5 py-3 shadow-lg flex items-center gap-2 hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
            >
              <MapPin className="h-4 w-4 text-navy" />
              <span className="text-sm font-medium text-navy">Grand Luxe Hotel</span>
            </a>
          </div>
        </div>
      </section>

      {/* Quick Info Strip */}
      <section className="bg-navy py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="font-serif text-2xl text-white mb-2">Good to know before you arrive</h2>
          <p className="text-white/60 text-sm mb-8">
            Check-in at 3:00 PM · Check-out at 12:00 PM · Free cancellation up to 48 hours before arrival
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Free WiFi included',
              'Airport shuttle available',
              'Pets allowed on request',
              'Parking on-site',
            ].map(item => (
              <span key={item} className="px-4 py-2 rounded-full bg-white/10 text-white/80 border border-white/20 text-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}