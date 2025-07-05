import { Button, Tooltip } from '@mui/material';
import { Plus } from 'lucide-react';
import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import { ChromePicker } from 'react-color';
import Draggable from 'react-draggable';
import { MdOutlineSaveAlt } from 'react-icons/md';
import ZoomTool from './Zoom';

interface LayerToolsBarProp {
  layers: Layer[];
  zoomLevel: number;
  selectedLayerId: string | null;
  setLayers: Dispatch<SetStateAction<Layer[]>>;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  setSelectedLayerId: Dispatch<SetStateAction<string | null>>;
  handleDownload: () => void;
}

const LayerToolsBar: React.FC<LayerToolsBarProp> = ({
  layers,
  zoomLevel,
  selectedLayerId,
  setLayers,
  handleZoomIn,
  handleZoomOut,
  setSelectedLayerId,
  handleDownload,
}) => {
  const [openColorSettings, setOpenColorSettings] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
          },
        ]);
      };

      img.src = imageSrc;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative z-50 flex h-full">
      <div className="border-mountain-200 flex h-full w-28 flex-col justify-between rounded-lg rounded-r-none border bg-white">
        <div className="flex flex-col space-y-2">
          {/* Layers Header */}
          <div className="border-mountain-400 text-mountain-800 flex h-10 items-center justify-center border-b-1 bg-white font-medium">
            Layers
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
                className="flex h-20 w-full items-center justify-center rounded-sm px-2 hover:cursor-pointer"
                onClick={() => setSelectedLayerId(layer.id)}
              >
                {layer.type === 'image' ? (
                  <img
                    src={layer.src}
                    className={`h-20 w-full rounded-sm border-1 object-cover ${
                      selectedLayerId === layer.id
                        ? 'border-indigo-400'
                        : 'border-mountain-200'
                    }`}
                    alt="Layer Preview"
                  />
                ) : (
                  <div
                    className={`relative h-20 w-full overflow-hidden rounded border bg-white ${selectedLayerId === layer.id ? 'border-indigo-400' : 'border-mountain-200'}`}
                  >
                    {layer.type === 'text' && (
                      <div
                        style={{
                          position: 'absolute',
                          fontSize: layer.fontSize * 0.5,
                          color: layer.color,
                        }}
                        className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex-nowrap text-nowrap"
                      >
                        {layer.text || 'Preview text'}
                      </div>
                    )}
                  </div>
                )}
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
                className={`text-mountain-600 flex h-12 w-full items-center justify-center border-2 text-sm italic hover:cursor-pointer ${selectedLayerId === layers[0].id ? 'border-indigo-400' : 'border-mountain-200'}`}
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
              <div className="absolute z-50 rounded border bg-white shadow-md">
                <div className="drag-handle cursor-move rounded-t bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                  🎨 Background Color
                </div>
                {layers[0].type === 'image' && (
                  <ChromePicker
                    color={(layers[0] as ImageLayer).backgroundColor}
                    onChangeComplete={(color) => {
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
        <div className="border-mountain-200 flex flex-col space-y-2 border-t-1 py-2">
          <div className="border-mountain-400 flex h-10 w-full items-center justify-center p-2 py-0 hover:cursor-pointer">
            <Button className="hover:bg-mountain-50 border-mountain-200 flex h-full w-full items-center justify-center rounded-lg border bg-white hover:cursor-pointer">
              <p className="font-normal">Close</p>
            </Button>
          </div>
          <div
            onClick={handleDownload}
            className="border-mountain-400 flex h-10 w-full items-center justify-center p-2 py-0 hover:cursor-pointer"
          >
            <Button className="border-mountain-200 flex h-full w-full items-center justify-center rounded-lg border bg-indigo-200 hover:cursor-pointer hover:bg-indigo-100">
              <MdOutlineSaveAlt className="mr-1" />
              <p className="font-normal">Export</p>
            </Button>
          </div>
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
