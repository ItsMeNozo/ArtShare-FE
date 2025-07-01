import { ReportTargetType } from "@/features/user-profile-public/api/report.api";
import ReportDialog from "@/features/user-profile-public/components/ReportDialog";
import { useReport } from "@/features/user-profile-public/hooks/useReport";
import { auth } from "@/firebase";
import { useSnackbar } from "@/hooks/useSnackbar";
import { Post, User } from "@/types";
import { extractReportErrorMessage } from "@/utils/error.util";
import { Box, CardContent, CardHeader, IconButton } from "@mui/material";
import Avatar from "boring-avatars";
import { X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDeletePost } from "../hooks/useDeletePost";
import { PostMenu } from "./PostMenu";

const PostArtist = ({ artist, postData }: { artist: User; postData: Post }) => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const currentUser = auth.currentUser;
  const isOwner = currentUser && postData.user_id === currentUser.uid;

  const { mutate: deletePostQuery } = useDeletePost({
    onSuccess: () => {
      navigate(`/${postData.user.username}`);
      showSnackbar("Post successfully deleted!", "success");
    },
    onError: (errorMessage) => {
      showSnackbar(errorMessage, "error");
    },
  });

  const handleEdit = () => {
    navigate(`/post/${postData.id}/edit`, {
      state: { postData },
    });
  };

  const handleDelete = async () => {
    deletePostQuery(postData.id);
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const { mutate: reportPost, isPending: isLoadingReportUser } = useReport();

  const handleReport = (reason: string) => {
    reportPost(
      {
        targetId: postData?.id,
        reason,
        targetType: ReportTargetType.POST,
        targetTitle: postData?.title,
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          showSnackbar(
            "Your report will be reviewed soon! Thanks for your report",
            "success",
          );
        },
        onError: (err) => {
          const displayMessage = extractReportErrorMessage(
            err,
            ReportTargetType.POST,
          );
          showSnackbar(displayMessage, "error");
        },
      },
    );
  };

  if (!artist) {
    return (
      <div className="flex items-center justify-center m-4">
        Artist not found or data is unavailable.
      </div>
    );
  }

  return (
    <div className="p-4 bg-white shadow dark:bg-mountain-950 md:border-b md:border-b-mountain-200 rounded-2xl md:rounded-b-none overflow-none">
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
        className="flex flex-col gap-4 p-2 transition-colors duration-200 rounded-lg cursor-pointer group hover:bg-gray-50 dark:hover:bg-mountain-800/50"
        onClick={() => navigate(`/${artist.username}`)}
      >
        <div className="flex gap-4 cursor-pointer">
          <div className="flex-shrink-0 overflow-hidden transition-all duration-200 rounded-full ring-2 ring-transparent group-hover:ring-blue-500/30">
            {artist.profile_picture_url ? (
              <img
                src={artist.profile_picture_url}
                className="object-cover w-20 h-20"
                alt={`${artist.username}'s profile`}
              />
            ) : (
              <Avatar
                name={artist.username || "Unknown"}
                colors={["#84bfc3", "#ff9b62", "#d96153"]}
                variant="beam"
                size={80}
              />
            )}
          </div>
          <div className="flex flex-col pt-0.5">
            <div className="text-xl font-bold transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {artist.full_name || "Unknown fullname"}
            </div>
            <div className="text-sm transition-colors duration-200 line-clamp-1 group-hover:text-blue-500 dark:group-hover:text-blue-300">
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
