import { Wifi, Waves, Dumbbell, Coffee, Car, Wind, Tv, Utensils, Shield } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-4 w-4" />,
  pool: <Waves className="h-4 w-4" />,
  gym: <Dumbbell className="h-4 w-4" />,
  breakfast: <Coffee className="h-4 w-4" />,
  parking: <Car className="h-4 w-4" />,
  ac: <Wind className="h-4 w-4" />,
  tv: <Tv className="h-4 w-4" />,
  restaurant: <Utensils className="h-4 w-4" />,
  spa: <Shield className="h-4 w-4" />,
};

interface Props {
  name: string;
  icon: string;
}

export function AmenityBadge({ name, icon }: Props) {
  const iconEl = iconMap[icon?.toLowerCase()] || iconMap['wifi'];
  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
      <span className="text-navy">{iconEl}</span>
      <span className="text-sm text-gray-700">{name}</span>
    </div>
  );
}
