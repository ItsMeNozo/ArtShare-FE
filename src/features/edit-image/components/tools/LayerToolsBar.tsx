import { Tooltip } from '@mui/material';
import { Sketch } from '@uiw/react-color';
import { Lock, Plus } from 'lucide-react';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import Draggable from 'react-draggable';
import { IoLayersOutline } from 'react-icons/io5';
import ZoomTool from './Zoom';

interface LayerToolsBarProp {
  layers: Layer[];
  zoomLevel: number;
  zIndex: { min: number; max: number };
  selectedLayerId: string | null;
  setZIndex: Dispatch<SetStateAction<{ min: number; max: number }>>;
  setLayers: Dispatch<SetStateAction<Layer[]>>;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  setSelectedLayerId: Dispatch<SetStateAction<string | null>>;
}

const LayerToolsBar: React.FC<LayerToolsBarProp> = ({
  layers,
  zoomLevel,
  selectedLayerId,
  zIndex,
  setZIndex,
  setLayers,
  handleZoomIn,
  handleZoomOut,
  setSelectedLayerId,
}) => {
  const [openColorSettings, setOpenColorSettings] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imageSrc = reader.result as string;

      const img = new Image();
      img.onload = () => {
        const maxWidth = 540;
        const maxHeight = 540;

        const width = img.width;
        const height = img.height;

        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const scale = Math.min(widthRatio, heightRatio);

        const scaledWidth = width * scale;
        const scaledHeight = height * scale;

        setLayers((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            type: 'image',
            zoom: zoomLevel,
            src: imageSrc,
            x: (maxWidth - scaledWidth) / 2,
            y: (maxHeight - scaledHeight) / 2,
            width: scaledWidth,
            height: scaledHeight,
            opacity: 1,
            rotation: 0,
            flipH: false,
            flipV: false,
            brightness: 100,
            contrast: 100,
            saturation: 100,
            hue: 0,
            sepia: 0,
            zIndex: zIndex.max + 1,
            isLocked: false,
          },
        ]);
        setZIndex((prev) => ({
          min: prev.min,
          max: prev.max + 1,
        }));
      };

      img.src = imageSrc;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setOpenColorSettings(false); // Close the color picker
      }
    }
    if (openColorSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openColorSettings]);

  return (
    <div className="z-50 relative flex h-full">
      <div className="flex flex-col justify-between bg-white border border-mountain-200 w-28 h-full overflow-y-auto custom-scrollbar">
        <div className="flex flex-col space-y-2 pb-24">
          {/* Layers Header */}
          <div className="border-mountain-400 text-mountain-800 flex h-10 items-center justify-center space-x-2 border-b-1 bg-white font-medium">
            <IoLayersOutline />
            <span>Layers</span>
          </div>
          <Tooltip title="Add Layer" arrow placement="right">
            <div
              className="border-mountain-400 flex h-10 w-full items-center justify-center p-2 py-0 hover:cursor-pointer"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <div className="border-mountain-200 flex h-full w-full items-center justify-center border">
                <Plus className="size-4" />
              </div>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </Tooltip>
          {[...layers]
            .slice(1)
            .reverse()
            .map((layer) => (
              <div
                key={layer.id}
                className="relative flex h-20 w-full items-center justify-center rounded-sm px-2 hover:cursor-pointer"
                onClick={() => setSelectedLayerId(layer.id)}
              >
                {layer.type === 'image' ? (
                  <img
                    src={layer.src}
                    className={`h-20 w-full rounded-sm object-cover ${
                      selectedLayerId === layer.id
                        ? 'border-4 border-indigo-500 shadow-lg shadow-indigo-200'
                        : 'border-mountain-200 border'
                    }`}
                    alt="Layer Preview"
                  />
                ) : (
                  <div
                    className={`relative h-20 w-full overflow-hidden rounded bg-white ${selectedLayerId === layer.id ? 'border-4 border-indigo-500 shadow-lg shadow-indigo-200' : 'border-mountain-200 border'}`}
                  >
                    {layer.type === 'text' && (
                      <div
                        style={{
                          position: 'absolute',
                          fontSize: '12px',
                          color: layer.color,
                        }}
                        className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex-nowrap text-nowrap"
                      >
                        {layer.text || 'Text Layer'}
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={`${layer.isLocked ? '' : 'hidden'} bg-mountain-950/50 absolute right-2 bottom-1 z-50 flex p-2`}
                >
                  <Lock className="size-3 text-white" />
                </div>
              </div>
            ))}
          <Tooltip title="Set Color" arrow placement="right">
            <div
              ref={containerRef}
              onClick={() => {
                setSelectedLayerId(layers[0].id);
                setOpenColorSettings(!openColorSettings);
              }}
              className="relative flex px-2"
            >
              <div
                className={`text-mountain-600 flex h-12 w-full items-center justify-center text-sm italic hover:cursor-pointer ${selectedLayerId === layers[0].id ? 'border-4 border-indigo-500 shadow-lg shadow-indigo-200' : 'border-mountain-200 border-2'}`}
                style={{
                  backgroundColor:
                    layers[0].type === 'image'
                      ? layers[0].backgroundColor
                      : '#fffff',
                }}
              />
              <span className="text-mountain-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs italic">
                Background
              </span>
            </div>
          </Tooltip>
          {openColorSettings && selectedLayerId === layers[0].id && (
            <Draggable handle=".drag-handle">
              <div
                ref={pickerRef}
                className="absolute z-50 rounded bg-white shadow-md"
              >
                <div className="bg-mountain-100 text-mountain-950 drag-handle cursor-move rounded-t px-3 py-1 text-sm font-normal">
                  🎨 Color Picker
                </div>
                {layers[0].type === 'image' && (
                  <Sketch
                    color={(layers[0] as ImageLayer).backgroundColor}
                    onChange={(color) => {
                      const updated = [...layers];
                      const imageLayer = updated[0] as ImageLayer;
                      imageLayer.backgroundColor = color.hex;
                      setLayers(updated);
                    }}
                  />
                )}
              </div>
            </Draggable>
          )}
        </div>
      </div>
      <ZoomTool
        zoomLevel={zoomLevel}
        handleZoomIn={handleZoomIn}
        handleZoomOut={handleZoomOut}
      />
    </div>
  );
};

export default LayerToolsBar;
