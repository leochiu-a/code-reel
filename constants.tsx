
import { Theme } from './types';

export const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
  'linear-gradient(135deg, #c3cfe2 0%, #c3cfe2 100%)',
  'linear-gradient(to right, #ff8177 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf8581 78%, #f8d9d6 100%)',
  'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  '#000000',
  '#ffffff',
  'transparent'
];

export const THEMES: Record<Theme, { label: string; shikiTheme: string }> = {
  'one-dark': {
    label: 'One Dark',
    shikiTheme: 'one-dark-pro'
  },
  'dracula': {
    label: 'Dracula',
    shikiTheme: 'dracula'
  },
  'nord': {
    label: 'Nord',
    shikiTheme: 'nord'
  },
  'github-light': {
    label: 'GitHub Light',
    shikiTheme: 'github-light'
  },
  'monokai': {
    label: 'Monokai',
    shikiTheme: 'monokai'
  },
  'night-owl': {
    label: 'Night Owl',
    shikiTheme: 'night-owl'
  }
};
