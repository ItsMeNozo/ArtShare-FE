import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Typography } from '@mui/material';
import { Sketch } from '@uiw/react-color';
import {
  Plus,
  RectangleHorizontal,
  RectangleVertical,
  Square,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  MdAspectRatio,
  MdOutlineFileUpload,
  MdOutlinePhotoSizeSelectActual,
} from 'react-icons/md';
import { PiStarFourFill } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import EditHeader from './components/EditHeader';
import SelectAiImagesPanel from './components/dialog';

const sample_1 =
  'https://res.cloudinary.com/dqxtf297o/image/upload/v1754810122/artshare-asset/design-sample/sample-1/Screenshot_2025-08-10_141500_h3icjl.png';

const BrowseImage = () => {
  const navigate = useNavigate();
  const pickerRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState('#ffffff');
  const [openColorSettings, setOpenColorSettings] = useState(false);

  const canvasSizeOptions = [
    {
      label: '1:1',
      icon: Square,
      value: '1:1',
      sizes: [
        { label: 'Small (512 x 512)', width: 512, height: 512 },
        { label: 'Medium (1080 x 1080)', width: 1080, height: 1080 },
        { label: 'Large (2048 x 2048)', width: 2048, height: 2048 },
      ],
    },
    {
      label: '16:9',
      value: '16:9',
      icon: RectangleHorizontal,
      sizes: [
        { label: 'Small (640 x 360)', width: 640, height: 360 },
        { label: 'Medium (1280 x 720)', width: 1280, height: 720 },
        { label: 'Large (1920 x 1080)', width: 1920, height: 1080 },
      ],
    },
    {
      label: '4:3',
      value: '4:3',
      icon: RectangleVertical,
      sizes: [
        { label: 'Small (800 x 600)', width: 800, height: 600 },
        { label: 'Medium (1024 x 768)', width: 1024, height: 768 },
        { label: 'Large (1600 x 1200)', width: 1600, height: 1200 },
      ],
    },
    {
      label: '3:4',
      value: '3:4',
      icon: RectangleHorizontal,
      sizes: [
        { label: 'Small (600 x 800)', width: 600, height: 800 },
        { label: 'Medium (768 x 1024)', width: 768, height: 1024 },
        { label: 'Large (1200 x 1600)', width: 1200, height: 1600 },
      ],
    },
  ];

  const smallCanvasByRatio = {
    '1:1': { width: 560, height: 560 },
    '16:9': { width: 996, height: 560 },
    '4:3': { width: 747, height: 560 },
    '3:4': { width: 420, height: 560 },
  };

  const [selectedRatio, setSelectedRatio] = useState(canvasSizeOptions[0]);
  const [selectedCanvasSize, setSelectedCanvasSize] = useState(
    canvasSizeOptions[0].sizes[1],
  );
  const editCanvas =
    smallCanvasByRatio[selectedRatio.value as keyof typeof smallCanvasByRatio];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const url = URL.createObjectURL(selected);
      navigate('/image/tool/editor', {
        state: {
          imageUrl: url,
          name: selected.name,
          ratio: selectedRatio.value,
          canvas: {
            width: selectedCanvasSize.width,
            height: selectedCanvasSize.height,
          },
          editCanvas: editCanvas,
          color: color,
        },
      });
    }
  };

  const handleNewBlankDesign = () => {
    navigate('/image/tool/editor', {
      state: {
        imageUrl: '',
        name: '',
        ratio: selectedRatio.value,
        canvas: {
          width: selectedCanvasSize.width,
          height: selectedCanvasSize.height,
        },
        editCanvas: editCanvas,
        color: color,
      },
    });
  };

  const handleLoadDesignSample = (sampleId: string) => {
    const size = smallCanvasByRatio['3:4'];
    navigate('/image/tool/editor', {
      state: {
        sampleId,
        ratio: '3:4',
        canvas: { width: 768, height: 1024 },
        editCanvas: size,
        color,
      },
    });
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setOpenColorSettings(false);
      }
    }
    if (openColorSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openColorSettings]);

  return (
    <div className="group relative flex h-full w-full flex-col">
      <EditHeader />
      <div
        className={`flex h-[calc(100vh-4rem)] w-full items-center justify-center overflow-hidden`}
        data-testid="image-editor"
      >
        <div
          className={`bg-mountain-100 flex h-full w-full space-x-8 overflow-y-hidden pb-0`}
        >
          <div className="flex h-full w-1/2 items-center justify-center">
            <div className="flex h-96 w-108 flex-col justify-between gap-4">
              <div
                onClick={handleNewBlankDesign}
                className="border-mountain-200 text-mountain-950 flex h-16 w-full cursor-pointer items-center justify-center rounded-full border bg-gradient-to-r from-indigo-100 to-purple-100 p-4 shadow-md"
              >
                <Plus className="size-6" />
                <Typography variant="body1" className="ml-2 text-sm">
                  New Blank Design
                </Typography>
              </div>
              <div className="flex gap-2">
                <Label className="bg-mountain-950 hover:bg-mountain-900 border-mountain-200 flex h-16 w-full cursor-pointer items-center justify-center rounded-full border-1 p-4 shadow-md">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                  />
                  <MdOutlineFileUpload className="size-6 text-white" />
                  <Typography variant="body1" className="text-sm text-white">
                    Upload From Device
                  </Typography>
                </Label>
                <SelectAiImagesPanel />
              </div>
              <div className="flex h-full w-full flex-1 flex-col justify-center gap-4 rounded-lg border border-gray-300 bg-white p-4 font-normal text-gray-700 shadow">
                {/* Select Aspect Ratio */}
                <div className="flex w-full items-center justify-between">
                  <p className="flex items-center space-x-2">
                    <MdAspectRatio />
                    <span>Aspect Ratio</span>
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="bg-mountain-50 border-mountain-200 h-12 w-48 justify-start rounded-full"
                      >
                        {selectedRatio.label}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="border-mountain-200 w-48">
                      {canvasSizeOptions.map((ratio) => {
                        const Icon = ratio.icon;
                        return (
                          <DropdownMenuItem
                            key={ratio.value}
                            onClick={() => {
                              setSelectedRatio(ratio);
                              setSelectedCanvasSize(ratio.sizes[1]);
                            }}
                            className="flex items-center space-x-2"
                          >
                            {Icon && (
                              <Icon className="text-muted-foreground size-4" />
                            )}
                            <span>{ratio.label}</span>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {/* Select Canvas Size */}
                <div className="flex w-full items-center justify-between">
                  <p className="flex items-center space-x-2">
                    <MdOutlinePhotoSizeSelectActual />
                    <span>Canvas Size</span>
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="bg-mountain-50 border-mountain-200 h-12 w-48 justify-start rounded-full"
                      >
                        {selectedCanvasSize.label}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="border-mountain-200 w-48">
                      {selectedRatio.sizes.map((size) => (
                        <DropdownMenuItem
                          key={size.label}
                          onClick={() => setSelectedCanvasSize(size)}
                        >
                          {size.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex w-full items-center justify-between">
                  <p>Background Color</p>
                  <Popover
                    open={openColorSettings}
                    onOpenChange={setOpenColorSettings}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="bg-mountain-50 border-mountain-200 h-12 w-48 justify-start rounded-full"
                      >
                        <div
                          className="border-mountain-200 h-6 w-6 rounded border shadow-md"
                          style={{ backgroundColor: color }}
                        />
                        <span className="ml-2">{color.replace('#', '')}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="border-mountain-200 ml-4 w-auto p-2"
                      side="right"
                    >
                      <div className="flex flex-col">
                        <div className="text-mountain-950 mb-2 text-sm font-medium">
                          🎨 Pick a color
                        </div>
                        <Sketch
                          color={color}
                          onChange={(colorResult) => {
                            setColor(colorResult.hex);
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
          <div className="relative flex h-full w-1/2 flex-col space-y-4 bg-gradient-to-b from-white to-purple-50/80 p-4 shadow-md">
            <div className="border-mountain-200 flex w-full border-b-1 py-2">
              <p className="pointer-events-none flex h-fit w-fit items-center space-x-2 font-medium">
                <PiStarFourFill className="text-purple-600" />
                <span>Try These Design Samples</span>
              </p>
            </div>
            <div className="flex">
              <button
                className="border-mountain-200 h-fit w-48 cursor-pointer rounded-lg border bg-white"
                onClick={() => handleLoadDesignSample('sample1')}
              >
                <img src={sample_1} className="rounded-lg" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseImage;
