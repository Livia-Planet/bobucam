import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Sticker } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

// 底部托盘贴纸清单 (可根据你的实际情况增减)
const STICKER_LIST = [
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
  // 严格调用已有的 store 方法，绝不擅自修改
  const { photos, addSticker, updateSticker, removeSticker } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentPhoto = photos[currentIndex];

  // 如果没有照片，安全返回首页
  if (!currentPhoto) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#FFFBF0]">
        <p className="mb-4 text-xl font-bold text-stone-600">还没拍照哦！</p>
        <button onClick={() => navigate('/')} className="px-8 py-3 bg-orange-500 text-white rounded-full font-bold shadow-lg active:scale-95">
          去拍照
        </button>
      </div>
    );
  }

  // 点击底部素材：将贴纸添加到照片正中央
  const handleAddSticker = (src: string) => {
    const newSticker: Sticker = {
      id: `sticker-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      src,
      x: 50,       // 位于宽度 50%
      y: 50,       // 位于高度 50%
      width: 25,   // 宽度占容器的 25%
      height: 25,  // 高度占容器的 25%
      rotation: 0,
    };
    addSticker(currentPhoto.id, newSticker);
    setActiveStickerId(newSticker.id);
  };

  // 处理拖拽结束：将像素位移转换为百分比并存入 store
  const handleDragEnd = (stickerId: string, info: any) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const sticker = currentPhoto.stickers.find(s => s.id === stickerId);
    if (!sticker) return;

    // 将拖拽的像素偏移量 (info.offset) 转化为百分比
    const dxPercent = (info.offset.x / rect.width) * 100;
    const dyPercent = (info.offset.y / rect.height) * 100;

    updateSticker(currentPhoto.id, stickerId, {
      x: sticker.x + dxPercent,
      y: sticker.y + dyPercent,
    });
  };

  return (
    // 全局点击取消选中贴纸
    <div className="flex flex-col h-screen bg-[#FFFBF0] overflow-hidden select-none" onClick={() => setActiveStickerId(null)}>

      {/* 顶部导航栏 */}
      <div className="relative h-20 flex items-center justify-between px-4 shrink-0">
        <img src="/src/assets/ui/header_bg.png" className="absolute inset-0 w-full h-full object-fill pointer-events-none" alt="" />

        {/* 重拍按钮 -> 导向 Camera (或 Home) */}
        <button onClick={() => navigate('/camera')} className="relative z-10 w-12 h-12 active:scale-90 transition-transform">
          <img src="/src/assets/ui/btn_retake.png" alt="重拍" className="w-full h-full object-contain drop-shadow-md" />
        </button>

        {/* 标题 */}
        <div className="relative z-10 h-10 pointer-events-none">
          <img src="/src/assets/ui/title_editor.png" alt="贴纸手账" className="h-full object-contain drop-shadow-md" />
        </div>

        {/* 下一步按钮 -> 导向 Export */}
        <button onClick={() => navigate('/export')} className="relative z-10 w-12 h-12 active:scale-90 transition-transform">
          <img src="/src/assets/ui/btn_next.png" alt="下一步" className="w-full h-full object-contain drop-shadow-md" />
        </button>
      </div>

      {/* 主画布区域 */}
      <div className="flex-1 relative flex items-center justify-center p-4">

        {/* 左右照片切换箭头 */}
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

        {/* 核心照片容器：绑定了 containerRef 且比例强制 3:4 */}
        <div
          ref={containerRef}
          className="relative w-full max-w-[320px] aspect-[3/4] bg-white shadow-2xl overflow-visible"
        >
          {/* 照片本体 */}
          <img src={currentPhoto.dataUrl} className="absolute inset-0 w-full h-full object-cover rounded-sm pointer-events-none" alt="照片" />

          {/* 关键：手绘相框层 - 必须位于照片之上，贴纸之下，且不能阻挡鼠标点击 */}
          <img
            src="/src/assets/ui/photo_frame.png"
            className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] object-fill pointer-events-none z-10"
            alt="相框"
          />

          {/* 贴纸渲染层 */}
          <div className="absolute inset-0 z-20">
            {currentPhoto.stickers.map((sticker) => (
              <motion.div
                key={sticker.id}
                drag
                dragMomentum={false}
                onDragStart={() => setActiveStickerId(sticker.id)}
                onDragEnd={(_, info) => handleDragEnd(sticker.id, info)}
                onClick={(e) => { e.stopPropagation(); setActiveStickerId(sticker.id); }}
                // 此处强制设置 transform 居中，确保拖拽时不再发生跳动，并且完美适配 Export.tsx
                animate={{ x: "-50%", y: "-50%" }}
                transition={{ duration: 0 }} // 关闭动画时间，确保实时更新
                className={`absolute cursor-move ${activeStickerId === sticker.id ? 'ring-2 ring-dashed ring-orange-500' : ''}`}
                style={{
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                  width: `${sticker.width}%`,
                  height: `${sticker.height}%`,
                  rotate: sticker.rotation,
                  touchAction: 'none'
                }}
              >
                {/* 贴纸图片 */}
                <img src={sticker.src} className="w-full h-full object-contain pointer-events-none drop-shadow-md" />

                {/* 仅在选中时显示的手绘操作按钮 */}
                <AnimatePresence>
                  {activeStickerId === sticker.id && (
                    <div className="absolute -inset-4 pointer-events-none">
                      {/* 删除：左上 */}
                      <motion.button
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="absolute -top-2 -left-2 w-8 h-8 pointer-events-auto active:scale-90 transition-transform"
                        onClick={(e) => { e.stopPropagation(); removeSticker(currentPhoto.id, sticker.id); }}
                      >
                        <img src="/src/assets/ui/btn_del.png" alt="删除" className="w-full h-full drop-shadow-lg" />
                      </motion.button>

                      {/* 旋转：右上 */}
                      <motion.button
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="absolute -top-2 -right-2 w-8 h-8 pointer-events-auto active:scale-90 transition-transform"
                        onClick={(e) => { e.stopPropagation(); updateSticker(currentPhoto.id, sticker.id, { rotation: sticker.rotation + 15 }); }}
                      >
                        <img src="/src/assets/ui/btn_rotate.png" alt="旋转" className="w-full h-full drop-shadow-lg" />
                      </motion.button>

                      {/* 缩放：右下 */}
                      <motion.button
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="absolute -bottom-2 -right-2 w-8 h-8 pointer-events-auto active:scale-90 transition-transform"
                        onClick={(e) => { e.stopPropagation(); updateSticker(currentPhoto.id, sticker.id, { width: sticker.width + 5, height: sticker.height + 5 }); }}
                      >
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

      {/* 底部贴纸托盘栏 */}
      <div className="relative h-36 p-4 shrink-0">
        <img src="/src/assets/ui/tray_bg.png" className="absolute inset-0 w-full h-full object-fill pointer-events-none" alt="" />
        <div className="relative z-10 flex gap-4 overflow-x-auto h-full items-center px-2 scrollbar-hide">
          {STICKER_LIST.map((s) => (
            <button
              key={s.id}
              onClick={(e) => { e.stopPropagation(); handleAddSticker(s.src); }}
              className="relative shrink-0 w-20 h-20 p-2 active:scale-90 transition-transform"
            >
              {/* 贴纸底座 */}
              <img src="/src/assets/ui/sticker_item_bg.png" className="absolute inset-0 w-full h-full object-contain -z-10 opacity-80" alt="" />
              <img src={s.src} className="w-full h-full object-contain pointer-events-none drop-shadow-sm" alt="贴纸" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}