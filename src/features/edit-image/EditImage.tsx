import React, { useEffect, useRef, useState } from "react";

//Components
import Panels from "./components/panels/Panels";

//Icons
import { IoCrop } from "react-icons/io5";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { RiText } from "react-icons/ri";
import { IoShapesOutline } from "react-icons/io5";
import { PiDiamondsFourLight } from "react-icons/pi";
import { HiDotsHorizontal } from "react-icons/hi";
import { MdFlipToFront } from "react-icons/md";
import { IoIosColorFilter } from "react-icons/io";
import Moveable from "react-moveable";
import LayerToolsBar from "./components/tools/LayerToolsBar";
import EditHeader from "./components/EditHeader";
import { useLayerStyleHandlers } from "./hooks/useLayerStyleHandlers";
import { useLayerTransformHandlers } from "./hooks/useLayerTransformHandlers";
import { ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";
import LayerItem from "./components/LayerItem";

const EditImage: React.FC = () => {
  //Handle getting images
  const location = useLocation();
  const { imageUrl, name } = location.state || {};

  //Toolbar
  const [fullScreen, setFullScreen] = useState(false);

  //Images
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activePanel, setActivePanel] = useState<
    "arrange" | "crop" | "adjust" | "filter" | "text" | null
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
  const [canvasSize] = useState({ width: 540, height: 540 });

  //Texts
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const layerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const moveableRef = useRef<Moveable>(null);
  const hasAppendedInitialImage = useRef(false);

  const [layers, setLayers] = useState<Layer[]>([
    {
      type: "image",
      id: crypto.randomUUID(),
      src: "",
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
      backgroundColor: "#ffffff",
      height: canvasSize.height,
      width: canvasSize.width,
      zIndex: 0,
    },
  ]);

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl || hasAppendedInitialImage.current) return;
    hasAppendedInitialImage.current = true;

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
      };
      setGlobalZIndex(2);
      setLayers((prev) => [...prev, newImageLayer]);
    };
    img.src = imageUrl;
  }, [imageUrl, layers]);

  useEffect(() => {
    const imageLayer = layers.find(
      (l): l is ImageLayer => l.type === "image" && !!l.src,
    );
    if (!imageLayer) return;
    const img = new Image();
    img.src = imageLayer.src;
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
      id: crypto.randomUUID(),
    };
    setLayers((prev) => [...prev, newLayer]);
  };
  //Style hooks
  const {
    handleBrightness,
    handleContrast,
    handleSaturation,
    handleHue,
    handleSepia,
  } = useLayerStyleHandlers({
    selectedLayerId,
    updateSelectedLayer,
    setBrightness,
    setContrast,
    setSaturation,
    setHue,
    setSepia
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
    handleLayerYPosition
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
            if (layer.type !== "image") return layer;
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
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [selectedLayerId]);

  const renderToCanvas = () => {
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
    layers.forEach((layer) => {
      if (layer.type === "image") {
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
      } else if (layer.type === "text") {
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
  };

  const handleDownload = () => {
    renderToCanvas();
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = "edited-image.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }, 300);
  };

  const imageContainerRef = useRef<HTMLDivElement>(null);

  const getFittingFontSize = (
    text: string,
    maxWidth: number,
    maxHeight: number,
    fontFamily = "Arial",
    startingFontSize = 20
  ): number => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return startingFontSize;

    let fontSize = startingFontSize;
    const lineHeightFactor = 1.2;

    ctx.font = `${fontSize}px ${fontFamily}`;
    let textWidth = ctx.measureText(text).width;

    while (
      (textWidth > maxWidth || fontSize * lineHeightFactor > maxHeight) &&
      fontSize > 5
    ) {
      fontSize -= 1;
      ctx.font = `${fontSize}px ${fontFamily}`;
      textWidth = ctx.measureText(text).width;
    }

    return fontSize;
  };

  const addText = () => {
    const defaultText = "Your Text";
    const maxWidth = 300;
    const maxHeight = 100;

    const fittedFontSize = getFittingFontSize(defaultText, maxWidth, maxHeight);

    const newTextLayer: TextLayer = {
      id: crypto.randomUUID(),
      type: "text",
      text: defaultText,
      fontSize: fittedFontSize,
      color: "#000000",
      x: 100,
      y: 100,
      rotation: 0,
      opacity: 1,
      width: maxWidth,
      height: maxHeight,
      zIndex: globalZIndex,
    };
    setGlobalZIndex(globalZIndex + 1);
    setLayers((prev) => [...prev, newTextLayer]);
  };

  const handleChangeFontSize = (newFontSize: number) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) =>
        layer.id === selectedLayerId && layer.type === "text"
          ? { ...layer, fontSize: newFontSize }
          : layer,
      ),
    );
  };

  const handleChangeFontFamily = (font: string) => {
    if (!selectedLayerId) return;
    const updatedLayers = layers.map((layer) =>
      layer.id === selectedLayerId && layer.type === "text"
        ? { ...layer, fontFamily: font }
        : layer,
    );
    setLayers(updatedLayers);
  };

  const handleChangeTextColor = (newColor: string) => {
    if (!selectedLayerId) return;
    const updatedLayers = layers.map((layer) =>
      layer.id === selectedLayerId && layer.type === "text"
        ? { ...layer, color: newColor }
        : layer,
    );
    setLayers(updatedLayers);
  };

  const handleTextChange = (id: string, newText: string) => {
    setLayers((prev) =>
      prev.map((layer) => {
        if (layer.id === id && layer.type === "text") {
          const fittedFontSize = getFittingFontSize(
            newText,
            layer.width,
            layer.height,
            layer.fontFamily || "Arial",
            20
          );

          return {
            ...layer,
            text: newText,
            fontSize: fittedFontSize,
          };
        }
        return layer;
      })
    );
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
        hideTopBar={fullScreen}
        setHideTopBar={setFullScreen}
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
            setCurrentZIndex={setGlobalZIndex}
          />
          <div onMouseDown={() => setSelectedLayerId(null)}
            className="relative flex justify-center items-center bg-mountain-200 w-full h-full">
            <div
              ref={imageContainerRef}
              className="relative mx-auto overflow-hidden"
              style={{
                transform: `scale(${zoomLevel})`,
                backgroundColor:
                  layers[0].type === "image"
                    ? layers[0].backgroundColor
                    : "#ffffff",
                width: canvasSize.width,
                height: canvasSize.height
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: `${canvasSize.width}px`,
                  height: `${canvasSize.height}px`,
                  overflow: "hidden",
                  transformOrigin: "top left",
                  border: "1px solid #ccc",
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
                    setEditingLayerId={setEditingLayerId}
                    setSelectedLayerId={setSelectedLayerId}
                    handleTextChange={handleTextChange}
                    setLayers={setLayers}
                    handleDuplicate={handleDuplicate}
                    bringToFront={() => bringToFront(layer.id)}
                    sendToBack={() => sendToBack(layer.id)}
                    moveForward={() => moveForward(layer.id)}
                    moveBackward={() => moveBackward(layer.id)}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Settings Panel */}
          <Panels
            activePanel={activePanel!}
            selectedLayerId={selectedLayerId!}
            layers={layers}
            handleLayerXPosition={handleLayerXPosition}
            handleLayerYPosition={handleLayerYPosition}
            handleRotationChange={handleRotationChange}
            handleOpacityChange={handleOpacityChange}
            toggleFlipHorizontal={toggleFlipHorizontal}
            toggleFlipVertical={toggleFlipVertical}
            handleDuplicate={handleDuplicate}
            updateSelectedLayer={updateSelectedLayer}
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
                setActivePanel((prev) => (prev === "arrange" ? null : "arrange"))
              }
              className="flex flex-col justify-center items-center space-y-1 hover:bg-mountain-50 rounded-lg w-full h-20 select-none"
            >
              <MdFlipToFront className="size-6 text-mountain-600" />
              <p className="text-mountain-600 text-xs">Arrange</p>
            </div>
            <div
              onClick={() =>
                setActivePanel((prev) => (prev === "crop" ? null : "crop"))
              }
              className="flex flex-col justify-center items-center space-y-1 hover:bg-mountain-50 rounded-lg w-full h-20 select-none"
            >
              <IoCrop className="size-6 text-mountain-600" />
              <p className="text-mountain-600 text-xs">Crop</p>
            </div>
            <div
              onClick={() =>
                setActivePanel((prev) => (prev === "adjust" ? null : "adjust"))
              }
              className="flex flex-col justify-center items-center space-y-1 hover:bg-mountain-50 rounded-lg w-full h-20 select-none"
            >
              <HiOutlineAdjustmentsHorizontal className="size-6 text-mountain-600" />
              <p className="text-mountain-600 text-xs">Adjust</p>
            </div>
            <div
              onClick={() =>
                setActivePanel((prev) => (prev === "filter" ? null : "filter"))
              }
              className="flex flex-col justify-center items-center space-y-1 hover:bg-mountain-50 rounded-lg w-full h-20 select-none"
            >
              <IoIosColorFilter className="size-6 text-mountain-600" />
              <p className="text-mountain-600 text-xs">Filter</p>
            </div>
            <div
              onClick={() =>
                setActivePanel((prev) => (prev === "text" ? null : "text"))
              }
              className="flex flex-col justify-center items-center space-y-1 hover:bg-mountain-50 rounded-lg w-full h-20 select-none"
            >
              <RiText className="size-6 text-mountain-600" />
              <p className="text-mountain-600 text-xs">Text</p>
            </div>
            <div className="flex flex-col justify-center items-center space-y-1 hover:bg-mountain-50 rounded-lg w-full h-20 select-none">
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
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
};

export default EditImage;
