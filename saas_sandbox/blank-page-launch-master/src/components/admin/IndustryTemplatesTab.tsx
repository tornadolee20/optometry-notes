import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, Edit2, Trash2, Upload, Eye, EyeOff, Package, Play, Loader2, Tag, Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchAllTemplatesForAdmin, 
  deleteIndustryTemplate,
  seedTemplatesFromHardcoded,
  toggleTemplateActive,
  type DbIndustryTemplate 
} from '@/services/industry-template-service';
import { type TemplateKeyword, type TemplateCategory, TEMPLATE_CATEGORY_LABELS } from '@/config/industryTemplates';
import { BrandKeywordDraftPreview } from './BrandKeywordDraftPreview';

interface TemplateFormData {
  templateId: string;
  label: string;
  emoji: string;
  keywords: TemplateKeyword[];
  isBrandTemplate: boolean;
  brandName: string;
  brandStyleHint: string;
}

const EMPTY_FORM: TemplateFormData = {
  templateId: '',
  label: '',
  emoji: '📦',
  keywords: [],
  isBrandTemplate: false,
  brandName: '',
  brandStyleHint: '',
};

// Extend DbIndustryTemplate to include brand fields
interface ExtendedDbTemplate extends DbIndustryTemplate {
  is_brand_template?: boolean;
  brand_name?: string;
  brand_style_hint?: string;
}

