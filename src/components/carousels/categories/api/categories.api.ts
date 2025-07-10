import api from '@/api/baseApi';
import { Category } from '@/types';

const CATEGORIES_API_PATH = 'categories';

export const categoryService = {
  /**
   * Fetches all categories from the backend.
   * @param page - The page number for pagination.
   * @param pageSize - The number of items per page.
   * @returns A promise that resolves to an array of categories.
   */
  async getAllCategories(
    page: number = 1,
    pageSize: number = 25,
  ): Promise<Category[]> {
    try {
      const params = {
        page,
        pageSize,
      };

      const response = await api.get<Category[]>(`/${CATEGORIES_API_PATH}`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching all categories from /${CATEGORIES_API_PATH}:`,
        error,
      );
      throw error;
    }
  },
};
