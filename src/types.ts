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
