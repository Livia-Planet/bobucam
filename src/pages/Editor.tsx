import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Sticker } from '../types';
import { motion, AnimatePresence } from 'motion/react';

// 1. 扩展贴纸清单，加入 category 字段
const STICKER_LIST = [
  // 生命周期 (你现有的第一批)
  { id: 's1', src: '/src/assets/stickers/Bobu.png', category: 'life' },
  { id: 's2', src: '/src/assets/stickers/Duddu.png', category: 'life' },
  { id: 's3', src: '/src/assets/stickers/Issi.png', category: 'life' },
  { id: 's4', src: '/src/assets/stickers/Ri.png', category: 'life' },
  { id: 's5', src: '/src/assets/stickers/Pluttenplott.png', category: 'life' },
  { id: 's6', src: '/src/assets/stickers/Pollyplutten.png', category: 'life' },
  { id: 's7', src: '/src/assets/stickers/Doddi.png', category: 'life' },
  { id: 's8', src: '/src/assets/stickers/Nakis.png', category: 'life' },
  // 占位符：未来你可以添加其他分类的贴纸
  { id: 's9', src: '/src/assets/stickers/Sol.png', category: 'universe' },
  { id: 's10', src: '/src/assets/stickers/Merkurius.png', category: 'universe' },
  { id: 's11', src: '/src/assets/stickers/Venus.png', category: 'universe' },
  { id: 's12', src: '/src/assets/stickers/Jorden.png', category: 'universe' },
  { id: 's13', src: '/src/assets/stickers/Moon.png', category: 'universe' },
  { id: 's14', src: '/src/assets/stickers/Mars.png', category: 'universe' },
  { id: 's15', src: '/src/assets/stickers/Jupiter.png', category: 'universe' },
  { id: 's16', src: '/src/assets/stickers/Saturn.png', category: 'universe' },
  { id: 's17', src: '/src/assets/stickers/Uranus.png', category: 'universe' },
  { id: 's18', src: '/src/assets/stickers/Neptune.png', category: 'universe' },
  { id: 's19', src: '/src/assets/stickers/Svarthal.png', category: 'universe' },
  { id: 's20', src: '/src/assets/stickers/Maskhal.png', category: 'universe' },
  // { id: 'u1', src: '/src/assets/stickers/star.png', category: 'universe' },
];

// 分类配置
const CATEGORIES = [
  { id: 'universe', src: '/src/assets/ui/tab_universe.png' },
  { id: 'nature', src: '/src/assets/ui/tab_nature.png' },
  { id: 'life', src: '/src/assets/ui/tab_life.png' },
  { id: 'element', src: '/src/assets/ui/tab_element.png' },
];

