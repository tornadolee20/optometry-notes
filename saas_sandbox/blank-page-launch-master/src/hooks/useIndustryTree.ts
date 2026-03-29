import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface IndustryChild {
  value: string;
  label: string;
  emoji: string;
}

export interface IndustryParent {
  value: string;
  label: string;
  emoji: string;
  children: IndustryChild[];
}

/**
 * 從 industry_templates 載入父子兩層結構
 * 父層：parent_id IS NULL 且 keywords 為空陣列
 * 子層：parent_id 指向父層的 template_id
 */
export const useIndustryTree = () => {
  return useQuery<IndustryParent[]>({
    queryKey: ["industry-tree"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("industry_templates")
        .select("template_id, label, emoji, parent_id, sort_order")
        .eq("is_active", true)
        .order("sort_order");

      if (error) {
        console.error("[useIndustryTree] DB error:", error);
        return [];
      }

      if (!data) return [];

      // Separate parents and children
      const parents = data.filter((t) => !t.parent_id);
      const children = data.filter((t) => !!t.parent_id);

      return parents.map((p) => ({
        value: p.template_id,
        label: p.label,
        emoji: p.emoji,
        children: children
          .filter((c) => c.parent_id === p.template_id)
          .map((c) => ({
            value: c.template_id,
            label: c.label,
            emoji: c.emoji,
          })),
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * 根據子模板 template_id 找到其父層 template_id
 */
export const findParentId = (
  tree: IndustryParent[],
  childTemplateId: string | null | undefined
): string => {
  if (!childTemplateId) return "";
  for (const parent of tree) {
    if (parent.children.some((c) => c.value === childTemplateId)) {
      return parent.value;
    }
  }
  return "";
};

/**
 * 根據子模板 template_id 取得顯示名稱（含 emoji）
 */
export const getChildLabel = (
  tree: IndustryParent[],
  childTemplateId: string | null | undefined
): string => {
  if (!childTemplateId) return "未設定";
  for (const parent of tree) {
    const child = parent.children.find((c) => c.value === childTemplateId);
    if (child) return `${child.emoji} ${child.label}`;
  }
  return childTemplateId;
};
