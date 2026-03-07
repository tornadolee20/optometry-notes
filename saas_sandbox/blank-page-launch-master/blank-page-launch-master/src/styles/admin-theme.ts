// 後台設計系統 - 集中管理所有視覺變數
export const adminTheme = {
  // 背景系統
  backgrounds: {
    page: 'bg-gradient-to-br from-background via-background to-accent/10',
    card: 'bg-card',
    elevated: 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
    subtle: 'bg-muted/30',
  },
  
  // 間距系統
  spacing: {
    page: 'px-6 py-8',
    pageContainer: 'container mx-auto',
    section: 'space-y-8',
    cardPadding: 'p-6',
    gap: {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
    },
  },
  
  // 圓角系統
  radius: {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  },
  
  // 陰影系統
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    card: 'shadow-lg hover:shadow-xl transition-shadow duration-300',
    elevated: 'shadow-xl shadow-primary/5',
  },
  
  // 文字樣式
  typography: {
    pageTitle: 'text-2xl font-bold text-foreground',
    pageDescription: 'text-muted-foreground',
    sectionTitle: 'text-xl font-semibold text-foreground',
    cardTitle: 'text-lg font-semibold text-foreground',
    cardDescription: 'text-sm text-muted-foreground',
    label: 'text-sm font-medium text-muted-foreground',
    value: 'text-3xl font-bold text-foreground',
    smallValue: 'text-2xl font-bold text-foreground',
  },
  
  // 動畫
  animations: {
    fadeIn: 'animate-fade-in',
    scaleIn: 'animate-scale-in',
    transition: 'transition-all duration-300',
  },
  
  // 品牌漸變色（用於重點元素）
  gradients: {
    primary: 'from-primary to-primary/80',
    success: 'from-emerald-500 to-emerald-600',
    info: 'from-blue-500 to-blue-600',
    warning: 'from-amber-500 to-amber-600',
    danger: 'from-rose-500 to-rose-600',
    purple: 'from-purple-500 to-purple-600',
  },

  // 統計卡片顏色主題
  statColors: {
    primary: {
      bg: 'bg-primary/10',
      text: 'text-primary',
      icon: 'text-primary',
    },
    success: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-600',
      icon: 'text-emerald-500',
    },
    info: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-600',
      icon: 'text-blue-500',
    },
    warning: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-600',
      icon: 'text-amber-500',
    },
    danger: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-600',
      icon: 'text-rose-500',
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-600',
      icon: 'text-purple-500',
    },
  },
} as const;

// 統一載入動畫樣式
export const loadingStyles = {
  spinner: 'animate-spin rounded-full border-2 border-primary/30 border-t-primary',
  spinnerSize: {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  },
} as const;

// 導出類型
export type AdminTheme = typeof adminTheme;
export type StatColorKey = keyof typeof adminTheme.statColors;
export type GradientKey = keyof typeof adminTheme.gradients;
