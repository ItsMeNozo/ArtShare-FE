import { TargetType } from '@/utils/constants';
import { useMediaQuery } from '@mui/material';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import { Theme, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import BoringAvatar from 'boring-avatars';
import React, { useEffect, useState } from 'react';
import { FiX as CloseIcon } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { fetchBlogLikingUsers, fetchPostLikingUsers } from './api/likes.api';
import type { LikingUser } from './types/user';

interface LikesDialogProps {
  contentId?: number;
  open: boolean;
  onClose: () => void;
  variant: TargetType;
}

/**
 * Dialog to show users who liked a post or blog.
 * Uses `variant` to pick the correct fetch function.
 */
export const LikesDialog: React.FC<LikesDialogProps> = ({
  contentId,
  open,
  onClose,
  variant,
}) => {
  const [likingUsers, setLikingUsers] = useState<LikingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const theme = useTheme<Theme>();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!open || !contentId) {
      setLikingUsers([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // choose fetcher based on variant
    const fetcher =
      variant === TargetType.BLOG ? fetchBlogLikingUsers : fetchPostLikingUsers;

    fetcher(contentId)
      .then(setLikingUsers)
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Failed to load likes.');
      })
      .finally(() => setLoading(false));
  }, [open, contentId, variant]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      aria-labelledby="likes-dialog-title"
      maxWidth={false}
      fullScreen={fullScreen}
      sx={{
        '& .MuiDialog-paper': {
          width: 400,
          height: '60vh',
          mx: 'auto',
        },
      }}
    >
      <DialogTitle
        id="likes-dialog-title"
        sx={{ display: 'flex', justifyContent: 'space-between', pr: 2 }}
      >
        Liked by
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {loading && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && likingUsers.length === 0 && (
          <Typography variant="body2" sx={{ p: 3, textAlign: 'center' }}>
            No one has liked this yet.
          </Typography>
        )}

        {!loading && !error && likingUsers.length > 0 && (
          <List dense disablePadding>
            {likingUsers.map((u) => (
              <ListItem
                key={u.id}
                sx={{
                  px: 2,
                  py: 1,
                  cursor: 'pointer',
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  transition: 'background-color 0.2s ease-in-out',
                }}
                role="button"
                aria-label={`Navigate to ${u.username}'s profile`}
                onClick={() => navigate(`/${u.username}`)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/${u.username}`);
                  }
                }}
              >
                <ListItemAvatar>
                  {u.profilePictureUrl ? (
                    <Avatar src={u.profilePictureUrl} />
                  ) : (
                    <BoringAvatar
                      size={40}
                      name={u.username}
                      variant="beam"
                      colors={[
                        '#84bfc3',
                        '#fff5d6',
                        '#ffb870',
                        '#d96153',
                        '#000511',
                      ]}
                    />
                  )}
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Typography noWrap fontWeight={500}>
                      {u.fullName || u.username}
                    </Typography>
                  }
                  secondary={
                    <Typography noWrap variant="caption" color="text.secondary">
                      @{u.username}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};
