import { useUser } from '@/contexts/user';
import { ReportTargetType } from '@/features/user-profile-public/api/report.api';
import ReportDialog from '@/features/user-profile-public/components/ReportDialog';
import { useReport } from '@/features/user-profile-public/hooks/useReport';
import { useSnackbar } from '@/hooks/useSnackbar';
import { Post, User } from '@/types';
import { extractReportErrorMessage } from '@/utils/error.util';
import { Box, CardContent, CardHeader, IconButton } from '@mui/material';
import Avatar from 'boring-avatars';
import { X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDeletePost } from '../hooks/useDeletePost';
import { PostMenu } from './PostMenu';

interface PostArtistProps {
  artist: User;
  postData: Post;
}

const PostArtist: React.FC<PostArtistProps> = ({ artist, postData }) => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { user: currentUser } = useUser();
  const [dialogOpen, setDialogOpen] = useState(false);

  const isOwner = currentUser && postData.userId === currentUser.id;

  const { mutate: deletePostQuery } = useDeletePost({
    onSuccess: () => {
      navigate(`/u/${postData.user.username}`);
      showSnackbar('Post successfully deleted!', 'success');
    },
    onError: (errorMessage) => {
      showSnackbar(errorMessage, 'error');
    },
  });

  const { mutate: reportPost, isPending: isLoadingReportUser } = useReport();

  const handleEdit = useCallback(() => {
    navigate(`/post/${postData.id}/edit`);
  }, [navigate, postData.id]);

  const handleDelete = useCallback(() => {
    deletePostQuery(postData.id);
  }, [deletePostQuery, postData.id]);

  const handleReport = useCallback(
    (reason: string) => {
      reportPost(
        {
          targetId: postData.id,
          reason,
          targetType: ReportTargetType.POST,
          targetTitle: postData.title,
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
            const displayMessage = extractReportErrorMessage(
              err,
              ReportTargetType.POST,
            );
            showSnackbar(displayMessage, 'error');
          },
        },
      );
    },
    [reportPost, postData, showSnackbar],
  );

  const navigateToProfile = useCallback(() => {
    navigate(`/u/${artist.username}`);
  }, [navigate, artist.username]);

  if (!artist) {
    return (
      <div className="m-4 flex items-center justify-center">
        Artist not found or data is unavailable.
      </div>
    );
  }

  return (
    <div className="dark:bg-mountain-950 md:border-b-mountain-200 rounded-2xl bg-white p-4 md:rounded-b-none md:border-b">
      <CardHeader
        className="p-0"
        action={
          <Box display="flex" gap={1}>
            <PostMenu
              isOwner={!!isOwner}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReport={() => setDialogOpen(true)}
            />
            <Link to="/explore">
              <IconButton>
                <X />
              </IconButton>
            </Link>
          </Box>
        }
      />

      <CardContent
        className="group dark:hover:bg-mountain-800/50 flex cursor-pointer flex-col gap-4 rounded-lg p-2 transition-colors duration-200 hover:bg-gray-50"
        onClick={navigateToProfile}
      >
        <div className="flex gap-4">
          <div className="flex-shrink-0 overflow-hidden rounded-full ring-2 ring-transparent transition-all duration-200 group-hover:ring-blue-500/30">
            {artist.profilePictureUrl ? (
              <img
                src={artist.profilePictureUrl}
                className="h-20 w-20 object-cover"
                alt={`${artist.username}'s profile`}
                loading="lazy"
              />
            ) : (
              <Avatar
                name={artist.username || 'Unknown'}
                colors={['#84bfc3', '#ff9b62', '#d96153']}
                variant="beam"
                size={80}
              />
            )}
          </div>
          <div className="flex flex-col pt-0.5">
            <div className="text-xl font-bold transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {artist.fullName || 'Unknown fullname'}
            </div>
            <div className="line-clamp-1 text-sm transition-colors duration-200 group-hover:text-blue-500 dark:group-hover:text-blue-300">
              @{artist.username}
            </div>
          </div>
        </div>
      </CardContent>

      <ReportDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleReport}
        submitting={isLoadingReportUser}
      />
    </div>
  );
};

export default PostArtist;
