import { useCallback } from 'react';

type UseShapeStyleHandlersProps = {
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  selectedLayerId: string | null;
  globalZIndex: number;
  setGlobalZIndex: (z: number) => void;
};

export const useShapeStyleHandlers = ({
  setLayers,
  selectedLayerId,
  globalZIndex,
  setGlobalZIndex,
}: UseShapeStyleHandlersProps) => {
  const addShape = useCallback(
    (shapeType: 'square' | 'circle' | 'rect-horizontal' | 'rect-vertical') => {
      let width = 100;
      let height = 100;

      switch (shapeType) {
        case 'square':
          width = 100;
          height = 100;
          break;
        case 'circle':
          width = 100;
          height = 100;
          break;
        case 'rect-horizontal':
          width = 150;
          height = 80;
          break;
        case 'rect-vertical':
          width = 80;
          height = 150;
          break;
      }

      const newShapeLayer: ShapeLayer = {
        id: crypto.randomUUID(),
        type: 'shape',
        shapeType,
        x: 100,
        y: 100,
        width,
        height,
        rotation: 0,
        opacity: 1,
        color: '#000000',
        zIndex: globalZIndex,
        isLocked: false,
      };

      setGlobalZIndex(globalZIndex + 1);
      setLayers((prev) => [...prev, newShapeLayer]);
    },
    [globalZIndex, setGlobalZIndex, setLayers],
  );

  const updateShape = useCallback(
    (updates: Partial<ShapeLayer>) => {
      if (!selectedLayerId) return;
      setLayers((prev) =>
        prev.map((layer) => {
          if (layer.id === selectedLayerId && layer.type === 'shape') {
            return { ...layer, ...updates };
          }
          return layer;
        }),
      );
    },
    [selectedLayerId, setLayers],
  );

  const handleChangeShapeColor = useCallback(
    (newColor: string) => {
      updateShape({ color: newColor });
    },
    [updateShape],
  );

  const handleChangeShapeSize = useCallback(
    (size: { width: number; height: number }) => {
      updateShape(size);
    },
    [updateShape],
  );

  const handleChangeShapeRotation = useCallback(
    (rotation: number) => {
      updateShape({ rotation });
    },
    [updateShape],
  );

  const handleChangeShapeOpacity = useCallback(
    (opacity: number) => {
      updateShape({ opacity });
    },
    [updateShape],
  );

  return {
    addShape,
    updateShape,
    handleChangeShapeColor,
    handleChangeShapeSize,
    handleChangeShapeRotation,
    handleChangeShapeOpacity,
  };
};
