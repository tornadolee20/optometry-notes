
import { X, GripVertical, RefreshCcw, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Keyword } from "@/types/store";
import { CATEGORY_LABELS } from "./KeywordInput";

interface KeywordListProps {
  keywords: Keyword[];
  onDelete: (id: string) => void;
  onRegenerate: () => void;
}

export const KeywordList = ({ keywords, onDelete, onRegenerate }: KeywordListProps) => {
  const getKeywordsByCategory = (category: Keyword['category']) => {
    return keywords.filter(k => k.category === category);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">所有真實感受</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          className="text-[#698B69] hover:text-[#557755] border-[#698B69] hover:border-[#557755]"
        >
          <RefreshCcw className="w-4 h-4 mr-1" />
          換一組真實感受
        </Button>
      </div>
      {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
        const categoryKeywords = getKeywordsByCategory(category as Keyword['category']);
        if (categoryKeywords.length === 0) return null;

        return (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <h4 className="text-sm font-medium text-gray-700">{label}</h4>
              <Badge variant="secondary" className="text-xs">
                {categoryKeywords.length}
              </Badge>
            </div>
            
            {/* 緊密的網格布局 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categoryKeywords.map((keyword) => (
                <div
                  key={keyword.id}
                  className="group relative bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
                >
                  {/* 拖拽手柄 */}
                  <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-3 h-3 text-gray-400 cursor-move" />
                  </div>
                  
                  {/* 刪除按鈕 */}
                  <button
                    onClick={() => onDelete(keyword.id)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded p-1"
                  >
                    <X className="w-3 h-3 text-red-500" />
                  </button>
                  
                  {/* 關鍵字內容 */}
                  <div className="pr-6 pl-4">
                    <div className="font-medium text-sm text-gray-800 mb-1 truncate" title={keyword.keyword}>
                      {keyword.keyword}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center justify-between">
                      <span>使用 {keyword.usage_count} 次</span>
                      {keyword.is_primary && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          重點
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
