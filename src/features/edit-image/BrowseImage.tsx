import { useNavigate } from 'react-router-dom';
import EditHeader from './components/EditHeader'
import { useEffect, useRef, useState } from 'react';
import { Typography } from '@mui/material';
import { BsCardImage } from 'react-icons/bs';
import { Plus, RectangleHorizontal, RectangleVertical, Square } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Sketch } from '@uiw/react-color';
import { Label } from '@/components/ui/label';
import { RiImageCircleAiLine } from 'react-icons/ri';
import { MdAspectRatio, MdOutlinePhotoSizeSelectActual } from 'react-icons/md';

const BrowseImage = () => {
  const navigate = useNavigate();
  const pickerRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState('#ffffff');
  const [openColorSettings, setOpenColorSettings] = useState(false);

  const canvasSizeOptions = [
    {
      label: "1:1",
      icon: Square,
      value: "1:1",
      sizes: [
        { label: "Small (512 x 512)", width: 512, height: 512 },
        { label: "Medium (1080 x 1080)", width: 1080, height: 1080 },
        { label: "Large (2048 x 2048)", width: 2048, height: 2048 },
      ],
    },
    {
      label: "16:9",
      value: "16:9",
      icon: RectangleHorizontal,
      sizes: [
        { label: "Small (640 x 360)", width: 640, height: 360 },
        { label: "Medium (1280 x 720)", width: 1280, height: 720 },
        { label: "Large (1920 x 1080)", width: 1920, height: 1080 },
      ],
    },
    {
      label: "4:3",
      value: "4:3",
      icon: RectangleVertical,
      sizes: [
        { label: "Small (800 x 600)", width: 800, height: 600 },
        { label: "Medium (1024 x 768)", width: 1024, height: 768 },
        { label: "Large (1600 x 1200)", width: 1600, height: 1200 },
      ],
    },
    {
      label: "3:4",
      value: "3:4",
      icon: RectangleHorizontal,
      sizes: [
        { label: "Small (600 x 800)", width: 600, height: 800 },
        { label: "Medium (768 x 1024)", width: 768, height: 1024 },
        { label: "Large (1200 x 1600)", width: 1200, height: 1600 },
      ],
    },
  ];

  const smallCanvasByRatio = {
    "1:1": { width: 560, height: 560 },
    "16:9": { width: 996, height: 560 },
    "4:3": { width: 747, height: 560 },
    "3:4": { width: 420, height: 560 },
  };

  const [selectedRatio, setSelectedRatio] = useState(canvasSizeOptions[0]);
  const [selectedCanvasSize, setSelectedCanvasSize] = useState(canvasSizeOptions[0].sizes[1]);
  const editCanvas = smallCanvasByRatio[selectedRatio.value as keyof typeof smallCanvasByRatio];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const url = URL.createObjectURL(selected);
      navigate("/image/tool/editor", {
        state: {
          imageUrl: url,
          name: selected.name,
          ratio: selectedRatio.value,
          canvas: {
            width: selectedCanvasSize.width,
            height: selectedCanvasSize.height,
          },
          editCanvas: editCanvas,
          color: color
        },
      });
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
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
    <div className="group relative flex flex-col w-full h-full">
      <EditHeader />
      <div className={`flex p-4 h-[calc(100vh-4rem)] items-center justify-center w-full overflow-hidden`}>
        <div className={`flex items-center space-x-8 justify-center bg-mountain-100 border border-mountain-200 rounded-lg w-full h-full overflow-y-hidden`}>
          <div className='relative flex justify-center items-center bg-gradient-to-b from-white via-indigo-100 to-purple-100 shadow-md w-96 h-96 cursor-pointer'>
            <BsCardImage className='w-20 h-20 font-bold text-mountain-600' />
          </div>
          <div className='flex flex-col justify-between gap-4 w-96 h-96'>
            <Label className="flex justify-center items-center bg-mountain-950 hover:bg-mountain-900 shadow-md p-4 border-1 border-mountain-200 rounded-full w-full h-16 cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
              <Plus className="size-6 text-white" />
              <Typography variant="body1" className="text-white text-sm">Open Image</Typography>
            </Label>
            <Label className="flex justify-center items-center bg-white shadow-md p-4 border-1 border-mountain-200 rounded-full w-full h-16 cursor-pointer">
              <RiImageCircleAiLine className="size-6 text-mountain-950" />
              <Typography variant="body1" className="text-mountain-950 text-sm">Browse In-App Images</Typography>
            </Label>
            <div className='flex flex-col flex-1 justify-center gap-4 bg-white shadow p-4 border border-gray-300 rounded-lg w-full h-full font-normal text-gray-700'>
              {/* Select Aspect Ratio */}
              <div className='flex justify-between items-center w-full'>
                <p className='flex items-center space-x-2'>
                  <MdAspectRatio />
                  <span>
                    Aspect Ratio
                  </span>
                </p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="justify-start bg-mountain-50 border-mountain-200 rounded-full w-48 h-12">
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
                          {Icon && <Icon className="size-4 text-muted-foreground" />}
                          <span>{ratio.label}</span>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {/* Select Canvas Size */}
              <div className='flex justify-between items-center w-full'>
                <p className='flex items-center space-x-2'>
                  <MdOutlinePhotoSizeSelectActual />
                  <span>
                    Canvas Size
                  </span>
                </p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="justify-start bg-mountain-50 border-mountain-200 rounded-full w-48 h-12">
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
              <div className='flex justify-between items-center w-full'>
                <p>Background Color</p>
                <Popover open={openColorSettings} onOpenChange={setOpenColorSettings}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start bg-mountain-50 border-mountain-200 rounded-full w-48 h-12"
                    >
                      <div
                        className="shadow-md border border-mountain-200 rounded w-6 h-6"
                        style={{ backgroundColor: color }}
                      />
                      <span className="ml-2">{color.replace('#', '')}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="ml-4 p-2 border-mountain-200 w-auto" side='right'>
                    <div className="flex flex-col">
                      <div className="mb-2 font-medium text-mountain-950 text-sm">
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
      </div>
    </div >
  )
}

export default BrowseImage