export default function Editor() {
  const navigate = useNavigate();
  const { photos, addSticker, updateSticker, removeSticker } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('life'); // 默认选中生命类

  const containerRef = useRef<HTMLDivElement>(null);
  const currentPhoto = photos[currentIndex];

  if (!currentPhoto) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <p className="mb-4 text-xl font-bold text-zinc-400">还没拍照哦！</p>
        <button onClick={() => navigate('/')} className="active:scale-95 transition-transform">
          {/* 这里复用了首页的去拍照按钮素材 */}
          <img src="/src/assets/ui/btn_start.png" className="w-48 object-contain" alt="去拍照" />
        </button>
      </div>
    );
  }

  const handleAddSticker = (src: string) => {
    const newSticker: Sticker = {
      id: `sticker-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      src,
      x: 50,
      y: 50,
      width: 25,
      height: 25,
      rotation: 0,
    };
    addSticker(currentPhoto.id, newSticker);
    setActiveStickerId(newSticker.id);
  };

  const handleDragEnd = (stickerId: string, info: any) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const sticker = currentPhoto.stickers.find(s => s.id === stickerId);
    if (!sticker) return;

    const dxPercent = (info.offset.x / rect.width) * 100;
    const dyPercent = (info.offset.y / rect.height) * 100;

    updateSticker(currentPhoto.id, stickerId, {
      x: sticker.x + dxPercent,
      y: sticker.y + dyPercent,
    });
  };

  // 根据当前选中分类过滤贴纸
  const filteredStickers = STICKER_LIST.filter(s => s.category === activeCategory);

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden select-none" onClick={() => setActiveStickerId(null)}>

      {/* 顶部导航栏 */}
      <div className="relative h-20 flex items-center justify-between px-4 shrink-0">
        <img src="/src/assets/ui/header_bg.png" className="absolute inset-0 w-full h-full object-fill pointer-events-none" alt="" />
        <button onClick={() => navigate('/camera')} className="relative z-10 w-12 h-12 active:scale-90 transition-transform">
          <img src="/src/assets/ui/btn_retake.png" alt="重拍" className="w-full h-full object-contain drop-shadow-md" />
        </button>
        <div className="relative z-10 h-10 pointer-events-none">
          <img src="/src/assets/ui/title_editor.png" alt="贴纸手账" className="h-full object-contain drop-shadow-md" />
        </div>
        <button onClick={() => navigate('/export')} className="relative z-10 w-12 h-12 active:scale-90 transition-transform">
          <img src="/src/assets/ui/btn_next.png" alt="下一步" className="w-full h-full object-contain drop-shadow-md" />
        </button>
      </div>

      {/* 主画布区域 */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        {photos.length > 1 && (
          <>
            <button
              disabled={currentIndex === 0}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(currentIndex - 1); }}
              className={`absolute left-2 z-30 w-12 h-12 transition-all ${currentIndex === 0 ? 'opacity-0' : 'active:scale-90 hover:scale-110 drop-shadow-lg'}`}
            >
              <img src="/src/assets/ui/arrow_left.png" alt="左" className="w-full h-full" />
            </button>
            <button
              disabled={currentIndex === photos.length - 1}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(currentIndex + 1); }}
              className={`absolute right-2 z-30 w-12 h-12 transition-all ${currentIndex === photos.length - 1 ? 'opacity-0' : 'active:scale-90 hover:scale-110 drop-shadow-lg'}`}
            >
              <img src="/src/assets/ui/arrow_right.png" alt="右" className="w-full h-full" />
            </button>
          </>
        )}

        {/* 核心舞台容器：定义了 300px 的最大宽度和 3:4 的比例 */}
        <div className="relative w-full max-w-[300px] aspect-[3/4] drop-shadow-2xl">

          {/* 1. 底层：照片容器 (向内缩进 4%，确保边缘被相框覆盖) */}
          <div
            className="absolute inset-[4%] z-0 overflow-hidden bg-zinc-200 rounded-sm"
          >
            <img
              src={currentPhoto.dataUrl}
              className="w-full h-full object-cover pointer-events-none"
              alt="照片本体"
            />
          </div>

          {/* 2. 中层：手绘相框 (铺满 300px 容器，z-10，正好压在缩小后的照片边缘上) */}
          <img
            src="/src/assets/ui/photo_frame.png"
            className="absolute inset-0 w-full h-full object-fill pointer-events-none z-10"
            alt="相框"
          />

          {/* 3. 顶层：贴纸交互层 (z-20，铺满全场，保证贴纸永远在最上面，且能贴到相框边上) */}
          <div
            ref={containerRef}
            className="absolute inset-0 z-20"
          >
            {currentPhoto.stickers.map((sticker) => (
              <motion.div
                key={sticker.id}
                drag
                dragMomentum={false}
                dragConstraints={containerRef} // 贴纸可以移动到相框的任何角落
                onDragStart={() => setActiveStickerId(sticker.id)}
                onDragEnd={(_, info) => handleDragEnd(sticker.id, info)}
                onClick={(e) => { e.stopPropagation(); setActiveStickerId(sticker.id); }}
                style={{
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                  width: `${sticker.width}%`,
                  height: `${sticker.height}%`,
                  rotate: sticker.rotation,
                  x: "-50%",
                  y: "-50%",
                  touchAction: 'none'
                }}
                className={`absolute cursor-move ${activeStickerId === sticker.id ? 'ring-2 ring-dashed ring-orange-400/50' : ''}`}
              >
                <img src={sticker.src} className="w-full h-full object-contain pointer-events-none drop-shadow-md" />

                <AnimatePresence>
                  {activeStickerId === sticker.id && (
                    <div className="absolute -inset-4 pointer-events-none">
                      {/* 这里是你的删除、旋转、缩放按钮，保持原样 */}
                      <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -top-2 -left-2 w-8 h-8 pointer-events-auto active:scale-90 transition-transform" onClick={(e) => { e.stopPropagation(); removeSticker(currentPhoto.id, sticker.id); }}>
                        <img src="/src/assets/ui/btn_del.png" alt="删除" className="w-full h-full drop-shadow-lg" />
                      </motion.button>
                      <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -top-2 -right-2 w-8 h-8 pointer-events-auto active:scale-90 transition-transform" onClick={(e) => { e.stopPropagation(); updateSticker(currentPhoto.id, sticker.id, { rotation: sticker.rotation + 15 }); }}>
                        <img src="/src/assets/ui/btn_rotate.png" alt="旋转" className="w-full h-full drop-shadow-lg" />
                      </motion.button>
                      <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -bottom-2 -right-2 w-8 h-8 pointer-events-auto active:scale-90 transition-transform" onClick={(e) => { e.stopPropagation(); updateSticker(currentPhoto.id, sticker.id, { width: sticker.width + 5, height: sticker.height + 5 }); }}>
                        <img src="/src/assets/ui/btn_scale.png" alt="缩放" className="w-full h-full drop-shadow-lg" />
                      </motion.button>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部操作区 (分类 Tab + 贴纸列表) */}
      <div className="relative shrink-0 flex flex-col pb-4 pt-2">
        <img src="/src/assets/ui/tray_bg.png" className="absolute inset-0 w-full h-full object-fill pointer-events-none" alt="" />

        {/* 🌟 新增：分类 Tab 栏 */}
        <div className="relative z-10 flex justify-around px-4 mb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={(e) => { e.stopPropagation(); setActiveCategory(cat.id); }}
              className="relative w-16 h-8 active:scale-95 transition-transform flex flex-col items-center"
            >
              <img src={cat.src} className={`w-full h-full object-contain transition-opacity ${activeCategory === cat.id ? 'opacity-100' : 'opacity-50'}`} alt={cat.id} />
              {/* 选中下划线指示器 */}
              {activeCategory === cat.id && (
                <img src="/src/assets/ui/tab_indicator.png" className="absolute -bottom-2 w-8 h-2 object-contain" alt="" />
              )}
            </button>
          ))}
        </div>

        {/* 贴纸滚动列表 */}
        <div className="relative z-10 flex gap-4 overflow-x-auto items-center px-4 scrollbar-hide h-24">
          {filteredStickers.length > 0 ? (
            filteredStickers.map((s) => (
              <button
                key={s.id}
                onClick={(e) => { e.stopPropagation(); handleAddSticker(s.src); }}
                className="relative shrink-0 w-20 h-20 p-2 active:scale-90 transition-transform"
              >
                <img src="/src/assets/ui/sticker_item_bg.png" className="absolute inset-0 w-full h-full object-contain -z-10 opacity-80" alt="" />
                <img src={s.src} className="w-full h-full object-contain pointer-events-none drop-shadow-sm" alt="贴纸" />
              </button>
            ))
          ) : (
            // 还没有贴纸时的提示
            <div className="w-full flex justify-center text-zinc-500/50 italic font-medium">
              这里空空的...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}