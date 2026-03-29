import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, Check, X, Pencil, AlertTriangle } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface DraftKeyword {
  keyword: string;
  category: "service" | "tech" | "env" | "price";
}

const CATEGORY_LABELS: Record<string, string> = {
  service: "服務溝通",
  tech: "技術成效",
  env: "環境設備",
  price: "價格相關",
};

const CATEGORY_COLORS: Record<string, string> = {
  service: "bg-blue-100 text-blue-700 border-blue-200",
  tech: "bg-purple-100 text-purple-700 border-purple-200",
  env: "bg-green-100 text-green-700 border-green-200",
  price: "bg-amber-100 text-amber-700 border-amber-200",
};

interface KeywordDraftPreviewProps {
  templateId: string;
  templateLabel: string;
  parentLabel: string;
  description?: string;
  onApplied: () => void;
  onClose: () => void;
}

export function KeywordDraftPreview({
  templateId,
  templateLabel,
  parentLabel,
  description,
  onApplied,
  onClose,
}: KeywordDraftPreviewProps) {
  const { toast } = useToast();
  const [keywords, setKeywords] = useState<DraftKeyword[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  const generate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-template-keywords", {
        body: { templateLabel, parentLabel, description: description || "" },
      });
      if (error) throw error;
      if (data?.keywords) {
        setKeywords(data.keywords);
        setHasGenerated(true);
        if (data.total < data.target) {
          toast({ variant: "destructive", title: `僅生成 ${data.total} 個`, description: `請手動補足至 ${data.target} 個` });
        }
      } else {
        throw new Error("No keywords returned");
      }
    } catch (err: unknown) {
      toast({ variant: "destructive", title: "生成失敗", description: err instanceof Error ? err.message : '未知錯誤' });
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
      setKeywords((prev) => prev.map((k, i) => (i === index ? { ...k, keyword: trimmed } : k)));
    }
    setEditingIndex(null);
  };

  const isInvalid = (kw: string) => kw.length < 3 || kw.length > 7;

  const invalidCount = keywords.filter((k) => isInvalid(k.keyword)).length;
  const validCount = keywords.filter((k) => !isInvalid(k.keyword)).length;
  const byCat = (cat: string) => keywords.filter((k) => k.category === cat);

  const applyToTemplate = async () => {
    if (invalidCount > 0) {
      toast({ variant: "destructive", title: "有不合規格的關鍵字", description: "請修正 3-7 字的限制" });
      return;
    }
    setIsApplying(true);
    try {
      const templateKeywords: Json = keywords.map((k) => ({
        keyword: k.keyword,
        category: k.category,
      }));

      const { error } = await supabase
        .from("industry_templates")
        .update({ keywords: templateKeywords, updated_at: new Date().toISOString() })
        .eq("template_id", templateId);

      if (error) throw error;

      toast({ title: "✅ 已套用為正式模板關鍵字", description: `${keywords.length} 個關鍵字已寫入` });
      onApplied();
    } catch (err: unknown) {
      toast({ variant: "destructive", title: "套用失敗", description: err instanceof Error ? err.message : '未知錯誤' });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            ✨ AI 關鍵字草稿 — {templateLabel}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasGenerated ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              AI 將為「{parentLabel} → {templateLabel}」生成 48 個關鍵字草稿
            </p>
            <Button onClick={generate} disabled={isGenerating}>
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />生成中...</>
              ) : (
                "✨ 開始生成"
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Stats bar */}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline">可套用 {validCount} / 48 個（共 {keywords.length} 個）</Badge>
              {["service", "tech", "env", "price"].map((cat) => (
                <Badge key={cat} variant="outline" className={CATEGORY_COLORS[cat]}>
                  {CATEGORY_LABELS[cat]}: {byCat(cat).length}
                </Badge>
              ))}
              {invalidCount > 0 && (
                <Badge variant="destructive">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {invalidCount} 個不合規格
                </Badge>
              )}
            </div>

            {/* Keywords by category */}
            {["service", "tech", "env", "price"].map((cat) => (
              <div key={cat}>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    cat === "service" ? "bg-blue-500" : cat === "tech" ? "bg-purple-500" : cat === "env" ? "bg-green-500" : "bg-amber-500"
                  }`} />
                  {CATEGORY_LABELS[cat]} ({byCat(cat).length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {keywords.map((kw, idx) => {
                    if (kw.category !== cat) return null;
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
                            className="h-7 w-24 text-xs"
                            autoFocus
                          />
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => saveEdit(idx)}>
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
                        {invalid && <span className="text-[10px] text-red-500">({kw.keyword.length}字)</span>}
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
            ))}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={generate} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                🔄 重新生成
              </Button>
              <Button size="sm" onClick={applyToTemplate} disabled={isApplying || invalidCount > 0}>
                {isApplying ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                ✅ 套用為正式模板關鍵字
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
