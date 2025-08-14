import { Dispatch, SetStateAction } from 'react';
import { SharePlatformName } from '../../types';

export type Order = 'asc' | 'desc';

export type SortableKeys = 'title' | 'status' | 'nextPostAt' | 'postCount';

export interface HeadCell {
  id: SortableKeys | 'platform' | 'actions';
  label: string;
  numeric: boolean;
  disablePadding: boolean;
  isSortable: boolean;
}

type PostStatus = 'canceled' | 'draft' | 'scheduled' | 'active';

interface Data {
  id: number;
  title: string;
  platforms: string[];
  numberOfPosts: number;
  status: PostStatus;
  nextPostAt: Date | null;
  posts?: AutoPost[] | null;
}

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: SortableKeys,
  ) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

interface EnhancedTableToolbarProps {
  numSelected: number;
  dense: boolean;
  handleChangeDense: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

type ProjectDialogProps = {
  openDiaLog: boolean;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  selectedRow: Data;
};

type PostStatus = 'draft' | 'scheduled' | 'posted' | 'canceled';

type AutoPost = {
  id: number;
  platformPostId?: string;
  content: string;
  imageUrl?: string[];
  status: PostStatus;
  createdAt: Date;
  scheduledTime?: Date;
};

type AutomationProjectDetail = {
  id: number;
  name: string;
  platforms: string[];
  status: PostStatus;
  posts: AutoPost[];
};

interface ItemTableProps {
  numSelected: number;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: SortableKeysItemTable,
  ) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

type SortableKeysItemTable = Exclude<keyof AutoPost>;

interface HeadCellItemTable {
  disablePadding: boolean;
  id: SortableKeysItemTable;
  label: string;
  numeric: boolean;
}

interface GenPostContent {
  id: number;
  title: string;
  content: string;
  images?: string[];
  hashtags?: string[];
}

export interface AutoPostMeta {
  scheduledAt: Date;
  imagesCount: number;
}

export interface AutoProjectListItem {
  id: number;
  title: string;
  description: string;
  status: ProjectStatus;
  platform: {
    id: number;
    name: SharePlatformName; // Matches Prisma Enum
  };
  postCount: number;
  // Assuming your backend can determine the next post time
  nextPostAt: string | null;
}
// "id": 9,
// "title": "àdsaf",
// "status": "ACTIVE",
// "platform": {
//     "id": 1,
//     "name": "FACEBOOK"
// },
// "postCount": 0,
// "nextPostAt": null

export type ProjectStatus =
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | 'DRAFT';

export interface AutoProjectDetailsDto {
  id: number;
  title: string;
  description: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date | null;
  platform: {
    id: number;
    name: SharePlatform;
    externalPageId: string;
    tokenExpiresAt: Date | null;
    status: PlatformStatus;
  };
  postCount: number;
}

export interface ProjectSummaryStats {
  active: number;
  completed: number;
  cancelledOrFailed: number;
  paused: number;
}

export interface CreateAutoProjectPayload {
  title: string;
  description: string;
  platformId: number;
  autoPostMetaList: AutoPostMeta[];
}
