// src/features/post/api/likes.api.mock.ts
import { LikingUser } from '../types/user'; // Adjust path

// Helper function to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock data - create a realistic list
const mockUsers: LikingUser[] = [
  {
    id: 'user1',
    username: 'john_doe',
    fullName: 'John Doe',
    profilePictureUrl: 'https://via.placeholder.com/50/FFA500/FFFFFF?text=JD',
    isFollowing: false,
  },
  {
    id: 'user2',
    username: 'jane_smith',
    fullName: 'Jane Smith',
    profilePictureUrl: null, // User without profile picture
    isFollowing: true,
  },
  {
    id: 'user3',
    username: 'test_user_long_name',
    fullName: null, // User without full name
    profilePictureUrl: 'https://via.placeholder.com/50/008000/FFFFFF?text=TU',
    isFollowing: false,
  },
  {
    id: 'user4',
    username: 'another_tester',
    fullName: 'Tester Person',
    profilePictureUrl: 'https://via.placeholder.com/50/0000FF/FFFFFF?text=AP',
    isFollowing: false,
  },
];

/**
 * Mock function to simulate fetching users who liked a post.
 * Returns a predefined list of users after a short delay.
 * @param postId - The ID of the post (ignored in this mock).
 * @returns A promise that resolves to an array of mock LikingUser objects.
 */
export const fetchLikingUsersMock = async (
  postId: number,
): Promise<LikingUser[]> => {
  console.log(`[MOCK] Fetching likes for post ID: ${postId}`);
  await delay(800); // Simulate network latency (800ms)

  // Simulate potential error (optional)
  // if (Math.random() > 0.8) { // ~20% chance of error
  //   console.log("[MOCK] Simulating fetch error");
  //   throw new Error("Mock API Error: Could not fetch likes.");
  // }

  // Return a slice or shuffled version to make it slightly dynamic if needed
  // For simplicity, just return the static list here.
  console.log('[MOCK] Returning mock user list:', mockUsers);
  return mockUsers;
};
