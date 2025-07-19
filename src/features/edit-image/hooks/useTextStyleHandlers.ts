import { useCallback } from 'react';

type UseTextStyleHandlersProps = {
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  selectedLayerId: string | null;
  globalZIndex: number;
  setGlobalZIndex: (z: number) => void;
};

export const useTextStyleHandlers = ({
  setLayers,
  selectedLayerId,
  globalZIndex,
  setGlobalZIndex,
}: UseTextStyleHandlersProps) => {
  const getFittingFontSize = useCallback(
    (
      text: string,
      maxWidth: number,
      maxHeight: number,
      fontFamily = 'Arial',
      startingFontSize = 20,
    ): number => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
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
    },
    [],
  );

  const addText = useCallback(() => {
    const defaultText = 'Your Text';
    const maxWidth = 300;
    const maxHeight = 100;
    const fittedFontSize = getFittingFontSize(defaultText, maxWidth, maxHeight);

    const newTextLayer: TextLayer = {
      id: crypto.randomUUID(),
      type: 'text',
      text: defaultText,
      fontSize: fittedFontSize,
      color: '#000000',
      x: 100,
      y: 100,
      rotation: 0,
      opacity: 1,
      width: maxWidth,
      height: maxHeight,
      zIndex: globalZIndex,
      isLocked: false,
    };

    setGlobalZIndex(globalZIndex + 1);
    setLayers((prev) => [...prev, newTextLayer]);
  }, [getFittingFontSize, globalZIndex, setGlobalZIndex, setLayers]);

  const handleChangeFontSize = useCallback(
    (newFontSize: number) => {
      setLayers((prev) =>
        prev.map((layer) =>
          layer.id === selectedLayerId && layer.type === 'text'
            ? { ...layer, fontSize: newFontSize }
            : layer,
        ),
      );
    },
    [selectedLayerId, setLayers],
  );

  const handleChangeFontFamily = useCallback(
    (font: string) => {
      if (!selectedLayerId) return;
      setLayers((prev) =>
        prev.map((layer) =>
          layer.id === selectedLayerId && layer.type === 'text'
            ? { ...layer, fontFamily: font }
            : layer,
        ),
      );
    },
    [selectedLayerId, setLayers],
  );

  const handleChangeTextColor = useCallback(
    (newColor: string) => {
      if (!selectedLayerId) return;
      setLayers((prev) =>
        prev.map((layer) =>
          layer.id === selectedLayerId && layer.type === 'text'
            ? { ...layer, color: newColor }
            : layer,
        ),
      );
    },
    [selectedLayerId, setLayers],
  );

  const handleTextChange = useCallback(
    (id: string, newText: string) => {
      setLayers((prev) =>
        prev.map((layer) => {
          if (layer.id === id && layer.type === 'text') {
            const fittedFontSize = getFittingFontSize(
              newText,
              layer.width,
              layer.height,
              layer.fontFamily || 'Arial',
              20,
            );
            return {
              ...layer,
              text: newText,
              fontSize: fittedFontSize,
            };
          }
          return layer;
        }),
      );
    },
    [getFittingFontSize, setLayers],
  );

  return {
    addText,
    handleTextChange,
    handleChangeFontSize,
    handleChangeFontFamily,
    handleChangeTextColor,
  };
};
