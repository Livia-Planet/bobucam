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
        video: { facingMode: 'user', aspectRatio: 3/4 },
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
    <div className="relative h-screen bg-zinc-900 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center">
        <button 
          onClick={() => navigate('/')}
          className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white"
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
        <canvas ref={canvasRef} className="hidden" />

        {/* Flash Overlay */}
        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute inset-0 bg-white z-10"
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
              className="absolute z-20 text-white text-8xl font-black drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
            >
              {countdown}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="h-40 bg-black flex items-center justify-center pb-8">
        <button
          onClick={startShootingSequence}
          disabled={isShooting}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-50 transition-transform active:scale-95"
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
            {isShooting ? (
              <div className="w-6 h-6 bg-red-500 rounded-sm animate-pulse" />
            ) : (
              <CameraIcon className="w-8 h-8 text-black" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
