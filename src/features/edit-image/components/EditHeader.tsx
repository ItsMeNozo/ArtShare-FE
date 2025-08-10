import React, { useEffect, useState } from "react";

//Icons
import { LuFile } from "react-icons/lu";

//Components
import UserInAppConfigs from "../../../components/popovers/UserInAppConfigs";
import { Button } from "@/components/ui/button";
import UserButton from "../../../components/header/user-button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { Switch } from "@/components/ui/switch";

//Context
import { useUser } from '@/contexts/user/useUser';
import { MdAspectRatio, MdOutlineSaveAlt } from "react-icons/md";
import { TbInfoCircleFilled, TbSettings2 } from "react-icons/tb";
import { BiExpandAlt } from 'react-icons/bi';
import { RiImageCircleFill } from 'react-icons/ri';
import { ChevronDown } from 'lucide-react';
import { FaCrown } from 'react-icons/fa';
import { Input } from '@/components/ui/input';
import { canvasSizeOptions, fileTypes, smallCanvasByRatio } from "../utils/constant";
import { findMatchingCanvasSize, getAspectRatioLabel } from "../utils/common";
import BackButton from "./headerItems/BackButton";
import ShareButton from "./headerItems/ShareButton";
import { Link, useLocation } from "react-router-dom";
import { PiStarFourFill } from "react-icons/pi";

interface EditHeaderProps {
  hideTopBar?: boolean;
  hasChanges?: boolean;
  finalCanvasSize?: Canvas;
  setNewEdit?: React.Dispatch<React.SetStateAction<NewDesign | null>>;
  setNewDesign?: React.Dispatch<React.SetStateAction<NewDesign | null>>;
  setHideTopBar?: React.Dispatch<React.SetStateAction<boolean>>;
  handleShare?: () => void;
  handleDownload?: (format: "png" | "jpg", fileName: string, includeWatermark: boolean) => void;
}

