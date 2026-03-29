import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { Keyword } from "@/types/store";

export type FilterCategory = 'all' | 'service' | 'product' | 'environment' | 'general' | 'area';

interface KeywordFilterTabsProps {
  keywords: Keyword[];
  activeTab: FilterCategory;
  onTabChange: (tab: FilterCategory) => void;
}

const TAB_CONFIG: { value: FilterCategory; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'service', label: '服務溝通' },
  { value: 'environment', label: '環境設備' },
  { value: 'product', label: '技術成效' },
  { value: 'general', label: '價格相關' },
];

export const KeywordFilterTabs = ({
  keywords,
  activeTab,
  onTabChange,
}: KeywordFilterTabsProps) => {
  const getCategoryCount = (category: FilterCategory): number => {
    if (category === 'all') return keywords.length;
    return keywords.filter(k => k.category === category).length;
  };

  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as FilterCategory)} className="w-full">
      <TabsList className="w-full h-auto flex flex-wrap gap-1 bg-muted/50 p-1">
        {TAB_CONFIG.map(tab => {
          const count = getCategoryCount(tab.value);
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex-1 min-w-[80px] data-[state=active]:bg-white data-[state=active]:shadow-sm gap-1.5 px-2 py-1.5 text-xs sm:text-sm"
            >
              {tab.label}
              <Badge 
                variant="secondary" 
                className={`text-[10px] h-4 px-1 ${
                  activeTab === tab.value 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {count}
              </Badge>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
};
