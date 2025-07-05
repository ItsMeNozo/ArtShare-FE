import { Collection, Post } from '@/types';

export type { Collection, Post };

export type SelectedCollectionId = number | 'all';

export interface CollectionDisplayInfo extends Collection {
  thumbnailUrl?: string;
}

export type SliderItemAll = {
  type: 'all';
  thumbnailUrl?: string;
  count: number;
};
export type SliderItemCollection = {
  type: 'collection';
  id: number;
  name: string;
  thumbnailUrl?: string;
  count: number;
  isPrivate: boolean;
};
export type SliderItemAdd = {
  type: 'add';
};
export type SliderItem = SliderItemAll | SliderItemCollection | SliderItemAdd;

export interface UpdateCollectionData {
  name?: string;
  description?: string;
  isPrivate?: boolean;
  thumbnailUrl?: string;
}
