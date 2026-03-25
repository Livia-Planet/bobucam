export interface Photo {
  id: string;
  dataUrl: string;
}

export interface Sticker {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface PhotoWithStickers extends Photo {
  stickers: Sticker[];
}

export interface PhotoWithStickers extends Photo {
  stickers: Sticker[];
  frameSrc?: string; // 👈 新增这一行：记录这张照片选中的相框图片路径
}

export interface Photo {
  id: string;
  dataUrl: string;
}

export interface Sticker {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface PhotoWithStickers extends Photo {
  stickers: Sticker[];
  frameSrc?: string; // 新增：记录当前照片使用的相框
}