export const IndustryTemplatesTab: React.FC = () => {
  const [templates, setTemplates] = useState<ExtendedDbTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateFormData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [keywordsText, setKeywordsText] = useState('');
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [previewResult, setPreviewResult] = useState<string | null>(null);
  const [previewLabel, setPreviewLabel] = useState<string>('');
  const [brandDraftTemplateId, setBrandDraftTemplateId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    // Fetch with brand fields
    try {
      const { data, error } = await supabase
        .from('industry_templates')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      
      const parsed = (data || []).map(t => ({
        ...t,
        keywords: Array.isArray(t.keywords) ? t.keywords as unknown as TemplateKeyword[] : [],
      })) as ExtendedDbTemplate[];
      
      setTemplates(parsed);
    } catch {
      const fallback = await fetchAllTemplatesForAdmin();
      setTemplates(fallback as ExtendedDbTemplate[]);
    }
    setIsLoading(false);
  };

  // ── Export all templates as JSON ──
  const handleExportJSON = () => {
    const exportData = templates.map(t => ({
      template_id: t.template_id,
      label: t.label,
      emoji: t.emoji,
      keywords: t.keywords,
      is_active: t.is_active,
      sort_order: t.sort_order,
      parent_id: (t as any).parent_id || null,
      is_brand_template: t.is_brand_template || false,
      brand_name: t.brand_name || null,
      brand_style_hint: t.brand_style_hint || null,
    }));

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `industry-templates_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast({ title: '匯出成功', description: `已匯出 ${exportData.length} 個產業模板` });
  };

  // ── Import templates from JSON ──
  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const importData = JSON.parse(text) as Array<Record<string, unknown>>;

      if (!Array.isArray(importData) || importData.length === 0) {
        throw new Error('檔案格式不正確，需為 JSON 陣列');
      }

      let upserted = 0;
      for (const item of importData) {
        if (!item.template_id || !item.label) continue;

        const { error } = await supabase
          .from('industry_templates')
          .upsert({
            template_id: item.template_id as string,
            label: item.label as string,
            emoji: (item.emoji as string) || '📦',
            keywords: (item.keywords ?? []) as unknown as import('@/integrations/supabase/types').Json,
            is_active: item.is_active !== false,
            sort_order: (item.sort_order as number) || 0,
            parent_id: (item.parent_id as string) || null,
            is_brand_template: (item.is_brand_template as boolean) || false,
            brand_name: (item.brand_name as string) || null,
            brand_style_hint: (item.brand_style_hint as string) || null,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'template_id' });

        if (error) {
          console.error(`[TemplateImport] Failed for ${item.template_id}:`, error);
        } else {
          upserted++;
        }
      }

      toast({ title: '匯入成功', description: `已匯入/更新 ${upserted} 個產業模板` });
      loadTemplates();
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: '匯入失敗', description: err instanceof Error ? err.message : '檔案格式錯誤' });
    } finally {
      setIsImporting(false);
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSeedFromHardcoded = async () => {
    const result = await seedTemplatesFromHardcoded();
    if (result.success) {
      toast({ title: '成功', description: `已從程式碼匯入 ${result.count} 個產業模板` });
      loadTemplates();
    } else {
      toast({ variant: 'destructive', title: '失敗', description: result.error });
    }
  };

  const handleEdit = (template: ExtendedDbTemplate) => {
    setEditingTemplate({
      templateId: template.template_id,
      label: template.label,
      emoji: template.emoji,
      keywords: template.keywords,
      isBrandTemplate: template.is_brand_template || false,
      brandName: template.brand_name || '',
      brandStyleHint: template.brand_style_hint || '',
    });
    const text = template.keywords.map(k => `${k.keyword}|${k.category}`).join('\n');
    setKeywordsText(text);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setEditingTemplate({ ...EMPTY_FORM });
    setKeywordsText('');
    setIsEditing(true);
  };

  const parseKeywordsText = (text: string): TemplateKeyword[] => {
    const lines = text.split('\n').filter(l => l.trim());
    return lines.map(line => {
      const parts = line.split('|');
      const keyword = parts[0]?.trim() || '';
      const category = (parts[1]?.trim() || 'service') as TemplateCategory;
      return { keyword, category };
    });
  };

  const handleSave = async () => {
    if (!editingTemplate) return;
    
    const keywords = parseKeywordsText(keywordsText);
    
    if (!editingTemplate.templateId.trim()) {
      toast({ variant: 'destructive', title: '錯誤', description: '請填寫模板 ID' });
      return;
    }
    if (!editingTemplate.label.trim()) {
      toast({ variant: 'destructive', title: '錯誤', description: '請填寫產業名稱' });
      return;
    }
    if (keywords.length === 0) {
      toast({ variant: 'destructive', title: '錯誤', description: '請至少輸入一個關鍵字' });
      return;
    }

    setIsSaving(true);
    
    // Save with brand fields
    try {
      const { data: existing } = await supabase
        .from('industry_templates')
        .select('id')
        .eq('template_id', editingTemplate.templateId)
        .single();

      const updateData: Record<string, unknown> = {
        label: editingTemplate.label,
        emoji: editingTemplate.emoji,
        keywords: keywords as unknown as Record<string, unknown>[],
        is_brand_template: editingTemplate.isBrandTemplate,
        brand_name: editingTemplate.isBrandTemplate ? editingTemplate.brandName : null,
        brand_style_hint: editingTemplate.isBrandTemplate ? editingTemplate.brandStyleHint : null,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        const { error } = await supabase
          .from('industry_templates')
          .update(updateData)
          .eq('template_id', editingTemplate.templateId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('industry_templates')
          .insert([{
            template_id: editingTemplate.templateId,
            label: updateData.label as string,
            emoji: updateData.emoji as string,
            keywords: updateData.keywords as unknown as import('@/integrations/supabase/types').Json,
            is_brand_template: updateData.is_brand_template as boolean,
            brand_name: updateData.brand_name as string | null,
            brand_style_hint: updateData.brand_style_hint as string | null,
            sort_order: 0,
          }]);
        if (error) throw error;
      }

      toast({ title: '成功', description: '模板已儲存' });
      setIsEditing(false);
      loadTemplates();
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: '儲存失敗', description: err instanceof Error ? err.message : '未知錯誤' });
    }
    
    setIsSaving(false);
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm(`確定要刪除此模板嗎？`)) return;
    const result = await deleteIndustryTemplate(templateId);
    if (result.success) {
      toast({ title: '已刪除' });
      loadTemplates();
    } else {
      toast({ variant: 'destructive', title: '刪除失敗', description: result.error });
    }
  };

  const handleToggleActive = async (templateId: string, isActive: boolean) => {
    const result = await toggleTemplateActive(templateId, !isActive);
    if (result.success) {
      toast({ title: isActive ? '已停用' : '已啟用' });
      loadTemplates();
    }
  };

  const handlePreviewGenerate = async (template: ExtendedDbTemplate) => {
    setPreviewingId(template.template_id);
    setPreviewLabel(template.label);
    setPreviewResult(null);
    try {
      const sampleKeywords = template.keywords.slice(0, 6).map(k => k.keyword);
      const { data, error } = await supabase.functions.invoke('generate-review', {
        body: {
          storeName: `${template.label}範例店家`,
          address: '台北市中正區範例路1號',
          keywords: sampleKeywords,
          customFeelings: [],
          description: `這是一間${template.label}店家`,
        },
      });
      if (error) throw error;
      setPreviewResult(data?.review || data?.text || JSON.stringify(data));
    } catch (err: unknown) {
      setPreviewResult(`生成失敗：${err instanceof Error ? err.message : '未知錯誤'}`);
    } finally {
      setPreviewingId(null);
    }
  };

  const getKeywordStatusLight = (count: number) => {
    if (count === 0) return '🔴';
    if (count < 48) return '🟡';
    return '🟢';
  };

  // Find the brand draft target template
  const brandDraftTemplate = brandDraftTemplateId 
    ? templates.find(t => t.template_id === brandDraftTemplateId)
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Brand Keyword Draft Preview */}
      {brandDraftTemplate && (
        <BrandKeywordDraftPreview
          templateId={brandDraftTemplate.template_id}
          templateLabel={brandDraftTemplate.label}
          parentLabel={(brandDraftTemplate as any).parent_id || brandDraftTemplate.label || ''}
          brandName={brandDraftTemplate.brand_name || ''}
          brandStyleHint={brandDraftTemplate.brand_style_hint || ''}
          onApplied={() => {
            setBrandDraftTemplateId(null);
            loadTemplates();
          }}
          onClose={() => setBrandDraftTemplateId(null)}
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button onClick={handleCreate} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          新增產業
        </Button>
        <Button onClick={handleExportJSON} variant="outline" size="sm" className="gap-1.5" disabled={templates.length === 0}>
          <Download className="w-4 h-4" />
          匯出 JSON
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={isImporting}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-4 h-4" />
          {isImporting ? '匯入中…' : '匯入 JSON'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImportJSON}
        />
        {templates.length === 0 && (
          <Button onClick={handleSeedFromHardcoded} variant="outline" size="sm" className="gap-1.5">
            <Upload className="w-4 h-4" />
            從程式碼匯入預設
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        共 {templates.length} 個產業模板（{templates.filter(t => t.is_active).length} 個啟用中，
        {templates.filter(t => t.is_brand_template).length} 個品牌模板）
      </p>

      {/* Template List */}
      {templates.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">尚無產業模板</p>
          <p className="text-xs mt-1">點擊「從程式碼匯入預設」來初始化</p>
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map((template) => (
            <div 
              key={template.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                template.is_active 
                  ? 'border-border/50 hover:border-border hover:bg-accent/20' 
                  : 'border-border/30 bg-muted/30 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-2xl flex-shrink-0">{template.emoji}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{template.label}</span>
                    {template.is_brand_template && (
                      <Badge variant="default" className="text-[10px] bg-primary/90 gap-1">
                        <Tag className="w-2.5 h-2.5" />
                        品牌：{template.brand_name}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">
                      {getKeywordStatusLight(template.keywords.length)} {template.keywords.length}/48 關鍵字
                    </Badge>
                    {!template.is_active && (
                      <Badge variant="secondary" className="text-[10px]">已停用</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ID: {template.template_id}
                    {template.is_brand_template && template.brand_style_hint && (
                      <span className="ml-2 text-primary/70">風格：{template.brand_style_hint}</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Brand keyword generation button */}
                {template.is_brand_template && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs h-8 border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => setBrandDraftTemplateId(template.template_id)}
                    disabled={!!brandDraftTemplateId}
                  >
                    🏷️ AI 品牌關鍵字
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePreviewGenerate(template)}
                  disabled={previewingId === template.template_id}
                  title="預覽生成"
                >
                  {previewingId === template.template_id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <Play className="w-4 h-4 text-primary" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleToggleActive(template.template_id, template.is_active)}
                  title={template.is_active ? '停用' : '啟用'}
                >
                  {template.is_active ? (
                    <Eye className="w-4 h-4 text-success" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleEdit(template)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(template.template_id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate?.templateId ? '編輯產業模板' : '新增產業模板'}
            </DialogTitle>
          </DialogHeader>

          {editingTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>模板 ID（英文）</Label>
                  <Input
                    value={editingTemplate.templateId}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, templateId: e.target.value })}
                    placeholder="e.g. optical"
                    disabled={templates.some(t => t.template_id === editingTemplate.templateId)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>產業名稱</Label>
                  <Input
                    value={editingTemplate.label}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, label: e.target.value })}
                    placeholder="e.g. 眼鏡業"
                  />
                </div>
                <div className="space-y-2">
                  <Label>圖示 (Emoji)</Label>
                  <Input
                    value={editingTemplate.emoji}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, emoji: e.target.value })}
                    placeholder="👓"
                    className="text-center text-xl"
                  />
                </div>
              </div>

              {/* Brand template toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div>
                  <Label className="text-sm font-medium">品牌專用模板</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    啟用後可設定品牌名稱，並使用品牌專屬 AI 關鍵字生成
                  </p>
                </div>
                <Switch
                  checked={editingTemplate.isBrandTemplate}
                  onCheckedChange={(checked) => setEditingTemplate({ ...editingTemplate, isBrandTemplate: checked })}
                />
              </div>

              {editingTemplate.isBrandTemplate && (
                <div className="grid grid-cols-2 gap-4 p-3 rounded-lg border border-primary/20 bg-primary/5">
                  <div className="space-y-2">
                    <Label>品牌名稱</Label>
                    <Input
                      value={editingTemplate.brandName}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, brandName: e.target.value })}
                      placeholder="e.g. 小林眼鏡、路易莎咖啡"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>品牌風格簡述（選填）</Label>
                    <Input
                      value={editingTemplate.brandStyleHint}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, brandStyleHint: e.target.value })}
                      placeholder="e.g. 親子友善、CP值高、專業醫療形象"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>關鍵字列表</Label>
                  <span className="text-xs text-muted-foreground">
                    格式：關鍵字|分類（每行一個）
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  分類：{Object.entries(TEMPLATE_CATEGORY_LABELS).map(([k, v]) => `${k}=${v}`).join('、')}
                </div>
                <Textarea
                  value={keywordsText}
                  onChange={(e) => setKeywordsText(e.target.value)}
                  placeholder={`驗光很仔細|service\n解說很清楚|service\n設備很現代|tech\n環境整潔|env\n價格透明|price`}
                  className="font-mono text-sm min-h-[300px]"
                />
                <p className="text-xs text-muted-foreground">
                  目前共 {parseKeywordsText(keywordsText).length} 個關鍵字
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? '儲存中...' : '儲存模板'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Result Dialog */}
      <Dialog open={!!previewResult} onOpenChange={() => setPreviewResult(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="w-4 h-4 text-primary" />
              {previewLabel} - 評論預覽
            </DialogTitle>
          </DialogHeader>
          <div className="bg-muted/50 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto">
            {previewResult}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewResult(null)}>
              關閉
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IndustryTemplatesTab;
