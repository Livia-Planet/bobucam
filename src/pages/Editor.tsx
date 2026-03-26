import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Sticker } from '../types';
import { motion, AnimatePresence } from 'motion/react';

// 完全保留你的素材列表和分类
const ITEM_LIST = [
  { id: 's1', src: '/stickers/Bobu.png', category: 'life', type: 'sticker' },
  { id: 's2', src: '/stickers/Duddu.png', category: 'life', type: 'sticker' },
  { id: 's3', src: '/stickers/Issi.png', category: 'life', type: 'sticker' },
  { id: 's4', src: '/stickers/Ri.png', category: 'life', type: 'sticker' },
  { id: 's5', src: '/stickers/Pluttenplott.png', category: 'life', type: 'sticker' },
  { id: 's6', src: '/stickers/Pollyplutten.png', category: 'life', type: 'sticker' },
  { id: 's7', src: '/stickers/Doddi.png', category: 'life', type: 'sticker' },
  { id: 's8', src: '/stickers/Nakis.png', category: 'life', type: 'sticker' },
  { id: 's9', src: '/stickers/Sol.png', category: 'universe', type: 'sticker' },
  { id: 's10', src: '/stickers/Merkurius.png', category: 'universe', type: 'sticker' },
  { id: 's11', src: '/stickers/Venus.png', category: 'universe', type: 'sticker' },
  { id: 's12', src: '/stickers/Jorden.png', category: 'universe', type: 'sticker' },
  { id: 's13', src: '/stickers/Moon.png', category: 'universe', type: 'sticker' },
  { id: 's14', src: '/stickers/Mars.png', category: 'universe', type: 'sticker' },
  { id: 's15', src: '/stickers/Jupiter.png', category: 'universe', type: 'sticker' },
  { id: 's16', src: '/stickers/Saturnus.png', category: 'universe', type: 'sticker' },
  { id: 's17', src: '/stickers/Uranus.png', category: 'universe', type: 'sticker' },
  { id: 's18', src: '/stickers/Neptunus.png', category: 'universe', type: 'sticker' },
  { id: 's19', src: '/stickers/Svarthal.png', category: 'universe', type: 'sticker' },
  { id: 's20', src: '/stickers/Maskhal.png', category: 'universe', type: 'sticker' },
  { id: 'f1', src: '/ui/photo_frame.png', category: 'element', type: 'frame' },
];

const CATEGORIES = [
  { id: 'universe', src: '/ui/tab_universe.png' },
  { id: 'nature', src: '/ui/tab_nature.png' },
  { id: 'life', src: '/ui/tab_life.png' },
  { id: 'element', src: '/ui/tab_element.png' },
];

