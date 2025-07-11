import { Input } from "@/components/ui/input";
import { Button } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { IoText } from "react-icons/io5";
import Draggable from "react-draggable";
import { Sketch } from "@uiw/react-color";

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
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
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
        className="flex justify-center items-center w-full h-10"
      >
        <Button className="flex justify-center items-center bg-white border border-mountain-200 rounded-lg w-full h-full font-normal text-sm">
          <IoText className="mr-2 size-5" />
          <p>Add Text</p>
        </Button>
      </div>
      <hr className="flex border-mountain-200 border-t-1 w-full" />
      <div className="flex justify-between items-center w-full">
        <p className="w-1/4 font-medium">Font</p>
        <div className="relative flex justify-end w-3/4">
          <select
            id="font-family"
            value={selectedLayer?.fontFamily || 'Arial'}
            onChange={(e) => handleChangeFontFamily(e.target.value)}
            className="p-2 border border-mountain-200 rounded-md outline-none text-sm"
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
            <option value="Comic Sans MS">Comic Sans</option>
          </select>
        </div>
      </div>
      <div className="flex justify-between items-center w-full">
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
          <span className="top-1/2 right-2 absolute text-gray-500 text-sm -translate-y-1/2">
            px
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center w-full">
        <p className="w-1/2 font-medium">Color</p>
        <div className="flex justify-between items-center px-2 pl-4 border-1 border-mountain-200 rounded-lg w-full">
          <div
            className="shadow-md border-1 border-mountain-200 rounded-full w-4 h-4"
            style={{ backgroundColor: `${selectedLayer?.color || '#ffffff'}` }}
          />
          <div className="bg-mountain-200 w-[1px] h-10" />
          <Button
            onClick={() => setSettingColor(!settingColor)}
            className="py-1 font-normal"
          >
            Change color
          </Button>
        </div>
        {settingColor && (
          <Draggable handle=".drag-handle">
            <div ref={pickerRef} className="z-50 absolute bg-white shadow-md rounded">
              <div className="bg-mountain-100 px-3 py-1 rounded-t font-normal text-mountain-950 text-sm cursor-move drag-handle">
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
