import { Category } from './category';

export interface Blog {
  categories?: Category[];
  id: number;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  is_published: boolean;
  like_count: number;
  comment_count: number;
  share_count: number;
  updated_at?: string | null;
  average_rating: number;
  is_protected: boolean;
  rating_count: number;
  pictures: string[];
  embedded_videos: string[];
  view_count: number;
  isLikedByCurrentUser: boolean;
  user: {
    id: string;
    username: string;
    full_name?: string | null;
    profile_picture_url?: string | null;
    followers_count: number;
    is_following: boolean;
  };
}

export interface BlogUser {
  id: string;
  username: string;
  profile_picture_url: string | null;
  full_name?: string | null;
}

export interface BlogCategory {
  id: number;
  name: string;
}

// Define the structure your backend API returns for list items, if different from frontend Blog type
// This was previously in this file. Ensure it's defined (here or in @/types/blog.ts)
// if your API functions in src/features/blog-details/api/blog.ts need it for mapping.
export interface BackendBlogListItemDto {
  id: number;
  title: string;
  slug: string;
  excerpt: string; // Or 'content' if your list items have full content
  cover_image_url: string | null;
  read_time_minutes: number;
  view_count: number;
  like_count: number;
  comment_count: number;
  is_published: boolean;
  is_protected: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  user: BlogUser;
  categories: Array<{
    // Corresponds to BlogCategory
    id: number;
    name: string;
  }>;
}

// Helper function to map backend DTO to frontend Blog type
// This is crucial if your backend list DTOs don't exactly match your frontend Blog type.
export const mapBackendToFrontendBlog = (
  backendBlog: BackendBlogListItemDto,
): Blog => {
  return {
    id: backendBlog.id, // Changed from blogId to id
    user_id: backendBlog.user.id, // Add missing user_id
    title: backendBlog.title,
    content: backendBlog.excerpt,
    created_at: backendBlog.created_at,
    is_published: backendBlog.is_published,
    like_count: backendBlog.like_count,
    comment_count: backendBlog.comment_count,
    view_count: backendBlog.view_count,
    share_count: 0, // Add default value
    updated_at: backendBlog.updated_at,
    average_rating: 0, // Add default value
    is_protected: backendBlog.is_protected,
    rating_count: 0, // Add default value
    pictures: backendBlog.cover_image_url ? [backendBlog.cover_image_url] : [],
    embedded_videos: [], // Add default value
    isLikedByCurrentUser: false, // Add default value
    user: {
      id: backendBlog.user.id,
      username: backendBlog.user.username,
      full_name: backendBlog.user.full_name,
      profile_picture_url: backendBlog.user.profile_picture_url,
      followers_count: 0, // Add default value or get from API
      is_following: false, // Add default value or get from API
    },
    categories: backendBlog.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      // Add other Category properties as needed
    })) as Category[],
  };
};

export interface SimpleBlogResponseDto {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  like_count: number;
  comment_count: number;
  share_count: number;
  view_count: number;
  is_published: boolean;
  pictures: string[];
  user: {
    id: string;
    username: string;
    profile_picture_url: string | null | '';
    full_name: string;
    followers_count: number;
    is_following: boolean;
  };
}

// Create a simpler mapping function for the actual response structure
export const mapSimpleBlogResponseToBlog = (
  backendBlog: SimpleBlogResponseDto,
): Blog => {
  return {
    id: backendBlog.id,
    user_id: backendBlog.user.id,
    title: backendBlog.title,
    content: backendBlog.content,
    created_at: backendBlog.created_at,
    is_published: backendBlog.is_published,
    like_count: backendBlog.like_count,
    comment_count: backendBlog.comment_count,
    view_count: backendBlog.view_count,
    share_count: backendBlog.share_count,
    updated_at: backendBlog.updated_at,
    average_rating: 0, // Not provided in response
    is_protected: false, // Not provided in response
    rating_count: 0, // Not provided in response
    pictures: backendBlog.pictures,
    embedded_videos: [], // Not provided in response
    isLikedByCurrentUser: false, // Not provided in response
    user: {
      id: backendBlog.user.id,
      username: backendBlog.user.username,
      full_name: backendBlog.user.full_name,
      profile_picture_url:
        backendBlog.user.profile_picture_url === ''
          ? null
          : backendBlog.user.profile_picture_url,
      followers_count: backendBlog.user.followers_count,
      is_following: backendBlog.user.is_following,
    },
    categories: [], // Not provided in response, add empty array
  };
};
