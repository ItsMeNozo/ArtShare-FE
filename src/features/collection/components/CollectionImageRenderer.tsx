import ConfirmationDialog from '@/components/ConfirmationDialog';
import { GalleryPhoto } from '@/components/gallery/Gallery';
import { useConfirmationDialog } from '@/hooks/useConfirmationDialog';
import { formatCount } from '@/utils/common';
import { IconButton, Tooltip } from '@mui/material';
import { Images } from 'lucide-react';
import React from 'react';
import { AiOutlineLike } from 'react-icons/ai';
import { BiCommentDetail } from 'react-icons/bi';
import { FiX as DeleteIcon } from 'react-icons/fi';
import { HiOutlineEye } from 'react-icons/hi';
import { RenderPhotoContext } from 'react-photo-album';
import { Link } from 'react-router-dom';
import { SelectedCollectionId } from '../types/collection';

export interface CollectionImageRendererOptions {
  selectedCollectionId: SelectedCollectionId;
  onRemovePost: (postId: number) => void;
  isReadOnly?: boolean;
}

export const CollectionImageRenderer = (
  context: RenderPhotoContext<GalleryPhoto>,
  options: CollectionImageRendererOptions,
) => {
  const { photo, width, height } = context;
  const { onRemovePost, selectedCollectionId, isReadOnly = false } = options;

  const {
    isDialogOpen,
    itemToConfirm: postToRemove,
    openDialog,
    closeDialog,
  } = useConfirmationDialog<number>();

  const canDelete = typeof selectedCollectionId === 'number' && !isReadOnly;

  const handleOpenDeleteDialog = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    openDialog(photo.postId);
  };

  const handleConfirmDelete = () => {
    if (postToRemove) {
      onRemovePost(postToRemove);
    }
    closeDialog();
  };

  return (
    <div
      className="relative border border-transparent rounded-lg cursor-pointer group hover:border-gray-300"
      style={{
        height: height,
        width: width,
      }}
    >
      {/* --- Delete Button --- */}
      {canDelete && (
        <Tooltip title="Remove from collection">
          <IconButton
            aria-label="Remove from collection"
            size="small"
            onClick={handleOpenDeleteDialog}
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              zIndex: 10,
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              opacity: 0,
              transition: 'opacity 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(200, 0, 0, 0.8)',
                opacity: 1,
              },
              '.group:hover &': {
                opacity: 1,
              },
            }}
          >
            <DeleteIcon fontSize={20} />
          </IconButton>
        </Tooltip>
      )}
      {/* --- End Delete Button --- */}

      <Link to={`/posts/${photo.postId}`} className="block w-full h-full">
        <img
          key={photo.key || photo.src}
          src={photo.src}
          className="object-cover w-full h-full rounded-lg"
          style={{ display: 'block' }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 flex flex-col items-start justify-end p-4 text-white transition-opacity duration-300 rounded-lg opacity-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/70 group-hover:opacity-100">
          {photo.postLength > 1 && (
            <div className="absolute flex items-center justify-center p-1 rounded-full pointer-events-auto top-2 left-2 bg-black/40">
              <Images size={14} />
            </div>
          )}
          <div className="flex items-end justify-between w-full gap-2">
            <div title={`${photo.title}\n${photo.author}`}>
              <span className="text-sm font-semibold line-clamp-1">
                {photo.title}
              </span>
              <span className="text-xs line-clamp-1">{photo.author}</span>
            </div>
            <div className="flex flex-col items-end space-y-0.5">
              <div className="flex items-center space-x-1">
                <p className="text-xs font-medium">
                  {formatCount(photo.likeCount)}
                </p>
                <AiOutlineLike className="size-3.5" />
              </div>
              <div className="flex items-center space-x-1">
                <p className="text-xs font-medium">
                  {formatCount(photo.commentCount)}
                </p>
                <BiCommentDetail className="size-3.5 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                <p className="text-xs font-medium">
                  {formatCount(photo.viewCount)}
                </p>
                <HiOutlineEye className="size-3.5" />
              </div>
            </div>
          </div>
        </div>
      </Link>

      <ConfirmationDialog
        open={isDialogOpen}
        onClose={closeDialog}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete Post"
        contentText={`Are you sure you want to remove the post "${
          photo.title || 'this post'
        }" from the collection?`}
        confirmButtonText="Remove"
      />
    </div>
  );
};
