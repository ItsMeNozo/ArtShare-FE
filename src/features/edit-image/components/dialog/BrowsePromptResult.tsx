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
import { fetchImageWithCorsHandling } from '@/utils/cors-handling';
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
import React, { useEffect, useState } from 'react';
import { FiDownload, FiTrash2 } from 'react-icons/fi';
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
    if (!open) return;

    const timeout = setTimeout(() => {
      // onDelete?.(result?.id!); // RESOVLE THIS
      setOpen(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [open]);

  const downloadSingle = async (url: string) => {
    const blob = await fetchImageWithCorsHandling(url);
    saveAs(blob, 'image-1.jpg');
  };

  const downloadMultiple = async (urls: string[]) => {
    const zip = new JSZip();

    await Promise.all(
      urls.map(async (url, index) => {
        try {
          const blob = await fetchImageWithCorsHandling(url);
          zip.file(`image-${index + 1}.jpg`, blob);
        } catch (error) {
          console.error(`Failed to download image ${index + 1}:`, error);
        }
      }),
    );

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'images.zip');
  };

  const handleDownloadAll = async () => {
    try {
      const { imageUrls } = result;

      if (imageUrls.length === 1) {
        await downloadSingle(imageUrls[0]);
      } else {
        await downloadMultiple(imageUrls);
      }
    } catch (error) {
      console.error('Download failed:', error);

      result.imageUrls.forEach((url, index) => {
        setTimeout(() => {
          window.open(url, '_blank');
        }, index * 100);
      });
    }
  };

  const isGenerating = result.generating;
  const hasMultipleImages = result.imageUrls.length > 1;

  return (
    <div className="flex w-full flex-col space-y-2">
      <div className="flex w-full items-center justify-between space-x-2">
        <p className="line-clamp-1">
          <span className="mr-2 font-sans font-medium">Prompt</span>
          {truncateText(result.userPrompt, 60)}
        </p>
        {!isGenerating && !useToEdit && (
          <div className="flex items-center space-x-2">
            <div className="flex flex-col items-end">
              <Tooltip title="Download" placement="bottom" arrow>
                <Button className="bg-mountain-100" onClick={handleDownloadAll}>
                  <FiDownload className="size-5" />
                </Button>
              </Tooltip>
              {hasMultipleImages && (
                <span className="mt-1 text-xs text-gray-500 select-none">
                  images.zip
                </span>
              )}
            </div>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Tooltip title="Delete" placement="bottom" arrow>
                  <Button className="bg-mountain-100 flex w-4">
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
            {isGenerating ? (
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
