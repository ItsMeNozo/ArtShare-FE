import api from '@/api/baseApi';

export const getTrendingAiPosts = async (): Promise<TrendingItem[]> => {
  try {
    const response = await api.get('/posts/ai-trending');
    const data = response.data;
    console.log(data);
    const withArt = data.filter((item: any) => item.art_generation);
    return withArt.map((item: any): TrendingItem => {
      const art = item.art_generation;
      const user = item.user;
      return {
        image: art.image_urls?.[0] ?? 'https://placehold.co/512?text=No+Image',
        prompt: art.final_prompt ?? art.user_prompt ?? '',
        style: art.style ?? 'Default',
        lighting: art.lighting ?? 'Default',
        camera: art.camera ?? 'Default',
        aspect_ratio: art.aspect_ratio ?? 'Default',
        model_key: art.model_key ?? 'Unknown',
        author: {
          id: user?.id ?? '',
          username: user?.username ?? 'Unknown',
          full_name: user?.full_name ?? '',
          profile_picture_url: user?.profile_picture_url ?? null,
        },
      };
    });
  } catch (error) {
    console.error('Error fetching trending AI posts:', error);
    throw error;
  }
};
