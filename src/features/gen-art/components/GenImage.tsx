import React, {
  Dispatch,
  ElementType,
  SetStateAction,
  useEffect,
  useState,
} from 'react';

//Libs
import ShowMoreText from 'react-show-more-text';

//Components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

//Assets
const example_1 =
  'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/Models-Mock/Model-1/dzu0q9a2zxvtu3w1r29a';

//Icons
import { getUserProfile } from '@/api/authentication/auth';
import { userKeys } from '@/lib/react-query/query-keys';
import { fetchImageWithCorsHandling } from '@/utils/cors-handling';
import { Button, CircularProgress, Tooltip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { saveAs } from 'file-saver';
import { Check } from 'lucide-react';
import {
  FaChevronLeft,
  FaChevronRight,
  FaRegPenToSquare,
} from 'react-icons/fa6';
import { FiDownload, FiTrash2 } from 'react-icons/fi';
import { IoIosSquareOutline } from 'react-icons/io';
import { IoCopyOutline } from 'react-icons/io5';
import { RiFolderUploadLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import DeleteButton from './DeleteConfirmation';

interface GenImageProps {
  index: number;
  result: PromptResult;
  otherImages: string[];
  useToShare?: boolean | null;
  setOpenDownload: Dispatch<SetStateAction<boolean>>;
  // onDelete?: (resultId: number, imgId: number) => void;
}

const AnyShowMoreText: ElementType = ShowMoreText as unknown as ElementType;

const GenImage: React.FC<GenImageProps> = ({
  index,
  result,
  otherImages,
  useToShare,
  setOpenDownload,
}) => {
  const [deleteImage, setDeleteImage] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [openDiaLog, setOpenDiaLog] = useState(false);
  const navigate = useNavigate();

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + otherImages.length) % otherImages.length,
    );
  };

  const handleNav = (index: number) => {
    if (index >= 0 && index < otherImages.length) {
      setCurrentIndex(index);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % otherImages.length);
  };

  const handleNavigateToEdit = () => {
    const imageUrl = result.imageUrls[index];
    const aspectRatio = result.aspectRatio;
    const [width, height] =
      aspectRatio === 'square'
        ? [1024, 1024]
        : aspectRatio === 'landscape'
          ? [1280, 720]
          : aspectRatio === 'portrait'
            ? [720, 1280]
            : [1024, 1024];
    navigate('/image/tool/editor', {
      state: {
        imageUrl,
        ratio: aspectRatio,
        canvas: {
          width,
          height,
        },
        name: `image-${result.id}`,
      },
    });
  };

  const handleNavigateToUpload = (prompt: PromptResult) => {
    navigate('/posts/new?type=ai-gen', { state: { prompt } });
  };

  const handleQuickDownload = async () => {
    try {
      const blob = await fetchImageWithCorsHandling(result.imageUrls[index]);
      saveAs(blob, `image-${Date.now()}.jpg`);
    } catch (error) {
      console.error('Quick download failed:', error);
      // Fallback: open image in new tab
      window.open(result.imageUrls[index], '_blank');
    }
  };

  const handleQuickDownloadFromModal = async () => {
    try {
      const blob = await fetchImageWithCorsHandling(
        result.imageUrls[currentIndex],
      );
      saveAs(blob, `image-${Date.now()}.jpg`);
    } catch (error) {
      console.error('Quick download failed:', error);
      // Fallback: open image in new tab
      window.open(result.imageUrls[currentIndex], '_blank');
    }
  };

  const { data: user, error } = useQuery({
    queryKey: userKeys.profile(result?.userId),
    queryFn: async () => {
      const response = await getUserProfile(result?.userId);
      return response ? response : null;
    },
    retry: 1,
  });

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (open) {
      timeout = setTimeout(() => {
        // onDelete?.(result.id, result); --> RESOVLE HERE
        setOpen(false); // Close dialog after delete
        setOpenDiaLog(false);
      }, 2000);
    }

    if (error) {
      console.log('error fetching user profile', user);
    }

    return () => clearTimeout(timeout);
  }, [open, user, error]);

  const handleDelete = () => {
    setTimeout(() => {
      // onDelete?.(resultId, imageId); --> RESOVLE HERE
      setOpen(false);
      setDeleteImage(false);
    }, 2000);
  };

  return (
    <Dialog open={openDiaLog} onOpenChange={setOpenDiaLog}>
      <DialogTrigger asChild>
        <div className="group relative inline-flex overflow-hidden">
          <div className="relative">
            <img
              src={result.imageUrls[index]}
              alt={`Image ${result.id}`}
              loading="lazy"
              className="block cursor-pointer shadow-md"
              style={{
                borderRadius: '8px',
                maxWidth: '100%',
                height: 'auto',
                display: 'block',
              }}
              onClick={() => {
                setCurrentIndex(index);
                setOpenDiaLog(true);
              }}
              onContextMenu={(e) => e.preventDefault()}
            />
            {deleteImage && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/20"
                style={{ borderRadius: '8px' }}
              >
                <div className="flex h-fit flex-col space-y-2 rounded-lg bg-white p-2">
                  <p className="text-sm">Are you sure to delete?</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="bg-mountain-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete();
                        }}
                      >
                        <FiTrash2 className="mr-2 size-5" />
                        <p className="font-normal">Delete This</p>
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="z-[1500] flex h-fit cursor-not-allowed justify-center sm:max-w-[320px]"
                      hideCloseButton
                    >
                      <DialogHeader>
                        <DialogDescription className="flex items-center justify-center space-x-4">
                          <CircularProgress size={32} thickness={4} />
                          <DialogTitle className="text-center text-base font-normal">
                            Deleting This Image
                          </DialogTitle>
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
            {useToShare ? (
              <div className="absolute bottom-2 left-2">
                <Tooltip title="Click to share this">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      const singleImageResult = {
                        ...result,
                        imageUrls: [result.imageUrls[index]],
                      };
                      handleNavigateToUpload(singleImageResult);
                    }}
                    className="hover:bg-mountain-50 z-50 flex h-6 w-28 transform items-center justify-center rounded-md bg-white opacity-0 duration-300 ease-in-out group-hover:opacity-100 hover:cursor-pointer"
                  >
                    <Check className="text-mountain-600 mr-1 size-4" />
                    <p>Share This</p>
                  </div>
                </Tooltip>
              </div>
            ) : (
              <>
                <div className="absolute bottom-2 left-2 flex items-center">
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleQuickDownload();
                      return false;
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="z-50 flex h-6 w-6 transform items-center justify-center rounded-l-full bg-white opacity-0 duration-300 ease-in-out group-hover:opacity-100 hover:cursor-pointer"
                    title="Download"
                  >
                    <FiDownload className="text-mountain-600 pointer-events-none size-4" />
                  </div>
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenDownload?.(true);
                      return false;
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="z-50 flex h-6 w-4 transform items-center justify-center rounded-r-full border-l border-gray-300 bg-white opacity-0 duration-300 ease-in-out group-hover:opacity-100 hover:cursor-pointer"
                    title="Download with options"
                  >
                    <span className="text-mountain-600 text-xs">▼</span>
                  </div>
                </div>
                <div className="absolute right-2 bottom-2 flex space-x-2">
                  <Tooltip title="Edit">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToEdit();
                      }}
                      className="z-50 flex h-6 w-6 transform items-center justify-center rounded-full bg-white opacity-0 duration-300 ease-in-out group-hover:opacity-100 hover:cursor-pointer"
                    >
                      <FaRegPenToSquare className="text-mountain-600 size-4" />
                    </div>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteImage(true);
                      }}
                      className="z-50 flex h-6 w-6 transform items-center justify-center rounded-full bg-white opacity-0 duration-300 ease-in-out group-hover:opacity-100 hover:cursor-pointer"
                    >
                      <FiTrash2 className="text-mountain-600" />
                    </div>
                  </Tooltip>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="z-[1300]" />
        <DialogContent className="z-[1400] min-w-7xl rounded-xl border-0 p-0">
          <DialogHeader hidden>
            <DialogTitle>Image Preview</DialogTitle>
            <DialogDescription>Image Description</DialogDescription>
          </DialogHeader>
          <div className="relative flex h-[680px]">
            <div className="bg-mountain-100 relative h-[680px] w-[65%] overflow-hidden rounded-l-xl">
              {/* Image Slider */}
              <div className="flex h-full w-full items-center justify-center">
                <div
                  className="flex h-full transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${currentIndex * 100}%)`,
                    width: `${otherImages.length * 100}%`,
                  }}
                >
                  {otherImages.map((_img, index) => (
                    <div
                      key={index}
                      className="flex h-full w-full flex-shrink-0 items-center justify-center"
                    >
                      <img
                        src={_img}
                        alt={`Preview ${index}`}
                        className="max-h-[680px] max-w-full object-contain"
                        onContextMenu={(e) => e.preventDefault()}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div
                className={`${otherImages.length === 1 ? 'hidden' : 'flex'}`}
              >
                {/* Left Arrow */}
                <div
                  onClick={handlePrev}
                  className="hover:bg-mountain-50 absolute top-1/2 left-4 z-50 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white duration-300 ease-in-out hover:scale-105"
                >
                  <FaChevronLeft />
                </div>
                {/* Right Arrow */}
                <div
                  onClick={handleNext}
                  className={`hover:bg-mountain-50 absolute top-1/2 right-4 z-50 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white duration-300 ease-in-out hover:scale-105`}
                >
                  <FaChevronRight />
                </div>
                {/* Gallery Navigating */}
                <div
                  onClick={handleNext}
                  className="absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 transform cursor-pointer items-center justify-center space-x-2 rounded-full duration-300 ease-in-out"
                >
                  <div className={`flex gap-2`}>
                    {otherImages.map((_, index) => {
                      let navIndex;
                      switch (index) {
                        case 0:
                          navIndex = 3; // last image
                          break;
                        case 1:
                          navIndex = 0; // first
                          break;
                        case 2:
                          navIndex = 1; // second
                          break;
                        case 3:
                          navIndex = 2; // third
                          break;
                        default:
                          navIndex = index;
                      }
                      return (
                        <div
                          key={index}
                          className={`h-2 w-8 rounded-lg hover:bg-white hover:opacity-100 ${
                            currentIndex === index
                              ? 'bg-white opacity-100'
                              : 'bg-mountain-200 opacity-50'
                          }`}
                          onClick={() => handleNav(navIndex)}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex h-full w-[35%] flex-col justify-between">
              <div>
                <div className="border-mountain-100 flex h-28 w-full items-end justify-between border-b p-4">
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="size-12">
                        <AvatarImage
                          src={
                            user?.profilePictureUrl ||
                            'https://github.com/shadcn.png'
                          }
                          alt="@shadcn"
                        />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <p className="font-medium">{user?.fullName}</p>
                    </div>
                    <div className="flex">
                      <div className="flex items-center">
                        <Button
                          className="h-9 min-w-9 rounded-r-none"
                          title="Download"
                          onClick={handleQuickDownloadFromModal}
                        >
                          <FiDownload className="size-5" />
                        </Button>
                        <Button
                          className="flex h-9 w-6 min-w-6 items-center justify-center rounded-l-none border-l border-gray-300 p-0"
                          title="Download with options"
                          onClick={() => setOpenDownload?.(true)}
                        >
                          ▼
                        </Button>
                      </div>
                      <DeleteButton open={open} setOpen={setOpen} />
                    </div>
                  </div>
                </div>
                <div className="border-mountain-100 flex h-1/2 w-full flex-col space-y-2 border-b px-4 py-2">
                  <div className="flex w-full items-center justify-between">
                    <p className="font-medium">Prompt</p>
                    <Button title="Copy" className="bg-mountain-100">
                      <IoCopyOutline className="size-5" />
                    </Button>
                  </div>
                  <div className="custom-scrollbar flex h-40 w-full overflow-y-auto">
                    <AnyShowMoreText
                      lines={3}
                      more="Show more"
                      less="Show less"
                      className="flex w-full text-sm break-words"
                      anchorClass="cursor-pointer hover:text-indigo-400 block py-2 underline text-sm"
                      expanded={false}
                      truncatedEndingComponent={'... '}
                    >
                      {result.userPrompt.replace(/\n/g, ' ')}
                    </AnyShowMoreText>
                  </div>
                </div>
                <div className="flex w-full p-4">
                  <div className="flex w-1/3 flex-col space-y-2">
                    <p className="font-medium">Style</p>
                    <div className="flex items-center space-x-2">
                      <img src={example_1} className="h-5 w-5 rounded-xs" />
                      <p className="text-mountain-600 line-clamp-1 capitalize">
                        {result.style}
                      </p>
                    </div>
                  </div>
                  <div className="flex w-1/3 flex-col space-y-2">
                    <p className="font-medium">Aspect Ratio</p>
                    <div className="flex items-center space-x-2">
                      <IoIosSquareOutline className="size-5" />
                      <p className="text-mountain-600">
                        {result.aspectRatio.charAt(0).toUpperCase() +
                          result.aspectRatio.slice(1).toLowerCase()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex w-full px-4">
                  <div className="flex w-1/3 flex-col space-y-2">
                    <div className="flex w-full items-center justify-between">
                      <p className="font-medium">Lighting</p>
                    </div>
                    <div className="flex items-center">
                      <p className="text-mountain-600 capitalize">
                        {result.lighting}
                      </p>
                    </div>
                  </div>
                  <div className="flex w-1/3 flex-col space-y-2">
                    <p className="font-medium">Camera</p>
                    <div className="text flex">
                      <p className="text-mountain-600 capitalize">
                        {result.camera}
                      </p>
                    </div>
                  </div>
                  <div className="flex w-1/3 flex-col space-y-2">
                    <p className="w-full font-medium">Image Size</p>
                    <div className="flex items-center">
                      <p className="text-mountain-600 capitalize">1024x1024</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <div
                  onClick={() => {
                    const copyResult = {
                      ...result,
                      imageUrls: [result.imageUrls[currentIndex]],
                    };
                    handleNavigateToUpload(copyResult);
                  }}
                  className="border-mountain-300 flex h-12 w-full transform items-center justify-center rounded-lg border bg-indigo-100 font-normal shadow-sm duration-300 ease-in-out select-none hover:cursor-pointer hover:bg-indigo-200/80"
                >
                  <RiFolderUploadLine className="mr-2 size-5" />
                  <p>Post This Image</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default GenImage;
