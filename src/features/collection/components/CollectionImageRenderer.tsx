import { GalleryPhoto } from '@/components/gallery/Gallery';
import { formatCount } from '@/utils/common';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Images } from 'lucide-react';
import React, { useState } from 'react';
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
}

export const CollectionImageRenderer = (
  context: RenderPhotoContext<GalleryPhoto>,
  options: CollectionImageRendererOptions,
) => {
  const { photo, width, height } = context;
  const { onRemovePost, selectedCollectionId } = options;

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const canDelete = typeof selectedCollectionId === 'number';

  const handleOpenDeleteDialog = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    onRemovePost(photo.postId);
    handleCloseDeleteDialog();
  };

  return (
    <div
      className="group relative cursor-pointer rounded-lg border border-transparent hover:border-gray-300"
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

      <Link to={`/posts/${photo.postId}`} className="block h-full w-full">
        <img
          key={photo.key || photo.src}
          src={photo.src}
          loading="lazy"
          className="h-full w-full rounded-lg object-cover"
          style={{ display: 'block' }}
        />
        {/* Overlay */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-start justify-end rounded-lg bg-gradient-to-b from-transparent via-transparent to-black/70 p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {photo.postLength > 1 && (
            <div className="pointer-events-auto absolute top-2 left-2 flex items-center justify-center rounded-full bg-black/40 p-1">
              <Images size={14} />
            </div>
          )}
          <div className="flex w-full items-end justify-between gap-2">
            <div title={`${photo.title}\n${photo.author}`}>
              <span className="line-clamp-1 text-sm font-semibold">
                {photo.title}
              </span>
              <span className="line-clamp-1 text-xs">{photo.author}</span>
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

      {/* --- Confirmation Dialog --- */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <DialogTitle id="alert-dialog-title">Confirm Removal</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to remove the post "
            {photo.title || 'this post'}" from the collection?
          </DialogContentText>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={handleCloseDeleteDialog} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" autoFocus>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
      {/* --- End Confirmation Dialog --- */}
    </div>
  );
};
