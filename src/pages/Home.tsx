import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

// 🌟 核心技巧：將 Link 包裝成可以做動畫的組件
const MotionLink = motion.create(Link);

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center h-screen p-6 overflow-hidden">
      {/* 1. 全局背景圖 */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/public/ui/home_bg.jpg"
          className="w-full h-full object-cover"
          alt=""
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      </div>

      {/* 這裡是你原本的入場動畫容器 */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="text-center flex flex-col items-center"
      >
        {/* 2. Logo */}
        <div className="w-48 h-48 mb-6 rotate-2 transition-transform hover:rotate-0">
          <img
            src="/public/ui/home_logo.png"
            className="w-full h-full object-contain drop-shadow-md"
            alt="BobuCam Logo"
          />
        </div>

        {/* 3. 標題文字 */}
        <div className="h-20 mb-4">
          <img
            src="/public/ui/home_title.png"
            className="h-full object-contain"
            alt="BobuCam"
          />
        </div>

        <div className="h-8 mb-20">
          <img
            src="/public/ui/home_subtitle.png"
            className="h-full object-contain opacity-80"
            alt="Snap, decorate, and share!"
          />
        </div>

        {/* 🌟 4. 修改後的開始拍攝按鈕 */}
        <MotionLink
          to="/camera"
          className="relative inline-flex items-center justify-center w-64"
          // 滑鼠懸停與點擊效果
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          // 持續的抖動動畫 (方案 A)
          animate={{
            rotate: [0, -1.5, 1.5, -1, 0], // 小幅度旋轉
            x: [0, -1, 1, 0],             // 小幅度左右位移
          }}
          transition={{
            duration: 0.6,                // 抖動一個週期的時間
            repeat: Infinity,             // 無限循環
            repeatType: "mirror",         // 鏡像往返，讓動作更連貫
            ease: "easeInOut"
          }}
        >
          <img
            src="/public/ui/btn_start.png"
            className="w-full object-contain drop-shadow-lg"
            alt="Start Shooting"
          />
        </MotionLink>
      </motion.div>

      <div className="absolute bottom-6 h-6 opacity-40">
        <img
          src="/public/ui/home_decorator.png"
          className="h-full object-contain"
          alt="Handmade Decorator"
        />
      </div>
    </div>
  );
}