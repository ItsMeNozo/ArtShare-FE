import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

//Logo src
import watermark from '/public/app_watermark.png';

//Components
import Moveable from 'react-moveable';
import EditHeader from './components/EditHeader';
import LayerItem from './components/LayerItem';
import Panels from './components/panels/Panels';
import LayerToolsBar from './components/tools/LayerToolsBar';

//Icons
import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';
import { IoCrop, IoShapesOutline } from 'react-icons/io5';
import { RiText } from 'react-icons/ri';
// import { IoShapesOutline } from "react-icons/io5";
// import { PiDiamondsFourLight } from "react-icons/pi";
// import { HiDotsHorizontal } from "react-icons/hi";
import { ChevronDown } from 'lucide-react';
import { IoIosColorFilter } from 'react-icons/io';
import { MdFlipToFront } from 'react-icons/md';

//Hooks
import { corsSafeSrc } from '@/utils/common';
import { useImageStyleHandlers } from './hooks/useImageStyleHandlers';
import { useLayerTransformHandlers } from './hooks/useLayerTransformHandlers';
import { useShapeStyleHandlers } from './hooks/useShapeStyleHandlers';
import { useTextStyleHandlers } from './hooks/useTextStyleHandlers';
import { designSamples } from './utils/constant';

const EditImage: React.FC = () => {
  //Handle getting images
  const location = useLocation();
  const navigate = useNavigate();
  const {
    sampleId,
    imageUrl,
    name,
    canvas = { width: 560, height: 560 },
    editCanvas,
    color = '#ffffff',
  } = location.state || {};

  //Toolbar
  const [fullScreen, setFullScreen] = useState(false);
  const [newEdit, setNewEdit] = useState<NewEdit | null>(null);
  const [newDesign, setNewDesign] = useState<NewDesign | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  //Images
  const [zIndex, setZIndex] = useState({ min: 1, max: 1 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activePanel, setActivePanel] = useState<
    'arrange' | 'crop' | 'adjust' | 'filter' | 'text' | 'shape' | null
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
    editCanvas || { width: 560, height: 560 },
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
      isLocked: false,
    },
  ]);

  useEffect(() => {
    if (layers.length !== 1) {
      setHasChanges(true);
      return;
    } else setHasChanges(false);
    const base = layers[0];
    const isBase =
      base.type === 'image' &&
      base.src === '' &&
      base.zIndex === 0 &&
      base.backgroundColor === (color || '#ffffff');
    setHasChanges(!isBase);
  }, [layers, color]);

  useEffect(() => {
    if (sampleId && designSamples[sampleId]) {
      const sample = designSamples[sampleId];
      setCanvasSize(sample.canvas);
      setFinalCanvasSize(sample.finalCanvas);
      setLayers(sample.layers);
      setNewDesign(null);
    } else if (!location.state) {
      // existing fallback if no state or sampleId
      setCanvasSize(canvas || { width: 560, height: 560 });
      setFinalCanvasSize(canvas || { width: 560, height: 560 });
      setLayers([
        {
          type: 'image',
          id: crypto.randomUUID(),
          src: '',
          zoom: 1,
          opacity: 1,
          flipH: false,
          flipV: false,
          x: 0,
          y: 0,
          width: canvas?.width || 560,
          height: canvas?.height || 560,
          rotation: 0,
          brightness: 100,
          contrast: 100,
          saturation: 100,
          hue: 0,
          sepia: 0,
          backgroundColor: color,
          zIndex: 0,
          isLocked: false,
        },
      ]);
    }
  }, [sampleId, canvas, color]);

  useEffect(() => {
    if (!newDesign || !newDesign.canvas) return;
    hasAppendedInitialImage.current = false;
    if (location.state) {
      location.state.imageUrl = null;
    }
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
      isLocked: false,
    };
    setLayers([baseLayer]);
    setNewDesign(null);
  }, [newDesign]);

  useEffect(() => {
    if (!newEdit || !newEdit.canvas) return;
    hasAppendedInitialImage.current = false;
    setSelectedLayerId(null);
    setEditingLayerId(null);
    setCanvasSize(newEdit.canvas);
    setFinalCanvasSize(newEdit.finalCanvas);
    setNewEdit(null);
  }, [newEdit]);

  useEffect(() => {
    if (!imageUrl || hasAppendedInitialImage.current) return;
    hasAppendedInitialImage.current = true;

    (async () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.fetchPriority = 'high'; // modern Chromium
      img.loading = 'eager';
      img.decoding = 'async';
      img.src = corsSafeSrc(imageUrl)!;

      // Wait for decode (paints faster when added)
      try {
        await img.decode();
      } catch {
        /* empty */
      }

      const maxWidth = canvasSize.width;
      const maxHeight = canvasSize.height;
      const widthRatio = maxWidth / img.naturalWidth;
      const heightRatio = maxHeight / img.naturalHeight;
      const scale = Math.min(widthRatio, heightRatio);

      const newImageLayer: ImageLayer = {
        id: crypto.randomUUID(),
        type: 'image',
        name,
        src: imageUrl!,
        zoom: 1,
        opacity: 1,
        flipH: false,
        flipV: false,
        width: img.naturalWidth * scale,
        height: img.naturalHeight * scale,
        x: (maxWidth - img.naturalWidth * scale) / 2,
        y: (maxHeight - img.naturalHeight * scale) / 2,
        rotation: 0,
        brightness: 100,
        contrast: 100,
        saturation: 100,
        hue: 0,
        sepia: 0,
        zIndex: 1,
        isLocked: false,
      };

      setLayers((prev) => [...prev, newImageLayer]);
    })();
  }, [imageUrl, canvasSize.width, canvasSize.height, name]);

  useEffect(() => {
    const imageLayer = layers.find(
      (l): l is ImageLayer => l.type === 'image' && !!l.src,
    );
    if (!imageLayer) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = corsSafeSrc(imageLayer.src)!;
  }, [layers]);

  useEffect(() => {
    const nonBackgroundLayers = layers.filter((layer) => layer.zIndex !== 0);
    const zIndexes = nonBackgroundLayers.map((layer) => layer.zIndex ?? 1);
    const maxZIndex = zIndexes.length > 0 ? Math.max(...zIndexes) : 1;
    const minZIndex = zIndexes.length > 0 ? Math.min(...zIndexes) : 1;
    setZIndex({ min: minZIndex, max: maxZIndex });
  }, [layers]);

  // Auto-focus the first image layer when layers change and no layer is currently selected
  useEffect(() => {
    // Only auto-focus if no layer is currently selected
    if (selectedLayerId) return;

    // Debounce the auto-focus logic to prevent frequent updates
    const timeoutId = setTimeout(() => {
      // Find the first non-background image layer (layers with zIndex > 0 and type 'image')
      const firstImageLayer = layers.find(
        (layer) =>
          layer.type === 'image' &&
          layer.zIndex &&
          layer.zIndex > 0 &&
          layer.src,
      );

      if (firstImageLayer) {
        setSelectedLayerId(firstImageLayer.id);
      }
    }, 100); // 100ms debounce

    return () => clearTimeout(timeoutId);
  }, [layers, selectedLayerId]);

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
    setSepia,
  });

  //Text hooks
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

  const {
    addShape,
    updateShape,
    handleChangeShapeColor,
    handleChangeShapeSize,
    handleChangeShapeRotation,
    handleChangeShapeOpacity,
  } = useShapeStyleHandlers({
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
    handleLockLayer,
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
    setYPos,
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

  const renderToCanvas = (includeWatermark: boolean): Promise<void> => {
    return new Promise((resolve) => {
      if (!canvasRef.current) return resolve();

      const canvas = canvasRef.current;
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve();

      // Clear and fill background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Prepare layers
      const allLayers = [...layers];
      if (includeWatermark) {
        const watermarkLayer: ImageLayer = {
          id: 'watermark',
          type: 'image',
          src: watermark,
          name: 'Watermark',
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
          isLocked: true,
        };
        allLayers.push(watermarkLayer);
      }

      const sortedLayers = allLayers.sort(
        (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0),
      );

      const imageLayers = sortedLayers.filter((l) => l.type === 'image');
      const textLayers = sortedLayers.filter((l) => l.type === 'text');

      const imagePromises: Promise<void>[] = [];

      // Pass 1: Draw images
      imageLayers.forEach((layer) => {
        const promise = new Promise<void>((resolveImg) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = corsSafeSrc(layer.src)!;
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

            const drawWidth = width ?? img.naturalWidth;
            const drawHeight = height ?? img.naturalHeight;

            ctx.save();
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
            ctx.drawImage(
              img,
              -drawWidth / 2,
              -drawHeight / 2,
              drawWidth,
              drawHeight,
            );
            ctx.restore();
            resolveImg();
          };
          img.onerror = () => resolveImg();
        });
        imagePromises.push(promise);
      });

      Promise.all(imagePromises).then(() => {
        // Pass 2: Draw text
        textLayers.forEach((layer) => {
          ctx.save();
          ctx.filter = 'none'; // reset filters for text

          const centerX = layer.x + (layer.width ?? 0) / 2;
          const centerY = layer.y + (layer.height ?? layer.fontSize ?? 0) / 2;
          ctx.translate(centerX, centerY);

          ctx.rotate(((layer.rotation || 0) * Math.PI) / 180);
          ctx.font = `${layer.fontSize}px ${layer.fontFamily || 'sans-serif'}`;
          ctx.fillStyle = layer.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.globalAlpha = layer.opacity ?? 1;

          ctx.fillText(layer.text, 0, 0);
          ctx.restore();
        });

        resolve();
      });
    });
  };

  const handleDownload = async (
    format: 'png' | 'jpg',
    fileName: string,
    includeWaterMark: boolean,
  ) => {
    await renderToCanvas(includeWaterMark);
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const trimmedName = fileName.trim();
      const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
      const link = document.createElement('a');
      link.download = trimmedName;
      link.href = canvas.toDataURL(mimeType);
      link.click();
    }, 300);
  };

  const canvasToFile = (canvas: HTMLCanvasElement): Promise<File | null> => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return resolve(null);
        resolve(new File([blob], 'canvas-output.png', { type: 'image/png' }));
      }, 'image/png');
    });
  };

  const handleShare = async () => {
    await renderToCanvas(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const file = await canvasToFile(canvas);
    if (!file) return;

    navigate('/posts/new', { state: { fromEditorImage: file } });
  };

  return (
    <div className="group relative flex h-full w-full flex-col">
      {/* Floating Button */}
      <button
        aria-label="Collapse Color Picker"
        onClick={() => setFullScreen(!fullScreen)}
        className={`absolute top-0 left-1/2 z-50 flex h-10 w-10 -translate-x-1/2 items-center justify-center transition-all ${fullScreen ? '' : 'hidden'}`}
      >
        <div className="relative -top-4 cursor-pointer rounded-full bg-white p-2 opacity-50 transition-all duration-300 ease-in-out hover:top-0 hover:opacity-100">
          <ChevronDown className="text-mountain-950 size-5 transition-opacity duration-200" />
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
      <div
        className={`flex ${fullScreen ? 'h-screen p-0' : 'h-[calc(100vh-4rem)] p-4'} w-full overflow-hidden`}
      >
        <div
          className={`bg-mountain-100 border-mountain-200 flex space-y-4 border ${fullScreen ? 'rounded-none' : 'rounded-lg'} h-full w-full overflow-y-hidden`}
        >
          <LayerToolsBar
            layers={layers}
            zoomLevel={zoomLevel}
            selectedLayerId={selectedLayerId}
            setLayers={setLayers}
            setSelectedLayerId={setSelectedLayerId}
            handleZoomIn={handleZoomIn}
            handleZoomOut={handleZoomOut}
            zIndex={zIndex}
            setZIndex={setZIndex}
          />
          <div
            onMouseDown={() => setSelectedLayerId(null)}
            className="bg-mountain-200 relative flex h-full w-full items-center justify-center"
          >
            <div
              ref={imageContainerRef}
              className="relative mx-auto overflow-hidden"
              style={{
                transform: `scale(${zoomLevel})`,
                backgroundColor:
                  layers[0].type === 'image'
                    ? layers[0].backgroundColor
                    : '#ffffff',
                width: canvasSize.width,
                height: canvasSize.height,
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
            <div className="text-mountain-600 absolute bottom-2 left-2 flex h-8 w-24 items-center justify-center rounded-lg bg-white text-sm opacity-50">
              <span>
                {finalCanvasSize?.width} x {finalCanvasSize?.height}
              </span>
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
            addShape={addShape}
            updateShape={updateShape}
            handleChangeShapeColor={handleChangeShapeColor}
            handleChangeShapeSize={handleChangeShapeSize}
            handleChangeShapeRotation={handleChangeShapeRotation}
            handleChangeShapeOpacity={handleChangeShapeOpacity}
          />
          {/* Tools Bar */}
          <div
            className={`border-mountain-200 relative z-50 flex h-full w-20 flex-none flex-col space-y-2 border bg-white`}
          >
            <div
              onClick={() =>
                setActivePanel((prev) =>
                  prev === 'arrange' ? null : 'arrange',
                )
              }
              className="hover:bg-mountain-50 flex h-20 w-full flex-col items-center justify-center space-y-1 rounded-lg select-none"
            >
              <MdFlipToFront className="text-mountain-600 size-6" />
              <p className="text-mountain-600 text-xs">Arrange</p>
            </div>
            <div
              onClick={() =>
                setActivePanel((prev) => (prev === 'crop' ? null : 'crop'))
              }
              className="hover:bg-mountain-50 flex h-20 w-full flex-col items-center justify-center space-y-1 rounded-lg select-none"
            >
              <IoCrop className="text-mountain-600 size-6" />
              <p className="text-mountain-600 text-xs">Crop</p>
            </div>
            <div
              onClick={() =>
                setActivePanel((prev) => (prev === 'adjust' ? null : 'adjust'))
              }
              className="hover:bg-mountain-50 flex h-20 w-full flex-col items-center justify-center space-y-1 rounded-lg select-none"
            >
              <HiOutlineAdjustmentsHorizontal className="text-mountain-600 size-6" />
              <p className="text-mountain-600 text-xs">Adjust</p>
            </div>
            <div
              onClick={() =>
                setActivePanel((prev) => (prev === 'filter' ? null : 'filter'))
              }
              className="hover:bg-mountain-50 flex h-20 w-full flex-col items-center justify-center space-y-1 rounded-lg select-none"
            >
              <IoIosColorFilter className="text-mountain-600 size-6" />
              <p className="text-mountain-600 text-xs">Filter</p>
            </div>
            <div
              onClick={() =>
                setActivePanel((prev) => (prev === 'text' ? null : 'text'))
              }
              className="hover:bg-mountain-50 flex h-20 w-full flex-col items-center justify-center space-y-1 rounded-lg select-none"
            >
              <RiText className="text-mountain-600 size-6" />
              <p className="text-mountain-600 text-xs">Text</p>
            </div>
            <div
              onClick={() =>
                setActivePanel((prev) => (prev === 'shape' ? null : 'shape'))
              }
              className="hover:bg-mountain-50 pointer-events-none flex h-20 w-full flex-col items-center justify-center space-y-1 rounded-lg select-none"
            >
              <IoShapesOutline className="text-mountain-600 size-6" />
              <p className="text-mountain-600 text-xs">Shape</p>
            </div>
            {/* 
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
