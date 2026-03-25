import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Sticker } from '../types';
import { motion, AnimatePresence } from 'motion/react';

// 1. 扩展列表，加入 type 以区分贴纸和相框
const ITEM_LIST = [
  // 生命周期贴纸
  { id: 's1', src: '/src/assets/stickers/Bobu.png', category: 'life', type: 'sticker' },
  { id: 's2', src: '/src/assets/stickers/Duddu.png', category: 'life', type: 'sticker' },
  { id: 's3', src: '/src/assets/stickers/Issi.png', category: 'life', type: 'sticker' },
  { id: 's4', src: '/src/assets/stickers/Ri.png', category: 'life', type: 'sticker' },
  { id: 's5', src: '/src/assets/stickers/Pluttenplott.png', category: 'life', type: 'sticker' },
  { id: 's6', src: '/src/assets/stickers/Pollyplutten.png', category: 'life', type: 'sticker' },
  { id: 's7', src: '/src/assets/stickers/Doddi.png', category: 'life', type: 'sticker' },
  { id: 's8', src: '/src/assets/stickers/Nakis.png', category: 'life', type: 'sticker' },
  // 宇宙贴纸
  { id: 's9', src: '/src/assets/stickers/Sol.png', category: 'universe', type: 'sticker' },
  { id: 's10', src: '/src/assets/stickers/Merkurius.png', category: 'universe', type: 'sticker' },
  { id: 's11', src: '/src/assets/stickers/Venus.png', category: 'universe', type: 'sticker' },
  { id: 's12', src: '/src/assets/stickers/Jorden.png', category: 'universe', type: 'sticker' },
  { id: 's13', src: '/src/assets/stickers/Moon.png', category: 'universe', type: 'sticker' },
  { id: 's14', src: '/src/assets/stickers/Mars.png', category: 'universe', type: 'sticker' },
  { id: 's15', src: '/src/assets/stickers/Jupiter.png', category: 'universe', type: 'sticker' },
  { id: 's16', src: '/src/assets/stickers/Saturn.png', category: 'universe', type: 'sticker' },
  { id: 's17', src: '/src/assets/stickers/Uranus.png', category: 'universe', type: 'sticker' },
  { id: 's18', src: '/src/assets/stickers/Neptune.png', category: 'universe', type: 'sticker' },
  { id: 's19', src: '/src/assets/stickers/Svarthal.png', category: 'universe', type: 'sticker' },
  { id: 's20', src: '/src/assets/stickers/Maskhal.png', category: 'universe', type: 'sticker' },
  // 把相框放在 element 分类里
  { id: 'f1', src: '/src/assets/ui/photo_frame.png', category: 'element', type: 'frame' },
  // 如果你有更多的相框素材，可以继续加在这里，例如：
  // { id: 'f2', src: '/src/assets/ui/frame_vintage.png', category: 'element', type: 'frame' },
];

const CATEGORIES = [
  { id: 'universe', src: '/src/assets/ui/tab_universe.png' },
  { id: 'nature', src: '/src/assets/ui/tab_nature.png' },
  { id: 'life', src: '/src/assets/ui/tab_life.png' },
  { id: 'element', src: '/src/assets/ui/tab_element.png' },
];

