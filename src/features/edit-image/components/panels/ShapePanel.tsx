import { Input } from '@/components/ui/input';
import { Button } from '@mui/material';
import { Sketch } from '@uiw/react-color';
import React, { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';

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
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setSettingColor(false);
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
      {/* Add Shape Buttons */}
      <div className="mb-4 flex flex-col space-y-2">
        {(
          [
            'square',
            'circle',
            'rect-horizontal',
            'rect-vertical',
          ] as ShapeType[]
        ).map((shape) => (
          <Button
            key={shape}
            variant="outlined"
            onClick={() => addShape(shape)}
          >
            Add {shape.replace('-', ' ')}
          </Button>
        ))}
      </div>
      {/* Size Controls */}
      {selectedLayer && (
        <>
          <div className="mb-3 flex w-full items-center justify-between">
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

          <div className="mb-3 flex w-full items-center justify-between">
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
          <div className="mb-3 flex w-full items-center justify-between">
            <p className="w-1/2 font-medium">Rotation</p>
            <Input
              type="number"
              min={0}
              max={360}
              value={selectedLayer.rotation}
              onChange={(e) =>
                handleChangeShapeRotation(Number(e.target.value))
              }
              className="w-24"
            />
            <span className="ml-1">°</span>
          </div>

          {/* Opacity */}
          <div className="mb-3 flex w-full items-center justify-between">
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
          <div className="flex w-full items-center justify-between">
            <p className="w-1/2 font-medium">Color</p>
            <div className="flex items-center space-x-2">
              <div
                className="h-6 w-6 rounded border border-gray-300"
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
                className="absolute z-50 rounded bg-white p-2 shadow-md"
                style={{ width: 220 }}
              >
                <div className="drag-handle mb-2 cursor-move rounded bg-gray-100 px-2 py-1 text-sm">
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
