import { LuRectangleHorizontal, LuRectangleVertical } from 'react-icons/lu';
import { TbSquareDashed } from 'react-icons/tb';

export const aspectOptions: AspectOption[] = [
  { label: 'Square', icon: TbSquareDashed, value: 'SQUARE' },
  { label: 'Landscape', icon: LuRectangleHorizontal, value: 'LANDSCAPE' },
  { label: 'Portrait', icon: LuRectangleVertical, value: 'PORTRAIT' },
];

export enum ModelKey {
  STABLE_DIFFUSION_XL = 'STABLE_DIFFUSION_XL',
  DALL_E_3 = 'DALL_E_3',
  GPT_IMAGE_1 = 'gpt-image-1',
  // Add other models your backend supports
}

export const HistoryFilter = {
  ALL: { label: 'All Time', value: 'all' },
  LAST7DAYS: { label: 'Last 7 Days', value: 'last7days' },
  LAST30DAYS: { label: 'Last 30 Days', value: 'last30days' },
};

export const lightingOptions: LightingOption[] = [
  {
    label: 'Auto Lighting',
    exampleUrl:
      'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-panels-lighting/kfppibr86fziyo6yix0e?blur=300&q=1',
    value: 'auto lighting',
  },
  {
    label: 'Soft Light',
    exampleUrl:
      'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-panels-lighting/vh5j11fiq3ycxoemeutc?blur=300&q=1',
    value: 'soft light',
  },
  {
    label: 'Cinematic',
    exampleUrl:
      'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-panels-lighting/zpmplwkqs3vrap8cgdea?blur=300&q=1',
    value: 'cinematic',
  },
  {
    label: 'Natural Light',
    exampleUrl:
      'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-panels-lighting/jajt2bsqrmuzk597evei?blur=300&q=1',
    value: 'natural light',
  },
  {
    label: 'Studio Light',
    exampleUrl:
      'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-panels-lighting/ukoggrvwq1s7itcbjb2n?blur=300&q=1',
    value: 'studio lighting',
  },
  {
    label: 'Neon Glow',
    exampleUrl:
      'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshare-panels-lighting/tcf8shns8ol3bdlr3xz1?blur=300&q=1',
    value: 'neon light',
  },
];

export const cameraOptions: CameraOption[] = [
  {
    label: 'Auto Camera',
    exampleUrl:
      'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshate-panels-camera/s46uka4gwgfbvsg1yn7v?blur=300&q=1',
    value: 'auto lighting',
  },
  {
    label: 'Close-Up',
    exampleUrl:
      'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshate-panels-camera/jqcvmsj1fdvf7k3rpijf?blur=300&q=1',
    value: 'close-up',
  },
  {
    label: 'Wide Angle',
    exampleUrl:
      'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshate-panels-camera/urbrbclcsy8nbfo5ttbj?blur=300&q=1',
    value: 'wide angle',
  },
  {
    label: 'Portrait',
    exampleUrl:
      'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshate-panels-camera/l3ma1x1b8xkymwifjcoo?blur=300&q=1',
    value: 'portrait',
  },
  {
    label: 'Bokeh',
    exampleUrl:
      'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshate-panels-camera/yplnugybyeohdwxya4q1?blur=300&q=1',
    value: 'bokeh',
  },
  {
    label: 'Aerial',
    exampleUrl:
      'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/artshate-panels-camera/efimpy0ytsjrfmkbmzjn?blur=300&q=1',
    value: 'aerial view',
  },
];
