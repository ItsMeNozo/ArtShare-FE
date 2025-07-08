import { useSnackbar } from '@/hooks/useSnackbar';
import { MEDIA_TYPE } from '@/utils/constants';
import { Avatar, Box, Button, IconButton, Tooltip } from '@mui/material';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { MdClose } from 'react-icons/md';
import { RiImageCircleAiLine } from 'react-icons/ri';
import { TbDeviceDesktop } from 'react-icons/tb';
import AutoSizer from 'react-virtualized-auto-sizer';
import TabValue from '../../enum/media-tab-value';
import MediaUploadTab from './MediaUploadTab';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { IoSparkles } from 'react-icons/io5';
import { LuImageOff } from 'react-icons/lu';
import {
  MAX_IMAGES,
  MAX_VIDEO,
  validateVideoDuration,
  VIDEO_THUMBNAIL_DEFAULT_URL,
} from '../../helpers/media-upload.helper';
import { useCheckMaturity } from '../../hooks/useIsMature';
import { PostMedia } from '../../types/post-media';
import AddMoreMediaButton from './AddMoreMediaButton';
import InfoMediaRemaining from './InfoMediaRemaining';
import MediaPreviewer from './MediaPreviewer';
import SelectAiImagesPanel from './SelectAiImagesPanel';
import SelectDeviceMediaPanel from './UploadFromDevice';

interface MediaSelectorPanelProps {
  postMedias: PostMedia[];
  setPostMedias: React.Dispatch<React.SetStateAction<PostMedia[]>>;
  onThumbnailAddedOrRemoved: (file: File | null) => void;
  hasArtNovaImages: boolean;
  setHasArtNovaImages: React.Dispatch<React.SetStateAction<boolean>>;
  isMatureAutoDetected: boolean;
  handleIsMatureAutoDetected: React.Dispatch<React.SetStateAction<boolean>>;
  onMediasChanged?: () => void;
}

