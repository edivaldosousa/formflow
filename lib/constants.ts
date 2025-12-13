export const COLORS = {
  primary: '#FFA500',
  secondary: '#003DA5',
  success: '#1DB854',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827'
};

export const ROLES = {
  GESTOR: 'GESTOR',
  CRIADOR: 'CRIADOR',
  EDITOR: 'EDITOR',
  REVISOR: 'REVISOR',
  VISUALIZADOR: 'VISUALIZADOR'
};

export const ROLE_PERMISSIONS = {
  GESTOR: ['*'],
  CRIADOR: ['read', 'create', 'update'],
  EDITOR: ['read', 'update'],
  REVISOR: ['read', 'comment'],
  VISUALIZADOR: ['read']
};