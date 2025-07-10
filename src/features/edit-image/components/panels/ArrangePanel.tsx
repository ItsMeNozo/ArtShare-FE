//Components
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button, Tooltip } from '@mui/material';
import { BsAspectRatio } from 'react-icons/bs';
import { MdLockOutline } from 'react-icons/md';

type PanelsProp = {
  selectedLayerId: string;
  layers: Layer[];
};

const ArrangePanel: React.FC<PanelsProp> = () => {
  return (
    <>
      <div className="flex flex-col space-y-2">
        <Label className="font-medium">Root size</Label>
        <div className="grid grid-cols-[30%_70%] grid-rows-2 gap-y-2">
          <p className="flex items-center text-sm">Width:</p>
          <Input
            className="bg-mountain-50 placeholder:text-mountain-600 h-12 w-full rounded-lg border"
            placeholder="Input Width"
            value="1080 px"
          />

          <p className="flex items-center text-sm">Height:</p>
          <Input
            className="bg-mountain-50 placeholder:text-mountain-600 h-12 w-full rounded-lg border"
            placeholder="Input Height"
            value="1080 px"
          />
        </div>
      </div>
      <div className="flex space-x-2">
        <Tooltip title="Lock Root Layer" arrow placement="left">
          <Button className="bg-mountain-50 border-mountain-200 flex w-[25%] border py-2 font-normal">
            <MdLockOutline className="text-mountain-600 size-5" />
          </Button>
        </Tooltip>
        <Button className="bg-mountain-50 border-mountain-200 flex w-[75%] border py-2 font-normal">
          <BsAspectRatio className="mr-2 size-4" />
          <p>Change Ratio</p>
        </Button>
      </div>
    </>
  );
};

export default ArrangePanel;