export default function PostMediaManager({
  postMedias,
  setPostMedias,
  onThumbnailAddedOrRemoved,
  hasArtNovaImages,
  setHasArtNovaImages,
  isMatureAutoDetected,
  handleIsMatureAutoDetected,
  onMediasChanged,
}: MediaSelectorPanelProps) {
  const { showSnackbar } = useSnackbar();

  const [tabValue, setTabValue] = useState<TabValue>(
    hasArtNovaImages ? TabValue.BROWSE_GENAI : TabValue.UPLOAD_MEDIA,
  );
  const [pendingTab, setPendingTab] = useState<TabValue | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [matureDialogOpen, setMatureDialogOpen] = useState(false);
  const [selectedPreviewMedia, setSelectedPreviewMedia] =
    useState<PostMedia | null>(null);

  const handleTabChange = (newTab: TabValue) => {
    if (
      hasArtNovaImages &&
      postMedias.length > 0 &&
      newTab !== TabValue.BROWSE_GENAI
    ) {
      setPendingTab(newTab);
      setConfirmDialogOpen(true);
    } else if (newTab !== TabValue.UPLOAD_MEDIA && postMedias.length > 0) {
      setPendingTab(newTab);
      setConfirmDialogOpen(true);
    } else {
      setTabValue(newTab);
    }
  };

  useEffect(() => {
    hasArtNovaImages
      ? setTabValue(TabValue.BROWSE_GENAI)
      : setTabValue(TabValue.UPLOAD_MEDIA);
  }, [hasArtNovaImages]);

  useEffect(() => {
    const isMatureDetected = postMedias.some((media) => media.isMature);
    if (isMatureDetected && !isMatureAutoDetected) {
      console.log(
        'Mature content detected in post medias',
        isMatureDetected,
        isMatureAutoDetected,
      );
      setMatureDialogOpen(true);
      handleIsMatureAutoDetected(true);
    }

    if (!isMatureDetected && isMatureAutoDetected) {
      handleIsMatureAutoDetected(false);
    }
  }, [postMedias, isMatureAutoDetected, handleIsMatureAutoDetected]);

  const { mutateAsync: checkMaturityForNewItems } = useCheckMaturity();

  const captureThumbnailFromVideo = (videoElement: HTMLVideoElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      console.error('Failed to get canvas context');
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        onThumbnailAddedOrRemoved(
          new File([blob], 'thumbnailFromVideo.png', {
            type: 'image/png',
          }),
        );
      } else {
        console.error('Failed to create blob from canvas');
      }
    }, 'image/png');
  };

  const handleImagesAdded = async (event: ChangeEvent<HTMLInputElement>) => {
    const newFiles = event.target.files;
    if (!newFiles || newFiles.length === 0) return;

    // new post medias
    const newImageMedias = Array.from(newFiles).map((file) => ({
      file,
      type: MEDIA_TYPE.IMAGE,
      url: URL.createObjectURL(file),
    }));

    const matureProcessedImageMedias =
      await checkMaturityForNewItems(newImageMedias);

    // combine with existing files
    const combinedMedias = [...postMedias, ...matureProcessedImageMedias];

    // image count
    const imageCount = combinedMedias.filter(
      (media) => media.type === MEDIA_TYPE.IMAGE,
    ).length;
    if (imageCount > MAX_IMAGES) {
      showSnackbar(`You can only upload up to ${MAX_IMAGES} images.`, 'error');
      return;
    }
    setPostMedias(combinedMedias);

    onMediasChanged?.();

    // first time adding a media
    if (postMedias.length === 0) {
      onThumbnailAddedOrRemoved(combinedMedias[0].file);
      setHasArtNovaImages?.(false);
    }
  };

  const handleVideoAdded = async (event: ChangeEvent<HTMLInputElement>) => {
    const videoFiles = event.target.files;
    if (!videoFiles || videoFiles.length === 0) return;
    if (
      postMedias.filter((media) => media.type === MEDIA_TYPE.VIDEO).length >=
      MAX_VIDEO
    ) {
      showSnackbar(`You can only upload up to ${MAX_VIDEO} video.`, 'error');
      return;
    }
    const file = videoFiles[0];

    const isValidDuration = await validateVideoDuration(file, 60);
    if (!isValidDuration) {
      showSnackbar('Video length cannot exceed 1 minute.', 'error');
      return;
    }

    // build new video as post media and add to existing
    const previewUrl = URL.createObjectURL(file);
    const newVideoMedia = [
      {
        file,
        type: MEDIA_TYPE.VIDEO,
        url: previewUrl,
      },
    ];
    const combinedMedias = [...postMedias, ...newVideoMedia];
    setPostMedias(combinedMedias);
    onMediasChanged?.();

    // auto-thumbnail logic
    if (postMedias.length === 0) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = previewUrl;
      video.crossOrigin = 'anonymous';

      video.onloadeddata = () => {
        video.currentTime = 0; // Go to the first frame
      };

      video.onseeked = () => {
        captureThumbnailFromVideo(video);
      };

      video.onerror = () => {
        console.error('Invalid video file.');
        URL.revokeObjectURL(previewUrl);
      };
    }
  };

  const handleRemoveMediaPreview = (media: PostMedia) => {
    const { url, file } = media;
    setPostMedias((prev) => prev.filter((media) => media.file !== file));
    onMediasChanged?.();

    if (url?.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
    if (selectedPreviewMedia === media) {
      const nextMedia = postMedias.find((m) => m !== media);
      setSelectedPreviewMedia(nextMedia || null);
    }
    // if the last preview is removed, set selectedPreviewMedia to null
    if (postMedias.length === 1) {
      setSelectedPreviewMedia(null);
      onThumbnailAddedOrRemoved(null);
    }
    // if removing the last AI image
    if (postMedias.length === 1 && hasArtNovaImages) {
      setHasArtNovaImages(false);
    }
  };

  if (!selectedPreviewMedia && postMedias.length > 0) {
    setSelectedPreviewMedia(postMedias[0]);
  }

  const imageCount = postMedias.filter(
    (media) => media.type === MEDIA_TYPE.IMAGE,
  ).length;
  const hasVideo =
    postMedias.filter((media) => media.type === MEDIA_TYPE.VIDEO).length > 0;

  return (
    <Box className="dark:bg-mountain-900 flex h-full w-[60%] flex-col items-start rounded-md text-gray-900 dark:text-white">
      {/* Tabs */}
      <div className="border-mountain-200 z-20 mb-3 flex w-full gap-x-1 rounded-full border bg-white p-1.25">
        <MediaUploadTab
          isActive={tabValue === TabValue.UPLOAD_MEDIA}
          onClick={() => handleTabChange(TabValue.UPLOAD_MEDIA)}
          icon={<TbDeviceDesktop className="mr-0.5 h-5 w-5" />}
          label="Upload from Device"
          examples="(images, video)"
        />
        <MediaUploadTab
          isActive={tabValue === TabValue.BROWSE_GENAI}
          onClick={() => handleTabChange(TabValue.BROWSE_GENAI)}
          icon={<RiImageCircleAiLine className="mr-2 h-5 w-5 text-sm" />}
          label="Post My AI Images"
          examples=""
        />
      </div>
      {/* Device Section */}
      <AutoSizer>
        {({ height, width }) => {
          const adjustedHeight = Math.max(height - 61, 150);
          return (
            <Box
              sx={{
                display: 'flex',
                width,
                height: adjustedHeight,
                flexDirection: 'column',
                alignItems: 'center',
                overflow: 'hidden',
                minHeight: 0,
                position: 'relative',
              }}
            >
              <Box
                className="absolute top-2 z-50 mb-2 flex w-full items-center justify-between space-x-2 rounded-lg p-1 px-2"
                sx={{ flexShrink: 0 }}
              >
                <InfoMediaRemaining
                  currentImageCount={imageCount}
                  MaxImage={MAX_IMAGES}
                  hasVideo={hasVideo}
                  MaxVideo={MAX_VIDEO}
                  hasAI={tabValue !== TabValue.BROWSE_GENAI}
                />
                <Tooltip title="Marked as an AI Post. Its prompt may appear in trending suggestions for others to reuse.">
                  <div
                    className={`${imageCount > 0 && hasArtNovaImages ? 'flex' : 'hidden'} items-center space-x-2 rounded-full bg-white px-4 py-1 text-base shadow hover:cursor-pointer`}
                  >
                    <IoSparkles className="mr-2 text-amber-300" />
                    <p>Generated by ArtNova</p>
                  </div>
                </Tooltip>
              </Box>
              <Box
                sx={{
                  height: '100%',
                  minHeight: 0,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
                className="bg-mountain-100 flex h-full w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-500"
              >
                {selectedPreviewMedia ? (
                  <MediaPreviewer media={selectedPreviewMedia} />
                ) : tabValue === TabValue.UPLOAD_MEDIA ? (
                  <SelectDeviceMediaPanel
                    onAddImages={handleImagesAdded}
                    onAddVideo={handleVideoAdded}
                  />
                ) : (
                  <SelectAiImagesPanel />
                )}
              </Box>
              {/* Carousel */}
              <Box
                className="custom-scrollbar flex h-fit space-x-2 pt-3"
                sx={{
                  flexShrink: 0,
                }}
              >
                {postMedias.map((media, i) => (
                  <Box
                    key={i}
                    className="bounce-item relative cursor-pointer rounded-md border-1"
                    sx={{
                      borderColor:
                        selectedPreviewMedia?.file === media.file
                          ? 'primary.main'
                          : 'transparent',
                    }}
                    onClick={() => setSelectedPreviewMedia(media)}
                  >
                    <Avatar
                      src={
                        media.type === MEDIA_TYPE.IMAGE
                          ? media.url
                          : VIDEO_THUMBNAIL_DEFAULT_URL
                      }
                      className="rounded-md"
                      sx={{ width: 80, height: 80 }}
                    />
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMediaPreview(media);
                      }}
                      size="small"
                      className="group absolute -top-2 -right-2 bg-gray-600 opacity-60 hover:bg-gray-400"
                    >
                      <MdClose
                        className="text-sm text-white group-hover:text-black"
                        size={16}
                      />
                    </IconButton>
                  </Box>
                ))}
                <AddMoreMediaButton
                  hidden={
                    (imageCount === 0 && !hasVideo) ||
                    (imageCount === MAX_IMAGES && hasVideo) ||
                    hasArtNovaImages
                  }
                  handleImagesAdded={handleImagesAdded}
                  handleVideoAdded={handleVideoAdded}
                />
              </Box>
            </Box>
          );
        }}
      </AutoSizer>
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="flex w-108 flex-col">
          <DialogHeader>
            <DialogTitle>Change Tab Confirmation</DialogTitle>
            <DialogDescription>
              Switch tabs, your changes will be removed. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-mountain-100 flex items-center justify-center py-6">
            <LuImageOff className="text-mountain-600 size-12" />
          </div>
          <DialogFooter>
            <Button
              className="bg-mountain-100 hover:bg-mountain-100/80"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="text-mountain-50 bg-red-700 hover:bg-red-700/80"
              onClick={() => {
                setPostMedias([]);
                setTabValue(pendingTab!);
                setConfirmDialogOpen(false);
                setSelectedPreviewMedia(null);
                onThumbnailAddedOrRemoved(null);
                setHasArtNovaImages(false);
              }}
            >
              Yes, discard and switch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={matureDialogOpen} onOpenChange={setMatureDialogOpen}>
        <DialogContent className="flex w-108 flex-col">
          <DialogHeader>
            <DialogTitle>Mature content detected</DialogTitle>
            <DialogDescription>
              Your images contain mature content. We will automatically mark
              this post as mature.
            </DialogDescription>
          </DialogHeader>
          {/* <div className="flex justify-center items-center bg-mountain-100 py-6">
            <LuImageOff className="size-12 text-mountain-600" />
          </div> */}
          <DialogFooter>
            <Button
              className="bg-mountain-100 hover:bg-mountain-100/80"
              onClick={() => setMatureDialogOpen(false)}
            >
              Yes, I acknowledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
