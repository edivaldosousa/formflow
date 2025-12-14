export type FieldType = 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'SELECT';
export type BuilderTab = 'EDITOR' | 'DESIGN' | 'LOGIC' | 'INTEGRATIONS';

export interface FormElement {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  order?: number;
}

export interface FormTheme {
  bgColor: string;
  formColor: string;
  textColor: string;
  buttonColor: string;
  logoUrl?: string;
  bannerImage?: string;
}

export interface Collaborator {
  userId: string;
  role: 'EDITOR' | 'VIEWER';
  addedAt: number;
}

export interface Integrations {
  notifications?: { enabled: boolean; emailTo: string };
  sharepoint?: { enabled: boolean; siteUrl: string; listName: string };
  slack?: boolean;
}

export interface Form {
  id: string;
  title: string;
  description: string;
  elements: FormElement[];
  integrations?: Integrations;
  collaborators?: Collaborator[];
  theme?: FormTheme;
  createdAt: number;
  updatedAt: number;
  status: 'draft' | 'publicado';
}

export const MOCK_THEMES = [
  { id: '1', name: 'Blue', theme: { bgColor: '#f0f9ff', formColor: '#fff', textColor: '#1e293b', buttonColor: '#3b82f6' } },
  { id: '2', name: 'Orange', theme: { bgColor: '#fff7ed', formColor: '#fff', textColor: '#7c2d12', buttonColor: '#f97316' } },
  { id: '3', name: 'Green', theme: { bgColor: '#f0fdf4', formColor: '#fff', textColor: '#166534', buttonColor: '#22c55e' } },
];
