import { fetchPostsByArtist } from '@/features/explore/api/get-post';
import { User } from '@/types';
import { useQuery } from '@tanstack/react-query';

const PostMoreByArtist = ({ artist }: { artist: User }) => {
  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['posts', artist.username],
    retry: 2,
    queryFn: () => fetchPostsByArtist(artist.username, 1),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Failed to fetch post data.</div>;
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white px-4 py-6">
      <div className="text-xl font-bold">
        More by {artist.username || 'Mock User'}
      </div>
      <div className="grid grid-cols-4 gap-4 rounded-2xl bg-white md:grid-cols-2 lg:grid-cols-3">
        {posts?.map((post) => (
          <img
            key={post.id}
            src={post.medias[0].url}
            alt={post.medias[0].description}
            className="aspect-[1/1] rounded"
          />
        ))}
      </div>
    </div>
  );
};

export default PostMoreByArtist;
