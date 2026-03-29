import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface IndustryOption {
  value: string;
  label: string;
  emoji: string;
}

/**
 * 從 industry_templates 資料表動態載入所有已啟用的行業選項
 * 取代原本寫死的 INDUSTRIES 列表
 */
export const useIndustryOptions = () => {
  return useQuery<IndustryOption[]>({
    queryKey: ["industry-options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("industry_templates")
        .select("template_id, label, emoji")
        .eq("is_active", true)
        .order("sort_order");

      if (error) {
        console.error("[useIndustryOptions] DB error:", error);
        return [];
      }

      return (data || []).map((t) => ({
        value: t.template_id,
        label: t.label,
        emoji: t.emoji,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
};

/**
 * 根據 template_id 取得行業顯示名稱
 */
export const getIndustryLabel = (
  options: IndustryOption[],
  value?: string | null
): string => {
  if (!value) return "未設定";
  const found = options.find((o) => o.value === value);
  return found ? `${found.emoji} ${found.label}` : value;
};
