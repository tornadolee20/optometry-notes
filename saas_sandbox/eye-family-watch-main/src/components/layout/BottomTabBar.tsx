import { Home, PlusCircle, TrendingUp, Settings } from 'lucide-react';

interface BottomTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: '首頁', icon: Home },
  { id: 'add', label: '新增紀錄', icon: PlusCircle },
  { id: 'trends', label: '趨勢', icon: TrendingUp },
  { id: 'settings', label: '設定', icon: Settings },
];

const BottomTabBar = ({ activeTab, onTabChange }: BottomTabBarProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card shadow-tab safe-bottom">
      <div className="flex items-stretch max-w-[430px] mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 pt-3 touch-target transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <Icon
                size={24}
                strokeWidth={isActive ? 2.5 : 1.8}
                className="mb-0.5"
              />
              <span className={`text-[11px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
