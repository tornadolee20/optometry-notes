import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Keyword } from "@/types/store";

// Type for database category (matches database schema)
type DatabaseCategory = 'service' | 'product' | 'general' | 'location' | 'experience';

// Map database categories to frontend categories
const mapDatabaseCategory = (dbCategory: DatabaseCategory | null | undefined): Keyword['category'] => {
  if (!dbCategory) return 'general';
  switch (dbCategory) {
    case 'location':
      return 'area';
    case 'experience':
      return 'environment';
    default:
      return dbCategory as Keyword['category'];
  }
};

const mapFrontendCategory = (frontendCategory: Keyword['category']): DatabaseCategory => {
  switch (frontendCategory) {
    case 'area':
      return 'location';
    case 'environment':
      return 'experience';
    default:
      return frontendCategory as DatabaseCategory;
  }
};

export const useStoreKeywords = (storeId: string) => {
  const { toast } = useToast();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchKeywords = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('store_keywords')
        .select('*')
        .eq('store_id', storeId)
        .order('priority');

      if (error) throw error;
      
      const formattedData: Keyword[] = (data || []).map(item => ({
        id: item.id,
        keyword: item.keyword,
        category: mapDatabaseCategory(item.category as DatabaseCategory),
        source: (item.source === 'manual' || item.source === 'ai') ? item.source : 'manual',
        is_primary: item.is_primary || false,
        usage_count: item.usage_count || 0,
        priority: item.priority || 0
      }));
      
      setKeywords(formattedData);
    } catch (error) {
      console.error('獲取關鍵字錯誤:', error);
      toast({
        variant: "destructive",
        title: "錯誤",
        description: "無法載入關鍵字",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, [storeId]);

  const addKeyword = async (keyword: string, category: Keyword['category']) => {
    if (!keyword.trim()) return;

    try {
      const { data, error } = await supabase
        .from('store_keywords')
        .insert({
          store_id: storeId,
          keyword: keyword.trim(),
          category: mapFrontendCategory(category),
          source: 'manual' as const,
          is_primary: false,
          usage_count: 0,
          priority: keywords.length
        })
        .select()
        .single();

      if (error) throw error;

      const newKeywordData: Keyword = {
        id: data.id,
        keyword: data.keyword,
        category: mapDatabaseCategory(data.category as DatabaseCategory),
        source: (data.source === 'manual' || data.source === 'ai') ? data.source : 'manual',
        is_primary: data.is_primary || false,
        usage_count: data.usage_count || 0,
        priority: data.priority || 0
      };

      setKeywords([...keywords, newKeywordData]);
      toast({
        title: "成功",
        description: "已新增關鍵字",
      });
      
      return newKeywordData;
    } catch (error) {
      console.error('新增關鍵字錯誤:', error);
      toast({
        variant: "destructive",
        title: "錯誤",
        description: (error as any)?.message || "無法新增關鍵字",
      });
      return null;
    }
  };

  const deleteKeyword = async (id: string) => {
    try {
      const { error } = await supabase
        .from('store_keywords')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setKeywords(keywords.filter(k => k.id !== id));
      toast({
        title: "成功",
        description: "已刪除關鍵字",
      });
      return true;
    } catch (error) {
      console.error('刪除關鍵字錯誤:', error);
      toast({
        variant: "destructive",
        title: "錯誤",
        description: (error as any)?.message || "無法刪除關鍵字",
      });
      return false;
    }
  };

  const reorderKeywords = async (reorderedKeywords: Keyword[]) => {
    setKeywords(reorderedKeywords);

    try {
      // Update each keyword individually to avoid type conflicts
      for (let i = 0; i < reorderedKeywords.length; i++) {
        const keyword = reorderedKeywords[i];
        const { error } = await supabase
          .from('store_keywords')
          .update({ priority: i })
          .eq('id', keyword.id);

        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error('更新順序錯誤:', error);
      toast({
        variant: "destructive",
        title: "錯誤",
        description: "無法更新關鍵字順序",
      });
      return false;
    }
  };

  return {
    keywords,
    isLoading,
    fetchKeywords,
    addKeyword,
    deleteKeyword,
    reorderKeywords
  };
};