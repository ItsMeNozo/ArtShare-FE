import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { ImageUpIcon } from 'lucide-react';
import React from 'react';
import { MdMoreVert } from 'react-icons/md';

interface ThumbnailCardProps {
  thumbnail?: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChange: () => void;
  onDownload?: () => void;
  onAutoGenerate?: () => void;
}

const ThumbnailCard: React.FC<ThumbnailCardProps> = ({
  thumbnail,
  onUpload,
  onChange,
  onDownload,
  onAutoGenerate,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <Box
      sx={{
        width: 90, // width (e.g., 90px)
        height: 160, // height (e.g., 160px) → 9:16 aspect ratio
        border: '1px dashed gray',
        borderRadius: 1,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1e1e1e',
        cursor: 'pointer',
      }}
    >
      {thumbnail ? (
        <>
          <img
            src={thumbnail}
            alt="Thumbnail"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <IconButton
            size="small"
            onClick={handleMenuClick}
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
            }}
          >
            <MdMoreVert size={18} />
          </IconButton>

          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem
              onClick={() => {
                handleClose();
                onChange();
              }}
            >
              Change
            </MenuItem>
            {onDownload && (
              <MenuItem
                onClick={() => {
                  handleClose();
                  onDownload();
                }}
              >
                Download
              </MenuItem>
            )}
            {onAutoGenerate && (
              <MenuItem
                onClick={() => {
                  handleClose();
                  onAutoGenerate();
                }}
              >
                Auto-generate
              </MenuItem>
            )}
          </Menu>
        </>
      ) : (
        <label htmlFor="thumbnail-upload">
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            color="gray"
          >
            <ImageUpIcon fontSize="large" />
            <Typography variant="body2">Upload file</Typography>
          </Box>
          <input
            type="file"
            id="thumbnail-upload"
            hidden
            accept="image/*"
            onChange={onUpload}
          />
        </label>
      )}
    </Box>
  );
};

export default ThumbnailCard;
