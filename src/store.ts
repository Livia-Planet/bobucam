import { create } from 'zustand';
import { PhotoWithStickers, Sticker } from './types';

interface AppState {
  photos: PhotoWithStickers[];
  addPhoto: (dataUrl: string) => void;
  addSticker: (photoId: string, sticker: Sticker) => void;
  updateSticker: (photoId: string, stickerId: string, updates: Partial<Sticker>) => void;
  removeSticker: (photoId: string, stickerId: string) => void;
  updatePhotoFrame: (photoId: string, frameSrc: string) => void; // 新增方法声明
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  photos: [],
  addPhoto: (dataUrl) =>
    set((state) => ({
      photos: [
        ...state.photos,
        {
          id: Date.now().toString() + Math.random(),
          dataUrl,
          stickers: [],
          frameSrc: '/src/assets/ui/photo_frame.png' // 赋予默认相框
        },
      ],
    })),
  addSticker: (photoId, sticker) =>
    set((state) => ({
      photos: state.photos.map((p) =>
        p.id === photoId ? { ...p, stickers: [...p.stickers, sticker] } : p
      ),
    })),
  updateSticker: (photoId, stickerId, updates) =>
    set((state) => ({
      photos: state.photos.map((p) =>
        p.id === photoId
          ? {
            ...p,
            stickers: p.stickers.map((s) =>
              s.id === stickerId ? { ...s, ...updates } : s
            ),
          }
          : p
      ),
    })),
  removeSticker: (photoId, stickerId) =>
    set((state) => ({
      photos: state.photos.map((p) =>
        p.id === photoId
          ? { ...p, stickers: p.stickers.filter((s) => s.id !== stickerId) }
          : p
      ),
    })),
  updatePhotoFrame: (photoId, frameSrc) => // 实现更新相框的方法
    set((state) => ({
      photos: state.photos.map((p) =>
        p.id === photoId ? { ...p, frameSrc } : p
      ),
    })),
  reset: () => set({ photos: [] }),
}));