import { useCallback } from 'react';

interface LayerHandlersParams {
  selectedLayerId: string | null;
  updateSelectedLayer: (updates: Partial<Layer>) => void;
  setBrightness: (val: number) => void;
  setContrast: (val: number) => void;
  setSaturation: (val: number) => void;
  setHue: (val: number) => void;
  setSepia: (val: number) => void;
}

export const useLayerStyleHandlers = ({
  selectedLayerId,
  updateSelectedLayer,
  setBrightness,
  setContrast,
  setSaturation,
  setHue,
  setSepia,
}: LayerHandlersParams) => {
  const handleBrightness = useCallback(
    (newBrightness: number) => {
      setBrightness(newBrightness);
      if (selectedLayerId) updateSelectedLayer({ brightness: newBrightness });
    },
    [selectedLayerId, updateSelectedLayer],
  );

  const handleContrast = useCallback(
    (newContrast: number) => {
      setContrast(newContrast);
      if (selectedLayerId) updateSelectedLayer({ contrast: newContrast });
    },
    [selectedLayerId, updateSelectedLayer],
  );

  const handleSaturation = useCallback(
    (newSaturation: number) => {
      setSaturation(newSaturation);
      if (selectedLayerId) updateSelectedLayer({ saturation: newSaturation });
    },
    [selectedLayerId, updateSelectedLayer],
  );

  const handleHue = useCallback(
    (newHue: number) => {
      setHue(newHue);
      if (selectedLayerId) updateSelectedLayer({ hue: newHue });
    },
    [selectedLayerId, updateSelectedLayer],
  );

  const handleSepia = useCallback(
    (newSepia: number) => {
      setSepia(newSepia);
      if (selectedLayerId) updateSelectedLayer({ sepia: newSepia });
    },
    [selectedLayerId, updateSelectedLayer],
  );

  return {
    handleBrightness,
    handleContrast,
    handleSaturation,
    handleHue,
    handleSepia,
  };
};
