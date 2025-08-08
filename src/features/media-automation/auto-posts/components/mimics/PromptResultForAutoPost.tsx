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
import { useSnackbar } from '@/hooks/useSnackbar';
import { truncateText } from '@/utils/text';
import {
  Button,
  CircularProgress,
  ImageList,
  ImageListItem,
  Tooltip,
} from '@mui/material';
import { saveAs } from 'file-saver';
import { useFormikContext } from 'formik';
import JSZip from 'jszip';
import { nanoid } from 'nanoid';
import { RiShareBoxFill } from 'react-icons/ri';
import { AutoPostFormValues, ImageState } from '../../types';
import GenImage from './GenImage';

interface promptResultProps {
  result: PromptResult;
  useToShare?: boolean | null;
}

const PromptResultForAutoPost: React.FC<promptResultProps> = ({
  result,
  useToShare,
}) => {
  const [open, setOpen] = useState(false);
  const { showSnackbar } = useSnackbar();

  const { setFieldValue, getFieldMeta } =
    useFormikContext<AutoPostFormValues>();

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

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    await Promise.all(
      result!.imageUrls.map(async (url, index) => {
        const response = await fetch(url);
        const blob = await response.blob();
        zip.file(`image-${index + 1}.jpg`, blob);
      }),
    );

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'images.zip');
  };

  const handleShareThese = (urls: string[]) => {
    // Implement share functionality here
    // create ImageState array from result.imageUrls

    const currentImages = getFieldMeta('images').value as ImageState[];
    if (currentImages.length + urls.length > 4) {
      showSnackbar('You can only share up to 4 images', 'warning');
      return;
    }
    const newImages = urls.map((url) => ({
      id: nanoid(),
      status: 'existing',
      url,
    }));
    setFieldValue('images', [...currentImages, ...newImages]);
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
            <Tooltip title="Post this" placement="bottom" arrow>
              <Button
                onClick={() => handleShareThese(result.imageUrls)}
                className={`bg-mountain-100 flex ${useToShare ? 'w-36' : 'w-8'}`}
              >
                <RiShareBoxFill className="size-5" />
                <p className={`${!useToShare ? 'hidden' : 'ml-2 font-normal'}`}>
                  Share These
                </p>
              </Button>
            </Tooltip>
            <Tooltip title="Download" placement="bottom" arrow>
              <Button
                className="bg-mountain-100"
                onClick={handleDownloadAll}
                hidden={useToShare || false}
              >
                <FiDownload className="size-5" />
              </Button>
            </Tooltip>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Tooltip title="Delete" placement="bottom" arrow>
                  <Button
                    className="bg-mountain-100 flex w-4"
                    hidden={useToShare || false}
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
              <GenImage
                result={result}
                otherImages={result.imageUrls}
                index={index}
                useToShare={useToShare}
                handleShareThis={handleShareThese}
                // onDelete={onDeleteSingle!}
              />
            )}
          </ImageListItem>
        ))}
      </ImageList>
    </div>
  );
};

export default PromptResultForAutoPost;
