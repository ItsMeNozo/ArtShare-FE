export enum MEDIA_TYPE {
  IMAGE = 'image',
  VIDEO = 'video',
}

// Z-index constants for consistent layering
export const Z_INDEX = {
  // Dialog layers
  DIALOG_OVERLAY: 1300,
  DIALOG_CONTENT: 1400,
  DIALOG_DELETE_OVERLAY: 1500,

  // Header and navigation
  HEADER: 50,

  // Notifications and overlays
  NOTIFICATION_PORTAL: 9999,

  // Other common layers
  TOOLTIP: 1000,
  MODAL: 1200,
  DROPDOWN: 100,
} as const;

export const dashboardBG =
  'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-asset/dashboard-feat-example/p5bnmcs6t71k6dbywnim?blur=300&q=1';

export const featuresShowcase = [
  {
    label: 'Image Generation',
    description: 'Create art from text using advanced AI.',
    url: 'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-asset/dashboard-feat-example/nxyormqdp4kggz0ncymu?blur=300&q=1',
    destination: '/image/tool/text-to-image',
  },
  // {
  //   label: 'Image Enhancement',
  //   description: 'Enhance image quality with smart AI tools.',
  //   url: 'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-asset/dashboard-feat-example/qrccndqcgnrmxpyfdhu3?blur=300&q=1',
  //   destination: '/image/tool/text-to-image',
  // },
  {
    label: 'Image Editor',
    description: 'A powerful editor for perfect visuals.',
    url: 'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-asset/dashboard-feat-example/rtbrxgmxcgkz9evmljks?blur=300&q=1',
    destination: '/image/tool/editor/new',
  },
  {
    label: 'Share Your Art',
    description: 'Upload and showcase your artwork to the community.',
    url: 'https://res.cloudinary.com/dqxtf297o/image/upload/v1755144896/artshare-asset/dashboard-feat-example/image-asset_oayynj.png',
    destination: '/posts/new',
  },
  {
    label: 'Write Blog',
    description:
      'Share the process of creating your artworks, from start to finish.',
    url: 'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-asset/dashboard-feat-example/ztwlihdk1mqirwi1pzoc?blur=300&q=1',
    destination: '/blogs/write',
  },
  {
    label: 'Connect Social Account',
    description:
      'Approve automation pushing content to other social platforms.',
    url: 'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-asset/dashboard-feat-example/uxeuuht93gl7mbtp1f3r?blur=300&q=1',
    destination: '/auto/social-links',
  },
  {
    label: 'Content Generation & Planning',
    description: 'Prepare the ideas to create and upload content row by row',
    url: 'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-asset/dashboard-feat-example/ydd0gojvbdnqejqifk2o?blur=300&q=1',
    destination: '/auto/projects',
  },
  // {
  //   label: 'Scheduled Content Posting',
  //   description: 'Schedule when to publish the content automatically.',
  //   url: 'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-asset/dashboard-feat-example/leuamzwred3navfdhc6v?blur=300&q=1',
  //   destination: '/auto/projects',
  // },
];

export enum TargetType {
  POST = 'POST',
  BLOG = 'BLOG',
}

export interface HeaderRoute {
  path: string;
  label: string;
  parent?: string;
  hideBackButton?: boolean;
}

export const routesForHeaders: HeaderRoute[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
  },
  {
    path: '/dashboard/updates',
    label: 'App Updates',
  },
  {
    path: '/dashboard/updates',
    label: 'App Updates',
  },
  {
    path: '/explore',
    label: 'Explore Arts',
  },
  {
    path: '/search',
    label: 'Search Page',
  },
  {
    path: '/blogs',
    label: 'Browse Blogs',
  },
  {
    path: '/blogs/:id',
    label: 'Read Blogs',
    parent: '/blogs',
  },
  {
    path: '/blogs/write',
    label: 'My Writing',
  },
  {
    path: '/blogs/write/new',
    label: 'Write Blog',
  },
  {
    path: '/posts/new',
    label: 'Create Post',
  },
  {
    path: '/posts/:id',
    label: 'Post Details',
    parent: '/explore',
  },
  {
    path: '/collections',
    label: 'My Collections',
  },
  {
    path: '/edit-user',
    label: 'Edit Profile',
  },
  {
    path: '/app-subscription',
    label: 'App Subscription',
  },
  {
    path: '/u/:username',
    label: 'My Profile',
  },
  {
    path: '/auto/social-links',
    label: 'Link Socials',
    hideBackButton: true,
  },
  {
    path: '/auto/scheduling',
    label: 'Project Scheduling',
  },
  {
    path: '/auto/scheduling',
    label: 'Project Scheduling',
  },
  {
    path: '/auto/projects',
    label: 'Automation Projects',
  },
  {
    path: '/auto/projects/new',
    label: 'New Workflow',
    parent: '/auto/projects',
  },
  {
    path: '/auto/projects/:id/edit',
    label: 'Edit Workflow',
    parent: '/auto/projects',
  },
  {
    path: '/auto/projects/:id/details',
    label: 'Manage Posts',
    parent: '/auto/projects',
  },
  {
    path: '/auto/projects/:id/posts/:postId/edit',
    label: 'Edit Post',
    parent: '/auto/projects/:id/details',
  },
  {
    path: '/auto/projects/:id/posts/new',
    label: 'Create Post',
    parent: '/auto/projects/:id/details',
  },
];
