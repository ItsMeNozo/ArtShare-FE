import { useUser } from '@/contexts/user';
import { useSnackbar } from '@/hooks/useSnackbar';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { MoreHorizontal } from 'lucide-react';
import { MouseEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { followUser, unfollowUser } from './api/follow.api';
import { getUserProfileByUsername, UserProfile } from './api/user-profile.api';
import ProfileHeader from './components/ProfileHeader';
import ProfileInfo from './components/ProfileInfo';
import ReportDialog from './components/ReportDialog';
import { useReportUser } from './hooks/useReportUser';
import { HiUserAdd } from 'react-icons/hi';
import { BiEdit } from 'react-icons/bi';

export const UserProfileCard = () => {
  const { username } = useParams();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [isHoveringFollowBtn, setIsHoveringFollowBtn] = useState(false);
  const [unfollowInFlight, setUnfollowInFlight] = useState(false);

  console.log('🎭 UserProfileCard rendered with username:', username);

  // Memoize the query function to prevent unnecessary re-renders
  const queryFn = useMemo(() => {
    console.log('🏗️ Creating query function for username:', username);
    return () => getUserProfileByUsername(username);
  }, [username]);

  const {
    data: profileData,
    isLoading,
    isError,
    error,
  } = useQuery<UserProfile, Error>({
    queryKey: ['userProfile', username],
    queryFn,
    enabled: !!username && username.trim() !== '', // Ensure username is not empty
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    retry: (failureCount, error) => {
      // Don't retry on 404 (user not found)
      if (error && 'status' in error && error.status === 404) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });

  useEffect(() => {
    // Once the profile refetch shows isFollowing === false, drop the flag
    if (!profileData?.isFollowing) {
      setUnfollowInFlight(false);
    }
  }, [profileData?.isFollowing]);
  /* ─────────────────── follow / unfollow ────────────── */
  const followMutation = useMutation({
    mutationFn: () => {
      if (!profileData?.id) {
        return Promise.reject(new Error('User ID is undefined'));
      }
      return followUser(profileData.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', username] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', username] });
      showSnackbar('Unfollow successfully.', 'success');
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

  // Dropdown menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (e: MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Report section
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

  const handleEdit = () => {
    handleMenuClose();
    navigate('/edit-user');
  };

  // Conditional rendering based on loading, error, or data state
  if (isLoading || isLoadingReportUser) {
    return (
      <Typography variant="body1" color="textPrimary">
        Loading profile...
      </Typography>
    );
  }

  if (isError) {
    // check if error indicates a 404 (Not Found)
    // to give a more specific "User not found" message.
    // For example, if (error instanceof AxiosError && error.response?.status === 404)
    return (
      <Typography variant="body1" color="textPrimary">
        Error loading profile: {error?.message || 'An unknown error occurred'}
      </Typography>
    );
  }

  // If, after loading and no generic error, profileData is still null/undefined,
  // it implies the user was not found by the API or the API returned no data.
  if (!profileData) {
    return (
      <Typography variant="body1" color="textPrimary">
        User profile not found for "{username}".
      </Typography>
    );
  }

  // Now, profileData exists. Check for incompleteness.
  const isProfileIncomplete =
    !profileData.birthday || // Checks if birthday is null, undefined, or an empty string
    !profileData.username || // Checks if username is null, undefined, or an empty string
    !profileData.full_name; // Checks if full_name is null, undefined, or an empty string

  if (isProfileIncomplete) {
    return (
      <Typography variant="body1" color="textPrimary">
        This user hasn't finished setting up their profile.
      </Typography>
    );
  }

  const toggleFollow = () => {
    if (isFollowing) {
      setUnfollowInFlight(true);
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  const isProcessing = followMutation.isPending || unfollowMutation.isPending;

  const isOwnProfile = user?.id === profileData?.id;
  const isFollowing = profileData?.isFollowing;

  return (
    <div className="flex justify-between items-end pb-4 w-full h-full">
      <div className="flex items-end space-x-4 w-full">
        {profileData.profile_picture_url ? (
          <ProfileHeader
            name={profileData?.full_name ?? ""}
            username={profileData.username || ""}
            avatarUrl={profileData.profile_picture_url}
            isFollowing={false}
          />
        ) : (
          <Box display="flex" alignItems="center">
            <ProfileHeader
              name={profileData?.full_name ?? ""}
              username={profileData?.username ?? ""}
              isFollowing={false}
            />
          </Box>
        )}
        <div className="flex justify-between items-center w-full">
          <ProfileInfo
            name={profileData?.full_name ?? ""}
            username={profileData.username ?? ""}
            bio={profileData.bio || ""}
            followings_count={profileData.followings_count}
            followers_count={profileData.followers_count}
            userId={profileData.id}
          />
          <Box className="flex h-10">
            {!isOwnProfile &&
              (isFollowing ? (
                <Button
                  onClick={toggleFollow}
                  disabled={isProcessing || unfollowInFlight}
                  variant={
                    isHoveringFollowBtn || unfollowInFlight
                      ? "contained"
                      : "outlined"
                  }
                  color={
                    isHoveringFollowBtn || unfollowInFlight
                      ? "error"
                      : "primary"
                  }
                  sx={{ textTransform: "none" }}
                  onMouseEnter={() => setIsHoveringFollowBtn(true)}
                  onMouseLeave={() => setIsHoveringFollowBtn(false)}
                  className="flex"
                >
                  {unfollowInFlight || isHoveringFollowBtn
                    ? "Unfollow"
                    : "Following"}
                </Button>
              ) : (
                <Button
                  onClick={toggleFollow}
                  disabled={isProcessing}
                  variant="contained"
                  color="primary"
                  sx={{ textTransform: "none" }}
                  className="flex w-28"
                >
                  <HiUserAdd className="mr-2 size-4" />
                  <p>Follow</p>
                </Button>
              ))}
            {isOwnProfile && (
              <Button
                onClick={handleEdit}
                disabled={isProcessing}
                variant="contained"
                sx={{ textTransform: "none" }}
                className="flex w-36"
              >
                <BiEdit className="mr-2 size-4" />
                <p>Edit Profile</p>
              </Button>
            )}
            {!isOwnProfile && (
              <Tooltip title="More options" arrow>
                <IconButton
                  aria-label="More options"
                  color="primary"
                  size="medium"
                  sx={{ borderRadius: "50%", bgcolor: "transparent" }}
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
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              className="m-2"
            >
              <MenuItem onClick={() => setDialogOpen(true)}>
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
      />
    </div>
  );
};
