//Core
import React, { useState } from 'react';

//Icons
import { FiDownload } from 'react-icons/fi';

//Components
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
import { RiShareBoxFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import GenImage from './GenImage';
import DownloadModal from './DownloadModal';

interface promptResultProps {
  result: PromptResult;
  useToShare?: boolean | null;
}
interface DownloadSettings {
  format: string; // jpg, png, webp, original
  device: string; // e.g., Desktop, Mobile, Tablet
  size: string;   // e.g., 1920x1080
  filename?: string;
}

const PromptResult: React.FC<promptResultProps> = ({ result, useToShare }) => {
  const [downloadTargetUrl, setDownloadTargetUrl] = useState<string | null>(null);
  const [openDownload, setOpenDownload] = useState<boolean>(false);
  const [openDownloadSingle, setOpenDownloadSingle] = useState<boolean>(false);

  const navigate = useNavigate();

  const resizeImage = async (blob: Blob, targetWidth: number, targetHeight: number, format: string) => {
    const img = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 0, 0, targetWidth, targetHeight);

    return new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (resizedBlob) => resolve(resizedBlob || blob),
        format === 'original' ? blob.type : `image/${format}`
      );
    });
  };

  const parseSize = (size: string) => {
    const [w, h] = size.split('x').map(Number);
    return { width: w, height: h };
  };

  const handleDownloadAll = async (settings: DownloadSettings) => {
    if (!result || !result.imageUrls || result.imageUrls.length === 0) return;

    const { format, size, filename } = settings;
    const { width, height } = parseSize(size);

    // If only one image, download directly
    if (result.imageUrls.length === 1) {
      const response = await fetch(result.imageUrls[0]);
      let blob = await response.blob();
      if (format !== "original" || size !== "original") {
        blob = await resizeImage(blob, width, height, format);
      }
      saveAs(blob, `${filename || `image-${Date.now()}`}.${format}`);
      return;
    }
    // Otherwise, create ZIP
    const zip = new JSZip();
    await Promise.all(
      result.imageUrls.map(async (url, index) => {
        const response = await fetch(url);
        let blob = await response.blob();
        if (format !== "original" || size !== "original") {
          blob = await resizeImage(blob, width, height, format);
        }
        zip.file(`${filename || "image"}-${index + 1}.${format}`, blob);
      })
    );
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `${filename || "images"}.zip`);
  };

  const handleDownloadSingle = async (settings: DownloadSettings) => {
    if (!downloadTargetUrl) return;
    const { format, size, filename } = settings;
    const { width, height } = parseSize(size);
    const response = await fetch(downloadTargetUrl);
    let blob = await response.blob();
    if (format !== 'original' || size !== 'original') {
      blob = await resizeImage(blob, width, height, format);
    }
    saveAs(blob, `${filename || `image-${Date.now()}`}.${format}`);
  };

  const handleNavigateToUploadPost = (prompt: PromptResult) => {
    navigate('/posts/new?type=ai-gen', {
      state: { prompt, skipUnsavedGuard: true },
    });
  };

  return (
    <div className="flex w-full flex-col space-y-2">
      <div className="flex w-full items-center justify-between space-x-2">
        <p className="line-clamp-1">
          <span className="mr-2 font-sans font-medium">Prompt</span>
          {truncateText(result.userPrompt, 120)}
        </p>
        {!result.generating && (
          <div className="flex items-center space-x-2">
            <Tooltip title="Post this" placement="bottom" arrow>
              <Button
                onClick={() => handleNavigateToUploadPost(result!)}
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
                onClick={() => setOpenDownload(true)}
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
      <ImageList cols={4} gap={8} sx={{ width: '100%' }}>
        {result.imageUrls.map((__, index) => (
          <ImageListItem key={index} sx={{ height: 'auto !important' }}>
            {result.generating ? (
              <div className="bg-mountain-100 relative flex aspect-square w-full items-center justify-center rounded-[8px]">
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
                setOpenDownload={(open) => {
                  setDownloadTargetUrl(result.imageUrls[index]);
                  setOpenDownloadSingle(open);
                }}
              />
            )}
          </ImageListItem>
        ))}
      </ImageList>
      {/* Modals */}
      {openDownload && (
        <DownloadModal
          imageURL={result.imageUrls!}
          imageRatio={result.aspectRatio}
          onDownload={handleDownloadAll}
          openDownload={openDownload}
          setOpenDownload={setOpenDownload}
        />
      )}
      {openDownloadSingle && (
        <DownloadModal
          imageRatio={result.aspectRatio}
          imageURL={downloadTargetUrl!}
          onDownload={handleDownloadSingle}
          openDownload={openDownloadSingle}
          setOpenDownload={setOpenDownloadSingle}
        />
      )}
    </div>
  );
};

export default PromptResult;
