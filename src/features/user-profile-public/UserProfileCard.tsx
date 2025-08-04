import { useUser } from '@/contexts/user';
import { useSnackbar } from '@/hooks/useSnackbar';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { MoreHorizontal } from 'lucide-react';
import { MouseEvent, useState } from 'react';
import { BiEdit } from 'react-icons/bi';
import { HiUserAdd } from 'react-icons/hi';
import { useNavigate, useParams } from 'react-router-dom';
import { followUser, unfollowUser } from './api/follow.api';
import { UserProfile } from './api/user-profile.api';
import ProfileHeader from './components/ProfileHeader';
import ProfileInfo from './components/ProfileInfo';
import ReportDialog from './components/ReportDialog';
import { useReportUser } from './hooks/useReportUser';
import { useUserProfile } from './hooks/useUserProfile';

export const UserProfileCard = () => {
  const { username } = useParams();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [isHoveringFollowBtn, setIsHoveringFollowBtn] = useState(false);

  const {
    data: profileData,
    isLoading,
    isRefetching,
    isError,
    error,
  } = useUserProfile(username);

  const isCardLoading = isLoading || isRefetching;

  const followMutation = useMutation({
    mutationFn: () => {
      if (!profileData?.id) {
        return Promise.reject(new Error('User ID is undefined'));
      }
      return followUser(profileData.id);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['userProfile', username] });

      const previousProfileData = queryClient.getQueryData<UserProfile>([
        'userProfile',
        username,
      ]);

      // 3. Optimistically update to the new value
      if (previousProfileData) {
        queryClient.setQueryData<UserProfile>(['userProfile', username], {
          ...previousProfileData,
          isFollowing: true,
          followersCount: previousProfileData.followersCount + 1,
        });
      }

      return { previousProfileData };
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ['userProfile', username] });
      showSnackbar('Followed successfully.', 'success');
    },
    onError: (error: unknown) => {
      let msg = 'Failed to follow user.';
      if (error instanceof AxiosError && error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error instanceof Error) {
        msg = error.message;
      }
      showSnackbar(msg, 'error');
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => {
      if (!profileData?.id) {
        return Promise.reject(new Error('User ID is undefined'));
      }
      return unfollowUser(profileData.id);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['userProfile', username] });
      const previousProfileData = queryClient.getQueryData<UserProfile>([
        'userProfile',
        username,
      ]);
      if (previousProfileData) {
        queryClient.setQueryData<UserProfile>(['userProfile', username], {
          ...previousProfileData,
          isFollowing: false,
          followersCount: previousProfileData.followersCount - 1,
        });
      }
      return { previousProfileData };
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ['userProfile', username] });
      showSnackbar('Unfollowed successfully.', 'success');
    },
    onError: (error: unknown) => {
      let msg = 'Failed to unfollow user.';
      if (error instanceof AxiosError && error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error instanceof Error) {
        msg = error.message;
      }
      showSnackbar(msg, 'error');
    },
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (e: MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleEdit = () => {
    handleMenuClose();
    navigate('/edit-user');
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const { mutate: reportUser, isPending: isLoadingReportUser } =
    useReportUser();

  const handleReport = (reason: string) => {
    reportUser(
      {
        targetId: 1,
        userId: profileData?.id,
        reason,
        targetTitle: profileData?.username || '',
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          showSnackbar(
            'Your report will be reviewed soon! Thanks for your report',
            'success',
          );
        },
        onError: (err) => {
          showSnackbar(err.message, 'error');
        },
      },
    );
  };

  if (isCardLoading || isLoadingReportUser) {
    return (
      <Box className="flex w-full items-center justify-center">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Typography variant="body1" color="error">
        Error loading profile: {error?.message || 'An unknown error occurred'}
      </Typography>
    );
  }

  if (!profileData) {
    return (
      <Typography variant="body1" color="textPrimary">
        User profile not found for "{username}".
      </Typography>
    );
  }

  const isProfileIncomplete =
    !profileData.birthday || !profileData.username || !profileData.fullName;

  if (isProfileIncomplete) {
    return (
      <Typography variant="body1" color="textSecondary">
        This user hasn't finished setting up their profile.
      </Typography>
    );
  }

  const isProcessingMutation =
    followMutation.isPending || unfollowMutation.isPending;
  const isOwnProfile = user?.id === profileData.id;
  const isFollowing = profileData.isFollowing;

  const toggleFollow = () => {
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  return (
    <div className="flex h-full w-full items-end justify-between pb-4">
      <div className="flex w-full items-end space-x-4">
        {/* FIX: Provide fallbacks to satisfy strict string and string | undefined props */}
        <ProfileHeader
          name={profileData.fullName ?? ''}
          username={profileData.username ?? ''}
          avatarUrl={profileData.profilePictureUrl ?? undefined}
          isFollowing={isFollowing}
        />
        <div className="flex w-full items-center justify-between">
          {/* FIX: Provide fallbacks here as well */}
          <ProfileInfo
            name={profileData.fullName ?? ''}
            username={profileData.username ?? ''}
            bio={profileData.bio || ''}
            followingsCount={profileData.followingsCount}
            followersCount={profileData.followersCount}
            userId={profileData.id}
          />
          <Box className="flex h-10 items-center space-x-2">
            {!isOwnProfile &&
              (isFollowing ? (
                <Button
                  onClick={toggleFollow}
                  disabled={isProcessingMutation}
                  variant={isHoveringFollowBtn ? 'contained' : 'outlined'}
                  color={isHoveringFollowBtn ? 'error' : 'primary'}
                  sx={{ textTransform: 'none', width: '112px' }}
                  onMouseEnter={() => setIsHoveringFollowBtn(true)}
                  onMouseLeave={() => setIsHoveringFollowBtn(false)}
                >
                  {isHoveringFollowBtn ? 'Unfollow' : 'Following'}
                </Button>
              ) : (
                <Button
                  onClick={toggleFollow}
                  disabled={isProcessingMutation}
                  variant="contained"
                  color="primary"
                  sx={{ textTransform: 'none', width: '112px' }}
                >
                  <HiUserAdd className="mr-2 size-4" />
                  Follow
                </Button>
              ))}
            {isOwnProfile && (
              <Button
                onClick={handleEdit}
                variant="contained"
                sx={{ textTransform: 'none', width: '144px' }}
              >
                <BiEdit className="mr-2 size-4" />
                Edit Profile
              </Button>
            )}
            {!isOwnProfile && (
              <Tooltip title="More options" arrow>
                <IconButton
                  aria-label="More options"
                  color="primary"
                  size="medium"
                  onClick={handleMenuOpen}
                >
                  <MoreHorizontal />
                </IconButton>
              </Tooltip>
            )}
            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem
                onClick={() => {
                  setDialogOpen(true);
                  handleMenuClose();
                }}
              >
                Report User
              </MenuItem>
            </Menu>
          </Box>
        </div>
      </div>
      <ReportDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleReport}
        submitting={isLoadingReportUser}
        itemType="user"
        itemName={profileData.username}
      />
    </div>
  );
};
