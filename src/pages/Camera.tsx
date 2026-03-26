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

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        addPhoto(dataUrl);
        setPhotoCount(prev => prev + 1);

        setFlash(true);
        setTimeout(() => setFlash(false), 100);
      }
    }
  }, [addPhoto]);

  const startShootingSequence = async () => {
    if (isShooting) return;
    setIsShooting(true);

    for (let i = 0; i < 4; i++) {
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
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
        {/* 关闭按钮：移除了背景色和边距，只留图片本身 */}
        <button
          onClick={() => navigate('/')}
          className="hover:scale-110 active:scale-95 transition-transform"
        >
          <img
            src="/ui/btn_close.png"
            className="w-10 h-10 object-contain drop-shadow-md"
            alt="Close"
          />
        </button>

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
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover -scale-x-100"
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