export enum MEDIA_TYPE {
  IMAGE = 'image',
  VIDEO = 'video',
}

export const dashboardBG =
  'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-asset/dashboard-feat-example/p5bnmcs6t71k6dbywnim?blur=300&q=1';

export const featuresShowcase = [
  {
    label: 'Text To Image',
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
    url: 'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-asset/dashboard-feat-example/rtbrxgmxcgkz9evmljks?blur=300&q=1',
    destination: '/image/tool/text-to-image',
  },
  {
    label: 'Text Editor',
    url: 'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-asset/dashboard-feat-example/ztwlihdk1mqirwi1pzoc?blur=300&q=1',
    destination: '/image/tool/text-to-image',
  },
  {
    label: 'Content Approval Workflow',
    url: 'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-asset/dashboard-feat-example/uxeuuht93gl7mbtp1f3r?blur=300&q=1',
    destination: '/image/tool/text-to-image',
  },
  {
    label: 'Automatic Content Creator',
    url: 'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-asset/dashboard-feat-example/ydd0gojvbdnqejqifk2o?blur=300&q=1',
    destination: '/image/tool/text-to-image',
  },
  {
    label: 'Scheduled Content Posting',
    url: 'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-asset/dashboard-feat-example/leuamzwred3navfdhc6v?blur=300&q=1',
    destination: '/image/tool/text-to-image',
  },
];

export enum TargetType {
  POST = 'POST',
  BLOG = 'BLOG',
}

export interface HeaderRoute {
  path: string;
  label: string;
  parent?: string;
}

export const routesForHeaders: HeaderRoute[] = [
  {
    path: '/dashboard',
    label: 'Home Page',
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
    path: '/docs',
    label: 'My Writing',
  },
  {
    path: '/docs/new',
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
    label: 'Details',
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
