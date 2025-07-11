type LayerType = 'image' | 'text';

type BaseLayer = {
  id: string;
  type: LayerType;
  x: number;
  y: number;
  zIndex: number;
  rotation: number;
  width: number;
  height: number;
};

type ImageLayer = BaseLayer & {
  type: 'image';
  id: string;
  name?: string;
  src: string;
  zoom: number;
  opacity: number;
  flipH: boolean;
  flipV: boolean;
  width?: number;
  height?: number;
  zoom?: number;
  x?: number;
  y?: number;
  rotation: number;
  saturation: number;
  hue: number;
  brightness: number;
  contrast: number;
  sepia: number;
  backgroundColor?: string;
};

type TextLayer = BaseLayer & {
  type: 'text';
  text: string;
  fontSize: number;
  color: string;
  fontFamily?: string;
  fontWeight?: string;
  flipH?: boolean;
  flipV?: boolean;
  opacity: number;
};

type Layer = ImageLayer | TextLayer;

type TextItem = {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
};
