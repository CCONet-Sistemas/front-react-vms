export type Theme = 'system' | 'light' | 'dark';

export interface ThemeOption {
  value: Theme;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}