export default function Editor() {
  const navigate = useNavigate();
  const { photos, addSticker, updateSticker, removeSticker, updatePhotoFrame } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('life');

  const containerRef = useRef<HTMLDivElement>(null);
  const currentPhoto = photos[currentIndex];

  if (!currentPhoto) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <p className="mb-4 text-xl font-bold text-zinc-400">还没拍照哦！</p>
        <button onClick={() => navigate('/')} className="active:scale-95 transition-transform">
          <img src="/src/assets/ui/btn_start.png" className="w-48 object-contain" alt="去拍照" />
        </button>
      </div>
    );
  }

  // 点击素材库物品
  const handleItemClick = (item: any) => {
    if (item.type === 'frame') {
      // 如果是相框，替换当前照片的相框
      updatePhotoFrame(currentPhoto.id, item.src);
    } else {
      // 如果是贴纸，添加到画布中心
      const newSticker: Sticker = {
        id: `sticker-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        src: item.src,
        x: 50,
        y: 50,
        width: 25,
        height: 25,
        rotation: 0,
      };
      addSticker(currentPhoto.id, newSticker);
      setActiveStickerId(newSticker.id);
    }
  };

  // 🌟 修复贴纸弹开问题：采用相对位移计算
  const handleDragEnd = (stickerId: string, info: any) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const sticker = currentPhoto.stickers.find(s => s.id === stickerId);
    if (!sticker) return;

    // 计算相对于原位置的百分比变化量
    const deltaXPercent = (info.offset.x / rect.width) * 100;
    const deltaYPercent = (info.offset.y / rect.height) * 100;

    updateSticker(currentPhoto.id, stickerId, {
      x: sticker.x + deltaXPercent,
      y: sticker.y + deltaYPercent,
    });
  };

  const filteredItems = ITEM_LIST.filter(item => item.category === activeCategory);

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden select-none" onClick={() => setActiveStickerId(null)}>

      {/* 顶部导航栏 */}
      <div className="relative h-20 flex items-center justify-between px-4 shrink-0">
        <img src="/src/assets/ui/header_bg.png" className="absolute inset-0 w-full h-full object-fill pointer-events-none" alt="" />
        <button onClick={() => navigate('/camera')} className="relative z-10 w-12 h-12 active:scale-90 transition-transform">
          <img src="/src/assets/ui/btn_retake.png" alt="重拍" className="w-full h-full object-contain" />
        </button>
        <div className="relative z-10 h-10">
          <img src="/src/assets/ui/title_editor.png" alt="贴纸手账" className="h-full object-contain" />
        </div>
        <button onClick={() => navigate('/export')} className="relative z-10 w-12 h-12 active:scale-90 transition-transform">
          <img src="/src/assets/ui/btn_next.png" alt="下一步" className="w-full h-full object-contain" />
        </button>
      </div>

      {/* 主画布区域 */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        {photos.length > 1 && (
          <>
            <button
              disabled={currentIndex === 0}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(currentIndex - 1); }}
              className={`absolute left-2 z-30 w-10 h-10 transition-all ${currentIndex === 0 ? 'opacity-0' : 'active:scale-90'}`}
            >
              <img src="/src/assets/ui/arrow_left.png" alt="左" className="w-full h-full" />
            </button>
            <button
              disabled={currentIndex === photos.length - 1}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(currentIndex + 1); }}
              className={`absolute right-2 z-30 w-10 h-10 transition-all ${currentIndex === photos.length - 1 ? 'opacity-0' : 'active:scale-90'}`}
            >
              <img src="/src/assets/ui/arrow_right.png" alt="右" className="w-full h-full" />
            </button>
          </>
        )}

        {/* 核心舞台：统一 3:4 比例 */}
        <div className="relative w-full max-w-[300px] aspect-[3/4] drop-shadow-2xl">

          {/* 层级 0：照片本体 */}
          <div className="absolute inset-[4%] z-0 overflow-hidden bg-zinc-100 rounded-sm">
            <img src={currentPhoto.dataUrl} className="w-full h-full object-cover pointer-events-none" alt="照片" />
          </div>

          {/* 层级 10：专属相框 (从当前照片数据中读取) */}
          {currentPhoto.frameSrc && (
            <img
              src={currentPhoto.frameSrc}
              className="absolute inset-0 w-full h-full object-fill pointer-events-none z-10"
              alt="相框"
            />
          )}

          {/* 层级 20：贴纸交互层 */}
          <div ref={containerRef} className="absolute inset-0 z-20">
            {currentPhoto.stickers.map((sticker) => (
              <motion.div
                key={sticker.id}
                drag
                dragMomentum={false}
                dragConstraints={containerRef}
                onDragStart={() => setActiveStickerId(sticker.id)}
                onDragEnd={(_, info) => handleDragEnd(sticker.id, info)}
                onClick={(e) => { e.stopPropagation(); setActiveStickerId(sticker.id); }}
                style={{
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                  width: `${sticker.width}%`,
                  height: `${sticker.height}%`,
                  rotate: sticker.rotation,
                  touchAction: 'none'
                }}
                // 确保拖拽和初始居中的逻辑不冲突
                animate={{ x: "-50%", y: "-50%" }}
                className={`absolute cursor-move ${activeStickerId === sticker.id ? 'ring-2 ring-dashed ring-orange-400/50' : ''}`}
              >
                <img src={sticker.src} className="w-full h-full object-contain pointer-events-none drop-shadow-md" />
                <AnimatePresence>
                  {activeStickerId === sticker.id && (
                    <div className="absolute -inset-4 pointer-events-none">
                      <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -top-2 -left-2 w-8 h-8 pointer-events-auto" onClick={(e) => { e.stopPropagation(); removeSticker(currentPhoto.id, sticker.id); }}>
                        <img src="/src/assets/ui/btn_del.png" alt="删除" className="w-full h-full" />
                      </motion.button>
                      <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -top-2 -right-2 w-8 h-8 pointer-events-auto" onClick={(e) => { e.stopPropagation(); updateSticker(currentPhoto.id, sticker.id, { rotation: sticker.rotation + 15 }); }}>
                        <img src="/src/assets/ui/btn_rotate.png" alt="旋转" className="w-full h-full" />
                      </motion.button>
                      <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -bottom-2 -right-2 w-8 h-8 pointer-events-auto" onClick={(e) => { e.stopPropagation(); updateSticker(currentPhoto.id, sticker.id, { width: sticker.width + 5, height: sticker.height + 5 }); }}>
                        <img src="/src/assets/ui/btn_scale.png" alt="缩放" className="w-full h-full" />
                      </motion.button>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部操作区 */}
      <div className="relative shrink-0 flex flex-col pb-4 pt-2">
        <img src="/src/assets/ui/tray_bg.png" className="absolute inset-0 w-full h-full object-fill pointer-events-none" alt="" />

        {/* 分类 Tab */}
        <div className="relative z-10 flex justify-around px-4 mb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={(e) => { e.stopPropagation(); setActiveCategory(cat.id); }}
              className="relative w-16 h-8 active:scale-95 transition-transform flex flex-col items-center"
            >
              <img src={cat.src} className={`w-full h-full object-contain transition-opacity ${activeCategory === cat.id ? 'opacity-100' : 'opacity-40'}`} alt={cat.id} />
              {activeCategory === cat.id && (
                <img src="/src/assets/ui/tab_indicator.png" className="absolute -bottom-2 w-8 h-2 object-contain" alt="" />
              )}
            </button>
          ))}
        </div>

        {/* 贴纸/相框列表 */}
        <div className="relative z-10 flex gap-4 overflow-x-auto items-center px-4 scrollbar-hide h-24">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}
              className="relative shrink-0 w-20 h-20 p-2 active:scale-90 transition-transform"
            >
              <img src="/src/assets/ui/sticker_item_bg.png" className="absolute inset-0 w-full h-full object-contain -z-10 opacity-80" alt="" />
              <img src={item.src} className="w-full h-full object-contain pointer-events-none" alt="素材" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}