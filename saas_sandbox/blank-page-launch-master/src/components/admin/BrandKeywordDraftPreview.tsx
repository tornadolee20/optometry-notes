import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, Check, X, Pencil, AlertTriangle } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface BrandDraftKeyword {
  keyword: string;
  category: string;
  dimension: string;
}

const DIMENSION_LABELS: Record<string, string> = {
  expertise: "專業技術與商品力",
  communication: "解說溝通與教育",
  process: "服務流程與動線",
  environment: "空間環境與氛圍",
  pricing: "價格與收費透明",
  aftercare: "售後與回訪關懷",
  demographics: "特定客群體驗",
  trust: "在地信任與品牌形象",
};

const DIMENSION_COLORS: Record<string, string> = {
  expertise: "bg-purple-100 text-purple-700 border-purple-200",
  communication: "bg-blue-100 text-blue-700 border-blue-200",
  process: "bg-cyan-100 text-cyan-700 border-cyan-200",
  environment: "bg-green-100 text-green-700 border-green-200",
  pricing: "bg-amber-100 text-amber-700 border-amber-200",
  aftercare: "bg-rose-100 text-rose-700 border-rose-200",
  demographics: "bg-orange-100 text-orange-700 border-orange-200",
  trust: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

const DIMENSION_DOT_COLORS: Record<string, string> = {
  expertise: "bg-purple-500",
  communication: "bg-blue-500",
  process: "bg-cyan-500",
  environment: "bg-green-500",
  pricing: "bg-amber-500",
  aftercare: "bg-rose-500",
  demographics: "bg-orange-500",
  trust: "bg-indigo-500",
};

const ALL_DIMENSIONS = Object.keys(DIMENSION_LABELS);

interface BrandKeywordDraftPreviewProps {
  templateId: string;
  templateLabel: string;
  parentLabel: string;
  brandName: string;
  brandStyleHint?: string;
  onApplied: () => void;
  onClose: () => void;
}

export function BrandKeywordDraftPreview({
  templateId,
  templateLabel,
  parentLabel,
  brandName,
  brandStyleHint,
  onApplied,
  onClose,
}: BrandKeywordDraftPreviewProps) {
  const { toast } = useToast();
  const [keywords, setKeywords] = useState<BrandDraftKeyword[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  const generate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-brand-keywords", {
        body: {
          parentCategoryName: parentLabel,
          industryTemplateName: templateLabel,
          brandName,
          brandStyleHint: brandStyleHint || "",
        },
      });
      if (error) throw error;
      if (data?.keywords) {
        setKeywords(data.keywords);
        setHasGenerated(true);
        if (data.total < data.target) {
          toast({
            variant: "destructive",
            title: `僅生成 ${data.total} 個`,
            description: `請手動補足至 ${data.target} 個`,
          });
        }
      } else {
        throw new Error("No keywords returned");
      }
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "生成失敗",
        description: err instanceof Error ? err.message : "未知錯誤",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords((prev) => prev.filter((_, i) => i !== index));
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(keywords[index].keyword);
  };

  const saveEdit = (index: number) => {
    const trimmed = editValue.trim();
    if (trimmed.length >= 3 && trimmed.length <= 7) {
      setKeywords((prev) =>
        prev.map((k, i) => (i === index ? { ...k, keyword: trimmed } : k))
      );
    }
    setEditingIndex(null);
  };

  const isInvalid = (kw: string) => kw.length < 3 || kw.length > 7;
  const invalidCount = keywords.filter((k) => isInvalid(k.keyword)).length;
  const validCount = keywords.filter((k) => !isInvalid(k.keyword)).length;
  const byDim = (dim: string) => keywords.filter((k) => k.dimension === dim);

  const applyToTemplate = async () => {
    if (invalidCount > 0) {
      toast({
        variant: "destructive",
        title: "有不合規格的關鍵字",
        description: "請修正 3-7 字的限制",
      });
      return;
    }
    setIsApplying(true);
    try {
      const templateKeywords: Json = keywords.map((k) => ({
        keyword: k.keyword,
        category: k.category,
        dimension: k.dimension,
      }));

      const { error } = await supabase
        .from("industry_templates")
        .update({
          keywords: templateKeywords,
          updated_at: new Date().toISOString(),
        })
        .eq("template_id", templateId);

      if (error) throw error;

      toast({
        title: "✅ 已套用為品牌模板關鍵字",
        description: `${keywords.length} 個品牌關鍵字已寫入`,
      });
      onApplied();
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "套用失敗",
        description: err instanceof Error ? err.message : "未知錯誤",
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            🏷️ 品牌關鍵字草稿 — {brandName}（{templateLabel}）
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasGenerated ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-2">
              AI 將為品牌「{brandName}」（{parentLabel} → {templateLabel}）
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              生成 48 個品牌專屬關鍵字，涵蓋八大構面
            </p>
            <Button onClick={generate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  品牌關鍵字生成中...
                </>
              ) : (
                "🏷️ 一鍵 AI 產生品牌關鍵字 (48)"
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Stats bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">
                可套用 {validCount} / 48 個（共 {keywords.length} 個）
              </Badge>
              {invalidCount > 0 && (
                <Badge variant="destructive">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {invalidCount} 個不合規格
                </Badge>
              )}
            </div>

            {/* Dimension distribution summary */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {ALL_DIMENSIONS.map((dim) => {
                const count = byDim(dim).length;
                return (
                  <Badge
                    key={dim}
                    variant="outline"
                    className={`text-[10px] ${DIMENSION_COLORS[dim]}`}
                  >
                    {DIMENSION_LABELS[dim]}: {count}
                  </Badge>
                );
              })}
            </div>

            {/* Keywords by dimension */}
            {ALL_DIMENSIONS.map((dim) => {
              const dimKeywords = byDim(dim);
              if (dimKeywords.length === 0) return null;
              return (
                <div key={dim}>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${DIMENSION_DOT_COLORS[dim]}`}
                    />
                    {DIMENSION_LABELS[dim]} ({dimKeywords.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {keywords.map((kw, idx) => {
                      if (kw.dimension !== dim) return null;
                      const invalid = isInvalid(kw.keyword);

                      if (editingIndex === idx) {
                        return (
                          <div key={idx} className="flex items-center gap-1">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit(idx);
                                if (e.key === "Escape") setEditingIndex(null);
                              }}
                              className="h-7 w-28 text-xs"
                              autoFocus
                            />
                            <span className="text-[10px] text-muted-foreground">
                              {editValue.length}字
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={() => saveEdit(idx)}
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          </div>
                        );
                      }

                      return (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border group cursor-default ${
                            invalid
                              ? "bg-red-50 text-red-700 border-red-300"
                              : "bg-muted/50 text-foreground border-border"
                          }`}
                        >
                          {kw.keyword}
                          {invalid && (
                            <span className="text-[10px] text-red-500">
                              ({kw.keyword.length}字)
                            </span>
                          )}
                          <button
                            onClick={() => startEdit(idx)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Pencil className="w-2.5 h-2.5 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => removeKeyword(idx)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-2.5 h-2.5 text-destructive" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={generate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="w-3 h-3 mr-1" />
                )}
                🔄 重新生成
              </Button>
              <Button
                size="sm"
                onClick={applyToTemplate}
                disabled={isApplying || invalidCount > 0}
              >
                {isApplying ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Check className="w-3 h-3 mr-1" />
                )}
                ✅ 儲存為此品牌模板的關鍵字
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
