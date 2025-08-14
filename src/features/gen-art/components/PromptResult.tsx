//Core
import React, { useState } from 'react';

//Icons
import { FiDownload } from 'react-icons/fi';

//Components
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
import { RiShareBoxFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import DownloadModal from './DownloadModal';
import GenImage from './GenImage';

interface promptResultProps {
  result: PromptResult;
  useToShare?: boolean | null;
}
interface DownloadSettings {
  format: string; // jpg, png, webp, original
  device: string; // e.g., Desktop, Mobile, Tablet
  size: string; // e.g., 1920x1080
  filename?: string;
}

const PromptResult: React.FC<promptResultProps> = ({ result, useToShare }) => {
  const [downloadTargetUrl, setDownloadTargetUrl] = useState<string | null>(
    null,
  );
  const [openDownload, setOpenDownload] = useState<boolean>(false);
  const [openDownloadSingle, setOpenDownloadSingle] = useState<boolean>(false);

  const navigate = useNavigate();

  const resizeImage = async (
    blob: Blob,
    targetWidth: number,
    targetHeight: number,
    format: string,
  ) => {
    const img = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 0, 0, targetWidth, targetHeight);

    return new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (resizedBlob) => resolve(resizedBlob || blob),
        format === 'original' ? blob.type : `image/${format}`,
      );
    });
  };

  const parseSize = (size: string) => {
    const [w, h] = size.split('x').map(Number);
    return { width: w, height: h };
  };

  const handleQuickDownload = async () => {
    if (!result || !result.imageUrls || result.imageUrls.length === 0) return;

    try {
      // If only one image, download directly at original quality
      if (result.imageUrls.length === 1) {
        const blob = await fetchImageWithCorsHandling(result.imageUrls[0]);
        saveAs(blob, `image-${Date.now()}.jpg`);
        return;
      }

      // Multiple images - create ZIP with original quality
      const zip = new JSZip();
      await Promise.all(
        result.imageUrls.map(async (url, index) => {
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
    } catch (error) {
      console.error('Quick download failed:', error);
      // Fallback: open images in new tabs
      result.imageUrls.forEach((url, index) => {
        setTimeout(() => window.open(url, '_blank'), index * 100);
      });
    }
  };

  const handleDownloadAll = async (settings: DownloadSettings) => {
    if (!result || !result.imageUrls || result.imageUrls.length === 0) return;

    const { format, size, filename } = settings;
    const { width, height } = parseSize(size);

    try {
      // If only one image, download directly
      if (result.imageUrls.length === 1) {
        let blob = await fetchImageWithCorsHandling(result.imageUrls[0]);
        if (format !== 'original' || size !== 'original') {
          blob = await resizeImage(blob, width, height, format);
        }
        saveAs(blob, `${filename || `image-${Date.now()}`}.${format}`);
        return;
      }

      // Otherwise, create ZIP
      const zip = new JSZip();
      await Promise.all(
        result.imageUrls.map(async (url, index) => {
          try {
            let blob = await fetchImageWithCorsHandling(url);
            if (format !== 'original' || size !== 'original') {
              blob = await resizeImage(blob, width, height, format);
            }
            zip.file(`${filename || 'image'}-${index + 1}.${format}`, blob);
          } catch (error) {
            console.error(`Failed to download image ${index + 1}:`, error);
            // Continue with other images even if one fails
          }
        }),
      );

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${filename || 'images'}.zip`);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open images in new tabs for manual download
      result.imageUrls.forEach((url, index) => {
        setTimeout(() => {
          window.open(url, '_blank');
        }, index * 100); // Stagger to avoid popup blocking
      });
    }
  };

  const handleDownloadSingle = async (settings: DownloadSettings) => {
    if (!downloadTargetUrl) return;
    const { format, size, filename } = settings;
    const { width, height } = parseSize(size);

    try {
      let blob = await fetchImageWithCorsHandling(downloadTargetUrl);
      if (format !== 'original' || size !== 'original') {
        blob = await resizeImage(blob, width, height, format);
      }
      saveAs(blob, `${filename || `image-${Date.now()}`}.${format}`);
    } catch (error) {
      console.error('Single image download failed:', error);
      // Fallback: open image in new tab for manual download
      window.open(downloadTargetUrl, '_blank');
    }
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
            <div className="flex items-center">
              <Tooltip title="Download" placement="bottom" arrow>
                <Button
                  className="bg-mountain-100 h-9 min-w-9 rounded-r-none"
                  onClick={handleQuickDownload}
                  hidden={useToShare || false}
                >
                  <FiDownload className="size-5" />
                </Button>
              </Tooltip>
              <Tooltip title="Download with options" placement="bottom" arrow>
                <Button
                  className="bg-mountain-100 flex h-9 w-6 min-w-6 items-center justify-center rounded-l-none border-l border-gray-300 p-0"
                  onClick={() => setOpenDownload(true)}
                  hidden={useToShare || false}
                >
                  ▼
                </Button>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
      <ImageList cols={4} gap={8} sx={{ width: '100%' }}>
        {result.imageUrls.map((__, index) => (
          <ImageListItem key={index} sx={{ height: 'auto' }}>
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
