import { useLoading } from "@/contexts/Loading/useLoading";
import { extractApiErrorMessage } from "@/utils/error.util";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBlog } from "../api/blog.api";

type UseDeleteBlogOptions = {
  onSuccess?: (blogId: number) => void;
  onError?: (errorMessage: string) => void;
};

export const useDeleteBlog = (options: UseDeleteBlogOptions = {}) => {
  const { showLoading, hideLoading } = useLoading();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blogId: string | number) => {
      // If showConfirmation is enabled and no external confirmation handled,
      // this should only be called after confirmation is already given
      return deleteBlog(blogId);
    },

    onMutate: () => {
      showLoading("Deleting blog...");
    },

    onSettled: () => {
      hideLoading();
    },

    onSuccess: (_, blogId) => {
      console.log("Blog deleted successfully!");

      // Invalidate and remove relevant queries
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["userBlogs"] });
      queryClient.removeQueries({ queryKey: ["blogDetails", blogId] });

      options.onSuccess?.(Number(blogId));
    },

    onError: (error) => {
      console.error("Error deleting blog:", error);
      if (options.onError) {
        const displayMessage = extractApiErrorMessage(
          error,
          "Failed to delete blog. Please try again.",
        );
        options.onError(displayMessage);
      }
    },
  });
};
