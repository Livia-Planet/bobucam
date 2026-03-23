import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { motion } from 'motion/react';
import { Check, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Sticker } from '../types';

const STICKERS = [
  { id: 's1', src: 'https://api.dicebear.com/7.x/notionists/svg?seed=carrot&backgroundColor=transparent' },
  { id: 's2', src: 'https://api.dicebear.com/7.x/notionists/svg?seed=flower&backgroundColor=transparent' },
  { id: 's3', src: 'https://api.dicebear.com/7.x/notionists/svg?seed=star&backgroundColor=transparent' },
  { id: 's4', src: 'https://api.dicebear.com/7.x/notionists/svg?seed=heart&backgroundColor=transparent' },
  { id: 's5', src: 'https://api.dicebear.com/7.x/notionists/svg?seed=smile&backgroundColor=transparent' },
];

export default function Editor() {
  const navigate = useNavigate();
  const { photos, addSticker, removeSticker } = useAppStore();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedStickerSrc, setSelectedStickerSrc] = useState<string>(STICKERS[0].src);
  const containerRef = useRef<HTMLDivElement>(null);

  if (photos.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <p className="mb-4 text-zinc-500">No photos found.</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-orange-500 text-white rounded-full font-bold">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];

  const handlePhotoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newSticker: Sticker = {
      id: Date.now().toString(),
      src: selectedStickerSrc,
      x,
      y,
      width: 20, // percentage
      height: 20,
      rotation: Math.random() * 40 - 20, // random rotation between -20 and 20
    };
    
    addSticker(currentPhoto.id, newSticker);
  };

  return (
    <div className="h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white shadow-sm z-10">
        <button 
          onClick={() => navigate('/camera')}
          className="text-zinc-500 font-medium"
        >
          Retake
        </button>
        <div className="font-bold text-zinc-900">Decorate</div>
        <button 
          onClick={() => navigate('/export')}
          className="text-orange-500 font-bold flex items-center gap-1"
        >
          Next <Check className="w-4 h-4" />
        </button>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
        {/* Navigation Arrows */}
        <button 
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="absolute left-2 z-20 p-2 bg-white/80 rounded-full shadow-md disabled:opacity-30"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button 
          onClick={() => setCurrentIndex(prev => Math.min(photos.length - 1, prev + 1))}
          disabled={currentIndex === photos.length - 1}
          className="absolute right-2 z-20 p-2 bg-white/80 rounded-full shadow-md disabled:opacity-30"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Photo Container */}
        <div 
          ref={containerRef}
          className="relative w-full max-w-sm aspect-[3/4] bg-zinc-200 rounded-2xl overflow-hidden shadow-xl cursor-crosshair"
          onClick={handlePhotoClick}
        >
          <img 
            src={currentPhoto.dataUrl} 
            alt={`Photo ${currentIndex + 1}`} 
            className="w-full h-full object-cover pointer-events-none"
          />
          
          {/* Stickers */}
          {currentPhoto.stickers.map(sticker => (
            <motion.div
              key={sticker.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute group"
              style={{
                left: `${sticker.x}%`,
                top: `${sticker.y}%`,
                width: `${sticker.width}%`,
                height: `${sticker.height}%`,
                transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                removeSticker(currentPhoto.id, sticker.id);
              }}
            >
              <img src={sticker.src} alt="sticker" className="w-full h-full object-contain drop-shadow-md" />
              {/* Delete button appears on hover/tap */}
              <div className="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Trash2 className="w-3 h-3" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sticker Palette */}
      <div className="h-32 bg-white border-t border-zinc-100 p-4 flex items-center gap-4 overflow-x-auto">
        {STICKERS.map(sticker => (
          <button
            key={sticker.id}
            onClick={() => setSelectedStickerSrc(sticker.src)}
            className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 p-2 transition-all ${
              selectedStickerSrc === sticker.src 
                ? 'border-orange-500 bg-orange-50 scale-110' 
                : 'border-transparent bg-zinc-100 hover:bg-zinc-200'
            }`}
          >
            <img src={sticker.src} alt="sticker option" className="w-full h-full object-contain" />
          </button>
        ))}
      </div>
    </div>
  );
}
