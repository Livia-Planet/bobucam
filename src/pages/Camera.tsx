import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Camera as CameraIcon, X } from 'lucide-react';

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

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', aspectRatio: 3 / 4 },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      // Fallback or error handling could go here
    }
  };

  useEffect(() => {
    reset(); // Clear previous session
    startCamera();
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

      // Match canvas to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror the image horizontally
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        addPhoto(dataUrl);
        setPhotoCount(prev => prev + 1);

        // Flash effect
        setFlash(true);
        setTimeout(() => setFlash(false), 100);
      }
    }
  }, [addPhoto]);

  const startShootingSequence = async () => {
    if (isShooting) return;
    setIsShooting(true);

    for (let i = 0; i < 4; i++) {
      // Countdown 3, 2, 1
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setCountdown(null);
      takePhoto();
      await new Promise(resolve => setTimeout(resolve, 500)); // Pause after photo
    }

    // Stop camera and navigate
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    navigate('/editor');
  };

  return (
    // 1. 修改背景色为 #ef6f2e (原本是 bg-zinc-900)
    <div className="relative h-screen bg-[#ef6f2e] flex flex-col">

      {/* Header (原样保留) */}
      <div className="absolute top-0 left-0 right-0 p-4 z-30 flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:scale-105 transition-transform"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-full text-white font-medium text-sm">
          {photoCount} / 4
        </div>
      </div>

      {/* Camera Viewfinder */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover -scale-x-100"
        />

        {/* 绝对不能丢的 canvas，拍照全靠它 */}
        <canvas ref={canvasRef} className="hidden" />

        {/* 👇 新增：手绘镂空相框！层级 z-10，不阻挡其他动画 */}
        <img
          src="/src/assets/ui/camera-frame.png"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
          alt="相机边框"
        />

        {/* Flash Overlay (原样保留，调整层级 z-20) */}
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

        {/* Countdown Overlay (原样保留，调整层级 z-30 确保显示在最上层) */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="absolute z-30 text-white text-8xl font-black drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
            >
              {countdown}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls (底部控制区) */}
      <div className="h-40 bg-[#ef6f2e] flex items-center justify-center pb-8">
        {/* 👇 替换为你要求的手绘快门按钮，保留全部原有触发逻辑 */}
        <button
          onClick={startShootingSequence}
          disabled={isShooting}
          className="transition-transform active:scale-95 hover:scale-105 disabled:opacity-50 disabled:active:scale-100"
        >
          <img
            src="/src/assets/ui/shutter-btn.png"
            alt="拍照"
            // 建议你的 shutter-btn.png 素材尺寸在 300x300px 左右，这里限制显示大小为 24x24 (96px)
            className="w-24 h-24 object-contain drop-shadow-xl"
          />
        </button>
      </div>
    </div>
  );
}
