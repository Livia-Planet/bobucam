import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { toPng } from 'html-to-image';
import gifshot from 'gifshot';

export default function Export() {
  const navigate = useNavigate();
  const { photos } = useAppStore();

  const [isExporting, setIsExporting] = useState(false);
  // 新增了 'grid' 状态，代表 2x2 排版
  const [exportType, setExportType] = useState<'strip' | 'grid' | 'gif'>('strip');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  // 🌟 1. 彻底手绘化的“还没拍照”提示页
  if (photos.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#fdfaf6]">
        <img src="/src/assets/ui/text_nophoto.png" alt="Huh? No photos yet!" className="w-64 mb-8 object-contain opacity-80 drop-shadow-sm" />
        <button onClick={() => navigate('/')} className="active:scale-95 transition-transform">
          <img src="/src/assets/ui/btn_start.png" className="w-48 object-contain" alt="Take Photo" />
        </button>
      </div>
    );
  }

  // 生成静态图 (支持单列 strip 和 四宫格 grid)
  const generateStatic = async () => {
    if (!stripRef.current) return;
    setIsExporting(true);
    try {
      // 截图时稍微降低一点分辨率以防手机浏览器崩溃，pixelRatio: 1.5 足够清晰了
      const dataUrl = await toPng(stripRef.current, { cacheBust: true, pixelRatio: 1.5 });
      setPreviewUrl(dataUrl);
    } catch (err) {
      console.error('Failed to generate static image', err);
    } finally {
      setIsExporting(false);
    }
  };

  // 🌟 2. 带有贴纸的动态 GIF 生成
  const generateDynamic = async () => {
    setIsExporting(true);
    try {
      // 核心魔法：我们不去拿原始照片，而是去隐藏的 DOM 里，把每一个带有贴纸的照片容器单独截图！
      const frameNodes = document.querySelectorAll('.gif-frame-target');
      const images: string[] = [];

      for (let i = 0; i < frameNodes.length; i++) {
        // 给每一帧（包含照片+贴纸）截取成独立的图片
        const frameDataUrl = await toPng(frameNodes[i] as HTMLElement, { cacheBust: true, pixelRatio: 1.2 });
        images.push(frameDataUrl);
      }

      // 然后再把这些带有贴纸的图片喂给 gifshot
      gifshot.createGIF({
        images,
        gifWidth: 400,
        gifHeight: 533, // 3:4 aspect ratio
        interval: 0.5, // 切换速度：0.5秒/张
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
  };

  useEffect(() => {
    // 每次切换排版或模式，重新生成预览
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
    // 文件名也会根据导出的状态自动改变
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
        alert("Your device does not currently support direct sharing. Please click to save to your album!");
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
          <img src="/src/assets/ui/btn_back.png" alt="Back" className="w-full h-full object-contain" />
        </button>
        <div className="relative z-10 h-10 pointer-events-none">
          <img src="/src/assets/ui/title_export.png" alt="Export" className="h-full object-contain" />
        </div>
        <button onClick={() => navigate('/')} className="relative z-10 w-12 h-12 active:scale-90 transition-transform">
          <img src="/src/assets/ui/btn_home.png" alt="Home" className="w-full h-full object-contain" />
        </button>
      </div>

      {/* 主预览区 */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center">

        {/* 🌟 3. 新增三Tab切换：单列长图 / 2x2四宫格 / 动态GIF */}
        <div className="flex gap-2 sm:gap-4 mb-6">
          <button
            onClick={() => setExportType('strip')}
            className={`w-24 sm:w-28 h-10 transition-all active:scale-95 ${exportType === 'strip' ? 'opacity-100 scale-105 drop-shadow-md' : 'opacity-40 grayscale-[50%]'}`}
          >
            <img src="/src/assets/ui/tab_strip.png" alt="Strip" className="w-full h-full object-contain" />
          </button>

          <button
            onClick={() => setExportType('grid')}
            className={`w-24 sm:w-28 h-10 transition-all active:scale-95 ${exportType === 'grid' ? 'opacity-100 scale-105 drop-shadow-md' : 'opacity-40 grayscale-[50%]'}`}
          >
            <img src="/src/assets/ui/tab_grid.png" alt="Grid" className="w-full h-full object-contain" />
          </button>

          <button
            onClick={() => setExportType('gif')}
            className={`w-24 sm:w-28 h-10 transition-all active:scale-95 ${exportType === 'gif' ? 'opacity-100 scale-105 drop-shadow-md' : 'opacity-40 grayscale-[50%]'}`}
          >
            <img src="/src/assets/ui/tab_gif.png" alt="GIF" className="w-full h-full object-contain" />
          </button>
        </div>

        {/* 预览展示容器 */}
        <div className="w-full max-w-[320px] relative bg-white p-3 pb-10 rounded-sm shadow-xl border border-zinc-200">

          {/* 🌟 4. 全手绘加载动画 */}
          {isExporting && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
              <img src="/src/assets/ui/icon_loading.png" alt="Loading" className="w-16 h-16 animate-bounce mb-2" />
              {/* Piff~Puff~Paff~! 替换为手绘图 */}
              <img src="/src/assets/ui/text_loading.png" alt="Piff Puff Paff" className="h-8 animate-pulse object-contain" />
            </div>
          )}

          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full h-auto rounded-sm shadow-inner" />
          ) : (
            <div className="w-full aspect-[3/4] bg-zinc-100 animate-pulse rounded-sm" />
          )}

          {/* ========================================== */}
          {/* 背后默默工作、不给用户看的排版渲染层 */}
          {/* ========================================== */}
          <div className="absolute -left-[9999px] top-0 pointer-events-none">
            {/* 核心排版逻辑：如果是 strip 就是竖排，如果是 grid 就是两列网格 */}
            <div
              ref={stripRef}
              className={`relative p-8 pb-24 overflow-hidden ${exportType === 'grid'
                ? 'grid grid-cols-2 gap-4 w-[800px]'  // 2x2 模式：容器变宽，分为2列
                : 'flex flex-col gap-6 w-[400px]'     // 单列长图模式
                }`}
            >
              <img
                src="/src/assets/ui/strip_bg.png"
                className="absolute inset-0 w-full h-full object-cover -z-10"
                alt="Background"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
              <div className="absolute inset-0 w-full h-full bg-[#f4ecd8] -z-20"></div>

              {photos.map((photo, i) => (
                <div
                  key={photo.id}
                  // 添加 gif-frame-target 类名，专门给 GIF 抓取截图用
                  className="gif-frame-target relative w-full aspect-[3/4] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-3 rounded-sm"
                >
                  <img src={photo.dataUrl} className="w-full h-full object-cover rounded-sm" />
                  {/* 渲染贴纸 */}
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

              {/* 🌟 5. 替换底部水印文字为图片 */}
              <div className="absolute bottom-6 right-8 opacity-60">
                <img src="/src/assets/ui/watermark.png" alt="BobuCam" className="h-10 object-contain drop-shadow-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部操作按钮 */}
      <div className="bg-white p-6 pb-8 border-t border-zinc-100 flex gap-4 shrink-0 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button
          onClick={handleDownload}
          disabled={isExporting || !previewUrl}
          className="flex-1 h-16 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
        >
          <img src="/src/assets/ui/btn_save.png" alt="Save" className="w-full h-full object-contain drop-shadow-sm" />
        </button>

        <button
          onClick={handleShare}
          disabled={isExporting || !previewUrl}
          className="flex-1 h-16 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
        >
          <img src="/src/assets/ui/btn_share.png" alt="Share" className="w-full h-full object-contain drop-shadow-sm" />
        </button>
      </div>
    </div>
  );
}