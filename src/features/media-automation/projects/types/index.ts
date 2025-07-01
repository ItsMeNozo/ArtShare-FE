export interface ProjectFormValues {
  projectName: string;
  description: string;
  platform: FormPlatform;
}

export interface FormPlatform {
  id: number;
  name: string;
}
