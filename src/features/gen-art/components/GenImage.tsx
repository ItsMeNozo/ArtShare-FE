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

//Constants
import { Z_INDEX } from '@/utils/constants';

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
import { FaCaretDown } from 'react-icons/fa';

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
        <div className="group inline-flex relative overflow-hidden">
          <div className="relative">
            <img
              src={result.imageUrls[index]}
              alt={`Image ${result.id}`}
              loading="lazy"
              className="block shadow-md cursor-pointer"
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
                className="absolute inset-0 flex justify-center items-center bg-black/20"
                style={{ borderRadius: '8px' }}
              >
                <div className="flex flex-col space-y-2 bg-white p-2 rounded-lg h-fit">
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
                      className={`z-[${Z_INDEX.DIALOG_DELETE_OVERLAY}] flex h-fit cursor-not-allowed justify-center sm:max-w-[320px]`}
                      hideCloseButton
                    >
                      <DialogHeader>
                        <DialogDescription className="flex justify-center items-center space-x-4">
                          <CircularProgress size={32} thickness={4} />
                          <DialogTitle className="font-normal text-base text-center">
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
              <div className="bottom-2 left-2 absolute">
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
                    className="z-50 flex justify-center items-center bg-white hover:bg-mountain-50 opacity-0 group-hover:opacity-100 rounded-md w-28 h-6 duration-300 ease-in-out hover:cursor-pointer transform"
                  >
                    <Check className="mr-1 size-4 text-mountain-600" />
                    <p>Share This</p>
                  </div>
                </Tooltip>
              </div>
            ) : (
              <>
                <div className="bottom-2 left-2 absolute flex items-center">
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
                    className="z-50 flex justify-center items-center bg-white opacity-0 group-hover:opacity-100 rounded-l-sm w-6 h-6 duration-300 ease-in-out hover:cursor-pointer transform"
                    title="Download"
                  >
                    <FiDownload className="size-4 text-mountain-600 pointer-events-none" />
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
                    className="z-50 flex justify-center items-center bg-white opacity-0 group-hover:opacity-100 border-gray-300 border-l rounded-r-sm w-6 h-6 duration-300 ease-in-out hover:cursor-pointer transform"
                    title="Download with options"
                  >
                    <span className="text-mountain-600 text-xs">
                      <FaCaretDown />
                    </span>
                  </div>
                </div>
                <div className="right-2 bottom-2 absolute flex space-x-2">
                  <Tooltip title="Edit">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToEdit();
                      }}
                      className="z-50 flex justify-center items-center bg-white opacity-0 group-hover:opacity-100 rounded-full w-6 h-6 duration-300 ease-in-out hover:cursor-pointer transform"
                    >
                      <FaRegPenToSquare className="size-4 text-mountain-600" />
                    </div>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteImage(true);
                      }}
                      className="z-50 flex justify-center items-center bg-white opacity-0 group-hover:opacity-100 rounded-full w-6 h-6 duration-300 ease-in-out hover:cursor-pointer transform"
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
        <DialogOverlay className={`z-[1600]`} />
        <DialogContent className={`z-[1700] min-w-7xl rounded-xl border-0 p-0`}>
          <DialogHeader hidden>
            <DialogTitle>Image Preview</DialogTitle>
            <DialogDescription>Image Description</DialogDescription>
          </DialogHeader>
          <div className="relative flex h-[680px]">
            <div className="relative bg-mountain-100 rounded-l-xl w-[65%] h-[680px] overflow-hidden">
              {/* Image Slider */}
              <div className="flex justify-center items-center w-full h-full">
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
                      className="flex flex-shrink-0 justify-center items-center w-full h-full"
                    >
                      <img
                        src={_img}
                        alt={`Preview ${index}`}
                        className="max-w-full max-h-[680px] object-contain"
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
                  className="top-1/2 left-4 z-50 absolute flex justify-center items-center bg-white hover:bg-mountain-50 rounded-full w-10 h-10 hover:scale-105 -translate-y-1/2 duration-300 ease-in-out cursor-pointer"
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
                  className="bottom-4 left-1/2 z-50 absolute flex justify-center items-center space-x-2 rounded-full -translate-x-1/2 -translate-y-1/2 duration-300 ease-in-out cursor-pointer transform"
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
                          className={`h-2 w-8 rounded-lg hover:bg-white hover:opacity-100 ${currentIndex === index
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
            <div className="flex flex-col justify-between w-[35%] h-full">
              <div>
                <div className="flex justify-between items-end p-4 border-mountain-100 border-b w-full h-28">
                  <div className="flex justify-between items-center w-full">
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
                      <Button
                        className="h-9 min-w-9 rounded"
                        title="Download"
                        onClick={handleQuickDownloadFromModal}
                      >
                        <FiDownload className="size-5" />
                      </Button>
                      <DeleteButton open={open} setOpen={setOpen} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 px-4 py-2 border-mountain-100 border-b w-full h-1/2">
                  <div className="flex justify-between items-center w-full">
                    <p className="font-medium">Prompt</p>
                    <Button title="Copy" className="bg-mountain-100">
                      <IoCopyOutline className="size-5" />
                    </Button>
                  </div>
                  <div className="flex w-full h-40 overflow-y-auto custom-scrollbar">
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
                <div className="flex p-4 w-full">
                  <div className="flex flex-col space-y-2 w-1/3">
                    <p className="font-medium">Style</p>
                    <div className="flex items-center space-x-2">
                      <img src={example_1} className="rounded-xs w-5 h-5" />
                      <p className="text-mountain-600 capitalize line-clamp-1">
                        {result.style}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 w-1/3">
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
                <div className="flex px-4 w-full">
                  <div className="flex flex-col space-y-2 w-1/3">
                    <div className="flex justify-between items-center w-full">
                      <p className="font-medium">Lighting</p>
                    </div>
                    <div className="flex items-center">
                      <p className="text-mountain-600 capitalize">
                        {result.lighting}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 w-1/3">
                    <p className="font-medium">Camera</p>
                    <div className="flex text">
                      <p className="text-mountain-600 capitalize">
                        {result.camera}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 w-1/3">
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
                  className="flex justify-center items-center bg-indigo-100 hover:bg-indigo-200/80 shadow-sm border border-mountain-300 rounded-lg w-full h-12 font-normal duration-300 ease-in-out hover:cursor-pointer select-none transform"
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
