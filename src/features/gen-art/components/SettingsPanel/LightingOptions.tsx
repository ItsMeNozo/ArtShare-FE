//Components
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@mui/material';

//Icons
import { GoLightBulb } from 'react-icons/go';
import { IoIosArrowForward } from 'react-icons/io';
import { lightingOptions } from '../../enum';

const LightingOptions: React.FC<SelectLightingProp> = ({
  selectedLighting,
  onChange,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="bg-mountain-100 flex w-full justify-between rounded-xl p-3 font-normal">
          <div className="flex items-center space-x-2">
            <GoLightBulb className="h-5 w-5 rounded-xs" />
            <p>{selectedLighting.label}</p>
          </div>
          <IoIosArrowForward />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="border-mountain-300 absolute -top-13 left-40 flex flex-col p-0 shadow-xl">
        <div className="border-mountain-300 border-b p-2">
          <p>Lighting Image</p>
        </div>
        <div className="custom-scrollbar flex h-48 flex-col justify-between space-y-2 overflow-y-auto px-6 py-4">
          {lightingOptions.map((option) => {
            return (
              <div
                key={option.value}
                className={`cursor-pointer} flex w-full flex-col items-center justify-center space-y-2`}
                onClick={() => onChange(option)}
              >
                <div
                  className={`bg-mountain-100 flex h-14 w-full items-center justify-center rounded-lg ${selectedLighting.value === option.value ? 'rounded-lg ring-2 ring-indigo-400' : ''}`}
                >
                  <img
                    src={option.exampleUrl}
                    loading="lazy"
                    className="text-mountain-600 size-5 h-full w-full rounded-lg object-cover"
                  />
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

export default LightingOptions;
