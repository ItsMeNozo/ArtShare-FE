import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import ZoomTool from "./Zoom";
import { Tooltip } from "@mui/material";
import { Plus } from "lucide-react";
import Draggable from "react-draggable";
import { Sketch } from '@uiw/react-color';

interface LayerToolsBarProp {
  layers: Layer[];
  zoomLevel: number;
  currentZIndex: number;
  selectedLayerId: string | null;
  setLayers: Dispatch<SetStateAction<Layer[]>>;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  setCurrentZIndex: Dispatch<SetStateAction<number>>;
  setSelectedLayerId: Dispatch<SetStateAction<string | null>>;
}

const LayerToolsBar: React.FC<LayerToolsBarProp> = ({
  layers,
  zoomLevel,
  selectedLayerId,
  currentZIndex,
  setLayers,
  handleZoomIn,
  handleZoomOut,
  setSelectedLayerId,
  setCurrentZIndex
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
            zIndex: currentZIndex
          },
        ]);
        setCurrentZIndex(currentZIndex + 1);
      };

      img.src = imageSrc;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
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
      <div className="flex flex-col justify-between bg-white border border-mountain-200 w-28 h-full">
        <div className="flex flex-col space-y-2">
          {/* Layers Header */}
          <div className="flex justify-center items-center bg-white border-mountain-400 border-b-1 h-10 font-medium text-mountain-800">
            Layers
          </div>
          <Tooltip title="Add Layer" arrow placement="right">
            <div
              className="flex justify-center items-center p-2 py-0 border-mountain-400 w-full h-10 hover:cursor-pointer"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <div className="flex justify-center items-center border border-mountain-200 w-full h-full">
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
                className="flex justify-center items-center px-2 rounded-sm w-full h-20 hover:cursor-pointer"
                onClick={() => setSelectedLayerId(layer.id)}
              >
                {layer.type === 'image' ? (
                  <img
                    src={layer.src}
                    className={`rounded-sm w-full h-20 object-cover border-1 ${selectedLayerId === layer.id
                      ? "border-indigo-400"
                      : "border-mountain-200"
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
                        className="top-1/2 left-1/2 flex-nowrap text-nowrap -translate-x-1/2 -translate-y-1/2"
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
              <span className="top-1/2 left-1/2 absolute text-mountain-400 text-xs italic -translate-x-1/2 -translate-y-1/2">
                Background
              </span>
            </div>
          </Tooltip>
          {openColorSettings && selectedLayerId === layers[0].id && (
            <Draggable handle=".drag-handle">
              <div ref={pickerRef} className="z-50 absolute bg-white shadow-md rounded">
                <div className="bg-mountain-100 px-3 py-1 rounded-t font-normal text-mountain-950 text-sm cursor-move drag-handle">
                  🎨 Color Picker
                </div>
                {layers[0].type === "image" && (
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
