import { useEffect, useState } from 'react';

//Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

//Assets
import { MockModelOptionsData } from '../../mock/Data';

//Icons
import { Button } from '@mui/material';
import { IoIosArrowForward } from 'react-icons/io';
import StyleOption from './StyleOption';

const StyleOptions: React.FC<StyleOptionsProp> = ({ style, selectStyle }) => {
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState<UsedStyle | null>(style);
  const [startIndex, setStartIndex] = useState(0);

  const visibleCount = 3;
  const itemWidth = 88; // 80px + 8px gap
  const baseOffset = 24;

  const handleSelect = (index: number) => {
    setSelectedIndex(index);

    if (index < startIndex) {
      setStartIndex(index); // shift left
    } else if (index > startIndex + visibleCount - 1) {
      setStartIndex(index - visibleCount + 1); // shift right
    }
  };

  const translateValue = -(startIndex * itemWidth) + baseOffset;

  const SelectSelectedStyle = (style: UsedStyle) => {
    selectStyle(style);
    setOpen(false);
  };

  useEffect(() => {
    setSelectedStyle(style);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-mountain-100 flex w-full justify-between rounded-xl p-3 font-normal">
          <div className="flex items-center space-x-2">
            <img
              src={style.images[0]}
              loading="lazy"
              className="h-5 w-5 rounded-xs"
            />
            <p>{style.name}</p>
          </div>
          <IoIosArrowForward />
        </Button>
      </DialogTrigger>
      <DialogContent className="border-mountain-200 w-fit gap-0 space-y-0 rounded-xl border bg-white p-0">
        <DialogHeader className="border-mountain-200 border-b-[1px] p-4">
          <DialogTitle className="text-mountain-700 font-normal">
            Styles
          </DialogTitle>
          <DialogDescription hidden>Image Description</DialogDescription>
        </DialogHeader>
        <div className="relative flex h-[600px] w-full">
          <div className="border-mountain-200 flex w-[717px] flex-col space-y-4 border-r-[1px] p-4">
            <div className="custom-scrollbar grid h-full grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-4 overflow-y-auto pr-4">
              {MockModelOptionsData.map((style) => (
                <StyleOption
                  key={style.name}
                  style={style}
                  isSelected={style === selectedStyle}
                  onClick={() => setSelectedStyle(style)}
                />
              ))}
            </div>
          </div>
          <div className="border-mountain-200 flex w-[307px] flex-col items-start space-y-4 overflow-hidden py-4">
            <div className="flex w-full justify-center">
              <div className="flex h-64 w-64">
                <img
                  loading="lazy"
                  src={selectedStyle?.images[selectedIndex]}
                  className="h-auto w-fit rounded-xl object-cover"
                />
              </div>
            </div>
            <div className="flex w-full flex-col px-6">
              <p className="mb-1 flex w-full font-medium">
                {selectedStyle?.name}
              </p>
              <span className="text-mountain-600 text-xs">
                {selectedStyle?.description}
              </span>
            </div>
            <div className="flex h-full w-full flex-col justify-between">
              <div>
                <p className="mb-1 flex w-full px-6 font-medium">
                  Sample Results
                </p>
                <div
                  className="flex w-[500px] space-x-2 overflow-x-auto duration-300 ease-in-out"
                  style={{ transform: `translateX(${translateValue}px)` }}
                >
                  {selectedStyle?.images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`flex h-20 w-20 transform cursor-pointer rounded-xl duration-200 ease-in-out ${selectedIndex === idx ? 'border-4 border-black' : ''}`}
                      onClick={() => {
                        handleSelect(idx);
                      }}
                    >
                      <img
                        src={img}
                        loading="lazy"
                        className="h-auto w-fit rounded-lg object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div
                className="flex px-6"
                onClick={() => SelectSelectedStyle(selectedStyle!)}
              >
                <Button className="flex w-full items-center justify-center bg-indigo-200">
                  Use This Style
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StyleOptions;
