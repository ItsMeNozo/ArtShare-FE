import { CategoryTypeValues } from '@/constants';

export interface Category {
  id: number;
  name: string;
  description: string | null;
  example_images: string[];
  type: CategoryTypeValues;
  created_at: string | Date;
  updated_at: string | Date | null;
}

export interface CreateCategoryDto {
  name: string;
  description?: string | null;
  example_images?: string[];
  type?: CategoryTypeValues;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string | null;
  example_images?: string[];
  type?: CategoryTypeValues;
}
