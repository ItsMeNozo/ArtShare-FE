//Components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@mui/material";
import { GoMoveToTop, GoMoveToBottom } from "react-icons/go";
import { TbChevronUp, TbChevronDown } from "react-icons/tb";
import { Lock, Unlock } from "lucide-react";

type PanelsProp = {
  selectedLayerId: string;
  layers: Layer[];
  moveForward: (layerId: string) => void;
  moveBackward: (layerId: string) => void;
  bringToFront: (layerId: string) => void;
  sendToBack: (layerId: string) => void;
  handleLockLayer: (layerId: string) => void;
};

const ArrangePanel: React.FC<PanelsProp> = ({
  selectedLayerId,
  layers,
  moveForward,
  moveBackward,
  bringToFront,
  sendToBack,
  handleLockLayer
}) => {
  const selectedLayer = layers?.find((layer) => layer.id === selectedLayerId) as ImageLayer;
  const zIndexes = layers.map((layer) => layer.zIndex ?? 0);
  const maxZIndex = Math.max(...zIndexes);
  const minZIndex = Math.min(...zIndexes);
  return (
    <>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col items-end space-y-2">
          <Label className="w-full font-medium text-left">Layer Name</Label>
          <Input
            className="flex bg-mountain-50 border w-full placeholder:text-mountain-600"
            placeholder="Input Layer Name"
            value={selectedLayer ? selectedLayer?.name : "File Name"}
          />
          <Button onClick={() => handleLockLayer(selectedLayer?.id)} className="flex justify-start bg-mountain-50 py-2 pl-4 border border-mountain-200 w-34 font-normal">
            {selectedLayer?.isLocked ?
              <>
                <Unlock className="mr-2 size-4 text-mountain-600" />
                <span>Unlock Layer</span>
              </> :
              <>
                <Lock className="mr-2 size-4 text-mountain-600" />
                <span>Lock Layer</span>
              </>
            }
          </Button>
        </div>
        <hr className="border-mountain-200 w-full" />
        <div className="space-y-2 grid grid-cols-[30%_70%] grid-rows-2">
          <p className="flex items-center text-sm">Width:</p>
          <Input
            className="bg-mountain-50 border rounded-lg w-full h-12 placeholder:text-mountain-600"
            placeholder="Input Width"
            value={selectedLayer ? `${selectedLayer?.width} px` : '0 px'}
          />
          <p className="flex items-center text-sm">Height:</p>
          <Input
            className="bg-mountain-50 border rounded-lg w-full h-12 placeholder:text-mountain-600"
            placeholder="Input Height"
            value={selectedLayer ? `${Number(selectedLayer?.height).toFixed(2)} px` : '0 px'}
          />
        </div>
      </div>
      <hr className="border-mountain-200 w-full" />
      <div className="flex flex-col items-end space-y-2 w-full">
        <Button
          disabled={selectedLayer?.zIndex === maxZIndex}
          onClick={() => bringToFront(selectedLayer?.id)}
          className={`flex justify-start bg-mountain-50 disabled:opacity-50 py-2 pl-14 border border-mountain-200 w-full font-normal`}>
          <GoMoveToTop className="mr-2 size-5 text-mountain-600" />
          <span>Bring To Front</span>
        </Button>
        <Button
          disabled={selectedLayer?.zIndex === maxZIndex}
          onClick={() => moveForward(selectedLayer?.id)}
          className="flex justify-start bg-mountain-50 disabled:opacity-50 py-2 pl-14 border border-mountain-200 w-full font-normal">
          <TbChevronUp className="mr-2 size-5 text-mountain-600" />
          <span>Move Forward</span>
        </Button>
        <Button
          disabled={selectedLayer?.zIndex === minZIndex}
          onClick={() => moveBackward(selectedLayer?.id)}
          className="flex justify-start bg-mountain-50 disabled:opacity-50 py-2 pl-14 border border-mountain-200 w-full font-normal">
          <TbChevronDown className="mr-2 size-5 text-mountain-600" />
          <span>Move Backward</span>
        </Button>
        <Button
          disabled={selectedLayer?.zIndex === minZIndex}
          onClick={() => sendToBack(selectedLayer?.id)}
          className="flex justify-start bg-mountain-50 disabled:opacity-50 py-2 pl-14 border border-mountain-200 w-full font-normal">
          <GoMoveToBottom className="mr-2 size-5 text-mountain-600" />
          <span>Bring To Back</span>
        </Button>
      </div>
    </>
  );
};

export default ArrangePanel;
