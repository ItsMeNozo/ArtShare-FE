import { useSnackbar } from '@/hooks/useSnackbar';
import { Box, Button } from '@mui/material';
import { Trash2, Upload } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useEffect } from 'react';
import { RiImageCircleAiFill } from 'react-icons/ri';
import { MAX_IMAGE_COUNT } from '../../constants';
import { ImageState } from '../../types';
import AddMoreImagesButton from '../mimics/AddMoreImagesButton';
import SelectAiImagesPanel from '../mimics/SelectGenImages';

interface PostImagesEditorProps {
  images: ImageState[];
  onImagesChange: (images: ImageState[]) => void;
  isInvalid?: boolean;
  canEdit: boolean;
}

const PostImagesEditor = ({
  images = [],
  onImagesChange,
  isInvalid = false,
  canEdit,
}: PostImagesEditorProps) => {
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.status === 'new') {
          URL.revokeObjectURL(image.url);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on unmount

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > MAX_IMAGE_COUNT) {
      showSnackbar('You can only upload up to 4 images', 'warning');
      return;
    }
    const availableSlots = MAX_IMAGE_COUNT - images.length;
    const validImages = files
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, availableSlots);

    const newImageStates: ImageState[] = validImages.map((file) => ({
      id: nanoid(),
      status: 'new',
      file: file,
      url: URL.createObjectURL(file), // Create a temporary local URL for preview
    }));

    onImagesChange([...images, ...newImageStates]);
  };

  const handleRemoveImage = (idToRemove: string) => {
    const imageToRemove = images.find((img) => img.id === idToRemove);
    // Revoke URL for 'new' images to free up memory
    if (imageToRemove && imageToRemove.status === 'new') {
      URL.revokeObjectURL(imageToRemove.url);
    }
    onImagesChange(images.filter((image) => image.id !== idToRemove));
  };

  const handleClearAll = () => {
    images.forEach((image) => {
      if (image.status === 'new') {
        URL.revokeObjectURL(image.url);
      }
    });
    onImagesChange([]);
  };

  console.log('PostImagesEditor images:', images);

  return (
    <Box
      className={`flex h-fit w-full flex-col rounded-lg border bg-white ${isInvalid ? 'border-red-500' : 'border-mountain-200'} ${!canEdit ? 'opacity-70' : ''} `}
    >
      <div className="border-mountain-200 text-mountain-800 flex h-12 items-center justify-between gap-2 rounded-t-md border-b bg-white p-2">
        <div className="flex items-center space-x-2">
          <span>Number of Images: {images.length}</span>
        </div>
        <span className="text-mountain-600 text-sm italic">
          Up to {MAX_IMAGE_COUNT} images
        </span>
      </div>
      <div className="border-mountain-200 flex flex-wrap border-b-1">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-square h-24 w-1/4 shrink-0 overflow-hidden bg-white p-2"
          >
            <img
              src={image.url}
              alt={`Post image preview`}
              className="h-full w-full rounded-md object-cover"
            />
            {image.status === 'existing' && (
              <span className="absolute top-3 left-3 rounded-full bg-blue-500 px-2 py-1 text-xs font-bold text-white">
                Saved
              </span>
            )}
            {/* <div className="hidden top-2 right-2 absolute group-hover:flex bg-white p-2 rounded-full cursor-pointer">
              <Edit className="size-4" />
            </div> */}
            {canEdit && ( // Only show remove button if editable
              <div
                onClick={() => handleRemoveImage(image.id)}
                className="absolute right-3 bottom-3 hidden cursor-pointer rounded-full bg-white p-2 text-red-500 shadow-md group-hover:flex hover:bg-red-50"
              >
                <Trash2 className="size-4" />
              </div>
            )}
          </div>
        ))}
      </div>{' '}
      {canEdit &&
        (images.length === 0 ? (
          <div className="flex w-full justify-center p-2">
            <label
              htmlFor="imageUpload"
              className="border-mountain-200 text-mountain-950 mx-2 flex w-48 cursor-pointer flex-col items-center space-y-2 rounded-md border bg-white px-4 py-2 text-center text-sm font-medium shadow-sm"
            >
              <Upload />
              <p>Upload From Device</p>
            </label>
            <SelectAiImagesPanel>
              <Button
                variant="text"
                component="label"
                className="border-mountain-200 text-mountain-950 mx-2 flex w-48 cursor-pointer flex-col items-center rounded-md border px-4 py-2 text-center text-sm font-medium shadow-sm"
              >
                <RiImageCircleAiFill className="mb-2 size-6" />
                <p>Browse Your Stock</p>
              </Button>
            </SelectAiImagesPanel>
          </div>
        ) : (
          <div className="flex w-full justify-center gap-4 p-2">
            <button
              type="button"
              onClick={handleClearAll}
              className="flex w-1/3 cursor-pointer items-center justify-center gap-2 rounded-md border border-red-200 bg-red-100 px-4 py-2 text-center text-sm font-medium text-red-700 shadow-sm hover:bg-red-200"
            >
              <Trash2 className="size-4" />
              <span>Clear All</span>
            </button>
            {/* <label
              htmlFor="imageUpload"
              className={`${images.length >= MAX_IMAGE_COUNT ? 'pointer-events-none opacity-50' : ''} hover:bg-mountain-50 border-mountain-200 text-mountain-950 flex w-2/3 cursor-pointer items-center justify-center gap-2 rounded-md border bg-white px-4 py-2 text-center text-sm font-medium shadow-sm`}
            >
              <Upload />
              <span>Add More</span>
            </label> */}
            <AddMoreImagesButton
              disabled={images.length >= MAX_IMAGE_COUNT}
              onFileChange={handleFileChange}
            />
          </div>
        ))}
      <input
        id="imageUpload"
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={!canEdit}
      />
    </Box>
  );
};

export default PostImagesEditor;
