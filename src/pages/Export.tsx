import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { toPng } from 'html-to-image';
import gifshot from 'gifshot';

export default function Export() {
  const navigate = useNavigate();
  const { photos } = useAppStore();

  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'strip' | 'grid' | 'gif'>('strip');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // 1. 增加一個狀態，記錄當前顯示的預覽是否是「最新」的
  const [isDirty, setIsDirty] = useState(true);
  const stripRef = useRef<HTMLDivElement>(null);

  if (photos.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <img src="/src/assets/ui/text_nophoto.png" alt="No pics taken yet, cutie!" className="w-64 mb-8 object-contain opacity-80" />
        <button onClick={() => navigate('/')} className="active:scale-95 transition-transform">
          <img src="/src/assets/ui/btn_start.png" className="w-48 object-contain rough-wiggle" alt="take photo" />
        </button>
      </div>
    );
  }

  const generateStatic = async () => {
    if (!stripRef.current) return;
    setIsExporting(true);

    setTimeout(async () => {
      try {
        const dataUrl = await toPng(stripRef.current!, {
          cacheBust: true,
          pixelRatio: 1.5,
          backgroundColor: '#ffffff' // ✨ 1. 改成白色背景
        });
        setPreviewUrl(dataUrl);
      } catch (err) {
        console.error('Failed to generate static image', err);
      } finally {
        setIsExporting(false);
      }
    }, 500);
  };

  const generateDynamic = async () => {
    setIsExporting(true);

    setTimeout(async () => {
      try {
        const frameNodes = document.querySelectorAll('.gif-frame-target');
        const images: string[] = [];

        for (let i = 0; i < frameNodes.length; i++) {
          const frameDataUrl = await toPng(frameNodes[i] as HTMLElement, {
            cacheBust: true,
            pixelRatio: 1.2,
            backgroundColor: '#ffffff', // ✨ 1. 導出幀背景也設為白色
            style: { boxShadow: 'none', borderRadius: '0' }
          });
          images.push(frameDataUrl);
        }

        gifshot.createGIF({
          images,
          gifWidth: 320,
          gifHeight: 426,
          interval: 0.5,
          numFrames: images.length,
          sampleInterval: 10,
        }, (obj: any) => {
          if (!obj.error) {
            setPreviewUrl(obj.image);
          }
          setIsExporting(false);
        });
      } catch (err) {
        console.error('Failed to prepare frames for GIF', err);
        setIsExporting(false);
      }
    }, 600);
  };

  useEffect(() => {
    setPreviewUrl(null); // 切換模式時清空舊預覽
    // 給一個微小的延遲，避免組件掛載時的瞬時卡頓
    const timer = setTimeout(() => {
      if (exportType === 'gif') {
        generateDynamic();
      } else {
        generateStatic();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [exportType]); // 🌟 只在切換導出類型時觸發

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `bobucam-${exportType}-${Date.now()}.${exportType === 'gif' ? 'gif' : 'png'}`;
    a.click();
  };

  const handleShare = async () => {
    if (!previewUrl) return;
    try {
      const blob = await (await fetch(previewUrl)).blob();
      const file = new File([blob], `bobucam.${exportType === 'gif' ? 'gif' : 'png'}`, { type: blob.type });
      if (navigator.share) {
        await navigator.share({ title: 'My BobuCam Moments', files: [file] });
      } else {
        alert("Save & share, pretty please!");
      }
    } catch (error) {
      console.error("Share failed", error);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col select-none">
      {/* 頂部導航 */}
      <div className="relative h-20 flex items-center justify-between px-4 shrink-0 bg-white shadow-sm z-10">
        <button onClick={() => navigate('/editor')} className="w-12 h-12 active:scale-90 transition-transform">
          <img src="/src/assets/ui/btn_back.png" alt="Back" className="w-full h-full object-contain" />
        </button>
        <img src="/src/assets/ui/title_export.png" alt="Export" className="h-10 object-contain" />
        <button onClick={() => navigate('/')} className="w-12 h-12 active:scale-90 transition-transform">
          <img src="/src/assets/ui/btn_home.png" alt="Home" className="w-full h-full object-contain" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        {/* Tab 切换 */}
        <div className="flex gap-4 mb-6">
          {(['strip', 'grid', 'gif'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setExportType(type)}
              className={`w-24 h-10 transition-all ${exportType === type ? 'scale-105 drop-shadow-md' : 'opacity-40 grayscale'}`}
            >
              <img src={`/src/assets/ui/tab_${type}.png`} className="w-full h-full object-contain" />
            </button>
          ))}
        </div>

        {/* 預覽區 */}
        <div className="w-full max-w-[320px] relative bg-white p-3 pb-10 rounded-sm shadow-xl border border-zinc-200">
          {isExporting && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
              <img src="/src/assets/ui/icon_loading.png" className="w-16 h-16 animate-bounce" />
              <img src="/src/assets/ui/text_loading.png" className="h-8 animate-pulse" />
            </div>
          )}
          {previewUrl && !isExporting ? (
            <img src={previewUrl} className="w-full h-auto rounded-sm shadow-inner" />
          ) : (
            <div className="w-full aspect-3/4 flex items-center justify-center bg-zinc-50 text-zinc-300">Rendering...</div>
          )}

          {/* 渲染隱藏層 */}
          <div className="absolute -left-2499.75 top-0 pointer-events-none">
            <div
              ref={stripRef}
              className={`relative p-8 pb-24 ${exportType === 'grid' ? 'grid grid-cols-2 gap-4 w-200' : 'flex flex-col gap-6 w-100'}`}
              style={{ backgroundColor: '#ffffff' }} // ✨ 1. 底板改成純白色
            >
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="gif-frame-target relative w-full aspect-3/4 overflow-hidden bg-white"
                >
                  {/* ✨ 2. 照片本體：GIF 模式下內縮增加到 15%，非 GIF 保持你原本完美的 4% */}
                  <div className={`absolute z-0 overflow-hidden rounded-sm transition-all ${exportType === 'gif' ? 'inset-[15%]' : 'inset-[4%]'
                    }`}>
                    <img src={photo.dataUrl} className="w-full h-full object-cover" />
                  </div>

                  {/* ✨ 3. 相框：無論什麼模式都始終維持 inset-0，確保相框大小不動 */}
                  {photo.frameSrc && (
                    <img src={photo.frameSrc} className="absolute inset-0 w-full h-full object-fill z-10" />
                  )}

                  {/* 貼紙 */}
                  <div className="absolute inset-0 z-20">
                    {photo.stickers.map(sticker => (
                      <div key={sticker.id} className="absolute" style={{ left: `${sticker.x}%`, top: `${sticker.y}%`, width: `${sticker.width}%`, height: `${sticker.height}%`, transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)` }}>
                        <img src={sticker.src} className="w-full h-full object-contain drop-shadow-md" />
                      </div>
                    ))}
                  </div>

                  {/* 水印 */}
                  {exportType === 'gif' && (
                    <div className="absolute bottom-4 right-4 opacity-70 z-30">
                      <img src="/src/assets/ui/watermark.png" className="h-8 object-contain" />
                    </div>
                  )}
                </div>
              ))}

              {exportType !== 'gif' && (
                <div className="absolute bottom-6 right-8 opacity-70">
                  <img src="/src/assets/ui/watermark.png" className="h-10 object-contain" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 底部按鈕 */}
      <div className="bg-white p-6 pb-8 border-t border-zinc-100 flex gap-4 shrink-0 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button onClick={handleDownload} disabled={isExporting || !previewUrl} className="flex-1 h-16 active:scale-95 transition-transform">
          <img src="/src/assets/ui/btn_save.png" alt="Save" className="w-full h-full object-contain" />
        </button>
        <button onClick={handleShare} disabled={isExporting || !previewUrl} className="flex-1 h-16 active:scale-95 transition-transform">
          <img src="/src/assets/ui/btn_share.png" alt="Share" className="w-full h-full object-contain" />
        </button>
      </div>
    </div>
  );
}