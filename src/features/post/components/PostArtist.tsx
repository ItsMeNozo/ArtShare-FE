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
      navigate(`/${postData.user.username}`);
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
    navigate(`/${artist.username}`);
  }, [navigate, artist.username]);

  if (!artist) {
    return (
      <div className="flex justify-center items-center m-4">
        Artist not found or data is unavailable.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-mountain-950 p-4 md:border-b md:border-b-mountain-200 rounded-2xl md:rounded-b-none">
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
        className="group flex flex-col gap-4 hover:bg-gray-50 dark:hover:bg-mountain-800/50 p-2 rounded-lg transition-colors duration-200 cursor-pointer"
        onClick={navigateToProfile}
      >
        <div className="flex gap-4">
          <div className="flex-shrink-0 rounded-full ring-2 ring-transparent group-hover:ring-blue-500/30 overflow-hidden transition-all duration-200">
            {artist.profilePictureUrl ? (
              <img
                src={artist.profilePictureUrl}
                className="w-20 h-20 object-cover"
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
            <div className="font-bold dark:group-hover:text-blue-400 group-hover:text-blue-600 text-xl transition-colors duration-200">
              {artist.fullName || 'Unknown fullname'}
            </div>
            <div className="dark:group-hover:text-blue-300 group-hover:text-blue-500 text-sm line-clamp-1 transition-colors duration-200">
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
