import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Rocket, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIndustryTree, getChildLabel } from "@/hooks/useIndustryTree";

interface IndustryOnboardingProps {
  storeId: string;
  storeIndustry?: string;
  keywordCount: number;
  onKeywordsApplied: () => void;
}

export const IndustryOnboarding = ({
  storeId,
  storeIndustry,
  keywordCount,
  onKeywordsApplied,
}: IndustryOnboardingProps) => {
  const { toast } = useToast();
  const [isApplying, setIsApplying] = useState(false);
  const { data: industryTree = [] } = useIndustryTree();

  // 只在關鍵字數量為 0 且已設定產業時顯示
  if (keywordCount > 0 || !storeIndustry) return null;

  const industryLabel = getChildLabel(industryTree, storeIndustry);

  const mapCategory = (cat: string): "general" | "product" | "service" | "location" | "experience" => {
    const m: Record<string, "general" | "product" | "service" | "location" | "experience"> = {
      general: "general", product: "product", service: "service",
      location: "location", experience: "experience",
      price: "general", tech: "product", env: "experience",
    };
    return m[cat] || "general";
  };

  const handleApply = async () => {
    setIsApplying(true);
    try {
      // 從資料庫取得該產業模板的關鍵字
      const { data: template } = await supabase
        .from("industry_templates")
        .select("keywords, label")
        .eq("template_id", storeIndustry)
        .eq("is_active", true)
        .single();

      if (!template?.keywords || !Array.isArray(template.keywords)) {
        throw new Error("找不到對應的產業模板");
      }

      // 清除舊關鍵字後插入新的
      await supabase.from("store_keywords").delete().eq("store_id", storeId);

      const rawKeywords = template.keywords as Array<{ text?: string; keyword?: string; category?: string }>;
      const keywordsToInsert = rawKeywords
        .map((kw, idx) => ({
          store_id: storeId,
          keyword: kw.text || kw.keyword || '',
          category: mapCategory(kw.category || "general"),
          source: "system",
          is_primary: idx < 12,
          priority: idx,
          industry: storeIndustry,
        }))
        .filter(kw => kw.keyword.length >= 3 && kw.keyword.length <= 7);

      const { error } = await supabase.from("store_keywords").insert(keywordsToInsert);
      if (error) throw error;

      toast({
        title: "🎉 設定完成！",
        description: `已載入「${template.label}」的 ${keywordsToInsert.length} 個關鍵字，立即開始收集好評吧！`,
      });

      onKeywordsApplied();
    } catch (error: unknown) {
      console.error('[Onboarding] Apply failed:', error);
      toast({
        variant: "destructive",
        title: "套用失敗",
        description: error instanceof Error ? error.message : "請稍後重試",
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-200 rounded-2xl p-6 mb-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Rocket className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-emerald-900 mb-1">
              🚀 尚未載入關鍵字
            </h3>
            <p className="text-sm text-emerald-700">
              您的產業為「{industryLabel}」，點擊下方按鈕立即套用專屬關鍵字模板！
            </p>
          </div>

          <Button
            onClick={handleApply}
            disabled={isApplying}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            {isApplying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                套用中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                一鍵套用「{industryLabel}」關鍵字
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
