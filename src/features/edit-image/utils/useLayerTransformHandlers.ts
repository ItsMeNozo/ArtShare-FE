import { useCallback } from 'react';

interface TransformHandlersParams {
  selectedLayerId: string | null;
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
  selectedLayerId,
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
    handleZoomIn,
    handleZoomOut,
    handleRotationChange,
    handleOpacityChange,
    toggleFlipHorizontal,
    toggleFlipVertical,
    handleLayerXPosition,
    handleLayerYPosition,
  };
};
