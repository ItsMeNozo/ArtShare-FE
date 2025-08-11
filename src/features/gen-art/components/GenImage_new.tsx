import React, { ElementType, useEffect, useState } from 'react';

//Libs
import ShowMoreText from 'react-show-more-text';

//Components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

//Assets
const example_1 =
  'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/Models-Mock/Model-1/dzu0q9a2zxvtu3w1r29a';

//Icons
import { getUserProfile } from '@/api/authentication/auth';
import { Button, CircularProgress, Tooltip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
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
  // onDelete?: (resultId: number, imgId: number) => void;
}

const AnyShowMoreText: ElementType = ShowMoreText as unknown as ElementType;

const GenImage: React.FC<GenImageProps> = ({
  index,
  result,
  otherImages,
  useToShare,
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

  const downloadImage = async (imageUrl: string, filename: string) => {
    const maxRetries = 3;
    const retryDelay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Check if image exists first
        const headResponse = await fetch(imageUrl, { method: 'HEAD' });
        if (!headResponse.ok) {
          throw new Error(`Image not ready (${headResponse.status})`);
        }

        // Download with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(imageUrl, {
          signal: controller.signal,
          cache: 'no-cache',
        });
        clearTimeout(timeout);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
        return;
      } catch (error) {
        console.warn(`Download attempt ${attempt} failed:`, error);

        if (attempt === maxRetries) {
          throw new Error(`Download failed after ${maxRetries} attempts`);
        }

        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * attempt),
        );
      }
    }
  };

  const waitForImageReady = async (
    imageUrl: string,
    maxWait: number = 30000,
  ) => {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      try {
        const response = await fetch(imageUrl, { method: 'HEAD' });
        if (response.ok) return true;
      } catch {
        // Silently continue if HEAD request fails
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    throw new Error('Image not ready within timeout');
  };

  const handleDownload = async () => {
    const imageUrl = result.imageUrls[index];
    const urlParts = imageUrl.split('/');
    const originalFilename = urlParts[urlParts.length - 1];
    const filename = originalFilename.includes('.')
      ? originalFilename
      : `${originalFilename}.png`;

    try {
      // Wait for image to be ready, then download
      await waitForImageReady(imageUrl);
      await downloadImage(imageUrl, filename);
    } catch (error) {
      console.error('Download failed:', error);

      // Fallback to canvas approach for CORS issues
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        const imageLoaded = new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Canvas image load failed'));

          // Timeout for canvas approach
          setTimeout(
            () => reject(new Error('Canvas image load timeout')),
            10000,
          );
        });

        img.src = imageUrl;
        await imageLoaded;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Convert canvas to blob and download
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = filename;
              link.style.display = 'none';
              document.body.appendChild(link);
              link.click();

              setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }, 100);
            } else {
              throw new Error('Failed to create blob from canvas');
            }
          },
          'image/png',
          1.0,
        );
      } catch (canvasError) {
        console.error('Canvas fallback failed:', canvasError);

        // Final user-friendly fallback
        const userChoice = confirm(
          `Download failed due to network or server issues.\n\n` +
            `Would you like to:\n` +
            `• Click "OK" to open the image in a new tab (you can then right-click to save)\n` +
            `• Click "Cancel" to copy the image URL to clipboard`,
        );

        if (userChoice) {
          window.open(imageUrl, '_blank', 'noopener,noreferrer');
        } else {
          try {
            await navigator.clipboard.writeText(imageUrl);
            alert(
              'Image URL copied to clipboard! You can paste it in your browser to download.',
            );
          } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = imageUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert(
              'Image URL copied to clipboard! You can paste it in your browser to download.',
            );
          }
        }
      }
    }
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

  const { data: user, error } = useQuery({
    queryKey: ['user-profile', result?.userId],
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
        // onDelete?.(result.id, result); --> RESOLVE HERE
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
      // onDelete?.(resultId, imageId); --> RESOLVE HERE
      setOpen(false);
      setDeleteImage(false);
    }, 2000);
  };

  return (
    <Dialog open={openDiaLog} onOpenChange={setOpenDiaLog}>
      <DialogTrigger asChild>
        <div className="group relative flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-hidden">
          <div className="group relative">
            <img
              src={result.imageUrls[index]}
              alt={`Image ${result.id}`}
              loading="lazy"
              className="max-h-full max-w-full cursor-pointer object-contain shadow-md"
              style={{
                borderRadius: '8px',
                aspectRatio: 'auto',
              }}
              onClick={() => {
                setCurrentIndex(index), setOpenDiaLog(true);
              }}
            />
            {deleteImage === true && (
              <div
                className={`absolute inset-0 flex items-center justify-center bg-black/20`}
                style={{ borderRadius: '8px' }}
              >
                <div className="flex h-fit flex-col space-y-2 rounded-lg bg-white p-2">
                  <p className="text-sm">Are you sure to delete?</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className={`bg-mountain-100`}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent opening dialog
                          handleDelete();
                        }}
                      >
                        <FiTrash2 className="mr-2 size-5" />
                        <p className="font-normal">Delete This</p>
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="flex h-fit cursor-not-allowed justify-center sm:max-w-[320px]"
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
              <>
                <div className="absolute bottom-2 left-2 flex">
                  <Tooltip title="Click to share this">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToUpload(result);
                      }}
                      className="hover:bg-mountain-50 z-50 flex h-6 w-28 transform items-center justify-center rounded-md bg-white opacity-0 duration-300 ease-in-out group-hover:opacity-100 hover:cursor-pointer"
                    >
                      <Check className="text-mountain-600 mr-1 size-4" />
                      <p>Share This</p>
                    </div>
                  </Tooltip>
                </div>
              </>
            ) : (
              <>
                <div className="absolute bottom-2 left-2 flex">
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDownload();
                      return false;
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="z-50 flex h-6 w-6 transform items-center justify-center rounded-full bg-white opacity-0 duration-300 ease-in-out group-hover:opacity-100 hover:cursor-pointer"
                    title="Download"
                  >
                    <FiDownload className="text-mountain-600 pointer-events-none" />
                  </div>
                </div>
                <div className="absolute right-2 bottom-2 flex space-x-2">
                  <Tooltip title="Edit">
                    <div
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent opening dialog
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
                        e.stopPropagation(); // Prevent opening dialog
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
      <DialogContent className="min-w-7xl rounded-xl border-0 p-0">
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
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className={`${otherImages.length === 1 ? 'hidden' : 'flex'}`}>
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
                    <Button title="Download" onClick={handleDownload}>
                      <FiDownload className="size-5" />
                    </Button>
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
    </Dialog>
  );
};

export default GenImage;
