//Core
import React, { useEffect, useState } from 'react';

//Icons
import { FiDownload, FiTrash2 } from 'react-icons/fi';

//Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { truncateText } from '@/utils/text';
import {
  Button,
  CircularProgress,
  ImageList,
  ImageListItem,
  Tooltip,
} from '@mui/material';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import BrowseGenImage from './BrowseGenImage';

interface promptResultProps {
  result: PromptResult;
  useToEdit?: boolean | null;
}

const BrowsePromptResult: React.FC<promptResultProps> = ({
  result,
  useToEdit,
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (open) {
      timeout = setTimeout(() => {
        // onDelete?.(result?.id!); // Trigger delete --> RESOVLE THIS
        setOpen(false); // Close dialog after delete
      }, 2000);
    }

    return () => clearTimeout(timeout);
  }, [open]);

  const fetchImageWithCorsHandling = async (url: string): Promise<Blob> => {
    try {
      // Try direct fetch first
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
        headers: {
          Accept: 'image/*',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.warn('Direct fetch failed, trying canvas approach:', error);

      // Fallback to canvas approach for CORS issues
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to blob conversion failed'));
            }
          }, 'image/png');
        };

        img.onerror = () => {
          reject(new Error('Could not load image for canvas approach'));
        };

        img.src = url;
      });
    }
  };

  const handleDownloadAll = async () => {
    try {
      const imageCount = result!.imageUrls.length;

      // If only one image, download it directly without zip
      if (imageCount === 1) {
        const blob = await fetchImageWithCorsHandling(result!.imageUrls[0]);
        saveAs(blob, 'image-1.jpg');
        return;
      }

      // Multiple images - create zip
      const zip = new JSZip();
      await Promise.all(
        result!.imageUrls.map(async (url, index) => {
          try {
            const blob = await fetchImageWithCorsHandling(url);
            zip.file(`image-${index + 1}.jpg`, blob);
          } catch (error) {
            console.error(`Failed to download image ${index + 1}:`, error);
            // Continue with other images even if one fails
          }
        }),
      );

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'images.zip');
    } catch (error) {
      console.error('Download failed:', error);

      // Fallback: open images in new tabs for manual download
      result!.imageUrls.forEach((url, index) => {
        setTimeout(() => {
          window.open(url, '_blank');
        }, index * 100); // Stagger to avoid popup blocking
      });
    }
  };

  return (
    <div className="flex w-full flex-col space-y-2">
      <div className="flex w-full items-center justify-between space-x-2">
        <p className="line-clamp-1">
          <span className="mr-2 font-sans font-medium">Prompt</span>
          {truncateText(result.userPrompt, 60)}
        </p>
        {!result.generating && (
          <div className="flex items-center space-x-2">
            <div className="flex flex-col items-end">
              <Tooltip title="Download" placement="bottom" arrow>
                <Button
                  className="bg-mountain-100"
                  onClick={handleDownloadAll}
                  hidden={useToEdit || false}
                >
                  <FiDownload className="size-5" />
                </Button>
              </Tooltip>
              {result.imageUrls.length > 1 && (
                <span className="mt-1 text-xs text-gray-500 select-none">
                  images.zip
                </span>
              )}
            </div>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Tooltip title="Delete" placement="bottom" arrow>
                  <Button
                    className="bg-mountain-100 flex w-4"
                    hidden={useToEdit || false}
                  >
                    <FiTrash2 className="size-5 text-red-900" />
                  </Button>
                </Tooltip>
              </PopoverTrigger>
              <PopoverContent className="dark:bg-mountain-900 border-mountain-100 dark:border-mountain-700 mt-2 mr-6 w-48 p-2">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm">Are you sure to delete?</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-mountain-100">
                        <FiTrash2 className="mr-2 size-5" />
                        <p className="font-normal">Delete All</p>
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
                            Deleting These Images
                          </DialogTitle>
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
      <ImageList cols={4} gap={8} sx={{ width: '100%', minHeight: '268px' }}>
        {result.imageUrls.map((__, index) => (
          <ImageListItem key={index} className="flex h-full object-cover">
            {result.generating ? (
              <div className="bg-mountain-100 relative flex h-full items-center justify-center rounded-[8px]">
                <CircularProgress size={64} thickness={4} />
                <p className="absolute text-xs font-medium text-gray-700">
                  Loading
                </p>
              </div>
            ) : (
              <BrowseGenImage
                result={result}
                otherImages={result.imageUrls}
                index={index}
                useToEdit={useToEdit}
                // onDelete={onDeleteSingle!}
              />
            )}
          </ImageListItem>
        ))}
      </ImageList>
    </div>
  );
};

export default BrowsePromptResult;
