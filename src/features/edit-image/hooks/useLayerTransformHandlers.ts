import { useCallback } from 'react';

interface TransformHandlersParams {
  layers: Layer[];
  selectedLayerId: string | null;
  updateLayerById: (id: string, updates: Partial<Layer>) => void;
  updateSelectedLayer: (updates: Partial<Layer>) => void;
  moveableRef: React.RefObject<any>;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  setRotation: React.Dispatch<React.SetStateAction<number>>;
  setOpacity: React.Dispatch<React.SetStateAction<number>>;
  setFlipHorizontal: React.Dispatch<React.SetStateAction<boolean>>;
  setFlipVertical: React.Dispatch<React.SetStateAction<boolean>>;
  setXPos: (val: number) => void;
  setYPos: (val: number) => void;
}

export const useLayerTransformHandlers = ({
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
}: TransformHandlersParams) => {
  const handleLockLayer = useCallback(
    (layerId: string) => {
      if (!layerId) return;
      const selectedLayer = layers.find((l) => l.id === layerId);
      if (!selectedLayer) return;
      const newLockedState = !selectedLayer.isLocked;
      updateLayerById(layerId, { isLocked: newLockedState });
    },
    [layers, updateLayerById],
  );

  const bringToFront = useCallback(
    (layerId: string) => {
      const targetLayers = layers.filter((l) => l.id !== layerId);
      const sorted = [...targetLayers].sort(
        (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0),
      );
      sorted.forEach((l, i) => {
        updateLayerById(l.id, { zIndex: i + 1 }); // Start from 1
      });
      updateLayerById(layerId, { zIndex: sorted.length + 1 }); // Topmost
    },
    [layers, updateLayerById],
  );

  const sendToBack = useCallback(
    (layerId: string) => {
      const targetLayers = layers.filter(
        (l) => l.id !== layerId && (l.zIndex ?? 0) > 0,
      );
      const sorted = [...targetLayers].sort(
        (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0),
      );
      sorted.forEach((l, i) => {
        updateLayerById(l.id, { zIndex: i + 2 });
      });
      updateLayerById(layerId, { zIndex: 1 });
    },
    [layers, updateLayerById],
  );

  const moveForward = useCallback(
    (layerId: string) => {
      const layer = layers.find((l) => l.id === layerId);
      if (!layer) return;
      const sorted = [...layers].sort(
        (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0),
      );
      const index = sorted.findIndex((l) => l.id === layerId);
      if (index === -1 || index === sorted.length - 1) return; // Already on top
      const aboveLayer = sorted[index + 1];
      if (!aboveLayer) return;
      updateLayerById(layer.id, { zIndex: aboveLayer.zIndex });
      updateLayerById(aboveLayer.id, { zIndex: layer.zIndex });
    },
    [layers, updateLayerById],
  );

  const moveBackward = useCallback(
    (layerId: string) => {
      const layer = layers.find((l) => l.id === layerId);
      if (!layer) return;
      const sorted = [...layers].sort(
        (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0),
      );
      const index = sorted.findIndex((l) => l.id === layerId);
      if (index <= 0) return;
      const belowLayer = sorted[index - 1];
      if (!belowLayer) return;
      updateLayerById(layer.id, { zIndex: belowLayer.zIndex });
      updateLayerById(belowLayer.id, { zIndex: layer.zIndex });
    },
    [layers, updateLayerById],
  );

  const handleLayerXPosition = useCallback(
    (newXPos: number) => {
      setXPos(newXPos);
      if (selectedLayerId) updateSelectedLayer({ x: newXPos });
    },
    [selectedLayerId, updateSelectedLayer],
  );

  const handleLayerYPosition = useCallback(
    (newYPos: number) => {
      setYPos(newYPos);
      if (selectedLayerId) updateSelectedLayer({ y: newYPos });
    },
    [selectedLayerId, updateSelectedLayer],
  );

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => {
      const newZoom = Math.min(prev + 0.1, 3);
      if (selectedLayerId) updateSelectedLayer({ zoom: newZoom });
      return newZoom;
    });
  }, [selectedLayerId]);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => {
      const newZoom = Math.max(prev - 0.1, 0.1);
      if (selectedLayerId) updateSelectedLayer({ zoom: newZoom });
      return newZoom;
    });
  }, [selectedLayerId]);

  const handleRotationChange = useCallback(
    (newRotation: number) => {
      setRotation(newRotation);
      if (selectedLayerId) updateSelectedLayer({ rotation: newRotation });
      setTimeout(() => {
        moveableRef.current?.updateRect?.();
      }, 0);
    },
    [selectedLayerId],
  );

  const handleOpacityChange = useCallback(
    (newOpacity: number) => {
      setOpacity(newOpacity);
      if (selectedLayerId) updateSelectedLayer({ opacity: newOpacity });
    },
    [selectedLayerId],
  );

  const toggleFlipHorizontal = useCallback(() => {
    setFlipHorizontal((prev) => {
      const newFlip = !prev;
      if (selectedLayerId) updateSelectedLayer({ flipH: newFlip });
      return newFlip;
    });
  }, [selectedLayerId]);

  const toggleFlipVertical = useCallback(() => {
    setFlipVertical((prev) => {
      const newFlip = !prev;
      if (selectedLayerId) updateSelectedLayer({ flipV: newFlip });
      return newFlip;
    });
  }, [selectedLayerId]);

  return {
    bringToFront,
    sendToBack,
    moveForward,
    moveBackward,
    handleZoomIn,
    handleZoomOut,
    handleLockLayer,
    handleRotationChange,
    handleOpacityChange,
    toggleFlipHorizontal,
    toggleFlipVertical,
    handleLayerXPosition,
    handleLayerYPosition,
  };
};
