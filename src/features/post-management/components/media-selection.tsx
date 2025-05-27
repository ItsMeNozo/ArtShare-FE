import React, { useState, useEffect, ChangeEvent } from "react";
import { Avatar, Box, IconButton, Tooltip } from "@mui/material";
import {
  MdAdd,
  MdClose,
} from "react-icons/md";
import { MEDIA_TYPE } from "@/utils/constants";
import TabValue from "../enum/media-tab-value";
import MediaUploadTab from "./media-upload-tab";
import AutoSizer from "react-virtualized-auto-sizer";
import { useSnackbar } from "@/contexts/SnackbarProvider";
import { RiImageCircleAiLine } from "react-icons/ri";
import { TbDeviceDesktop } from "react-icons/tb";
import MediaPreview from "./media-preview";
import UploadFromDevice from "./upload-from-device";
import BrowseAiImages from "./browse-ai-image";
import { IoSparkles } from "react-icons/io5";
import InfoMediaRemaining from "./InfoMediaRemaining";
import { PostMedia } from "../types/post-media";
import ConfirmDialog from "@/components/dialogs/Confirm";
import { LuImageOff } from "react-icons/lu";

const MAX_IMAGES = 4;
const MAX_VIDEO = 1;
const VIDEO_THUMBNAIL_DEFAULT_URL = "https://cdn.prod.website-files.com/67862f03f11f4116194d307a/67eff145fcba92bac1eb6bb3_Video-Placeholder.jpg";

interface MediaSelectorPanelProps {
  postMedias: PostMedia[];
  setPostMedias: React.Dispatch<React.SetStateAction<PostMedia[]>>;
  setThumbnailFile: (
    file?: File,
    isOriginal?: boolean,
    thumbnail_crop_meta?: string,
  ) => void;
  hasArtNovaImages: boolean;
  setHasArtNovaImages: React.Dispatch<React.SetStateAction<boolean>>;
}

const validateVideoDuration = (
  file: File,
  maxDurationSec = 60,
): Promise<boolean> => {
  return new Promise((resolve) => {
    const videoElement = document.createElement("video");
    videoElement.preload = "metadata";
    videoElement.onloadedmetadata = () => {
      URL.revokeObjectURL(videoElement.src);
      resolve(videoElement.duration <= maxDurationSec);
    };
    videoElement.onerror = () => resolve(false);
    videoElement.src = URL.createObjectURL(file);
  });
};

