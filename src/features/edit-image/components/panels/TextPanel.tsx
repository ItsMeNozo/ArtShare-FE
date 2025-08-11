import { Input } from '@/components/ui/input';
import { Button } from '@mui/material';
import { Sketch } from '@uiw/react-color';
import { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { IoText } from 'react-icons/io5';
import FontSelector from '../../mimics/FontSelector';

type PanelsProp = {
  selectedLayer: TextLayer | undefined;
  addText: () => void;
  handleChangeFontSize: (newFontSize: number) => void;
  handleChangeFontFamily: (newFontFamily: string) => void;
  handleChangeTextColor: (newColor: string) => void;
};

const TextPanel: React.FC<PanelsProp> = ({
  selectedLayer,
  addText,
  handleChangeFontSize,
  handleChangeFontFamily,
  handleChangeTextColor,
}) => {
  const [settingColor, setSettingColor] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setSettingColor(false); // Close the color picker
      }
    }
    if (settingColor) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [settingColor]);

  return (
    <>
      <div
        onClick={addText}
        className="flex h-10 w-full items-center justify-center"
      >
        <Button className="border-mountain-200 flex h-full w-full items-center justify-center rounded-lg border bg-white text-sm font-normal">
          <IoText className="mr-2 size-5" />
          <p>Add Text</p>
        </Button>
      </div>
      <hr className="border-mountain-200 flex w-full border-t-1" />
      <FontSelector
        selectedLayer={selectedLayer}
        handleChangeFontFamily={handleChangeFontFamily}
      />
      <div className="flex w-full items-center justify-between">
        <p className="w-1/2 font-medium">Text size</p>
        <div className="relative w-fit">
          <Input
            type="number"
            min={4}
            max={200}
            value={selectedLayer?.fontSize || 24}
            onChange={(e) => handleChangeFontSize(Number(e.target.value))}
            className="pr-10"
          />
          <span className="absolute top-1/2 right-2 -translate-y-1/2 text-sm text-gray-500">
            px
          </span>
        </div>
      </div>
      <div className="flex w-full items-center justify-between">
        <p className="w-1/2 font-medium">Color</p>
        <div className="border-mountain-200 flex w-full items-center justify-between rounded-lg border-1 px-2 pl-4">
          <div
            className="border-mountain-200 h-4 w-4 rounded-full border-1 shadow-md"
            style={{ backgroundColor: `${selectedLayer?.color || '#ffffff'}` }}
          />
          <div className="bg-mountain-200 h-10 w-[1px]" />
          <Button
            onClick={() => setSettingColor(!settingColor)}
            className="py-1 font-normal"
          >
            Change color
          </Button>
        </div>
        {settingColor && (
          <Draggable handle=".drag-handle">
            <div
              ref={pickerRef}
              className="absolute z-50 rounded bg-white shadow-md"
            >
              <div className="bg-mountain-100 text-mountain-950 drag-handle cursor-move rounded-t px-3 py-1 text-sm font-normal">
                🎨 Color Picker
              </div>
              <Sketch
                color={selectedLayer?.color}
                onChange={(color) => handleChangeTextColor(color.hex)}
              />
            </div>
          </Draggable>
        )}
      </div>
    </>
  );
};

export default TextPanel;
