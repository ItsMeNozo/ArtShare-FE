import api from '@/api/baseApi';

interface ArtGeneration {
  imageUrls?: string[];
  finalPrompt?: string;
  userPrompt?: string;
  style?: string;
  lighting?: string;
  camera?: string;
  aspectRatio?: string;
  modelKey?: string;
}

interface PostWithArt {
  artGeneration?: ArtGeneration;
  user?: {
    id: string;
    username: string;
    fullName: string;
    profilePictureUrl: string | null;
  };
}

export const getTrendingAiPosts = async (): Promise<TrendingItem[]> => {
  try {
    const response = await api.get<PostWithArt[]>('/posts/ai-trending');
    const data = response.data;
    const withArt = data.filter(
      (item): item is PostWithArt & { artGeneration: ArtGeneration } =>
        !!item.artGeneration,
    );
    return withArt.map((item): TrendingItem => {
      const art = item.artGeneration;
      const user = item.user;
      return {
        image: art.imageUrls?.[0] ?? 'https://placehold.co/512?text=No+Image',
        prompt: art.finalPrompt ?? art.userPrompt ?? '',
        style: art.style ?? 'Default',
        lighting: art.lighting ?? 'Default',
        camera: art.camera ?? 'Default',
        aspectRatio: art.aspectRatio ?? 'Default',
        modelKey: art.modelKey ?? 'Unknown',
        author: {
          id: user?.id ?? '',
          username: user?.username ?? 'Unknown',
          fullName: user?.fullName ?? '',
          profilePictureUrl: user?.profilePictureUrl ?? null,
        },
      };
    });
  } catch (error) {
    console.error('Error fetching trending AI posts:', error);
    throw error;
  }
};
