import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { Sketch } from "@uiw/react-color";

type ShapeType = 'square' | 'circle' | 'rect-horizontal' | 'rect-vertical';
type ShapePanelProps = {
  selectedLayer: ShapeLayer;
  addShape: (shapeType: ShapeType) => void;
  handleChangeShapeSize: (size: { width: number; height: number }) => void;
  handleChangeShapeColor: (color: string) => void;
  handleChangeShapeRotation: (rotation: number) => void;
  handleChangeShapeOpacity: (opacity: number) => void;
};

const ShapePanel: React.FC<ShapePanelProps> = ({
  selectedLayer,
  addShape,
  handleChangeShapeSize,
  handleChangeShapeColor,
  handleChangeShapeRotation,
  handleChangeShapeOpacity,
}) => {
  const [settingColor, setSettingColor] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setSettingColor(false);
      }
    }
    if (settingColor) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settingColor]);

  return (
    <>
      {/* Add Shape Buttons */}
      <div className="flex flex-col space-y-2 mb-4">
        {(["square", "circle", "rect-horizontal", "rect-vertical"] as ShapeType[]).map((shape) => (
          <Button
            key={shape}
            variant="outlined"
            onClick={() => addShape(shape)}
          >
            Add {shape.replace("-", " ")}
          </Button>
        ))}
      </div>
      {/* Size Controls */}
      {selectedLayer && (
        <>
          <div className="flex justify-between items-center mb-3 w-full">
            <p className="w-1/2 font-medium">Width</p>
            <Input
              type="number"
              min={10}
              max={1000}
              value={selectedLayer.width}
              onChange={(e) =>
                handleChangeShapeSize({
                  width: Number(e.target.value),
                  height: selectedLayer.height,
                })
              }
              className="w-24"
            />
            <span className="ml-1">px</span>
          </div>

          <div className="flex justify-between items-center mb-3 w-full">
            <p className="w-1/2 font-medium">Height</p>
            <Input
              type="number"
              min={10}
              max={1000}
              value={selectedLayer.height}
              onChange={(e) =>
                handleChangeShapeSize({
                  width: selectedLayer.width,
                  height: Number(e.target.value),
                })
              }
              className="w-24"
            />
            <span className="ml-1">px</span>
          </div>

          {/* Rotation */}
          <div className="flex justify-between items-center mb-3 w-full">
            <p className="w-1/2 font-medium">Rotation</p>
            <Input
              type="number"
              min={0}
              max={360}
              value={selectedLayer.rotation}
              onChange={(e) => handleChangeShapeRotation(Number(e.target.value))}
              className="w-24"
            />
            <span className="ml-1">°</span>
          </div>

          {/* Opacity */}
          <div className="flex justify-between items-center mb-3 w-full">
            <p className="w-1/2 font-medium">Opacity</p>
            <Input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={selectedLayer.opacity}
              onChange={(e) => handleChangeShapeOpacity(Number(e.target.value))}
              className="w-24"
            />
          </div>

          {/* Color Picker */}
          <div className="flex justify-between items-center w-full">
            <p className="w-1/2 font-medium">Color</p>
            <div className="flex items-center space-x-2">
              <div
                className="border border-gray-300 rounded w-6 h-6"
                style={{ backgroundColor: selectedLayer.color }}
              />
              <Button onClick={() => setSettingColor(!settingColor)}>
                Change Color
              </Button>
            </div>
          </div>

          {settingColor && (
            <Draggable handle=".drag-handle">
              <div
                ref={pickerRef}
                className="z-50 absolute bg-white shadow-md p-2 rounded"
                style={{ width: 220 }}
              >
                <div className="bg-gray-100 mb-2 px-2 py-1 rounded text-sm cursor-move drag-handle">
                  🎨 Color Picker
                </div>
                <Sketch
                  color={selectedLayer.color}
                  onChange={(color) => handleChangeShapeColor(color.hex)}
                />
              </div>
            </Draggable>
          )}
        </>
      )}
    </>
  );
};

export default ShapePanel;
