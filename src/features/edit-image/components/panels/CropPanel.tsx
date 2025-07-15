//Components
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import OpacitySlider from '../sliders/OpacitySlider';

//Icons
import { GoTrash } from 'react-icons/go';
import { IoDuplicateOutline } from 'react-icons/io5';
import { PiFlipHorizontalLight, PiFlipVerticalLight } from 'react-icons/pi';
import LayerPosition from '../sliders/LayerPosition';
import RotateSlider from '../sliders/RotateSlider';

type PanelsProp = {
  selectedLayerId: string;
  layers: Layer[];
  handleOpacityChange: (newOpacity: number) => void;
  toggleFlipHorizontal: () => void;
  toggleFlipVertical: () => void;
  handleDuplicate: (layerId: string) => void;
  handleRotationChange: (newRotation: number) => void;
  handleLayerXPosition: (newXPos: number) => void;
  handleLayerYPosition: (newYPos: number) => void;
};

const CropPanel: React.FC<PanelsProp> = ({
  layers,
  selectedLayerId,
  toggleFlipHorizontal,
  toggleFlipVertical,
  handleOpacityChange,
  handleDuplicate,
  handleRotationChange,
  handleLayerXPosition,
  handleLayerYPosition,
}) => {
  return (
    <>
      <div className="flex flex-col space-y-2">
        <Label className="font-medium">Layer Name</Label>
        <Input
          className="bg-mountain-50 placeholder:text-mountain-600 flex w-full border"
          placeholder="Input Layer Name"
          defaultValue="Background"
        />
      </div>
      <hr className="border-mountain-100 flex w-full border-t-1" />
      <div className="flex flex-col space-y-2">
        <Label className="font-medium">Layer position</Label>
        <div className="flex justify-between gap-x-4">
          <LayerPosition
            label={'X'}
            position={layers.find((layer) => layer.id === selectedLayerId)?.x!}
            onChange={handleLayerXPosition}
          />
          <LayerPosition
            label={'Y'}
            position={layers.find((layer) => layer.id === selectedLayerId)?.y!}
            onChange={handleLayerYPosition}
          />
        </div>
      </div>
      <div className="flex flex-col space-y-2">
        <OpacitySlider
          opacity={
            layers.find((layer) => layer.id === selectedLayerId)?.opacity ?? 1
          }
          onChange={handleOpacityChange}
        />
      </div>
      <div className="flex flex-col space-y-2">
        <RotateSlider
          rotate={
            layers.find((layer) => layer.id === selectedLayerId)?.rotation ?? 0
          }
          onChange={handleRotationChange}
        />
      </div>
      <div className="flex w-full space-x-2">
        <div
          onClick={toggleFlipHorizontal}
          className="bg-mountain-50 hover:bg-mountain-100 border-mountain-200 flex h-10 w-[25%] items-center justify-center rounded-lg border shadow-sm select-none"
        >
          <PiFlipHorizontalLight className="flex size-5" />
        </div>
        <div
          onClick={toggleFlipVertical}
          className="bg-mountain-50 hover:bg-mountain-100 border-mountain-200 flex h-10 w-[25%] items-center justify-center rounded-lg border shadow-sm select-none"
        >
          <PiFlipVerticalLight className="flex size-5" />
        </div>
        <div
          onClick={() => handleDuplicate(layers[layers.length - 1].id)}
          className="bg-mountain-50 hover:bg-mountain-100 border-mountain-200 flex h-10 w-[25%] items-center justify-center rounded-lg border shadow-sm select-none"
        >
          <IoDuplicateOutline className="flex size-5" />
        </div>
        <div className="bg-mountain-50 hover:bg-mountain-100 border-mountain-200 flex h-10 w-[25%] items-center justify-center rounded-lg border shadow-sm select-none">
          <GoTrash className="flex size-5" />
        </div>
      </div>
    </>
  );
};

export default CropPanel;
