import React, { useEffect, useRef, useState } from 'react';

//Components
import Panels from './components/panels/Panels';

//Icons
import { HiDotsHorizontal } from 'react-icons/hi';
import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';
import { IoIosColorFilter } from 'react-icons/io';
import { IoCrop, IoShapesOutline } from 'react-icons/io5';
import { MdFlipToFront } from 'react-icons/md';
import { PiDiamondsFourLight } from 'react-icons/pi';
import { RiText } from 'react-icons/ri';
import Moveable from 'react-moveable';
import EditHeader from './components/EditHeader';
import LayerToolsBar from './components/tools/LayerToolsBar';

const EditImage: React.FC = () => {
  //Images
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activePanel, setActivePanel] = useState<
    'arrange' | 'crop' | 'adjust' | 'filter' | 'text' | null
  >(null);
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
  const [canvasSize, setCanvasSize] = useState({ width: 540, height: 540 });

  //Texts
  const layerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const moveableRef = useRef<Moveable>(null);

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
      backgroundColor: '#ffffff',
    },
  ]);

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  useEffect(() => {
    const imageLayer = layers.find(
      (l): l is ImageLayer => l.type === 'image' && !!l.src,
    );
    if (!imageLayer) return;

    const img = new Image();
    img.src = imageLayer.src;
    img.onload = () => {
      const targetHeight = 540;
      const scale = targetHeight / img.naturalHeight;
      const scaledWidth = img.naturalWidth * scale;

      setCanvasSize({
        width: scaledWidth,
        height: targetHeight,
      });
    };
  }, [layers]);

  const updateSelectedLayer = (updates: Partial<Layer>) => {
    setLayers((prev) =>
      prev.map((layer) => {
        if (layer.id !== selectedLayerId) return layer;
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

  const handleZoomIn = () => {
    setZoomLevel((prev) => {
      const newZoom = Math.min(prev + 0.1, 3);
      if (selectedLayerId) updateSelectedLayer({ zoom: newZoom });
      return newZoom;
    });
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const newZoom = Math.max(prev - 0.1, 0.1);
      if (selectedLayerId) updateSelectedLayer({ zoom: newZoom });
      return newZoom;
    });
  };

  const handleRotationChange = (newRotation: number) => {
    setRotation(newRotation);
    if (selectedLayerId) updateSelectedLayer({ rotation: newRotation });
    setTimeout(() => {
      moveableRef.current?.updateRect();
    }, 0);
  };

  const handleOpacityChange = (newOpacity: number) => {
    setOpacity(newOpacity);
    if (selectedLayerId) updateSelectedLayer({ opacity: newOpacity });
  };

  const toggleFlipHorizontal = () => {
    setFlipHorizontal((prev) => {
      const newFlip = !prev;
      if (selectedLayerId) updateSelectedLayer({ flipH: newFlip });
      return newFlip;
    });
  };

  const toggleFlipVertical = () => {
    setFlipVertical((prev) => {
      const newFlip = !prev;
      if (selectedLayerId) updateSelectedLayer({ flipV: newFlip });
      return newFlip;
    });
  };

  const handleBrightness = (newBrightness: number) => {
    setBrightness(newBrightness);
    if (selectedLayerId) updateSelectedLayer({ brightness: newBrightness });
  };

  const handleLayerXPosition = (newXPos: number) => {
    setXPos(newXPos);
    if (selectedLayerId) updateSelectedLayer({ x: newXPos });
  };

  const handleLayerYPosition = (newYPos: number) => {
    setYPos(newYPos);
    if (selectedLayerId) updateSelectedLayer({ y: newYPos });
  };

  const handleContrast = (newContrast: number) => {
    setContrast(newContrast);
    if (selectedLayerId) updateSelectedLayer({ contrast: newContrast });
  };

  const handleSaturation = (newSaturation: number) => {
    setSaturation(newSaturation);
    if (selectedLayerId) updateSelectedLayer({ saturation: newSaturation });
  };

  const handleHue = (newHue: number) => {
    setHue(newHue);
    if (selectedLayerId) updateSelectedLayer({ hue: newHue });
  };

  const handleSepia = (newSepia: number) => {
    setSepia(newSepia);
    if (selectedLayerId) updateSelectedLayer({ sepia: newSepia });
  };

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

  const renderToCanvas = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    layers.forEach((layer) => {
      if (layer.type === 'image') {
        const img = new Image();
        img.src = layer.src;

        img.onload = () => {
          ctx.save();
          ctx.translate(layer.x, layer.y);
          ctx.rotate((layer.rotation * Math.PI) / 180);
          const scaleX = layer.flipH ? -1 : 1;
          const scaleY = layer.flipV ? -1 : 1;
          ctx.scale(scaleX * layer.zoom, scaleY * layer.zoom);
          ctx.globalAlpha = layer.opacity;
          ctx.filter = `
                    brightness(${layer.brightness}%)
                    contrast(${layer.contrast}%)
                    saturate(${layer.saturation}%)
                    hue-rotate(${layer.hue}deg)
                    sepia(${layer.sepia}%)
                `;
          ctx.drawImage(
            img,
            -img.naturalWidth / 2,
            -img.naturalHeight / 2,
            img.naturalWidth,
            img.naturalHeight,
          );
          ctx.restore();
        };
      } else if (layer.type === 'text') {
        ctx.save();
        ctx.translate(layer.x, layer.y);
        ctx.rotate(((layer.rotation || 0) * Math.PI) / 180);
        ctx.font = `${layer.fontSize}px sans-serif`;
        ctx.fillStyle = layer.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
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

      const link = document.createElement('a');
      link.download = 'edited-image.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }, 300); // ensure all images finish drawing
  };

  const imageContainerRef = useRef<HTMLDivElement>(null);

  const addText = () => {
    const newTextLayer: TextLayer = {
      id: crypto.randomUUID(),
      type: 'text',
      text: 'Your Text',
      fontSize: 24,
      color: '#000000',
      x: 100,
      y: 100,
      rotation: 0,
      opacity: 1,
    };
    setLayers((prev) => [...prev, newTextLayer]);
  };

  const handleChangeFontSize = (newFontSize: number) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) =>
        layer.id === selectedLayerId && layer.type === 'text'
          ? { ...layer, fontSize: newFontSize }
          : layer,
      ),
    );
  };

  const handleChangeFontFamily = (font: string) => {
    if (!selectedLayerId) return;
    const updatedLayers = layers.map((layer) =>
      layer.id === selectedLayerId && layer.type === 'text'
        ? { ...layer, fontFamily: font }
        : layer,
    );
    setLayers(updatedLayers);
  };

  const handleChangeTextColor = (newColor: string) => {
    if (!selectedLayerId) return;
    const updatedLayers = layers.map((layer) =>
      layer.id === selectedLayerId && layer.type === 'text'
        ? { ...layer, color: newColor }
        : layer,
    );
    setLayers(updatedLayers);
  };

  return (
    <div className="flex h-full w-full flex-col px-2">
      <EditHeader />
      <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden p-4">
        <div className="bg-mountain-100 border-mountain-200 flex h-full w-full space-y-4 overflow-y-hidden rounded-lg border">
          <LayerToolsBar
            layers={layers}
            zoomLevel={zoomLevel}
            selectedLayerId={selectedLayerId}
            setLayers={setLayers}
            setSelectedLayerId={setSelectedLayerId}
            handleZoomIn={handleZoomIn}
            handleZoomOut={handleZoomOut}
            handleDownload={handleDownload}
          />
          <div className="bg-mountain-200 relative flex h-full w-full items-center justify-center">
            <div
              ref={imageContainerRef}
              className="relative mx-auto h-[540px] w-[540px] overflow-hidden"
              style={{
                transform: `scale(${zoomLevel})`,
                backgroundColor:
                  layers[0].type === 'image'
                    ? layers[0].backgroundColor
                    : '#ffffff',
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
                  <div key={layer.id}>
                    <div
                      ref={(el) => {
                        layerRefs.current[layer.id] = el;
                      }}
                      style={{
                        width: layer.width,
                        height: layer.height,
                        transform: `
                      translate(${layer.x}px, ${layer.y}px)
                      rotate(${layer.rotation}deg)
                      `,
                        transformOrigin: 'center',
                        position: 'absolute',
                        zIndex: layer.id,
                        background: 'transparent',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        pointerEvents: 'auto',
                      }}
                      onMouseDown={() => setSelectedLayerId(layer.id)}
                    >
                      {layer.type === 'image' ? (
                        <img
                          src={layer.src}
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none',
                            filter: `
                            saturate(${layer.saturation}%)
                            hue-rotate(${layer.hue}deg)
                            brightness(${layer.brightness}%)
                            contrast(${layer.contrast}%)
                            opacity(${layer.opacity})
                            sepia(${layer.sepia}%)
                            `,
                            transform: `
                            scaleX(${layer.flipH ? -1 : 1})
                            scaleY(${layer.flipV ? -1 : 1})
                            `,
                          }}
                          draggable={false}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            fontSize: layer.fontSize,
                            color: layer.color,
                            fontWeight: layer.fontWeight || 'normal',
                            fontFamily: layer.fontFamily || 'sans-serif',
                            textAlign: 'center',
                            whiteSpace: 'pre-wrap',
                            userSelect: 'none',
                            transform: `
                            scaleX(${layer.flipH ? -1 : 1})
                            scaleY(${layer.flipV ? -1 : 1})
                            `,
                            opacity: layer.opacity,
                          }}
                        >
                          {layer.text}
                        </div>
                      )}
                    </div>
                    {selectedLayerId === layer.id && (
                      <Moveable
                        ref={moveableRef}
                        target={layerRefs.current[layer.id]}
                        draggable
                        resizable
                        rotatable
                        rotationPosition="top"
                        throttleResize={1}
                        renderDirections={['nw', 'ne', 'sw', 'se']}
                        keepRatio={false}
                        onDrag={({ beforeTranslate }) => {
                          setLayers((prev) =>
                            prev.map((l) =>
                              l.id === layer.id
                                ? {
                                    ...l,
                                    x: beforeTranslate[0],
                                    y: beforeTranslate[1],
                                  }
                                : l,
                            ),
                          );
                        }}
                        onResize={({ width, height, drag, target }) => {
                          target.style.width = `${width}px`;
                          target.style.height = `${height}px`;
                          target.style.transform = drag.transform;
                        }}
                        onResizeEnd={({ lastEvent }) => {
                          if (!lastEvent) return;
                          const { width, height, drag } = lastEvent;
                          setLayers((prev) =>
                            prev.map((l) =>
                              l.id === layer.id
                                ? {
                                    ...l,
                                    width,
                                    height,
                                    x: drag.beforeTranslate[0],
                                    y: drag.beforeTranslate[1],
                                  }
                                : l,
                            ),
                          );
                        }}
                        onRotate={({ rotation }) => {
                          setLayers((prev) =>
                            prev.map((l) =>
                              l.id === layer.id ? { ...l, rotation } : l,
                            ),
                          );
                        }}
                      />
                    )}
                  </div>
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
          <div className="border-mountain-200 relative z-50 flex h-full w-20 flex-none flex-col justify-between space-y-2 rounded-lg rounded-l-none border bg-white">
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
            <div className="hover:bg-mountain-50 flex h-20 w-full flex-col items-center justify-center space-y-1 rounded-lg select-none">
              <IoShapesOutline className="text-mountain-600 size-6" />
              <p className="text-mountain-600 text-xs">Shape</p>
            </div>
            <div className="hover:bg-mountain-50 flex h-20 w-full flex-col items-center justify-center space-y-1 rounded-lg select-none">
              <PiDiamondsFourLight className="text-mountain-600 size-6" />
              <p className="text-mountain-600 text-xs">Element</p>
            </div>
            <div className="hover:bg-mountain-50 flex h-20 w-full flex-col items-center justify-center space-y-1 rounded-lg select-none">
              <HiDotsHorizontal className="text-mountain-600 size-6" />
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
