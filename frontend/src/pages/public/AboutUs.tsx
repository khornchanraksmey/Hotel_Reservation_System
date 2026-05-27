import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Hotel, Award, Users, Heart } from 'lucide-react';

const TEAM = [
  {
    name: 'James Whitfield',
    role: 'General Manager',
    initials: 'JW',
    bio: 'With over 20 years in luxury hospitality, James leads our team with a passion for exceptional guest experiences.',
  },
  {
    name: 'Sophie Laurent',
    role: 'Head of Guest Relations',
    initials: 'SL',
    bio: 'Sophie ensures every guest feels at home, going the extra mile to make each stay truly memorable.',
  },
  {
    name: 'Marcus Chen',
    role: 'Executive Chef',
    initials: 'MC',
    bio: 'Marcus brings a blend of classic and contemporary cuisine, crafting menus that delight every palate.',
  },
];

const VALUES = [
  {
    icon: Heart,
    title: 'Genuine Hospitality',
    desc: 'We believe great service comes from the heart. Every interaction is personal, warm, and attentive.',
  },
  {
    icon: Award,
    title: 'Uncompromising Quality',
    desc: 'From our linens to our breakfast, we hold every detail to the highest standard — no exceptions.',
  },
  {
    icon: Users,
    title: 'People First',
    desc: 'Our guests and our team are everything. A happy team creates happy guests, and that drives everything we do.',
  },
];

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf8]">
      <Navbar />

      {/* Hero */}
      <section className="relative h-72 md:h-96 bg-navy overflow-hidden flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80')` }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <p className="text-gold text-sm font-medium uppercase tracking-widest mb-3">Our Story</p>
          <h1 className="font-serif text-4xl md:text-5xl text-white font-bold leading-tight max-w-xl">
            A place where comfort meets character
          </h1>
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-5">
            <p className="text-gold text-sm font-medium uppercase tracking-widest">Since 2005</p>
            <h2 className="font-serif text-3xl text-navy leading-snug">
              We started small. We grew with our guests.
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Grand Luxe Hotel opened its doors in 2005 with just 24 rooms and a simple belief — that every guest deserves to feel genuinely welcome, not just checked in. Back then, we knew our guests by name. We still do.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Over the years we've grown, renovated, and expanded. But the one thing that hasn't changed is why we do this. Hospitality, to us, isn't a service industry. It's a people industry. And people deserve more than a clean room and a firm handshake.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Today, Grand Luxe is home to over 80 rooms, a full-service restaurant, a spa, and a team of people who genuinely love what they do. We're proud of what we've built — but more proud of the memories our guests carry with them when they leave.
            </p>
          </div>

          {/* Image collage */}
          <div className="grid grid-cols-2 gap-3 h-96">
            <div className="rounded-2xl overflow-hidden row-span-2">
              <img
                src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80"
                alt="Hotel room"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80"
                alt="Hotel lobby"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80"
                alt="Hotel pool"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-navy py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-gold text-sm font-medium uppercase tracking-widest mb-2">What Drives Us</p>
            <h2 className="font-serif text-3xl text-white">Our values, in plain words</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/5 rounded-2xl p-7 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-gold/20 flex items-center justify-center mb-5">
                  <Icon className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-serif text-lg text-white mb-2">{title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { number: '20+', label: 'Years in business' },
            { number: '80+', label: 'Rooms & suites' },
            { number: '15k+', label: 'Happy guests' },
            { number: '4.8', label: 'Average rating' },
          ].map(({ number, label }) => (
            <div key={label} className="space-y-2">
              <p className="font-serif text-4xl font-bold text-navy">{number}</p>
              <p className="text-gray-500 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-gold text-sm font-medium uppercase tracking-widest mb-2">The People Behind It</p>
            <h2 className="font-serif text-3xl text-navy">Meet a few of our team</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TEAM.map(({ name, role, initials, bio }) => (
              <div key={name} className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-full bg-navy flex items-center justify-center text-white font-serif font-bold text-lg mb-5">
                  {initials}
                </div>
                <h3 className="font-semibold text-navy text-lg">{name}</h3>
                <p className="text-gold text-sm mb-3">{role}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 max-w-7xl mx-auto px-6 w-full text-center">
        <h2 className="font-serif text-3xl text-navy mb-4">Come see for yourself</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Words only go so far. We'd love to show you what Grand Luxe feels like in person.
        </p>
        <Link
          to="/rooms"
          className="inline-flex items-center gap-2 px-8 py-3 bg-navy text-white rounded-xl font-medium hover:bg-navy/90 transition-colors"
        >
          <Hotel className="h-4 w-4" />
          Browse Our Rooms
        </Link>
      </section>

      <Footer />
    </div>
  );
}