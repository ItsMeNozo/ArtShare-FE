import { useUser } from "@/contexts/UserProvider";
import { Post } from "@/types";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchUserPosts } from "../api/get-posts-by-user";
import PostCard from "./PostCard";

const UserPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const { username } = useParams<{ username: string }>();
  const { user } = useUser();

  useEffect(() => {
    if (!username) return;
    (async () => {
      try {
        setLoadingPosts(true);
        const userPosts = await fetchUserPosts(username, 1);
        console.log("@@ User posts", userPosts);
        setPosts(userPosts);
      } catch (error) {
        console.error("Error fetching user posts:", error);
      } finally {
        setLoadingPosts(false);
      }
    })();
  }, [username]);

  const handlePostDeleted = (postId: number) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };

  if (!username) return null;

  if (loadingPosts) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={200}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (posts.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={200}
      >
        <Typography variant="body2" color="textSecondary">
          No posts available.
        </Typography>
      </Box>
    );
  }

  return (
    <div className="gap-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 4xl:grid-cols-10 p-1 w-full">
      {posts.map((post) => {
        const isOwner = user?.username === post.user?.username;

        return (
          <PostCard
            key={post.id}
            post={post}
            isOwner={isOwner}
            username={username}
            onPostDeleted={handlePostDeleted}
          />
        );
      })}
    </div>
  );
};

export default UserPosts;