const EditHeader: React.FC<EditHeaderProps> = ({
  finalCanvasSize,
  hasChanges,
  hideTopBar,
  setNewEdit,
  setNewDesign,
  setHideTopBar,
  handleShare,
  handleDownload
}) => {
  const { user, loading } = useUser();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [canvasSize, setCanvasSize] = useState<{ label: string; width: number; height: number } | null>(null);
  const editCanvas = smallCanvasByRatio[aspectRatio as keyof typeof smallCanvasByRatio];

  const currentRatioGroup = canvasSizeOptions.find(r => r.value === aspectRatio);
  const currentSizes = currentRatioGroup?.sizes || [];

  //Download
  const [openDownload, setOpenDownload] = useState(false);
  const [fileName, setFileName] = useState("");
  const [selectedFileType, setSelectedFileType] = useState(fileTypes[0]);
  const [useWatermark, setUseWatermark] = useState<boolean>(true);
  const [exportSize, setExportSize] = useState({ label: "Original", width: canvasSize?.width, height: canvasSize?.height });
  const isNewEditorPage = location.pathname === "/image/tool/editor/new";

  const exportSizes = [
    { label: "Original", width: canvasSize?.width, height: canvasSize?.height },
    { label: "Small (512x512)", width: 512, height: 512 },
    { label: "Medium (1080x1080)", width: 1080, height: 1080 },
    { label: "Large (2048x2048)", width: 2048, height: 2048, requiredRank: 'pro' },
  ];

  const handleExport = (filename: string, format: "png" | "jpg") => {
    handleDownload?.(format, filename, useWatermark)
  };

  useEffect(() => {
    const selected = canvasSizeOptions.find(option => option.value === aspectRatio);
    if (selected) {
      setCanvasSize(selected.sizes[1]);
    }
  }, [aspectRatio]);

  useEffect(() => {
    if (!openDownload) return;
    const trimmed = fileName.trim();
    const extension = selectedFileType?.value || 'png';
    if (!trimmed || trimmed.startsWith('artshare-')) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      setFileName(`artshare-${timestamp}.${extension}`);
    } else if (!trimmed.endsWith(`.${extension}`)) {
      setFileName(`${trimmed}.${extension}`);
    }
  }, [openDownload, selectedFileType]);

  useEffect(() => {
    if (!finalCanvasSize) return;
    const matchedSize = findMatchingCanvasSize(finalCanvasSize);
    const aspectRatio = getAspectRatioLabel(finalCanvasSize.width, finalCanvasSize.height);
    if (matchedSize) {
      setCanvasSize(matchedSize);
    }
    if (aspectRatio) {
      setAspectRatio(aspectRatio);
    }
  }, [finalCanvasSize, finalCanvasSize?.width, finalCanvasSize?.height]);

  return (
    <nav
      className={`border-mountain-200 dark:bg-mountain-950 dark:border-b-mountain-700 relative z-50 flex h-16 w-full items-center justify-between border-b-1 pr-4 ${hideTopBar ? 'hidden' : ''}`}
    >
      <div className="flex justify-between items-center p-4 w-full">
        <BackButton hasChanges={hasChanges} />
        {!isNewEditorPage ? (
          <div className="flex w-full">
            <div className="flex space-x-2 mx-4 px-4 border-mountain-200 border-l-1 w-full">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="flex justify-center items-center bg-mountain-50/60 hover:bg-mountain-100/60 shadow-sm border border-mountain-200 rounded-lg w-32 h-10 font-medium text-mountain-950 text-sm cursor-pointer"
                  >
                    <LuFile className="size-4 text-indigo-600" />
                    <p className="font-medium">New</p>
                  </Button>
                </DialogTrigger>
                <DialogContent className="flex flex-col border-mountain-200 w-2xl h-[640px]">
                  <DialogHeader className="pb-4 border-mountain-200 border-b-1">
                    <DialogTitle>Create New Design</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col space-y-8 h-full">
                    <div className="flex flex-col justify-center space-y-0.5 bg-blue-50 p-2 border-blue-600 border-l-4 w-full h-16">
                      <div className="flex items-center space-x-2">
                        <TbInfoCircleFilled className="text-blue-900" />
                        <span className="font-medium">Note</span>
                      </div>
                      <p className="text-sm">
                        Creating a new design will discard your current progress.
                      </p>
                    </div>
                    <div className="flex flex-col space-y-4">
                      <Label htmlFor="ratio" className="text-right">
                        Aspect Ratio
                      </Label>
                      <div className="gap-4 grid grid-cols-4 w-full">
                        {[
                          { ratio: "1:1", width: 60, height: 60 },
                          { ratio: "16:9", width: 80, height: 45 },
                          { ratio: "4:3", width: 60, height: 45 },
                          { ratio: "3:4", width: 45, height: 60 }
                        ].map(({ ratio, width, height }) => (
                          <button
                            key={ratio}
                            onClick={() => setAspectRatio(ratio)}
                            className={`flex flex-col items-center justify-end p-2 border rounded-lg ${aspectRatio === ratio
                              ? "border-mountain-600 bg-mountain-50"
                              : "border-mountain-300 hover:bg-mountain-100"
                              }`}
                          >
                            <div
                              className="bg-mountain-200 rounded-sm"
                              style={{
                                width: `${width}px`,
                                height: `${height}px`,
                              }}
                            />
                            <span className="mt-2 font-medium text-mountain-700 text-sm">{ratio}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-4">
                      <Label htmlFor="ratio" className="text-right">
                        Image Size
                      </Label>
                      <div className="gap-4 grid grid-cols-2 w-80">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className="flex flex-1 justify-start bg-white hover:bg-mountain-50 shadow border border-mountain-200 rounded-lg w-72 h-12 font-normal text-mountain-900">
                              <MdAspectRatio className="mr-2" />
                              <span className="font-normal text-mountain-600">
                                {canvasSize?.label || "Select Canvas Size"}
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="border-mountain-200 w-72">
                            {canvasSizeOptions
                              .filter((option) => option.value === aspectRatio)
                              .map((canvas, index) => (
                                <div key={index} className="px-2 py-1">
                                  <div className="flex flex-col gap-1">
                                    {canvas.sizes.map((size, sIndex) => (
                                      <DropdownMenuItem
                                        key={sIndex}
                                        onClick={() => {
                                          setCanvasSize(size);
                                        }}
                                        className="hover:bg-gray-100 px-4 py-2 text-sm cursor-pointer"
                                      >
                                        {size.label}
                                      </DropdownMenuItem>
                                    ))}
                                  </div>
                                </div>
                              ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant={"outline"}
                      onClick={() => { setOpen(false) }}
                      className="border-mountain-200">
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      onClick={() => {
                        setOpen(false);
                        setNewDesign?.({
                          layers: [],
                          ratio: aspectRatio,
                          canvas: editCanvas,
                          finalCanvas: {
                            width: canvasSize?.width!,
                            height: canvasSize?.height!,
                          }
                        });
                      }}
                    >
                      Create New Design
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="flex justify-center items-center bg-mountain-50/60 hover:bg-mountain-100/60 shadow-sm border border-mountain-200 rounded-lg w-32 h-10 font-medium text-mountain-950 text-sm cursor-pointer">
                    <TbSettings2 className="size-4 text-purple-600" />
                    <p className="font-medium">Settings</p>
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="start" className="space-y-6 mt-4 p-4 border-mountain-200 w-80">
                  <div className='flex flex-col space-y-4'>
                    <p className="text-mountain-400 text-sm">Current Project</p>
                    {/* Aspect Ratio Dropdown */}
                    <div className="flex justify-between items-center space-x-2">
                      <p className="font-medium text-sm">Aspect Ratio</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="justify-between bg-mountain-50 hover:bg-mountain-100 border-0 border-mountain-200 w-48 cursor-pointer"
                          >
                            {aspectRatio}
                            <ChevronDown />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="space-y-2 py-2 border-mountain-200 w-48">
                          {canvasSizeOptions.map((option) => (
                            <DropdownMenuItem
                              key={option.value}
                              onClick={() => {
                                setAspectRatio(option.value);
                                setCanvasSize(option.sizes[1]);
                              }}
                            >
                              {option.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {/* Canvas Size Dropdown */}
                    <div className="flex justify-between items-center space-x-2">
                      <p className="font-medium text-sm">Canvas Size</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="justify-between bg-mountain-50 hover:bg-mountain-100 border-0 border-mountain-200 w-48 cursor-pointer"
                          >
                            {canvasSize?.label}
                            <ChevronDown />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="space-y-2 py-2 border-mountain-200 w-48">
                          {currentSizes.map((size) => (
                            <DropdownMenuItem
                              key={size.label}
                              onClick={() => setCanvasSize(size)}
                              className="justify-between"
                            >
                              <p>{size.label}</p>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    disabled={!canvasSize || !aspectRatio || !setNewEdit}
                    className="bg-indigo-200 hover:bg-indigo-100 w-full text-mountain-950 cursor-pointer"
                    onClick={() => {
                      if (!canvasSize || !aspectRatio || !setNewEdit) return;
                      setNewEdit({
                        layers: [],
                        ratio: aspectRatio,
                        canvas: editCanvas,
                        finalCanvas: canvasSize,
                      });
                    }}
                  >
                    Apply Settings
                  </Button>
                </PopoverContent>
              </Popover>
              <Popover open={openDownload} onOpenChange={setOpenDownload}>
                <PopoverTrigger asChild>
                  <Button className="flex justify-center items-center bg-mountain-50/60 hover:bg-mountain-100/60 shadow-sm border border-mountain-200 rounded-lg w-32 h-10 font-medium text-mountain-950 text-sm cursor-pointer">
                    <MdOutlineSaveAlt className="size-4 text-violet-600" />
                    <p className="font-medium">Export</p>
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="start" className="space-y-6 mt-4 p-4 border-mountain-200 w-80 select-none">
                  <div className='flex flex-col space-y-4'>
                    <div className='flex justify-between items-center'>
                      <p className='font-medium text-sm'>Download</p>
                      <div className="flex items-center space-x-2 bg-indigo-100 p-1 px-2 rounded-lg select-none">
                        <FaCrown className='text-amber-400' />
                        <span className="text-sm">App Watermark</span>
                        <Switch
                          disabled
                          checked={useWatermark}
                          onCheckedChange={setUseWatermark}
                          className="data-[state=checked]:bg-indigo-500"
                        />
                      </div>
                    </div>
                    <Input
                      placeholder="File Name"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      className="placeholder:text-mountain-400"
                    />
                    {/* File Export */}
                    <div className="flex justify-between items-center space-x-2 w-full">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="flex items-center border-mountain-200 w-24 font-medium text-sm cursor-pointer">
                            <RiImageCircleFill className='mr-1 size-6 text-purple-700' />
                            <span>{selectedFileType.label}</span>
                            <ChevronDown />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="space-y-2 py-2 border-mountain-200 min-w-24">
                          {fileTypes.map((type) => (
                            <DropdownMenuItem
                              key={type.value}
                              onClick={() => setSelectedFileType(type)}
                              className="flex justify-between items-center"
                            >
                              {type.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="justify-between border-mountain-200 w-46 cursor-pointer">
                            {exportSize.label}
                            <ChevronDown />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="space-y-2 py-2 border-mountain-200 w-48">
                          {exportSizes.map((size) => (
                            <DropdownMenuItem key={size.label} onClick={() => setExportSize(size)} className={`justify-between`}>
                              <p>{size.label}</p>
                              {size.requiredRank === 'pro' && <FaCrown className='text-amber-400' />}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Button
                      variant="default"
                      className="bg-purple-200 hover:bg-purple-100 w-full text-mountain-950 cursor-pointer"
                      onClick={() => handleExport(fileName, selectedFileType.value as "png" | "jpg")}
                    >
                      Download {selectedFileType.label}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <ShareButton hasChanges={hasChanges} handleShare={handleShare} />
            </div>
            <div className="flex items-center space-x-4 px-4 border-mountain-200 border-r-1">
              <Button
                onClick={() => setHideTopBar?.((prev) => !prev)}
                className="flex justify-center items-center bg-mountain-50/60 hover:bg-mountain-100/60 shadow-sm border border-mountain-200 rounded-lg w-32 h-10 font-medium text-mountain-950 text-sm cursor-pointer">
                <BiExpandAlt className="size-4 text-cyan-600" />
                Full Screen
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex w-full">
            <div className="flex space-x-2 mx-4 px-4 border-mountain-200 border-l-1 w-full">
              <Link
                to="/image/tool/text-to-image"
                className="flex justify-center items-center bg-mountain-50/60 hover:bg-mountain-100/60 shadow-sm border border-mountain-200 rounded-lg w-64 h-10 font-medium text-mountain-950 text-sm cursor-pointer">
                <PiStarFourFill className="mr-2 size-4 text-amber-600" />
                Generate Images with ArtNova
              </Link>
            </div>
          </div>
        )}
      </div>
      <div className={`flex h-full items-center space-x-2`}>
        <UserButton user={user!} loading={loading!} />
        <UserInAppConfigs />
      </div>
    </nav>
  );
};

export default EditHeader;
