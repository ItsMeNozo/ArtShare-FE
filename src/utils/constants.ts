export enum MEDIA_TYPE {
  IMAGE = 'image',
  VIDEO = 'video',
}

export const dashboardBG =
  'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-asset/dashboard-feat-example/p5bnmcs6t71k6dbywnim?blur=300&q=1';

export const featuresShowcase = [
  {
    label: 'Text To Image',
    description: 'Create art from text using advanced AI.',
    url: 'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-asset/dashboard-feat-example/nxyormqdp4kggz0ncymu?blur=300&q=1',
    destination: '/image/tool/text-to-image',
  },
  {
    label: 'Image Enhancement',
    description: 'Enhance image quality with smart AI tools.',
    url: 'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-asset/dashboard-feat-example/qrccndqcgnrmxpyfdhu3?blur=300&q=1',
    destination: '/image/tool/text-to-image',
  },
  {
    label: 'Image Editor',
    description: 'A powerful editor for perfect visuals.',
    url: 'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-asset/dashboard-feat-example/rtbrxgmxcgkz9evmljks?blur=300&q=1',
    destination: '/image/tool/text-to-image',
  },
  {
    label: 'Text Editor',
    description: 'Write, edit, and enhance with AI.',
    url: 'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-asset/dashboard-feat-example/ztwlihdk1mqirwi1pzoc?blur=300&q=1',
    destination: '/image/tool/text-to-image',
  },
  {
    label: 'Content Approval Workflow',
    description:
      'Approve automation pushing content to other social platforms.',
    url: 'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-asset/dashboard-feat-example/uxeuuht93gl7mbtp1f3r?blur=300&q=1',
    destination: '/image/tool/text-to-image',
  },
  {
    label: 'Automatic Content Creator',
    description:
      'Prepare the ideas for bots to create and upload content row by row',
    url: 'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-asset/dashboard-feat-example/ydd0gojvbdnqejqifk2o?blur=300&q=1',
    destination: '/image/tool/text-to-image',
  },
  {
    label: 'Scheduled Content Posting',
    description: 'Schedule when to publish the content automatically.',
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
  description: string;
  parent?: string;
}

export const routesForHeaders: HeaderRoute[] = [
  {
    path: '/dashboard',
    label: 'Home Page',
    description: 'Discovering what we supply for your artistic journey',
  },
  {
    path: '/explore',
    label: 'Explore Arts',
    description: 'Discover stunning creations shared by artists worldwide',
  },
  {
    path: '/search',
    label: 'Search Page',
    description: 'Finding beautiful creations that you want to view',
  },
  {
    path: '/blogs',
    label: 'Browse Blogs',
    description: 'Get inspired by stories, tutorials, and creative journeys',
  },
  {
    path: '/blogs/:id',
    label: 'Read Blogs',
    description: 'Dive into creative experiences shared by artists',
    parent: '/blogs',
  },
  {
    path: '/docs',
    label: 'My Writing',
    description: 'Your space to write and manage your knowledge, sharings',
  },
  {
    path: '/docs/new',
    label: 'Write Blog',
    description:
      'Share your latest artwork or visual content with the community',
  },
  {
    path: '/posts/new',
    label: 'Create Post',
    description:
      'Share your latest artwork or visual content with the community',
  },
  {
    path: '/posts/:id',
    label: 'Post Details',
    description: "View artwork in detail and engage with the artist's post",
    parent: '/explore',
  },
  {
    path: '/collections',
    label: 'My Collections',
    description: '',
  },
  {
    path: '/edit-user',
    label: 'Edit Profile',
    description: 'Update your user profile information if needed',
  },
  {
    path: '/app-subscription',
    label: 'App Subscription',
    description: 'View and manage your current subscription plan',
  },
  {
    path: '/:username',
    label: 'My Profile',
    description: 'This place is yours to showcase your creations',
  },
  {
    path: '/auto/social-links',
    label: 'Link Socials',
    description: 'Connect social accounts to enable automated posting',
  },
  {
    path: '/auto/projects',
    label: 'Automation Projects',
    description: 'Manage your automated content workflows',
  },
  {
    path: '/auto/projects/new',
    label: 'New Workflow',
    description: 'Create new workflow for automative upload',
    parent: '/auto/projects',
  },
  {
    path: '/auto/projects/:id/edit',
    label: 'Edit Workflow',
    description: 'Create new workflow for automative upload',
    parent: '/auto/projects',
  },
  {
    path: '/auto/projects/:id/details',
    label: 'Details',
    description: 'Manage your automated content workflows',
    parent: '/auto/projects',
  },
  {
    path: '/auto/projects/:id/posts/:postId/edit',
    label: 'Edit Post',
    description: '',
    parent: '/auto/projects/:id/details',
  },
  {
    path: '/auto/projects/:id/posts/new',
    label: 'Create Post',
    description: '',
    parent: '/auto/projects/:id/details',
  },
];
