import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, RotateCcw, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TEMPLATE_CATEGORY_MAP } from "@/config/industryTemplates";
import type { IndustryTemplate, TemplateKeyword } from "@/config/industryTemplates";
import { fetchIndustryTemplates } from "@/services/industry-template-service";
import { supabase } from "@/integrations/supabase/client";
import type { Keyword } from "@/types/store";

// LocalStorage key for keyword backup
const BACKUP_KEY = 'sandbox_keyword_backup';

interface KeywordBackup {
  storeId: string;
  keywords: Keyword[];
  timestamp: number;
}

interface IndustryTemplateSwitcherProps {
  storeId: string;
  currentKeywords: Keyword[];
  onKeywordsChanged: () => void;
  storeIndustry?: string;
}

export const IndustryTemplateSwitcher = ({
  storeId,
  currentKeywords,
  onKeywordsChanged,
  storeIndustry,
}: IndustryTemplateSwitcherProps) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<IndustryTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("current");
  const [previewKeywords, setPreviewKeywords] = useState<TemplateKeyword[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [hasBackup, setHasBackup] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load templates from DB (with fallback)
  useEffect(() => {
    fetchIndustryTemplates().then(setTemplates);
  }, []);

  // Auto-sync with store's industry when templates load or storeIndustry changes
  useEffect(() => {
    if (!storeIndustry || templates.length === 0) return;
    const match = templates.find(t => t.id === storeIndustry);
    if (match) {
      setSelectedTemplate(storeIndustry);
      setPreviewKeywords(match.keywords);
    }
  }, [storeIndustry, templates]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check for existing backup on mount
  useEffect(() => {
    const backup = localStorage.getItem(BACKUP_KEY);
    if (backup) {
      try {
        const parsed: KeywordBackup = JSON.parse(backup);
        if (parsed.storeId === storeId) {
          setHasBackup(true);
        }
      } catch (e) {
        // Invalid backup, ignore
      }
    }
  }, [storeId]);

  const getTemplateById = (id: string) => templates.find(t => t.id === id);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId === "current") {
      setPreviewKeywords([]);
      return;
    }
    const template = getTemplateById(templateId);
    if (template) {
      setPreviewKeywords(template.keywords);
    }
  };

  const saveBackup = () => {
    const backup: KeywordBackup = {
      storeId,
      keywords: currentKeywords,
      timestamp: Date.now(),
    };
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
    setHasBackup(true);
  };

  const handleApplyTemplate = async () => {
    if (selectedTemplate === "current" || previewKeywords.length === 0) return;

    const template = getTemplateById(selectedTemplate);
    if (!template) return;

    setIsApplying(true);
    try {
      // 1. Backup current keywords to localStorage
      saveBackup();

      // 2. Delete all current keywords first
      if (currentKeywords.length > 0) {
        
        const { error: deleteError } = await supabase
          .from('store_keywords')
          .delete()
          .eq('store_id', storeId);
        if (deleteError) {
          console.error('[Template] Delete error:', deleteError);
          throw deleteError;
        }
      }

      // 3. Insert template keywords in batches of 12
      const BATCH_SIZE = 12;
      const keywords = template.keywords;

      

      for (let batchIndex = 0; batchIndex < Math.ceil(keywords.length / BATCH_SIZE); batchIndex++) {
        const batch = keywords.slice(batchIndex * BATCH_SIZE, (batchIndex + 1) * BATCH_SIZE);
        const inserts = batch.map((kw: TemplateKeyword, i: number) => {
          const globalIndex = batchIndex * BATCH_SIZE + i;
          const dbCategory = TEMPLATE_CATEGORY_MAP[kw.category] as 'general' | 'product' | 'service' | 'location' | 'experience';

          return {
            store_id: storeId,
            keyword: kw.keyword,
            category: dbCategory,
            source: 'system' as const,
            is_primary: globalIndex < 12,
            usage_count: 0,
            priority: globalIndex,
          };
        });

        

        const { error: insertError } = await supabase
          .from('store_keywords')
          .insert(inserts);

        if (insertError) {
          console.error('[Template] Insert error in batch', batchIndex + 1, ':', insertError);
          throw insertError;
        }
      }

      onKeywordsChanged();
      toast({
        title: "模板已套用",
        description: `已載入「${template.label}」的 ${template.keywords.length} 個關鍵字（舊設定已備份）`,
      });
    } catch (error: unknown) {
      console.error('[Template] Apply failed:', error);
      toast({
        variant: "destructive",
        title: "套用失敗",
        description: error instanceof Error ? error.message : "請稍後重試",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleRestoreBackup = async () => {
    const backupStr = localStorage.getItem(BACKUP_KEY);
    if (!backupStr) return;

    let backup: KeywordBackup;
    try {
      backup = JSON.parse(backupStr);
      if (backup.storeId !== storeId) {
        toast({
          variant: "destructive",
          title: "備份不匹配",
          description: "此備份屬於其他店家",
        });
        return;
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "備份無效",
        description: "無法讀取備份資料",
      });
      return;
    }

    setIsApplying(true);
    try {
      // Delete current
      const { error: deleteError } = await supabase
        .from('store_keywords')
        .delete()
        .eq('store_id', storeId);
      if (deleteError) throw deleteError;

      // Restore backup in batches
      if (backup.keywords.length > 0) {
        const BATCH_SIZE = 12;
        for (let i = 0; i < backup.keywords.length; i += BATCH_SIZE) {
          const batch = backup.keywords.slice(i, i + BATCH_SIZE);
          const inserts = batch.map((kw: Keyword, j: number) => {
            let dbCategory: 'general' | 'product' | 'service' | 'location' | 'experience' = 'general';
            if (kw.category === 'area') dbCategory = 'location';
            else if (kw.category === 'environment') dbCategory = 'experience';
            else if (['general', 'product', 'service'].includes(kw.category)) {
              dbCategory = kw.category as 'general' | 'product' | 'service';
            }

            return {
              store_id: storeId,
              keyword: kw.keyword,
              category: dbCategory,
              source: kw.source || 'manual',
              is_primary: kw.is_primary || false,
              usage_count: kw.usage_count || 0,
              priority: i + j,
            };
          });

          const { error: insertError } = await supabase
            .from('store_keywords')
            .insert(inserts);
          if (insertError) throw insertError;
        }
      }

      // Clear backup
      localStorage.removeItem(BACKUP_KEY);
      setHasBackup(false);
      setSelectedTemplate("current");
      setPreviewKeywords([]);
      onKeywordsChanged();

      toast({
        title: "已恢復",
        description: `關鍵字已恢復為備份設定（${backup.keywords.length} 個）`,
      });
    } catch (error) {
      console.error('恢復備份失敗:', error);
      toast({
        variant: "destructive",
        title: "恢復失敗",
        description: "請稍後重試",
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 mb-4">
      <div className="flex items-center gap-2">
        <FlaskConical className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-medium text-amber-900">🧪 行業模板深度切換（沙盒測試）</span>
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
          開發者專用
        </Badge>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
          <SelectTrigger className="w-64 h-8 text-sm bg-white">
            <SelectValue placeholder="選擇行業模板" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">目前設定</SelectItem>
            {templates.map(t => (
              <SelectItem key={t.id} value={t.id}>
                {t.emoji} {t.id === storeIndustry ? `⭐ 目前店家：${t.label}` : t.label} ({t.keywords.length}個)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedTemplate !== "current" && (
          <Button
            size="sm"
            onClick={handleApplyTemplate}
            disabled={isApplying}
            className="h-8 bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Check className="w-3 h-3 mr-1" />
            {isApplying ? '套用中...' : '全部套用（覆蓋）'}
          </Button>
        )}

        {hasBackup && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRestoreBackup}
            disabled={isApplying}
            className="h-8 border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            恢復上次設定
          </Button>
        )}
      </div>

      {/* Preview keywords */}
      {previewKeywords.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-600">預覽（{previewKeywords.length} 個關鍵字）：</p>
            {previewKeywords.length > 24 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 text-xs text-amber-700 hover:text-amber-900 px-2"
              >
                {isExpanded ? (
                  <><ChevronUp className="w-3 h-3 mr-1" />收起</>
                ) : (
                  <><ChevronDown className="w-3 h-3 mr-1" />展開全部 {previewKeywords.length} 個</>
                )}
              </Button>
            )}
          </div>
          <div className={`flex flex-wrap gap-1.5 ${isExpanded ? 'max-h-64' : 'max-h-32'} overflow-y-auto`}>
            {(isExpanded ? previewKeywords : previewKeywords.slice(0, 24)).map((kw, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-xs bg-amber-100 text-amber-800 border-amber-200"
              >
                {kw.keyword}
              </Badge>
            ))}
            {!isExpanded && previewKeywords.length > 24 && (
              <Badge variant="outline" className="text-xs text-amber-600">
                +{previewKeywords.length - 24} 更多...
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
