interface Canvas {
  width: number;
  height: number;
}

type CanvasSize = { width: number; height: number };

interface NewDesign {
  ratio?: string;
  canvas: CanvasSize;
  finalCanvas: CanvasSize;
  layers: Layer[];
}

type LayerType = 'image' | 'text' | 'shape';

type BaseLayer = {
  id: string;
  type: LayerType;
  x: number;
  y: number;
  zIndex: number;
  rotation: number;
  width: number;
  height: number;
  isLocked: boolean;
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

type ShapeLayer = BaseLayer & {
  type: 'shape';
  shapeType: ShapeType;
  color: string;
  strokeColor?: string;
  strokeWidth?: number;
  opacity: number;
};

type Layer = ImageLayer | TextLayer | ShapeLayer;

type TextItem = {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
};