export default function MediaSelectorPanel({
  postMedias,
  setPostMedias,
  setThumbnailFile,
  hasArtNovaImages,
  setHasArtNovaImages,
}: MediaSelectorPanelProps) {
  const { showSnackbar } = useSnackbar();

  const [tabValue, setTabValue] = useState<TabValue>(hasArtNovaImages ? TabValue.BROWSE_GENAI : TabValue.UPLOAD_MEDIA);
  const [pendingTab, setPendingTab] = useState<TabValue | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPreviewMedia, setSelectedPreviewMedia] = useState<PostMedia | null>(null);

  const handleTabChange = (newTab: TabValue) => {
    if (hasArtNovaImages && postMedias.length > 0 && newTab !== TabValue.BROWSE_GENAI) {
      setPendingTab(newTab);
      setConfirmDialogOpen(true);
    } else if (newTab !== TabValue.UPLOAD_MEDIA && postMedias.length > 0) {
      setPendingTab(newTab);
      setConfirmDialogOpen(true);
    } else {
      setTabValue(newTab)
    }
  };

  useEffect(() => {
    hasArtNovaImages ? setTabValue(TabValue.BROWSE_GENAI) : setTabValue(TabValue.UPLOAD_MEDIA);
  }, [hasArtNovaImages]);


  const captureThumbnailFromVideo = (videoElement: HTMLVideoElement) => {
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      console.error("Failed to get canvas context");
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        setThumbnailFile(
          new File([blob], "thumbnailFromVideo.png", { type: "image/png" }),
          true,
        );
      } else {
        console.error("Failed to create blob from canvas");
      }
    }, "image/png");
  };

  const handleImagesAdded = (event: ChangeEvent<HTMLInputElement>) => {
    const newFiles = event.target.files;
    if (!newFiles || newFiles.length === 0) return;

    // new post medias
    const newImageMedias = Array.from(newFiles).map((file) => ({
      file,
      type: MEDIA_TYPE.IMAGE,
      url: URL.createObjectURL(file),
    }));
    // combine with existing files
    const combinedMedias = [...postMedias, ...newImageMedias];

    // image count
    const imageCount = combinedMedias.filter(
      (media) => media.type === MEDIA_TYPE.IMAGE,
    ).length;
    if (imageCount > MAX_IMAGES) {
      showSnackbar(
        `You can only upload up to ${MAX_IMAGES} images.`,
        "error",
      );
      return;
    }
    setPostMedias(combinedMedias);

    // first time adding a media
    if (postMedias.length === 0) {
      setThumbnailFile(combinedMedias[0].file, true);
      setHasArtNovaImages?.(false);
    }
  };

  const handleVideoAdded = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const videoFiles = event.target.files;
    if (!videoFiles || videoFiles.length === 0) return;
    if (videoFiles.length > MAX_VIDEO) {
      showSnackbar(
        `You can only upload up to ${MAX_VIDEO} video.`,
        "error",
      );
      return;
    }
    const file = videoFiles[0];

    const isValidDuration = await validateVideoDuration(file, 60);
    if (!isValidDuration) {
      showSnackbar("Video length cannot exceed 1 minute.", "error");
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

    // auto-thumbnail logic
    if (postMedias.length === 0) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = previewUrl;
      video.crossOrigin = "anonymous";

      video.onloadeddata = () => {
        video.currentTime = 0; // Go to the first frame
      };

      video.onseeked = () => {
        captureThumbnailFromVideo(video);
      };

      video.onerror = () => {
        console.error("Invalid video file.");
        URL.revokeObjectURL(previewUrl);
      };
    }
  };

  const handleRemoveMediaPreview = (media: PostMedia) => {
    const { url, file } = media;
    setPostMedias((prev) => prev.filter((media) => media.file !== file));

    if (url?.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
    if (selectedPreviewMedia === media) {
      const nextMedia = postMedias.find((m) => m !== media);
      setSelectedPreviewMedia(nextMedia || null);
    }
    // if the last preview is removed, set selectedPreviewMedia to null
    if (postMedias.length === 1) {
      setSelectedPreviewMedia(null);
      setThumbnailFile(undefined, true);
    }
    // if removing the last AI image
    if (postMedias.length === 1 && hasArtNovaImages) {
      setHasArtNovaImages(false);
    }
  }


  if (!selectedPreviewMedia && postMedias.length > 0) {
    setSelectedPreviewMedia(postMedias[0]);
  }

  const imageCount = postMedias.filter(
    (media) => media.type === MEDIA_TYPE.IMAGE,
  ).length;
  const hasVideo = postMedias.filter(
    (media) => media.type === MEDIA_TYPE.VIDEO,
  ).length > 0;

  return (
    <Box className="flex flex-col items-start dark:bg-mountain-900 rounded-md w-[60%] h-full text-gray-900 dark:text-white">
      {/* Tabs */}
      <div className="z-20 flex gap-x-1 bg-white mb-3 p-1.25 border border-mountain-200 rounded-full w-full">
        <MediaUploadTab
          isActive={tabValue === TabValue.UPLOAD_MEDIA}
          onClick={() => handleTabChange(TabValue.UPLOAD_MEDIA)}
          icon={<TbDeviceDesktop className="mr-0.5 w-5 h-5" />}
          label="Upload from Device"
          examples="(images, video)"
        />
        <MediaUploadTab
          isActive={tabValue === TabValue.BROWSE_GENAI}
          onClick={() => handleTabChange(TabValue.BROWSE_GENAI)}
          icon={<RiImageCircleAiLine className="mr-2 w-5 h-5 text-sm" />}
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
                flexDirection: "column",
                alignItems: "center",
                overflow: "hidden",
                minHeight: 0,
                position: "relative"
              }}
            >
              <Box
                className="top-2 z-50 absolute flex justify-between items-center space-x-2 mb-2 p-1 px-2 rounded-lg w-full"
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
                  <div className={`${imageCount > 0 && hasArtNovaImages ? 'flex' : 'hidden'} hover:cursor-pointer text-base items-center space-x-2 px-4 py-1 bg-white shadow rounded-full`}>
                    <IoSparkles className="mr-2 text-amber-300" />
                    <p>Generated by ArtNova</p>
                  </div>
                </Tooltip>
              </Box>
              <Box
                sx={{
                  height: "100%",
                  minHeight: 0,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
                className="flex flex-col justify-center items-center bg-mountain-100 border border-gray-500 border-dashed rounded-lg w-full h-full"
              >
                {selectedPreviewMedia ? (
                  <MediaPreview
                    media={selectedPreviewMedia}
                  />
                ) : (
                  tabValue === TabValue.UPLOAD_MEDIA ? (
                    <UploadFromDevice
                      onAddImages={handleImagesAdded}
                      onAddVideo={handleVideoAdded}
                    />
                  ) : (
                    <BrowseAiImages
                      handleImageFilesChange={handleImagesAdded}
                    />
                  )
                )}
              </Box>
              {/* Carousel */}
              <Box
                className="flex space-x-2 pt-3 h-fit custom-scrollbar"
                sx={{ flexShrink: 0, overflowX: "hidden" }}
              >
                {postMedias.map(
                  (media, i) => (
                    <Box
                      key={i}
                      className="relative border-1 rounded-md cursor-pointer bounce-item"
                      sx={{
                        borderColor:
                          selectedPreviewMedia?.file === media.file
                            ? "primary.main"
                            : "transparent",
                      }}
                      onClick={() => setSelectedPreviewMedia(media)}
                    >
                      <Avatar
                        src={
                          media.type === MEDIA_TYPE.IMAGE
                            ? media.url
                            : VIDEO_THUMBNAIL_DEFAULT_URL}
                        className="rounded-md"
                        sx={{ width: 80, height: 80 }}
                      />
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveMediaPreview(media);
                        }}
                        size="small"
                        className="group -top-2 -right-2 absolute bg-gray-600 hover:bg-gray-400 opacity-60"
                      >
                        <MdClose
                          className="text-white group-hover:text-black text-sm"
                          size={16}
                        />
                      </IconButton>
                    </Box>
                  ),
                )}
                <Box
                  className="flex justify-center items-center border border-mountain-600 rounded-md w-[80px] h-[80px] text-gray-900 dark:text-white cursor-pointer"
                  component="label"
                  hidden={
                    (imageCount === 0 && !hasVideo)
                    || imageCount === MAX_IMAGES
                    || hasArtNovaImages
                  }
                >
                  <MdAdd size={32} />
                  <input
                    accept="image/*"
                    type="file"
                    multiple
                    hidden
                    onChange={handleImagesAdded}
                  />
                </Box>
              </Box>
            </Box>
          );
        }}
      </AutoSizer>
      <ConfirmDialog
        title="Change Tab Confirmation"
        description="Switch tabs, your changes will be removed. Are you sure?"
        confirmMessage="Yes, discard and switch"
        icon={<LuImageOff className="size-12 text-mountain-600" />}
        open={confirmDialogOpen}
        onCancel={() => setConfirmDialogOpen(false)}
        onConfirm={() => {
          setPostMedias([]);
          setTabValue(pendingTab!);
          setConfirmDialogOpen(false);
          setSelectedPreviewMedia(null);
          setThumbnailFile(undefined, true);
          setHasArtNovaImages(false);
        }}
      />
    </Box>
  );
}
