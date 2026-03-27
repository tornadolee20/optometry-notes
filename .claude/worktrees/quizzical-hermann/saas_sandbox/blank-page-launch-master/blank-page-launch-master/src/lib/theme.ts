// 統一的色彩系統配置
export const colors = {
  // 主色調
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // 主色
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // 成功色調
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',  // 成功色
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // 警告色調
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',  // 警告色
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // 錯誤色調
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',  // 錯誤色
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // 中性色調
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // 特殊色調
  gradient: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
    warning: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    error: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
    hero: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    card: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
  }
};

// 陰影系統
export const shadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  
  // 彩色陰影
  primary: '0 4px 14px 0 rgb(59 130 246 / 0.15)',
  success: '0 4px 14px 0 rgb(34 197 94 / 0.15)',
  warning: '0 4px 14px 0 rgb(245 158 11 / 0.15)',
  error: '0 4px 14px 0 rgb(239 68 68 / 0.15)',
};

// 邊框半徑
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

// 間距系統
export const spacing = {
  px: '1px',
  0: '0px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
};

// 字體大小
export const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
  sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
  base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
  lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
  xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
  '5xl': ['3rem', { lineHeight: '1' }],           // 48px
  '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
  '7xl': ['4.5rem', { lineHeight: '1' }],         // 72px
  '8xl': ['6rem', { lineHeight: '1' }],           // 96px
  '9xl': ['8rem', { lineHeight: '1' }],           // 128px
};

// 動畫持續時間
export const duration = {
  75: '75ms',
  100: '100ms',
  150: '150ms',
  200: '200ms',
  300: '300ms',
  500: '500ms',
  700: '700ms',
  1000: '1000ms',
};

// 動畫緩動函數
export const easing = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // 自訂緩動
  'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  'bounce-out': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  'elastic-in': 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  'elastic-out': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
};

// 主題工具函數
export const theme = {
  colors,
  shadows,
  borderRadius,
  spacing,
  fontSize,
  duration,
  easing,
  
  // 常用組合
  button: {
    primary: {
      bg: colors.primary[500],
      hover: colors.primary[600],
      text: '#ffffff',
      shadow: shadows.primary,
    },
    success: {
      bg: colors.success[500],
      hover: colors.success[600],
      text: '#ffffff',
      shadow: shadows.success,
    },
    warning: {
      bg: colors.warning[500],
      hover: colors.warning[600],
      text: '#ffffff',
      shadow: shadows.warning,
    },
    error: {
      bg: colors.error[500],
      hover: colors.error[600],
      text: '#ffffff',
      shadow: shadows.error,
    },
  },
  
  card: {
    background: '#ffffff',
    border: colors.gray[200],
    shadow: shadows.sm,
    hover: shadows.md,
  },
  
  input: {
    border: colors.gray[300],
    focus: colors.primary[500],
    error: colors.error[500],
    success: colors.success[500],
  },
};

export default theme;