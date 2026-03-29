export interface Store {
  id: string;
  store_name: string;
  email: string;
  phone?: string;
  address?: string;
  store_number: number;
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'cancelled' | null;
  industry: string | null;
  created_at: string;
  line_id?: string | null;
  notes?: string | null;
  tags?: string[] | null;
  subscription?: {
    id: string;
    status: 'trial' | 'active' | 'expired' | 'canceled';
    plan_type: 'basic' | 'premium' | 'enterprise' | null;
    expires_at: string | null;
    trial_ends_at: string | null;
    created_at: string;
    days_left: number;
    payment_source?: string | null;
  };
}

export const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
    case 'inactive':
      return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';
    case 'pending':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const getStatusText = (status: string | null) => {
  switch (status) {
    case 'active':
      return '活躍';
    case 'inactive':
      return '未啟用';
    case 'pending':
      return '待審核';
    default:
      return '未知';
  }
};

export const getSubscriptionStatusColor = (status: string) => {
  switch (status) {
    case 'trial':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
    case 'active':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
    case 'expired':
      return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';
    case 'canceled':
      return 'bg-muted text-muted-foreground border-border';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

export const getSubscriptionStatusText = (status: string) => {
  switch (status) {
    case 'trial':
      return '免費試用';
    case 'active':
      return '專業版會員';
    case 'expired':
      return '已到期';
    case 'canceled':
      return '已取消';
    default:
      return '未知';
  }
};

export const getSubscriptionIconName = (status: string): 'gift' | 'crown' | 'alert' | 'clock' => {
  switch (status) {
    case 'trial':
      return 'gift';
    case 'active':
      return 'crown';
    case 'expired':
      return 'alert';
    default:
      return 'clock';
  }
};

export const formatTimeLeft = (daysLeft: number) => {
  if (daysLeft <= 0) return '已到期';
  if (daysLeft === 1) return '剩餘 1 天';
  if (daysLeft < 30) return `剩餘 ${daysLeft} 天`;
  
  const months = Math.floor(daysLeft / 30);
  const remainingDays = daysLeft % 30;
  
  if (remainingDays === 0) return `剩餘 ${months} 個月`;
  return `剩餘 ${months} 個月 ${remainingDays} 天`;
};