export default function Editor() {
  const navigate = useNavigate();
  const { photos, addSticker, updateSticker, removeSticker, updatePhotoFrame } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('life');

  const containerRef = useRef<HTMLDivElement>(null);
  // 🌟 终极武器：用来记录每次拖拽开始时的精确坐标，彻底解决偏移问题
  const panStartMap = useRef<Record<string, { x: number; y: number }>>({});

  // 🌟 1. 音效初始化 (放在 Hooks 頂層)
  const clickAudio = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    // 初始化音效
    const audio = new Audio('/audio/click.wav');
    audio.load();
    clickAudio.current = audio;

    // 🌟 可選：清理函數（當用戶離開這個頁面時，釋放音效資源）
    return () => {
      if (clickAudio.current) {
        clickAudio.current.pause();
        clickAudio.current = null;
      }
    };
  }, []);

  const playClickSound = () => {
    if (clickAudio.current) {
      clickAudio.current.currentTime = 0;
      clickAudio.current.play().catch(e => console.log("Audio failed", e));
    }
  };

  const currentPhoto = photos[currentIndex];

  // 🌟 2. 確保 return 前所有的 Hooks 都已經宣告完畢
  if (!currentPhoto) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <p className="mb-4 text-xl font-bold text-zinc-400">No pics taken yet, cutie~</p>
        <button onClick={() => { playClickSound(); navigate('/'); }} className="active:scale-95 transition-transform">
          <img src="/ui/btn_start.png" className="w-48 object-contain" alt="Take Photo" />
        </button>
      </div>
    );
  }

  const handleItemClick = (item: any) => {
    playClickSound(); // 🌟 3. 點擊素材列表時播放
    if (item.type === 'frame') {
      updatePhotoFrame(currentPhoto.id, item.src);
    } else {
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

  const filteredItems = ITEM_LIST.filter(item => item.category === activeCategory);

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden select-none"
      onClick={() => { if (activeStickerId) playClickSound(); setActiveStickerId(null); }} // 🌟 點空白處取消也響一下
    >
      {/* 顶部导航栏 */}
      <div className="relative h-20 flex items-center justify-between px-4 shrink-0">
        <img src="/ui/header_bg.png" className="absolute inset-0 w-full h-full object-fill pointer-events-none" alt="" />
        <button onClick={() => { playClickSound(); navigate('/camera'); }} className="relative z-10 w-12 h-12 active:scale-90 transition-transform">
          <img src="/ui/btn_retake.png" alt="Retake" className="w-full h-full object-contain" />
        </button>
        <div className="relative z-10 h-10">
          <img src="/ui/title_editor.png" alt="Sticker Journal" className="h-full object-contain" />
        </div>
        <button onClick={() => { playClickSound(); navigate('/export'); }} className="relative z-10 w-12 h-12 active:scale-90 transition-transform">
          <img src="/ui/btn_next.png" alt="Next" className="w-full h-full object-contain" />
        </button>
      </div>

      {/* 主画布区域 */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        {photos.length > 1 && (
          <>
            <button
              disabled={currentIndex === 0}
              onClick={(e) => { e.stopPropagation(); playClickSound(); setCurrentIndex(currentIndex - 1); }} // 🌟 切換照片
              className={`absolute left-2 z-30 w-10 h-10 transition-all ${currentIndex === 0 ? 'opacity-0' : 'active:scale-90'}`}
            >
              <img src="/ui/arrow_left.png" alt="左" className="w-full h-full" />
            </button>
            <button
              disabled={currentIndex === photos.length - 1}
              onClick={(e) => { e.stopPropagation(); playClickSound(); setCurrentIndex(currentIndex + 1); }} // 🌟 切換照片
              className={`absolute right-2 z-30 w-10 h-10 transition-all ${currentIndex === photos.length - 1 ? 'opacity-0' : 'active:scale-90'}`}
            >
              <img src="/ui/arrow_right.png" alt="右" className="w-full h-full" />
            </button>
          </>
        )}

        <div className="relative w-full max-w-75 aspect-3/4 drop-shadow-2xl">
          {/* 层级 0：照片本体 */}
          <div className="absolute inset-[4%] z-0 overflow-hidden bg-zinc-100 rounded-sm">
            <img src={currentPhoto.dataUrl} className="w-full h-full object-cover pointer-events-none" alt="photo" />
          </div>

          {/* 层级 10：专属相框 */}
          {currentPhoto.frameSrc && (
            <img
              src={currentPhoto.frameSrc}
              className="absolute inset-0 w-full h-full object-fill pointer-events-none z-10"
              alt="frame"
            />
          )}

          {/* 层级 20：贴纸交互层 */}
          <div ref={containerRef} className="absolute inset-0 z-20 overflow-hidden">
            {currentPhoto.stickers.map((sticker) => (
              <motion.div
                key={sticker.id}
                // 🌟 改用 onPan 替代 drag，彻底消灭位移冲突
                onPanStart={() => {
                  panStartMap.current[sticker.id] = { x: sticker.x, y: sticker.y };
                  if (activeStickerId !== sticker.id) playClickSound(); // 🌟 選中貼紙時響一下
                  setActiveStickerId(sticker.id);
                }}
                onPan={(e, info) => {
                  if (!containerRef.current || !panStartMap.current[sticker.id]) return;
                  const rect = containerRef.current.getBoundingClientRect();
                  const startPos = panStartMap.current[sticker.id];

                  const dxPercent = (info.offset.x / rect.width) * 100;
                  const dyPercent = (info.offset.y / rect.height) * 100;

                  updateSticker(currentPhoto.id, sticker.id, {
                    x: Math.min(Math.max(startPos.x + dxPercent, 0), 100),
                    y: Math.min(Math.max(startPos.y + dyPercent, 0), 100),
                  });
                }}
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
                className={`absolute cursor-pointer ${activeStickerId === sticker.id ? 'ring-2 ring-dashed ring-orange-400/50' : ''}`}
              >
                <img src={sticker.src}
                  // 🌟 加在這裡，這樣貼紙線條就會自己抖動，但不會影響你拖拽它
                  className="w-full h-full object-contain pointer-events-none drop-shadow-md" />
                <AnimatePresence>
                  {activeStickerId === sticker.id && (
                    <div className="absolute -inset-4 pointer-events-none">
                      {/* 1. 左上角：刪除 */}
                      <motion.button
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="absolute -top-2 -left-2 w-8 h-8 pointer-events-auto rough-wiggle"
                        onClick={(e) => { e.stopPropagation(); removeSticker(currentPhoto.id, sticker.id); }}
                      >
                        <img src="/ui/btn_del.png" alt="Delete" className="w-full h-full" />
                      </motion.button>

                      {/* 2. 右上角：旋轉 */}
                      <motion.button
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="absolute -top-2 -right-2 w-8 h-8 pointer-events-auto rough-wiggle"
                        style={{ animationDelay: '0.1s' }} // 💡 小技巧：讓每個按鈕抖動時間錯開，更自然
                        onClick={(e) => { e.stopPropagation(); updateSticker(currentPhoto.id, sticker.id, { rotation: sticker.rotation + 15 }); }}
                      >
                        <img src="/ui/btn_rotate.png" alt="Rotate" className="w-full h-full" />
                      </motion.button>

                      {/* 3. 右下角：放大 */}
                      <motion.button
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="absolute -bottom-2 -right-2 w-8 h-8 pointer-events-auto rough-wiggle"
                        style={{ animationDelay: '0.2s' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSticker(currentPhoto.id, sticker.id, {
                            width: sticker.width + 5,
                            height: sticker.height + 5
                          });
                        }}
                      >
                        <img src="/ui/btn_scale.png" alt="Scale Up" className="w-full h-full" />
                      </motion.button>

                      {/* 🌟 4. 新增左下角：縮小 */}
                      <motion.button
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="absolute -bottom-2 -left-2 w-8 h-8 pointer-events-auto rough-wiggle"
                        style={{ animationDelay: '0.3s' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Math.max(10, ...) 確保寬高最少維持在 5%，不會消失
                          updateSticker(currentPhoto.id, sticker.id, {
                            width: Math.max(5, sticker.width - 5),
                            height: Math.max(5, sticker.height - 5)
                          });
                        }}
                      >
                        <img src="/ui/btn_shrink.png" alt="Shrink" className="w-full h-full" />
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
        <img src="/ui/tray_bg.png" className="absolute inset-0 w-full h-full object-fill pointer-events-none" alt="" />

        {/* 分类 Tab */}
        <div className="relative z-10 flex justify-around px-4 mb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={(e) => { e.stopPropagation(); playClickSound(); setActiveCategory(cat.id); }} // 🌟 分類切換
              className="relative w-16 h-8 active:scale-95 transition-transform flex flex-col items-center"
            >
              <img src={cat.src} className={`w-full h-full object-contain transition-opacity ${activeCategory === cat.id ? 'opacity-100' : 'opacity-40'}`} alt={cat.id} />
              {activeCategory === cat.id && (
                <img src="/ui/tab_indicator.png" className="absolute -bottom-2 w-8 h-2 object-contain" alt="" />
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
              <img src="/ui/sticker_item_bg.png" className="absolute inset-0 w-full h-full object-contain -z-10 opacity-80" alt="" />
              <img src={item.src} className="w-full h-full object-contain pointer-events-none" alt="sticker" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}