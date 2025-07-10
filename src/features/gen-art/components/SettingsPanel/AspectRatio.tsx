//Compoents
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@mui/material';

//Icons
import { IoIosArrowForward } from 'react-icons/io';
import { aspectOptions } from '../../enum';

const AspectRatioOptions: React.FC<SelectRatioProp> = ({
  selectedAspect,
  onChange,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="bg-mountain-100 flex w-full justify-between rounded-xl p-3 font-normal">
          <div className="flex items-center space-x-2">
            <selectedAspect.icon className="text-mountain-600 size-5" />
            <p>{selectedAspect.label}</p>
          </div>
          <IoIosArrowForward />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="border-mountain-300 absolute -top-13 left-40 p-0 shadow-xl">
        <div className="border-mountain-300 border-b p-2">
          <p>Aspect Ratio</p>
        </div>
        <div className="flex justify-between space-x-2 px-6 py-4">
          {aspectOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.value}
                className={`cursor-pointer} flex flex-col items-center justify-center space-y-2`}
                onClick={() => onChange(option)}
              >
                <div
                  className={`bg-mountain-100 flex h-14 w-14 items-center justify-center rounded-lg ${selectedAspect.value === option.value ? 'ring-mountain-400 rounded-lg ring-2' : ''}`}
                >
                  <Icon className="text-mountain-600 size-5" />
                </div>
                <p className="text-mountain-800 text-xs">{option.label}</p>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AspectRatioOptions;
