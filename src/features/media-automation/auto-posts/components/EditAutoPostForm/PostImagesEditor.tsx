import { Box } from '@mui/material';
import { Trash2, Upload } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useEffect } from 'react';
import { RiImageCircleAiFill } from 'react-icons/ri';
import { MAX_IMAGE_COUNT } from '../../constants';
import { ImageState } from '../../types';

interface PostImagesEditorProps {
  images: ImageState[];
  onImagesChange: (images: ImageState[]) => void;
  isInvalid?: boolean;
}

const PostImagesEditor = ({
  images = [],
  onImagesChange,
  isInvalid = false,
}: PostImagesEditorProps) => {
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
    console.log('Selected files:', files);
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
      className={`border-mountain-200 flex h-fit w-full flex-col rounded-lg border bg-white ${isInvalid ? 'border-red-500' : 'border-mountain-200'
        }`}
    >
      <div className="flex justify-between items-center gap-2 bg-white p-2 border-mountain-200 border-b rounded-t-md h-12 text-mountain-800">
        <div className="flex items-center space-x-2">
          <span>Number of Images: {images.length}</span>
        </div>
        <span className="text-mountain-600 text-sm italic">
          Up to {MAX_IMAGE_COUNT} images
        </span>
      </div>
      <div className="flex flex-wrap border-mountain-200 border-b-1">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative bg-white p-2 w-1/4 h-24 aspect-square overflow-hidden shrink-0"
          >
            <img
              src={image.url}
              alt={`Post image preview`}
              className="rounded-md w-full h-full object-cover"
            />
            {image.status === 'existing' && (
              <span className="top-3 left-3 absolute bg-blue-500 px-2 py-1 rounded-full font-bold text-white text-xs">
                Saved
              </span>
            )}
            {/* <div className="hidden top-2 right-2 absolute group-hover:flex bg-white p-2 rounded-full cursor-pointer">
              <Edit className="size-4" />
            </div> */}
            <div
              onClick={() => handleRemoveImage(image.id)}
              className="hidden right-3 bottom-3 absolute group-hover:flex bg-white hover:bg-red-50 shadow-md p-2 rounded-full text-red-500 cursor-pointer"
            >
              <Trash2 className="size-4" />
            </div>
          </div>
        ))}
      </div>
      {images.length === 0 ? (
        <div className="flex justify-center p-2 w-full">
          <label
            htmlFor="imageUpload"
            className="flex flex-col items-center space-y-2 bg-white shadow-sm mx-2 px-4 py-2 border border-mountain-200 rounded-md w-48 font-medium text-mountain-950 text-sm text-center cursor-pointer"
          >
            <Upload />
            <p>Upload From Device</p>
          </label>
          <label
            htmlFor="imageUpload"
            className="flex flex-col items-center space-y-2 bg-white shadow-sm mx-2 px-4 py-2 border border-mountain-200 rounded-md w-48 font-medium text-mountain-950 text-sm text-center cursor-pointer"
          >
            <RiImageCircleAiFill className="size-6" />
            <p>Browse Your Stock</p>
          </label>
        </div>
      ) : (
        <div className="flex justify-center gap-4 p-2 w-full">
          <button
            type="button"
            onClick={handleClearAll}
            className="flex justify-center items-center gap-2 bg-red-100 hover:bg-red-200 shadow-sm px-4 py-2 border border-red-200 rounded-md w-1/3 font-medium text-red-700 text-sm text-center cursor-pointer"
          >
            <Trash2 className="size-4" />
            <span>Clear All</span>
          </button>
          <label
            htmlFor="imageUpload"
            className={`${images.length >= MAX_IMAGE_COUNT ? 'opacity-50 pointer-events-none' : ''} flex justify-center items-center gap-2 bg-white hover:bg-mountain-50 shadow-sm px-4 py-2 border border-mountain-200 rounded-md w-2/3 font-medium text-mountain-950 text-sm text-center cursor-pointer`}
          >
            <Upload />
            <span>Add More</span>
          </label>
        </div>
      )}
      <input
        id="imageUpload"
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </Box>
  );
};

export default PostImagesEditor;
