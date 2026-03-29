import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Check, X as CloseIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Keyword } from "@/types/store";

interface InlineKeywordEditProps {
  keyword: Keyword;
  onUpdate: () => void;
  onDelete: (id: string) => void;
  categoryLabel: string;
}

export const InlineKeywordEdit = ({
  keyword,
  onUpdate,
  onDelete,
  categoryLabel,
}: InlineKeywordEditProps) => {
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(keyword.keyword);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    const trimmed = editValue.trim();
    
    if (!trimmed) {
      toast({
        variant: "destructive",
        title: "關鍵字不能為空",
      });
      return;
    }

    if (trimmed.length < 3 || trimmed.length > 7) {
      toast({
        variant: "destructive",
        title: "格式不符",
        description: "關鍵字長度需為 3~7 個字",
      });
      return;
    }

    if (trimmed === keyword.keyword) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('store_keywords')
        .update({ keyword: trimmed })
        .eq('id', keyword.id);

      if (error) throw error;

      toast({
        title: "更新成功",
        description: `已將「${keyword.keyword}」更新為「${trimmed}」`,
      });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('更新關鍵字失敗:', error);
      toast({
        variant: "destructive",
        title: "更新失敗",
        description: "請稍後重試",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditValue(keyword.keyword);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="group relative bg-white border-2 border-primary/30 rounded-lg p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            className="flex-1 h-8 text-sm"
            autoFocus
            disabled={isUpdating}
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
            onClick={handleSave}
            disabled={isUpdating}
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-100"
            onClick={handleCancel}
            disabled={isUpdating}
          >
            <CloseIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white border border-gray-200 rounded-lg p-3 hover:border-primary/30 hover:shadow-sm transition-all">
      {/* 編輯按鈕 */}
      <button
        onClick={() => setIsEditing(true)}
        className="absolute top-1 right-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 rounded p-1"
        title="編輯關鍵字"
      >
        <Pencil className="w-3 h-3 text-blue-500" />
      </button>
      
      {/* 刪除按鈕 */}
      <button
        onClick={() => onDelete(keyword.id)}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded p-1"
        title="刪除關鍵字"
      >
        <CloseIcon className="w-3 h-3 text-red-500" />
      </button>
      
      {/* 關鍵字內容 */}
      <div className="pr-16">
        <div className="font-medium text-sm text-gray-800 mb-1 truncate" title={keyword.keyword}>
          {keyword.keyword}
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {categoryLabel}
          </Badge>
          <span className="text-xs text-gray-500">
            {keyword.usage_count ?? 0}次
          </span>
        </div>
      </div>
    </div>
  );
};
