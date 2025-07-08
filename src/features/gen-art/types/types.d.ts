type StyleOption = {
  name: string;
  description: string;
  images: string[];
};

type AspectOption = {
  label: string;
  icon: IconType;
  value: string;
};

type LightingOption = {
  label: string;
  exampleUrl: string;
  value: string;
};

type CameraOption = {
  label: string;
  exampleUrl: string;
  value: string;
};

type SelectRatioProp = {
  selectedAspect: AspectOption;
  onChange: (aspect: AspectOption) => void;
};

type SelectLightingProp = {
  selectedLighting: LightingOption;
  onChange: (lighting: LightingOption) => void;
};

type SelectCameraProp = {
  selectedCamera: CameraOption;
  onChange: (camera: CameraOption) => void;
};

interface UsedStyle {
  name: string;
  description: string;
  images: string[];
}

interface StyleOptionsProp {
  style: UsedStyle;
  selectStyle: (style: UsedStyle) => void;
}

interface PanelProps {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  numberOfImages: number;
  setNumberOfImages: (value: number) => void;
  aspectRatio: AspectOption;
  setAspectRatio: (value: AspectOption) => void;
  lighting: LightingOption;
  setLighting: (value: LightingOption) => void;
  camera: CameraOption;
  setCamera: (value: CameraOption) => void;
  style: StyleOption;
  setStyle: (value: StyleOption) => void;
}

interface UsedModel {
  name: string;
  description: string;
  images: string[];
}

interface PromptResult {
  id: number;
  aspectRatio: string;
  createdAt: string;
  camera: string;
  finalPrompt: string;
  imageUrls: string[];
  lighting: string;
  modelKey: string;
  numberOfImagesGenerated: number;
  style: string;
  userId: string;
  userPrompt: string;
  generating?: boolean;
}

interface HistoryFilter {
  label: string;
  value: string;
}

interface TrendingItem {
  image: string;
  prompt: string;
  style: string;
  lighting: string;
  camera: string;
  aspectRatio: string;
  modelKey: string;
  author: {
    id: string;
    username: string;
    fullName: string;
    profilePictureUrl: string | null;
  };
}
