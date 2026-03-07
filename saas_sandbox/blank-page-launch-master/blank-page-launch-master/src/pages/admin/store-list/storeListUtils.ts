export interface Store {
  id: string;
  store_name: string;
  email: string;
  store_number: number;
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'cancelled' | null;
  industry: string | null;
  created_at: string;
  subscription?: {
    id: string;
    status: 'trial' | 'active' | 'expired' | 'canceled';
    plan_type: 'basic' | 'premium' | 'enterprise' | null;
    expires_at: string | null;
    trial_ends_at: string | null;
    created_at: string;
    days_left: number;
  };
}

export const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
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
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'expired':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'canceled':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
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
