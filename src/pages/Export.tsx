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
  const stripRef = useRef<HTMLDivElement>(null);

  if (photos.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#fdfaf6]">
        <img src="/src/assets/ui/text_nophoto.png" alt="还没拍照哦" className="w-64 mb-8 object-contain opacity-80 drop-shadow-sm" />
        <button onClick={() => navigate('/')} className="active:scale-95 transition-transform">
          <img src="/src/assets/ui/btn_start.png" className="w-48 object-contain" alt="去拍照" />
        </button>
      </div>
    );
  }

  const generateStatic = async () => {
    if (!stripRef.current) return;
    setIsExporting(true);

    // 🌟 修复水印初次不显示：给浏览器 500ms 的时间去加载和渲染 DOM 里的图片
    setTimeout(async () => {
      try {
        const dataUrl = await toPng(stripRef.current!, { cacheBust: true, pixelRatio: 1.5 });
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
          const frameDataUrl = await toPng(frameNodes[i] as HTMLElement, { cacheBust: true, pixelRatio: 1.2 });
          images.push(frameDataUrl);
        }

        gifshot.createGIF({
          images,
          gifWidth: 400,
          gifHeight: 533,
          interval: 0.5,
          numFrames: images.length,
        }, (obj: any) => {
          if (!obj.error) {
            setPreviewUrl(obj.image);
          } else {
            console.error('Failed to generate GIF', obj.error);
          }
          setIsExporting(false);
        });
      } catch (err) {
        console.error('Failed to prepare frames for GIF', err);
        setIsExporting(false);
      }
    }, 500); // GIF 也延迟一下，确保贴纸全部就位
  };

  useEffect(() => {
    setPreviewUrl(null); // 每次切换先清空预览
    if (exportType === 'strip' || exportType === 'grid') {
      generateStatic();
    } else {
      generateDynamic();
    }
  }, [exportType]);

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
        alert("你的设备暂不支持直接调用分享，请点击左侧保存到相册，然后去微信分享哦！");
      }
    } catch (error) {
      console.error("Share failed", error);
    }
  };

  return (
    <div className="h-screen bg-[#fdfaf6] flex flex-col select-none">

      {/* 顶部导航栏 */}
      <div className="relative h-20 flex items-center justify-between px-4 shrink-0 bg-white shadow-sm z-10">
        <button onClick={() => navigate('/editor')} className="relative z-10 w-12 h-12 active:scale-90 transition-transform">
          <img src="/src/assets/ui/btn_back.png" alt="返回" className="w-full h-full object-contain" />
        </button>
        <div className="relative z-10 h-10 pointer-events-none">
          <img src="/src/assets/ui/title_export.png" alt="导出" className="h-full object-contain" />
        </div>
        <button onClick={() => navigate('/')} className="relative z-10 w-12 h-12 active:scale-90 transition-transform">
          <img src="/src/assets/ui/btn_home.png" alt="首页" className="w-full h-full object-contain" />
        </button>
      </div>

      {/* 主预览区 */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center">

        {/* 三Tab切换：单列长图 / 2x2四宫格 / 动态GIF */}
        <div className="flex gap-2 sm:gap-4 mb-6">
          <button onClick={() => setExportType('strip')} className={`w-24 sm:w-28 h-10 transition-all active:scale-95 ${exportType === 'strip' ? 'opacity-100 scale-105 drop-shadow-md' : 'opacity-40 grayscale-[50%]'}`}>
            <img src="/src/assets/ui/tab_strip.png" alt="长图" className="w-full h-full object-contain" />
          </button>
          <button onClick={() => setExportType('grid')} className={`w-24 sm:w-28 h-10 transition-all active:scale-95 ${exportType === 'grid' ? 'opacity-100 scale-105 drop-shadow-md' : 'opacity-40 grayscale-[50%]'}`}>
            <img src="/src/assets/ui/tab_grid.png" alt="四宫格" className="w-full h-full object-contain" />
          </button>
          <button onClick={() => setExportType('gif')} className={`w-24 sm:w-28 h-10 transition-all active:scale-95 ${exportType === 'gif' ? 'opacity-100 scale-105 drop-shadow-md' : 'opacity-40 grayscale-[50%]'}`}>
            <img src="/src/assets/ui/tab_gif.png" alt="GIF" className="w-full h-full object-contain" />
          </button>
        </div>

        {/* 预览展示容器 */}
        <div className="w-full max-w-[320px] relative bg-white p-3 pb-10 rounded-sm shadow-xl border border-zinc-200 min-h-[400px]">

          {/* 全手绘加载动画 */}
          {isExporting && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
              <img src="/src/assets/ui/icon_loading.png" alt="加载中" className="w-16 h-16 animate-bounce mb-2" />
              <img src="/src/assets/ui/text_loading.png" alt="Piff Puff Paff" className="h-8 animate-pulse object-contain" />
            </div>
          )}

          {previewUrl && !isExporting ? (
            <img src={previewUrl} alt="Preview" className="w-full h-auto rounded-sm shadow-inner" />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-0" />
          )}

          {/* ========================================== */}
          {/* 背后默默工作、不给用户看的排版渲染层 */}
          {/* ========================================== */}
          <div className="absolute -left-[9999px] top-0 pointer-events-none">

            <div
              ref={stripRef}
              className={`relative p-8 pb-24 overflow-hidden ${exportType === 'grid'
                ? 'grid grid-cols-2 gap-4 w-[800px]'
                : 'flex flex-col gap-6 w-[400px]'
                }`}
            >
              {/* 长图/拼图模式下的全局底层背景 */}
              <img src="/src/assets/ui/strip_bg.png" className="absolute inset-0 w-full h-full object-cover -z-10" alt="底板" onError={(e) => e.currentTarget.style.display = 'none'} />
              <div className="absolute inset-0 w-full h-full bg-[#f4ecd8] -z-20"></div>

              {photos.map((photo, i) => (
                <div
                  key={photo.id}
                  className="gif-frame-target relative w-full aspect-[3/4] shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-sm overflow-hidden"
                >
                  {/* 1. 层级 0：照片本体 (内缩 4%) */}
                  <div className="absolute inset-[4%] z-0 overflow-hidden bg-zinc-100 rounded-sm">
                    <img src={photo.dataUrl} className="w-full h-full object-cover" />
                  </div>

                  {/* 2. 层级 10：专属相框 */}
                  {photo.frameSrc && (
                    <img src={photo.frameSrc} className="absolute inset-0 w-full h-full object-fill z-10" />
                  )}

                  {/* 3. 层级 20：渲染贴纸 */}
                  <div className="absolute inset-0 z-20">
                    {photo.stickers.map(sticker => (
                      <div key={sticker.id} className="absolute" style={{ left: `${sticker.x}%`, top: `${sticker.y}%`, width: `${sticker.width}%`, height: `${sticker.height}%`, transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)` }}>
                        <img src={sticker.src} className="w-full h-full object-contain drop-shadow-md" />
                      </div>
                    ))}
                  </div>

                  {/* GIF 模式下的水印 (z-30) */}
                  {exportType === 'gif' && (
                    <div className="absolute bottom-4 right-4 opacity-70 z-30">
                      <img src="/src/assets/ui/watermark.png" alt="BobuCam" className="h-8 object-contain drop-shadow-sm" />
                    </div>
                  )}
                </div>
              ))}

              {/* 长图/拼图模式下的全局右下角图章 */}
              {exportType !== 'gif' && (
                <div className="absolute bottom-6 right-8 opacity-70">
                  <img src="/src/assets/ui/watermark.png" alt="BobuCam" className="h-10 object-contain drop-shadow-sm" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 底部操作按钮 */}
      <div className="bg-white p-6 pb-8 border-t border-zinc-100 flex gap-4 shrink-0 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button onClick={handleDownload} disabled={isExporting || !previewUrl} className="flex-1 h-16 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100">
          <img src="/src/assets/ui/btn_save.png" alt="保存" className="w-full h-full object-contain drop-shadow-sm" />
        </button>
        <button onClick={handleShare} disabled={isExporting || !previewUrl} className="flex-1 h-16 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100">
          <img src="/src/assets/ui/btn_share.png" alt="分享" className="w-full h-full object-contain drop-shadow-sm" />
        </button>
      </div>
    </div>
  );
}