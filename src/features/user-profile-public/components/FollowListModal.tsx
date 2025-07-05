// src/components/FollowListModal.tsx
import {
  Avatar,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';
import BoringAvatar from 'boring-avatars';
import { X } from 'lucide-react';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

export interface FollowListModalProps {
  open: boolean;
  title: string;
  loading: boolean;
  error?: Error;
  data?: Array<{
    id: string;
    username: string;
    fullName: string | null;
    profilePictureUrl: string | null;
  }>;
  onClose: () => void;
}

const FollowListModal: FC<FollowListModalProps> = ({
  open,
  title,
  loading,
  error,
  data,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleUserClick = (username: string) => {
    navigate(`/${username}`);
    onClose(); // Close the modal after navigation
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ m: 0, p: 2 }}>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
          size="large"
        >
          <X />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">Error: {error.message}</Typography>
        ) : data && data.length > 0 ? (
          <List>
            {data.map((user) => (
              <ListItem
                key={user.id}
                component="div"
                disablePadding
                onClick={() => handleUserClick(user.username)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  transition: 'background-color 0.2s ease-in-out',
                  px: 2,
                  py: 1,
                }}
                role="button"
                aria-label={`Navigate to ${user.username}'s profile`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleUserClick(user.username);
                  }
                }}
              >
                <ListItemAvatar>
                  {user.profilePictureUrl ? (
                    <Avatar
                      src={user.profilePictureUrl}
                      alt={user.username}
                    />
                  ) : (
                    <BoringAvatar
                      size={40}
                      name={user.username}
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
                    <Typography fontWeight={500}>
                      {user.fullName || user.username}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      @{user.username}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography textAlign="center" color="textSecondary">
            No {title.toLowerCase()} found.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FollowListModal;
