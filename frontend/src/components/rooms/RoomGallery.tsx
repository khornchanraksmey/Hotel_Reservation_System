import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop';

interface Props {
  images: string[];
  alt: string;
}

export function RoomGallery({ images, alt }: Props) {
  const imgs = images?.length > 0 ? images.map(getImageUrl) : [PLACEHOLDER];
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  function prev() { setActive(i => (i - 1 + imgs.length) % imgs.length); }
  function next() { setActive(i => (i + 1) % imgs.length); }

  return (
    <>
      <div className="relative rounded-xl overflow-hidden">
        <img
          src={imgs[active]}
          alt={alt}
          className="w-full h-80 md:h-[450px] object-cover cursor-zoom-in"
          onClick={() => setLightbox(true)}
        />
        {imgs.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      {imgs.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto">
          {imgs.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === active ? 'border-gold' : 'border-transparent'}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightbox(false)}>
            <X className="h-8 w-8" />
          </button>
          {imgs.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/20">
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/20">
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}
          <img
            src={imgs[active]}
            alt={alt}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={e => e.stopPropagation()}
          />
          <p className="absolute bottom-4 text-white/60 text-sm">{active + 1} / {imgs.length}</p>
        </div>
      )}
    </>
  );
}
