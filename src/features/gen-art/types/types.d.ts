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
  aspect_ratio: string;
  created_at: string;
  camera: string;
  final_prompt: string;
  image_urls: string[];
  lighting: string;
  model_key: string;
  number_of_images_generated: number;
  style: string;
  user_id: string;
  user_prompt: string;
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
  aspect_ratio: string;
  model_key: string;
  author: {
    id: string;
    username: string;
    full_name: string;
    profile_picture_url: string | null;
  };
}
