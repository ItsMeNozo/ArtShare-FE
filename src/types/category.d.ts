import { CategoryTypeValues } from '@/constants';

export interface Category {
  id: number;
  name: string;
  description: string | null;
  exampleImages: string[];
  type: CategoryTypeValues;
  createdAt: string | Date;
  updatedAt: string | Date | null;
}

export interface CreateCategoryDto {
  name: string;
  description?: string | null;
  exampleImages?: string[];
  type?: CategoryTypeValues;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string | null;
  exampleImages?: string[];
  type?: CategoryTypeValues;
}
