import { Link } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-6 bg-gradient-to-b from-orange-50 to-orange-100">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="text-center"
      >
        <div className="w-32 h-32 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-8 rotate-3">
          <Camera className="w-16 h-16 text-orange-500" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-zinc-900 mb-4">
          BobuCam
        </h1>
        <p className="text-zinc-600 mb-12 font-medium">
          Snap, decorate, and share your happy moments!
        </p>
        
        <Link
          to="/camera"
          className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-orange-500 rounded-full shadow-lg hover:bg-orange-600 hover:scale-105 transition-all active:scale-95"
        >
          Start Shooting
        </Link>
      </motion.div>
    </div>
  );
}
