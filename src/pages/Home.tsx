import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center h-screen p-6 overflow-hidden">
      {/* 1. 可选的全局背景图 (home_bg.jpg) */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/src/assets/ui/home_bg.jpg"
          className="w-full h-full object-cover"
          alt=""
          onError={(e) => (e.currentTarget.style.display = 'none')} // 如果没画背景图则自动隐藏，使用默认白底
        />
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="text-center flex flex-col items-center"
      >
        {/* 2. 手绘大 Logo (home_logo.png) */}
        <div className="w-48 h-48 mb-6 rotate-2 transition-transform hover:rotate-0">
          <img
            src="/src/assets/ui/home_logo.png"
            className="w-full h-full object-contain drop-shadow-md"
            alt="BobuCam Logo"
          />
        </div>

        {/* 3. 手绘标题文字 (home_title.png) */}
        <div className="h-20 mb-4">
          <img
            src="/src/assets/ui/home_title.png"
            className="h-full object-contain"
            alt="BobuCam"
          />
        </div>

        <div className="h-8 mb-20">
          <img
            src="/src/assets/ui/home_subtitle.png"
            className="h-full object-contain opacity-80"
            alt="Snap, decorate, and share!"
          />
        </div>

        {/* 4. 开始拍摄按钮 (btn_start.png) */}
        <Link
          to="/camera"
          className="relative inline-flex items-center justify-center w-64 transition-all hover:scale-105 active:scale-95"
        >
          <img
            src="/src/assets/ui/btn_start.png"
            className="w-full object-contain drop-shadow-lg"
            alt="Start Shooting"
          />
          {/* 这里不放文字了，因为你的图片里已经写了“Start Shooting” */}
        </Link>
      </motion.div>

      <div className="absolute bottom-6 h-6 opacity-40">
        <img
          src="/src/assets/ui/home_decorator.png"
          className="h-full object-contain"
          alt="Handmade Decorator"
        />
      </div>

    </div>
  );
}