import { useNavigate } from 'react-router-dom';
import EditHeader from './components/EditHeader'
import { useState } from 'react';
import { Typography } from '@mui/material';
import { BsCardImage } from 'react-icons/bs';
import { Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RiImageCircleAiLine } from 'react-icons/ri';
import { MdAspectRatio, MdOutlinePhotoSizeSelectActual } from 'react-icons/md';

const BrowseImage = () => {
  const navigate = useNavigate();
  const [selectedRatio, setSelectedRatio] = useState("1:1");
  const ratioOptions = ["1:1", "16:9", "4:3", "3:4"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const url = URL.createObjectURL(selected);
      navigate("/image/tool/editor", {
        state: {
          imageUrl: url,
          name: selected.name,
          ratio: selectedRatio,
        },
      });
    }
  };

  return (
    <div className="group relative flex flex-col w-full h-full">
      <EditHeader />
      <div className={`flex p-4 h-[calc(100vh-4rem)] items-center justify-center w-full overflow-hidden`}>
        <div className={`flex items-center space-x-8 justify-center bg-mountain-100 border border-mountain-200 rounded-lg w-full h-full overflow-y-hidden`}>
          <div className='flex justify-center items-center bg-gradient-to-b from-white via-indigo-100 to-purple-100 shadow-md w-96 h-96 cursor-pointer'>
            <BsCardImage className='w-20 h-20 text-mountain-600' />
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex flex-col flex-1 justify-center bg-white hover:bg-gray-100 shadow border border-gray-300 rounded-lg w-full h-16 font-normal text-gray-700">
                    <div className='flex items-center'>
                      <MdAspectRatio className='mr-2' />
                      <span className='font-bold text-lg'>{selectedRatio}</span>
                    </div>
                    <p>Aspect Ratio</p>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="mt-4 ml-4 border-mountain-200" side='right'>
                  {ratioOptions.map((ratio) => (
                    <DropdownMenuItem
                      key={ratio}
                      onClick={() => setSelectedRatio(ratio)}
                      className="cursor-pointer"
                    >
                      {ratio}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button className="flex flex-col flex-1 justify-center bg-white hover:bg-gray-100 shadow border border-gray-300 rounded-lg w-full h-16 font-normal text-gray-700 pointer-events-none select-none">
                <div className='flex items-center'>
                  <MdOutlinePhotoSizeSelectActual className='mr-2' />
                  <span className='font-bold text-lg'>1080 x 1080</span>
                </div>
                <p>Canvas Size</p>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}

export default BrowseImage
