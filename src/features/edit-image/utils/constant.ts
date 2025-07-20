export const canvasSizeOptions = [
  {
    label: '1:1',
    value: '1:1',
    sizes: [
      { label: 'Small (512 x 512)', width: 512, height: 512 },
      { label: 'Medium (1080 x 1080)', width: 1080, height: 1080 },
      { label: 'Large (2048 x 2048)', width: 2048, height: 2048 },
    ],
  },
  {
    label: '16:9',
    value: '16:9',
    sizes: [
      { label: 'Small (640 x 360)', width: 640, height: 360 },
      { label: 'Medium (1280 x 720)', width: 1280, height: 720 },
      { label: 'Large (1920 x 1080)', width: 1920, height: 1080 },
    ],
  },
  {
    label: '4:3',
    value: '4:3',
    sizes: [
      { label: 'Small (800 x 600)', width: 800, height: 600 },
      { label: 'Medium (1024 x 768)', width: 1024, height: 768 },
      { label: 'Large (1600 x 1200)', width: 1600, height: 1200 },
    ],
  },
  {
    label: '3:4',
    value: '3:4',
    sizes: [
      { label: 'Small (600 x 800)', width: 600, height: 800 },
      { label: 'Medium (768 x 1024)', width: 768, height: 1024 },
      { label: 'Large (1200 x 1600)', width: 1200, height: 1600 },
    ],
  },
];

export const smallCanvasByRatio = {
  '1:1': { width: 560, height: 560 },
  '16:9': { width: 996, height: 560 },
  '4:3': { width: 747, height: 560 },
  '3:4': { width: 420, height: 560 },
};

export const fileTypes = [
  { label: 'PNG', value: 'png', color: 'violet-600' },
  { label: 'JPG', value: 'jpg', color: 'indigo-600' },
];

export const ratioMap: Record<string, string> = {
  '1.00': '1:1',
  '1.78': '16:9',
  '1.33': '4:3',
  '0.75': '3:4',
};
