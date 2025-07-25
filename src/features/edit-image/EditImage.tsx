import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";

//Logo src
import watermark from '/public/app_watermark.png'

//Components
import Panels from './components/panels/Panels';
import LayerItem from "./components/LayerItem";
import LayerToolsBar from "./components/tools/LayerToolsBar";
import EditHeader from "./components/EditHeader";
import Moveable from "react-moveable";

//Icons
import { IoCrop } from "react-icons/io5";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { RiText } from "react-icons/ri";
// import { IoShapesOutline } from "react-icons/io5";
// import { PiDiamondsFourLight } from "react-icons/pi";
// import { HiDotsHorizontal } from "react-icons/hi";
import { MdFlipToFront } from "react-icons/md";
import { IoIosColorFilter } from "react-icons/io";
import { ChevronDown } from "lucide-react";

//Hooks
import { useImageStyleHandlers } from "./hooks/useImageStyleHandlers";
import { useLayerTransformHandlers } from "./hooks/useLayerTransformHandlers";
import { useTextStyleHandlers } from './hooks/useTextStyleHandlers';

const EditImage: React.FC = () => {
  //Handle getting images
  const location = useLocation();
  const navigate = useNavigate();
  const { imageUrl, name, canvas, editCanvas, color } = location.state || {};

  //Toolbar
  const [fullScreen, setFullScreen] = useState(false);
  const [newEdit, setNewEdit] = useState<NewDesign | null>(null);
  const [newDesign, setNewDesign] = useState<NewDesign | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  //Images
  const [zIndex, setZIndex] = useState({ min: 1, max: 1 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activePanel, setActivePanel] = useState<
    'arrange' | 'crop' | 'adjust' | 'filter' | 'text' | null
  >(null);
  const [globalZIndex, setGlobalZIndex] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [xPos, setXPos] = useState(0);
  const [yPos, setYPos] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [sepia, setSepia] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  //Canvas Size
  const hasAppendedInitialImage = useRef(false);
  const [finalCanvasSize, setFinalCanvasSize] = useState<Canvas>(canvas);
  const [canvasSize, setCanvasSize] = useState<Canvas>(
    editCanvas || { width: 560, height: 560 }
  );

  //Texts
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const layerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const moveableRef = useRef<Moveable>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const [layers, setLayers] = useState<Layer[]>([
    {
      type: 'image',
      id: crypto.randomUUID(),
      src: '',
      zoom: zoomLevel,
      opacity: opacity,
      flipH: flipHorizontal,
      flipV: flipVertical,
      x: xPos,
      y: yPos,
      rotation: rotation,
      brightness: brightness,
      contrast: contrast,
      saturation: saturation,
      hue: hue,
      sepia: sepia,
      backgroundColor: color || '#ffffff',
      height: canvasSize.height,
      width: canvasSize.width,
      zIndex: 0,
      isLocked: false
    }
  ]);

  useEffect(() => {
    if (layers.length !== 1) {
      setHasChanges(true);
      return;
    } else setHasChanges(false);
    const base = layers[0];
    const isBase =
      base.type === "image" &&
      base.src === "" &&
      base.zIndex === 0 &&
      base.backgroundColor === color || '#ffffff';
    setHasChanges(!isBase);
  }, [layers]);

  useEffect(() => {
    if (!newDesign || !newDesign.canvas) return;
    hasAppendedInitialImage.current = false;
    location.state.imageUrl = null;
    setLayers([]);
    setSelectedLayerId(null);
    setEditingLayerId(null);
    setCanvasSize(newDesign.canvas);
    setFinalCanvasSize(newDesign.finalCanvas);
    const baseLayer: ImageLayer = {
      type: 'image',
      id: crypto.randomUUID(),
      src: '',
      zoom: zoomLevel,
      opacity: opacity,
      flipH: flipHorizontal,
      flipV: flipVertical,
      x: xPos,
      y: yPos,
      rotation: rotation,
      brightness: brightness,
      contrast: contrast,
      saturation: saturation,
      hue: hue,
      sepia: sepia,
      backgroundColor: color || '#ffffff',
      height: canvasSize.height,
      width: canvasSize.width,
      zIndex: 0,
      isLocked: false
    };
    setLayers([baseLayer]);
    setNewDesign(null);
  }, [newDesign]);

  useEffect(() => {
    if (!newEdit || !newEdit.canvas) return;
    hasAppendedInitialImage.current = false;
    setLayers([]);
    setSelectedLayerId(null);
    setEditingLayerId(null);
    setCanvasSize(newEdit.canvas);
    setFinalCanvasSize(newEdit.finalCanvas);
    const baseLayer: ImageLayer = {
      type: 'image',
      id: crypto.randomUUID(),
      src: '',
      zoom: zoomLevel,
      opacity: opacity,
      flipH: flipHorizontal,
      flipV: flipVertical,
      x: xPos,
      y: yPos,
      rotation: rotation,
      brightness: brightness,
      contrast: contrast,
      saturation: saturation,
      hue: hue,
      sepia: sepia,
      backgroundColor: color || '#ffffff',
      height: newEdit.canvas.height,
      width: newEdit.canvas.width,
      zIndex: 0,
      isLocked: false
    };
    setLayers([baseLayer]);
    setNewDesign(null);
  }, [newEdit]);

  useEffect(() => {
    if (!imageUrl || hasAppendedInitialImage.current) return;
    hasAppendedInitialImage.current = true;
    const img = new Image();
    img.onload = () => {
      const maxWidth = canvasSize.width;
      const maxHeight = canvasSize.height;
      const width = img.width;
      const height = img.height;
      const widthRatio = maxWidth / width;
      const heightRatio = maxHeight / height;
      const scale = Math.min(widthRatio, heightRatio);
      const scaledWidth = width * scale;
      const scaledHeight = height * scale;
      // Prevent duplicate image layer
      const isAlreadyAdded = layers.some(
        (layer) => layer.type === "image" && layer.src === imageUrl
      );
      if (isAlreadyAdded) return;
      const newImageLayer: ImageLayer = {
        id: crypto.randomUUID(),
        type: "image",
        name: name,
        src: imageUrl,
        zoom: 1,
        opacity: 1,
        flipH: false,
        flipV: false,
        x: (maxWidth - scaledWidth) / 2,
        y: (maxHeight - scaledHeight) / 2,
        width: scaledWidth,
        height: scaledHeight,
        rotation: 0,
        brightness: 100,
        contrast: 100,
        saturation: 100,
        hue: 0,
        sepia: 0,
        zIndex: 1,
        isLocked: false
      };
      setLayers((prev) => [...prev, newImageLayer]);
    };
    img.src = imageUrl;
  }, [imageUrl, layers, newDesign]);

  useEffect(() => {
    const imageLayer = layers.find(
      (l): l is ImageLayer => l.type === 'image' && !!l.src,
    );
    if (!imageLayer) return;
    const img = new Image();
    img.src = imageLayer.src;
  }, [layers]);

  useEffect(() => {
    const nonBackgroundLayers = layers.filter((layer) => layer.zIndex !== 0);
    const zIndexes = nonBackgroundLayers.map((layer) => layer.zIndex ?? 1);
    const maxZIndex = zIndexes.length > 0 ? Math.max(...zIndexes) : 1;
    const minZIndex = zIndexes.length > 0 ? Math.min(...zIndexes) : 1;
    setZIndex({ min: minZIndex, max: maxZIndex });
  }, [layers]);

  const updateSelectedLayer = (updates: Partial<Layer>) => {
    setLayers((prev) =>
      prev.map((layer) => {
        if (layer.id !== selectedLayerId) return layer;
        return { ...layer, ...updates } as Layer;
      }),
    );
  };

  const updateLayerById = (id: string, updates: Partial<Layer>) => {
    setLayers((prev) =>
      prev.map((layer) => {
        if (layer.id !== id) return layer;
        return { ...layer, ...updates } as Layer;
      }),
    );
  };

  const handleDuplicate = (layerId: string) => {
    const layerToDuplicate = layers.find((l) => l.id === layerId);
    if (!layerToDuplicate) return;
    const newLayer = {
      ...layerToDuplicate,
      zIndex: layerToDuplicate.zIndex + 1,
      id: crypto.randomUUID(),
    };
    setLayers((prev) => [...prev, newLayer]);
  };

  const {
    handleBrightness,
    handleContrast,
    handleSaturation,
    handleHue,
    handleSepia,
  } = useImageStyleHandlers({
    selectedLayerId,
    updateSelectedLayer,
    setBrightness,
    setContrast,
    setSaturation,
    setHue,
    setSepia
  });

  const {
    addText,
    handleTextChange,
    handleChangeFontSize,
    handleChangeFontFamily,
    handleChangeTextColor,
  } = useTextStyleHandlers({
    layers,
    setLayers,
    selectedLayerId,
    globalZIndex,
    setGlobalZIndex,
  });

  // Transform hooks
  const {
    moveForward,
    moveBackward,
    bringToFront,
    sendToBack,
    handleZoomIn,
    handleZoomOut,
    handleRotationChange,
    handleOpacityChange,
    toggleFlipHorizontal,
    toggleFlipVertical,
    handleLayerXPosition,
    handleLayerYPosition,
    handleLockLayer
  } = useLayerTransformHandlers({
    layers,
    selectedLayerId,
    updateLayerById,
    updateSelectedLayer,
    moveableRef,
    setZoomLevel,
    setRotation,
    setOpacity,
    setFlipHorizontal,
    setFlipVertical,
    setXPos,
    setYPos
  });

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        if (!selectedLayerId) return;
        setLayers((prevLayers) =>
          prevLayers.map((layer) => {
            if (layer.id !== selectedLayerId) return layer;
            if (layer.type !== 'image') return layer;
            const newZoom =
              e.deltaY < 0
                ? Math.min(layer.zoom + 0.1, 3)
                : Math.max(layer.zoom - 0.1, 0.1);
            setZoomLevel(newZoom);
            return { ...layer, zoom: newZoom };
          }),
        );
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [selectedLayerId]);

  const renderToCanvas = (includeWatermark: boolean) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Fill background
    const backgroundLayer = layers.find(
      (layer): layer is ImageLayer => layer.type === "image"
    );
    ctx.save();
    ctx.fillStyle = backgroundLayer?.backgroundColor || "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    [...layers]
      .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
      .forEach((layer) => {
        if (layer.type === 'image') {
          const img = new Image();
          img.src = layer.src;
          img.onload = () => {
            const {
              x,
              y,
              zoom,
              rotation,
              flipH,
              flipV,
              opacity,
              brightness,
              contrast,
              saturation,
              hue,
              sepia,
              width,
              height,
            } = layer;
            // Calculate layer size
            const drawWidth = width ?? img.naturalWidth;
            const drawHeight = height ?? img.naturalHeight;
            ctx.save();
            // Translate to (x + center), so rotation is around center
            ctx.translate(x + drawWidth / 2, y + drawHeight / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.scale((flipH ? -1 : 1) * zoom, (flipV ? -1 : 1) * zoom);
            ctx.globalAlpha = opacity;
            ctx.filter = `
          brightness(${brightness}%)
          contrast(${contrast}%)
          saturate(${saturation}%)
          hue-rotate(${hue}deg)
          sepia(${sepia}%)
        `;
            // Draw image centered
            ctx.drawImage(
              img,
              -drawWidth / 2,
              -drawHeight / 2,
              drawWidth,
              drawHeight
            );
            ctx.restore();
          };
        } else if (layer.type === 'text') {
          ctx.save();
          ctx.translate(layer.x + layer.width / 2, layer.y);
          ctx.rotate(((layer.rotation || 0) * Math.PI) / 180);
          ctx.font = `${layer.fontSize}px ${layer.fontFamily || "sans-serif"}`;
          ctx.fillStyle = layer.color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.globalAlpha = layer.opacity ?? 1;
          ctx.fillText(layer.text, 0, 0);
          ctx.restore();
        }
      });
    const watermarkLayer: ImageLayer =
    {
      id: crypto.randomUUID(),
      type: "image",
      src: watermark,
      name: "Watermark",
      opacity: 0.4,
      zoom: 1,
      flipH: false,
      flipV: false,
      rotation: 0,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      sepia: 0,
      width: 256 * 0.3,
      height: 62 * 0.3,
      x: canvasSize.width - 96,
      y: canvasSize.height - 32,
      zIndex: 9999,
      isLocked: false
    }
    if (includeWatermark) {
      const img = new Image();
      img.src = watermarkLayer.src;
      img.onload = () => {
        ctx.save();
        ctx.globalAlpha = watermarkLayer.opacity;
        ctx.drawImage(
          img,
          watermarkLayer.x,
          watermarkLayer.y,
          watermarkLayer.width,
          watermarkLayer.height
        );
        ctx.restore();
      };
    }
  };

  const handleDownload = (format: "png" | "jpg", fileName: string, includeWaterMark: boolean) => {
    renderToCanvas(includeWaterMark);
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const trimmedName = fileName.trim();
      const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
      const link = document.createElement("a");
      link.download = trimmedName;
      link.href = canvas.toDataURL(mimeType);
      link.click();
    }, 300);
  };

  const handleShare = () => {
    renderToCanvas(true);
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.toBlob((blob) => {
        if (!blob) return;
        const file = new File([blob], 'canvas-output.png', {
          type: 'image/png',
        });
        const fileUrl = URL.createObjectURL(file);
        navigate("/posts/new", {
          state: {
            fromEditorImage: { fileUrl, fileName: file.name },
          },
        });
      }, 'image/png');
    }, 300);
  };

  return (
    <div className="group relative flex flex-col w-full h-full">
      {/* Floating Button */}
      <button
        aria-label="Collapse Color Picker"
        onClick={() => setFullScreen(!fullScreen)}
        className={`top-0 left-1/2 z-50 absolute flex justify-center items-center w-10 h-10 transition-all -translate-x-1/2 ${fullScreen ? '' : 'hidden'}`}
      >
        <div className="-top-4 hover:top-0 relative bg-white opacity-50 hover:opacity-100 p-2 rounded-full transition-all duration-300 ease-in-out cursor-pointer">
          <ChevronDown className="size-5 text-mountain-950 transition-opacity duration-200" />
        </div>
      </button>
      <EditHeader
        finalCanvasSize={finalCanvasSize}
        hideTopBar={fullScreen}
        hasChanges={hasChanges}
        setHideTopBar={setFullScreen}
        setNewEdit={setNewEdit}
        setNewDesign={setNewDesign}
        handleShare={handleShare}
        handleDownload={handleDownload}
      />
      <div className={`flex ${fullScreen ? 'p-0 h-screen' : 'p-4 h-[calc(100vh-4rem)]'}  w-full overflow-hidden`}>
        <div className={`flex space-y-4 bg-mountain-100 border border-mountain-200 ${fullScreen ? 'rounded-none' : 'rounded-lg'} w-full h-full overflow-y-hidden`}>
          <LayerToolsBar
            layers={layers}
            zoomLevel={zoomLevel}
            selectedLayerId={selectedLayerId}
            setLayers={setLayers}
            setSelectedLayerId={setSelectedLayerId}
            handleZoomIn={handleZoomIn}
            handleZoomOut={handleZoomOut}
            currentZIndex={globalZIndex}
          />
          <div onMouseDown={() => setSelectedLayerId(null)}
            className="relative flex justify-center items-center bg-mountain-200 w-full h-full">
            <div
              ref={imageContainerRef}
              className="relative mx-auto overflow-hidden"
              style={{
                transform: `scale(${zoomLevel})`,
                backgroundColor:
                  layers[0].type === 'image'
                    ? layers[0].backgroundColor
                    : "#ffffff",
                width: canvasSize.width,
                height: canvasSize.height
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: `${canvasSize.width}px`,
                  height: `${canvasSize.height}px`,
                  overflow: 'hidden',
                  transformOrigin: 'top left',
                  border: '1px solid #ccc',
                }}
              >
                {layers.slice(1).map((layer) => (
                  <LayerItem
                    key={layer.id}
                    layer={layer}
                    editingLayerId={editingLayerId}
                    selectedLayerId={selectedLayerId}
                    layerRefs={layerRefs}
                    moveableRef={moveableRef}
                    zIndex={zIndex}
                    setEditingLayerId={setEditingLayerId}
                    setSelectedLayerId={setSelectedLayerId}
                    handleTextChange={handleTextChange}
                    setLayers={setLayers}
                    handleDuplicate={handleDuplicate}
                    bringToFront={() => bringToFront(layer.id)}
                    sendToBack={() => sendToBack(layer.id)}
                    moveForward={() => moveForward(layer.id)}
                    moveBackward={() => moveBackward(layer.id)}
                    handleLockLayer={handleLockLayer}
                  />
                ))}
              </div>
            </div>
            <div className="bottom-2 left-2 absolute flex justify-center items-center bg-white opacity-50 rounded-lg w-24 h-8 text-mountain-600 text-sm">
              <span>{finalCanvasSize.width} x {finalCanvasSize.height}</span>
            </div>
          </div>
          {/* Settings Panel */}
          <Panels
            activePanel={activePanel!}
            selectedLayerId={selectedLayerId!}
            layers={layers}
            handleLockLayer={handleLockLayer}
            updateSelectedLayer={updateSelectedLayer}
            moveForward={moveForward}
            moveBackward={moveBackward}
            sendToBack={sendToBack}
            bringToFront={bringToFront}
            handleLayerXPosition={handleLayerXPosition}
            handleLayerYPosition={handleLayerYPosition}
            handleRotationChange={handleRotationChange}
            handleOpacityChange={handleOpacityChange}
            toggleFlipHorizontal={toggleFlipHorizontal}
            toggleFlipVertical={toggleFlipVertical}
            handleDuplicate={handleDuplicate}
            setActivePanel={setActivePanel}
            handleSaturation={handleSaturation}
            handleBrightness={handleBrightness}
            handleContrast={handleContrast}
            handleHue={handleHue}
            handleSepia={handleSepia}
            addText={addText}
            handleChangeFontSize={handleChangeFontSize}
            handleChangeFontFamily={handleChangeFontFamily}
            handleChangeTextColor={handleChangeTextColor}
          />
          {/* Tools Bar */}
          <div className={`z-50 relative flex flex-col flex-none space-y-2 bg-white border border-mountain-200 w-20 h-full `}>
            <div
              onClick={() =>
                setActivePanel((prev) =>
                  prev === 'arrange' ? null : 'arrange',
                )
              }
              className="flex flex-col justify-center items-center space-y-1 hover:bg-mountain-50 rounded-lg w-full h-20 select-none"
            >
              <MdFlipToFront className="size-6 text-mountain-600" />
              <p className="text-mountain-600 text-xs">Arrange</p>
            </div>
            <div
              onClick={() =>
                setActivePanel((prev) => (prev === 'crop' ? null : 'crop'))
              }
              className="flex flex-col justify-center items-center space-y-1 hover:bg-mountain-50 rounded-lg w-full h-20 select-none"
            >
              <IoCrop className="size-6 text-mountain-600" />
              <p className="text-mountain-600 text-xs">Crop</p>
            </div>
            <div
              onClick={() =>
                setActivePanel((prev) => (prev === 'adjust' ? null : 'adjust'))
              }
              className="flex flex-col justify-center items-center space-y-1 hover:bg-mountain-50 rounded-lg w-full h-20 select-none"
            >
              <HiOutlineAdjustmentsHorizontal className="size-6 text-mountain-600" />
              <p className="text-mountain-600 text-xs">Adjust</p>
            </div>
            <div
              onClick={() =>
                setActivePanel((prev) => (prev === 'filter' ? null : 'filter'))
              }
              className="flex flex-col justify-center items-center space-y-1 hover:bg-mountain-50 rounded-lg w-full h-20 select-none"
            >
              <IoIosColorFilter className="size-6 text-mountain-600" />
              <p className="text-mountain-600 text-xs">Filter</p>
            </div>
            <div
              onClick={() =>
                setActivePanel((prev) => (prev === 'text' ? null : 'text'))
              }
              className="flex flex-col justify-center items-center space-y-1 hover:bg-mountain-50 rounded-lg w-full h-20 select-none"
            >
              <RiText className="size-6 text-mountain-600" />
              <p className="text-mountain-600 text-xs">Text</p>
            </div>
            {/* <div className="flex flex-col justify-center items-center space-y-1 hover:bg-mountain-50 rounded-lg w-full h-20 select-none">
              <IoShapesOutline className="size-6 text-mountain-600" />
              <p className="text-mountain-600 text-xs">Shape</p>
            </div>
            <div className="flex flex-col justify-center items-center space-y-1 hover:bg-mountain-50 rounded-lg w-full h-20 select-none">
              <PiDiamondsFourLight className="size-6 text-mountain-600" />
              <p className="text-mountain-600 text-xs">Element</p>
            </div>
            <div className="flex flex-col justify-center items-center space-y-1 hover:bg-mountain-50 rounded-lg w-full h-20 select-none">
              <HiDotsHorizontal className="size-6 text-mountain-600" />
              <p className="text-mountain-600 text-xs">More</p>
            </div> */}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
};

export default EditImage;
