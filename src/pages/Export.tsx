import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { motion } from 'motion/react';
import { Download, Share2, ArrowLeft, RefreshCw, Image as ImageIcon, Video } from 'lucide-react';
import { toPng } from 'html-to-image';
import gifshot from 'gifshot';

export default function Export() {
  const navigate = useNavigate();
  const { photos } = useAppStore();
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'static' | 'dynamic'>('static');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  if (photos.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <p className="mb-4 text-zinc-500">No photos found.</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-orange-500 text-white rounded-full font-bold">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const generateStatic = async () => {
    if (!stripRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(stripRef.current, { cacheBust: true, pixelRatio: 2 });
      setPreviewUrl(dataUrl);
    } catch (err) {
      console.error('Failed to generate static image', err);
    } finally {
      setIsExporting(false);
    }
  };

  const generateDynamic = async () => {
    setIsExporting(true);
    
    // We need to render each photo with stickers to a canvas first to get the frames
    // For simplicity in this demo, we'll just use the raw images if we can't easily render stickers
    // A robust solution would use html-to-image on each individual photo container first.
    
    // Let's try to generate a GIF from the raw photos for now
    const images = photos.map(p => p.dataUrl);
    
    gifshot.createGIF({
      images,
      gifWidth: 400,
      gifHeight: 533, // 3:4 aspect ratio
      interval: 0.5, // seconds per frame
      numFrames: images.length,
    }, (obj: any) => {
      if (!obj.error) {
        setPreviewUrl(obj.image);
      } else {
        console.error('Failed to generate GIF', obj.error);
      }
      setIsExporting(false);
    });
  };

  useEffect(() => {
    if (exportType === 'static') {
      generateStatic();
    } else {
      generateDynamic();
    }
  }, [exportType]);

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `bobucam-${exportType}-${Date.now()}.${exportType === 'static' ? 'png' : 'gif'}`;
    a.click();
  };

  return (
    <div className="h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white shadow-sm z-10">
        <button 
          onClick={() => navigate('/editor')}
          className="text-zinc-500 font-medium flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="font-bold text-zinc-900">Export</div>
        <button 
          onClick={() => navigate('/')}
          className="text-orange-500 font-bold"
        >
          Done
        </button>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center bg-zinc-100">
        
        {/* Toggle Export Type */}
        <div className="flex bg-white rounded-full p-1 shadow-sm mb-6">
          <button
            onClick={() => setExportType('static')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-colors ${
              exportType === 'static' ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:bg-zinc-50'
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Strip
          </button>
          <button
            onClick={() => setExportType('dynamic')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-colors ${
              exportType === 'dynamic' ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:bg-zinc-50'
            }`}
          >
            <Video className="w-4 h-4" /> GIF
          </button>
        </div>

        {/* Preview Container */}
        <div className="w-full max-w-xs relative bg-white p-4 pb-12 rounded-sm shadow-xl border border-zinc-200">
          {isExporting ? (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
              <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mb-4" />
              <p className="text-zinc-500 font-medium animate-pulse">Processing magic...</p>
            </div>
          ) : null}

          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full h-auto rounded-sm shadow-inner" />
          ) : (
            <div className="w-full aspect-[3/4] bg-zinc-100 animate-pulse rounded-sm" />
          )}

          {/* Hidden element for static rendering */}
          <div className="absolute -left-[9999px] top-0">
            <div ref={stripRef} className="w-[400px] bg-white p-4 pb-16 flex flex-col gap-4">
              {photos.map((photo, i) => (
                <div key={photo.id} className="relative w-full aspect-[3/4] bg-zinc-200 overflow-hidden">
                  <img src={photo.dataUrl} className="w-full h-full object-cover" />
                  {photo.stickers.map(sticker => (
                    <div
                      key={sticker.id}
                      className="absolute"
                      style={{
                        left: `${sticker.x}%`,
                        top: `${sticker.y}%`,
                        width: `${sticker.width}%`,
                        height: `${sticker.height}%`,
                        transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
                      }}
                    >
                      <img src={sticker.src} className="w-full h-full object-contain drop-shadow-md" />
                    </div>
                  ))}
                </div>
              ))}
              <div className="absolute bottom-4 right-4 text-zinc-400 font-black text-xl tracking-tighter opacity-50">
                BobuCam
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white p-6 border-t border-zinc-100 flex gap-4">
        <button
          onClick={handleDownload}
          disabled={isExporting || !previewUrl}
          className="flex-1 bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          <Download className="w-5 h-5" /> Save
        </button>
        <button
          disabled={isExporting || !previewUrl}
          className="flex-1 bg-zinc-900 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          <Share2 className="w-5 h-5" /> Share
        </button>
      </div>
    </div>
  );
}
