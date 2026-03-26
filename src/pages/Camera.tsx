import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';

export default function Camera() {
  const navigate = useNavigate();
  const { addPhoto, reset } = useAppStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [photoCount, setPhotoCount] = useState(0);
  const [isShooting, setIsShooting] = useState(false);
  const [flash, setFlash] = useState(false);

  // 記錄當前鏡頭模式
  // 🌟 這裡要加上 <'user' | 'environment'>，不然 TS 會以為它只是一個普通字串
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const shutterAudio = useRef(new Audio('/audio/camera.wav'));
  const clickAudio = useRef(new Audio('/audio/click.wav'));

  // 🌟 小技巧：預加載設置
  useEffect(() => {
    shutterAudio.current.load();
    clickAudio.current.load();
  }, []);

  // 🌟 修改：統一使用 Ref 播放，效率更高
  const playClickSound = () => {
    if (clickAudio.current) {
      clickAudio.current.currentTime = 0;
      clickAudio.current.play().catch(e => console.log("Click sound failed"));
    }
  };

  // 1. 修改定義：讓 startCamera 接受一個 mode 參數
  const startCamera = async (mode: 'user' | 'environment') => {
    try {
      // 🌟 優化：啟動前先清空目前的流，避免畫面凍結
      if (videoRef.current) videoRef.current.srcObject = null;

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        // 🌟 這裡要把 'user' 改成 mode，這樣它才會切換！
        video: {
          facingMode: mode,
          aspectRatio: 3 / 4,
          // 🌟 增加：嘗試請求更快的幀率，減少取景器延遲
          frameRate: { ideal: 30 }
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  // 2. 修改調用邏輯
  const toggleCamera = () => {
    playClickSound(); // 🌟 點擊切換鈕時播放 click.wav

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    const nextMode: 'user' | 'environment' = facingMode === 'user' ? 'environment' : 'user';

    setFacingMode(nextMode);
    // 這裡傳入 nextMode，現在 startCamera 能接收它了！
    startCamera(nextMode);
  };

  useEffect(() => {
    reset(); // Clear previous session
    startCamera(facingMode); // 🌟 這裡也要加上 facingMode
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {

      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // 🌟 只有前置鏡頭需要左右翻轉
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        addPhoto(dataUrl);
        setPhotoCount(prev => prev + 1);

        setFlash(true);
        setTimeout(() => setFlash(false), 100);
      }
    }
  }, [addPhoto, facingMode]); // 加上 facingMode 依賴更嚴謹

  const startShootingSequence = async () => {
    if (isShooting) return;

    playClickSound(); // 🌟 點擊大快門鈕時播放 click.wav
    setIsShooting(true);

    for (let i = 0; i < 4; i++) {
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        // 🌟 核心修改：當倒數到 1 的時候，提前播放拍照音效
        if (c === 1) {
          shutterAudio.current.currentTime = 0;
          shutterAudio.current.play().catch(e => console.log("Shutter sound failed"));
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setCountdown(null);
      takePhoto();
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    navigate('/editor');
  };

  return (
    <div className="relative h-screen bg-[#ef6f2e] flex flex-col">

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-30 flex justify-between items-center">
        <div className="flex gap-4"> {/* 🌟 把關閉和翻轉按鈕包在一起 */}
          <button
            onClick={() => {
              clickAudio.current.currentTime = 0; // 重置聲音
              clickAudio.current.play(); // 播放啵啵聲

              // 給聲音一點點播放時間（可加可不加，通常直接跳轉也行）
              setTimeout(() => navigate('/'), 100);
            }}
            className="hover:scale-110 active:scale-95 transition-transform"
          >
            <img
              src="/ui/btn_close.png"
              className="w-10 h-10 object-contain drop-shadow-md"
              alt="Close"
            />
          </button>

          {/* 🌟 翻轉鏡頭按鈕 */}
          <button onClick={toggleCamera} disabled={isShooting} className="hover:scale-110 active:scale-95 transition-transform disabled:opacity-50">
            <img src="/ui/btn_flip.png" className="w-10 h-10 object-contain drop-shadow-md" alt="Flip Camera" />
          </button>
        </div>

        {/* 拍照计数器：根据 photoCount 状态动态加载不同图片 */}
        <div className="h-8">
          <img
            src={`/ui/count_${photoCount}.png`}
            className="h-full object-contain drop-shadow-md"
            alt={`${photoCount}/4`}
          />
        </div>
      </div>

      {/* Camera Viewfinder */}
      <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
        {/* 🌟 增加 bg-black，這樣切換時會閃黑一下，比凍結在那裡更自然 */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${facingMode === 'user' ? '-scale-x-100' : ''}`}
        />

        <canvas ref={canvasRef} className="hidden" />

        <img
          src="/ui/camera-frame.png"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
          alt="Camera Frame"
        />

        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute inset-0 bg-white z-20"
            />
          )}
        </AnimatePresence>

        {/* Countdown Overlay */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="absolute z-30"
            >
              {/* 倒计时：根据 countdown 状态动态加载不同图片 */}
              <img
                src={`/ui/cd_${countdown}.png`}
                className="w-48 h-48 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                alt={`countdown ${countdown}`}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="h-40 bg-[#ef6f2e] flex items-center justify-center pb-8">
        <button
          onClick={startShootingSequence}
          disabled={isShooting}
          className="transition-transform active:scale-95 hover:scale-105 disabled:opacity-50 disabled:active:scale-100"
        >
          <img
            src="/ui/shutter-btn.png"
            alt="Take Photo"
            className="w-24 h-24 object-contain drop-shadow-xl"
          />
        </button>
      </div>
    </div>
  );
}