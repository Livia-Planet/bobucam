import React, { useState, useRef } from 'react'; // ✅ 修正：添加了 React 导入，解决 Cannot find namespace 'React'
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Sticker } from '../types';

// 手绘贴纸素材
const STICKERS = [
  { id: 's1', src: '/src/assets/stickers/Bobu.png' },
  { id: 's2', src: '/src/assets/stickers/Duddu.png' },
  { id: 's3', src: '/src/assets/stickers/Issi.png' },
  { id: 's4', src: '/src/assets/stickers/Ri.png' },
  { id: 's5', src: '/src/assets/stickers/Pluttenplott.png' },
  { id: 's6', src: '/src/assets/stickers/Pollyplutten.png' },
  { id: 's7', src: '/src/assets/stickers/Doddi.png' },
  { id: 's8', src: '/src/assets/stickers/Nakis.png' },
];

export default function Editor() {
  const navigate = useNavigate();
  const { photos, addSticker, removeSticker } = useAppStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedStickerSrc, setSelectedStickerSrc] = useState<string>(STICKERS[0].src);
  const containerRef = useRef<HTMLDivElement>(null);

  if (photos.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#ef6f2e]">
        <div className="text-center bg-[#FDE4D0] p-8 border-4 border-[#3E2723] shadow-[4px_4px_0px_0px_#3E2723] rounded-3xl">
          <p className="mb-4 text-[#3E2723] font-bold text-xl">还没拍照哦！</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-[#FF8A65] border-4 border-[#3E2723] shadow-[4px_4px_0px_0px_#3E2723] text-[#3E2723] rounded-2xl font-bold hover:scale-105 active:scale-95 transition-transform"
          >
            返回首页
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
      width: 25,
      height: 25,
      rotation: Math.random() * 40 - 20,
    };

    addSticker(currentPhoto.id, newSticker);
    console.log(currentPhoto.stickers)
  };

  return (
    <div className="h-screen bg-[#ef6f2e] flex flex-col font-['Fredoka']">

      {/* 顶部 Header */}
      <div className="flex items-center justify-between p-4 bg-transparent z-10 relative">
        {/* 背景可以用一张大的长条手绘纸片图，这里暂用 CSS 模拟 */}

        {/* 重拍按钮 */}
        <button onClick={() => navigate('/camera')} className="w-24 active:scale-95 transition-transform">
          <img src="/src/assets/ui/btn_retake.png" alt="重拍" className="w-full" />
        </button>

        {/* 中间标题 */}
        <div className="w-40">
          <img src="/src/assets/ui/title_editor.png" alt="贴纸手账" className="w-full" />
        </div>

        {/* 下一步按钮 */}
        <button onClick={() => navigate('/export')} className="w-24 active:scale-95 transition-transform">
          <img src="/src/assets/ui/btn_next.png" alt="下一步" className="w-full" />
        </button>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="absolute left-4 z-20 p-2 bg-white border-4 border-[#3E2723] shadow-[2px_2px_0px_0px_#3E2723] rounded-full disabled:opacity-30 disabled:scale-100 hover:scale-110 active:scale-90 transition-all"
        >
          <ChevronLeft className="w-8 h-8 text-[#3E2723]" />
        </button>

        <button
          onClick={() => setCurrentIndex(prev => Math.min(photos.length - 1, prev + 1))}
          disabled={currentIndex === photos.length - 1}
          className="absolute right-4 z-20 p-2 bg-white border-4 border-[#3E2723] shadow-[2px_2px_0px_0px_#3E2723] rounded-full disabled:opacity-30 disabled:scale-100 hover:scale-110 active:scale-90 transition-all"
        >
          <ChevronRight className="w-8 h-8 text-[#3E2723]" />
        </button>

        {/* Photo Container */}
        <div
          ref={containerRef}
          // ✅ 修正：aspect-[3/4] -> aspect-3/4，rounded-[2rem] -> rounded-4xl
          className="relative w-full max-w-sm aspect-3/4 bg-stone-200 rounded-4xl border-8 border-[#3E2723] overflow-hidden shadow-[8px_8px_0px_0px_rgba(62,39,35,0.8)] cursor-crosshair"
          onClick={handlePhotoClick}
        >
          <img
            src={currentPhoto.dataUrl}
            alt={`Photo ${currentIndex + 1}`}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />

          <img
            src="/src/assets/ui/camera-frame.png"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
            alt="相机边框"
          />

          {/* Stickers */}
          {currentPhoto.stickers.map(sticker => (
            <motion.div
              key={sticker.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute group z-20"
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
              <img src={sticker.src} alt="sticker" className="w-full h-full object-contain drop-shadow-[2px_2px_0px_rgba(62,39,35,0.5)] pointer-events-none" />
              <div className="absolute -top-3 -right-3 bg-red-500 border-2 border-[#3E2723] text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-[2px_2px_0px_0px_#3E2723]">
                <Trash2 className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 底部贴纸选择托盘 */}
      <div className="h-36 bg-[#FDE4D0] border-t-8 border-[#3E2723] p-4 flex items-center gap-4 overflow-x-auto shadow-[0_-4px_0px_0px_rgba(0,0,0,0.1)]">
        {STICKERS.map(sticker => (
          <button
            key={sticker.id}
            onClick={() => setSelectedStickerSrc(sticker.src)}
            // ✅ 修正：flex-shrink-0 -> shrink-0
            className={`shrink-0 w-20 h-20 rounded-2xl transition-all ${selectedStickerSrc === sticker.src
              ? 'border-4 border-[#3E2723] bg-white scale-110 shadow-[4px_4px_0px_0px_#3E2723]'
              : 'border-4 border-transparent bg-white/50 hover:bg-white hover:scale-105'
              }`}
          >
            <img src={sticker.src} alt="sticker option" className="w-full h-full object-contain p-1" />
          </button>
        ))}
      </div>
    </div>
  );
}