//Components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@mui/material";
import { MdLockOutline } from "react-icons/md";
import { GoMoveToTop, GoMoveToBottom } from "react-icons/go";
import { TbChevronUp, TbChevronDown } from "react-icons/tb";

type PanelsProp = {
  selectedLayerId: string;
  layers: Layer[];
};

const ArrangePanel: React.FC<PanelsProp> = ({ selectedLayerId, layers }) => {
  if (!selectedLayerId)
    return (
      <div className="flex justify-center w-full text-mountain-600 text-xs text-center">
        <span>Select the layer to view the details.</span>
      </div>
    )

  const selectedLayer = layers?.find((layer) => layer.id === selectedLayerId) as ImageLayer;

  return (
    <>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col items-end space-y-2">
          <Label className="w-full font-medium text-left">Layer Name</Label>
          <Input
            className="flex bg-mountain-50 border w-full placeholder:text-mountain-600"
            placeholder="Input Layer Name"
            defaultValue={selectedLayer?.name || "File Name"}
          />
          <Button className="flex bg-mountain-50 py-2 border border-mountain-200 w-32 font-normal">
            <MdLockOutline className="mr-2 size-5 text-mountain-600" />
            <span>Lock Layer</span>
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
            value={selectedLayer ? `${Number(selectedLayer.height).toFixed(2)} px` : '0 px'}
          />
        </div>
      </div>
      <hr className="border-mountain-200 w-full" />
      <div className="flex flex-col items-end space-y-2 w-full">
        <Button className="flex bg-mountain-50 py-2 border border-mountain-200 w-full font-normal">
          <GoMoveToTop className="mr-2 size-5 text-mountain-600" />
          <span>Bring To Front</span>
        </Button>
        <Button className="flex bg-mountain-50 py-2 border border-mountain-200 w-full font-normal">
          <TbChevronUp className="mr-2 size-5 text-mountain-600" />
          <span>Move Forward</span>
        </Button>
        <Button className="flex bg-mountain-50 py-2 border border-mountain-200 w-full font-normal">
          <TbChevronDown className="mr-2 size-5 text-mountain-600" />
          <span>Move Backward</span>
        </Button>
        <Button className="flex bg-mountain-50 py-2 border border-mountain-200 w-full font-normal">
          <GoMoveToBottom className="mr-2 size-5 text-mountain-600" />
          <span>Bring To Back</span>
        </Button>
      </div>
    </>
  );
};

export default ArrangePanel;
