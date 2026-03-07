import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, AlertCircle, Info, XCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CLINICAL_NORMS, getAgeBasedNorms } from '@/constants/clinicalNorms';

export type ValidationContext = 'save' | 'report';

export interface DefaultFieldInfo {
  fieldKey: string;
  labelZhTW: string;
  labelZhCN: string;
  labelEn: string;
  currentValue: string;
  isDefault: boolean;
  isCritical: boolean;
  isImportant: boolean;
}

export interface DataQualityWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: ValidationContext;
  completeness: number;
  defaultFields: DefaultFieldInfo[];
  onConfirm: () => void;
  onSaveDraft?: () => void;
}

export function DataQualityWarningDialog({
  open,
  onOpenChange,
  context,
  completeness,
  defaultFields,
  onConfirm,
  onSaveDraft,
}: DataQualityWarningDialogProps) {
  const { language } = useLanguage();
  const [acknowledged, setAcknowledged] = useState(false);

  const t = (zhTW: string, zhCN: string, en: string) => {
    if (language === 'en') return en;
    return language === 'zh-TW' ? zhTW : zhCN;
  };

  const criticalFields = defaultFields.filter(f => f.isCritical && f.isDefault);
  const importantFields = defaultFields.filter(f => f.isImportant && !f.isCritical && f.isDefault);

  // 根據 context 和 completeness 決定嚴重程度
  const getSeverityLevel = () => {
    if (context === 'report') {
      if (completeness < 20) return 'block';
      if (completeness < 50) return 'severe';
      if (completeness < 80) return 'moderate';
      return 'ok';
    } else {
      // save context
      if (completeness < 50) return 'warning';
      if (completeness < 80) return 'info';
      return 'ok';
    }
  };

  const severity = getSeverityLevel();

  const getDialogConfig = () => {
    switch (severity) {
      case 'block':
        return {
          icon: <XCircle className="h-6 w-6 text-destructive" />,
          title: t('無法產生報告', '无法生成报告', 'Cannot Generate Report'),
          description: t(
            '資料完整度過低，請至少填寫核心測量項目',
            '数据完整度过低，请至少填写核心测量项目',
            'Data completeness is too low. Please fill in at least the core measurement items.'
          ),
          showConfirm: false,
          confirmText: '',
          variant: 'destructive' as const,
        };
      case 'severe':
        return {
          icon: <AlertCircle className="h-6 w-6 text-destructive" />,
          title: t('資料驗證警告', '数据验证警告', 'Data Validation Warning'),
          description: t(
            '偵測到多個關鍵欄位仍使用預填值，報告可能不準確',
            '检测到多个关键字段仍使用预填值，报告可能不准确',
            'Multiple critical fields are using pre-filled values. Report may be inaccurate.'
          ),
          showConfirm: true,
          confirmText: t('我已確認資料正確，繼續產生報告', '我已确认数据正确，继续生成报告', 'I confirm data is correct, continue generating report'),
          variant: 'destructive' as const,
        };
      case 'moderate':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-warning" />,
          title: t('資料提示', '数据提示', 'Data Notice'),
          description: t(
            '部分欄位使用預填值，建議確認是否為實測數據',
            '部分字段使用预填值，建议确认是否为实测数据',
            'Some fields are using pre-filled values. Please confirm if they are actual measurements.'
          ),
          showConfirm: false,
          confirmText: '',
          variant: 'warning' as const,
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-warning" />,
          title: t('資料驗證警告', '数据验证警告', 'Data Validation Warning'),
          description: t(
            '資料完整度偏低，建議補充更多測量項目',
            '数据完整度偏低，建议补充更多测量项目',
            'Data completeness is low. Consider adding more measurements.'
          ),
          showConfirm: false,
          confirmText: '',
          variant: 'warning' as const,
        };
      case 'info':
        return {
          icon: <Info className="h-6 w-6 text-blue-500" />,
          title: t('資料提示', '数据提示', 'Data Notice'),
          description: t(
            '部分選填項目尚未填寫',
            '部分选填项目尚未填写',
            'Some optional items are not filled.'
          ),
          showConfirm: false,
          confirmText: '',
          variant: 'info' as const,
        };
      default:
        return {
          icon: <CheckCircle2 className="h-6 w-6 text-success" />,
          title: t('資料驗證通過', '数据验证通过', 'Data Validation Passed'),
          description: t('資料完整度良好', '数据完整度良好', 'Data completeness is good'),
          showConfirm: false,
          confirmText: '',
          variant: 'success' as const,
        };
    }
  };

  const config = getDialogConfig();

  const handleConfirm = () => {
    if (config.showConfirm && !acknowledged) return;
    onConfirm();
    onOpenChange(false);
    setAcknowledged(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
    setAcknowledged(false);
  };

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft();
    }
    onOpenChange(false);
    setAcknowledged(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {config.icon}
            <div>
              <DialogTitle>{config.title}</DialogTitle>
              <DialogDescription className="mt-1">
                {config.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 完整度指示器 */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>{t('資料完整度', '数据完整度', 'Data Completeness')}</span>
                <span className={cn(
                  'font-semibold',
                  completeness >= 80 ? 'text-success' :
                  completeness >= 50 ? 'text-warning' : 'text-destructive'
                )}>
                  {completeness}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full transition-all duration-300',
                    completeness >= 80 ? 'bg-success' :
                    completeness >= 50 ? 'bg-warning' : 'bg-destructive'
                  )}
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>
          </div>

          {/* 關鍵欄位警告 */}
          {criticalFields.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                <XCircle className="h-4 w-4" />
                {t(
                  `偵測到 ${criticalFields.length} 個關鍵欄位使用預填值：`,
                  `检测到 ${criticalFields.length} 个关键字段使用预填值：`,
                  `${criticalFields.length} critical field(s) using pre-filled values:`
                )}
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {criticalFields.map((field) => (
                  <div 
                    key={field.fieldKey}
                    className="flex items-center justify-between p-2 bg-destructive/10 rounded text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <XCircle className="h-3.5 w-3.5 text-destructive" />
                      {language === 'en' ? field.labelEn : language === 'zh-TW' ? field.labelZhTW : field.labelZhCN}
                    </span>
                    <span className="text-muted-foreground font-mono text-xs">
                      ({field.currentValue})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 重要欄位警告 */}
          {importantFields.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-warning">
                <AlertTriangle className="h-4 w-4" />
                {t(
                  `${importantFields.length} 個重要欄位使用預填值：`,
                  `${importantFields.length} 个重要字段使用预填值：`,
                  `${importantFields.length} important field(s) using pre-filled values:`
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {importantFields.map((field) => (
                  <span 
                    key={field.fieldKey}
                    className="px-2 py-1 bg-warning/10 text-warning rounded text-xs"
                  >
                    {language === 'en' ? field.labelEn : language === 'zh-TW' ? field.labelZhTW : field.labelZhCN}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 強制確認勾選框 */}
          {config.showConfirm && (
            <div className="flex items-start gap-3 p-3 border border-warning rounded-lg bg-warning/5">
              <Checkbox
                id="acknowledge"
                checked={acknowledged}
                onCheckedChange={(checked) => setAcknowledged(checked === true)}
              />
              <label 
                htmlFor="acknowledge" 
                className="text-sm cursor-pointer leading-relaxed"
              >
                {config.confirmText}
              </label>
            </div>
          )}

          {/* 提示訊息 */}
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            {t(
              '標示 📊 的欄位表示使用標準預填值，建議以實測數據替換',
              '标示 📊 的字段表示使用标准预填值，建议以实测数据替换',
              'Fields marked with 📊 indicate standard pre-filled values. Replace with actual measurements if possible.'
            )}
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={handleCancel}>
            {t('返回修改', '返回修改', 'Go Back')}
          </Button>
          
          {context === 'save' && onSaveDraft && severity !== 'ok' && (
            <Button variant="outline" onClick={handleSaveDraft}>
              {t('儲存草稿', '保存草稿', 'Save Draft')}
            </Button>
          )}
          
          {severity !== 'block' && (
            <Button 
              onClick={handleConfirm}
              disabled={config.showConfirm && !acknowledged}
              variant={severity === 'severe' ? 'destructive' : 'default'}
            >
              {context === 'save' 
                ? t('確認儲存', '确认保存', 'Confirm Save')
                : t('產生報告', '生成报告', 'Generate Report')
              }
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 根據當前數據和預設值狀態生成警告欄位列表
 */
export function generateDefaultFieldsInfo(
  isDefaultValues: Record<string, boolean>,
  values: Record<string, number | null>,
  age: number
): DefaultFieldInfo[] {
  const norms = getAgeBasedNorms(age);
  
  const fieldConfigs: Array<{
    key: string;
    labelZhTW: string;
    labelZhCN: string;
    labelEn: string;
    getValue: () => string;
    isCritical: boolean;
    isImportant: boolean;
  }> = [
    // 關鍵欄位 (CRITICAL)
    {
      key: 'distPhoria',
      labelZhTW: '遠距隱斜位',
      labelZhCN: '远距隐斜位',
      labelEn: 'Distance Phoria',
      getValue: () => `${values.distPhoria ?? 0}Δ`,
      isCritical: true,
      isImportant: false,
    },
    {
      key: 'nearPhoria',
      labelZhTW: '近距隱斜位',
      labelZhCN: '近距隐斜位',
      labelEn: 'Near Phoria',
      getValue: () => `${values.nearPhoria ?? -6}Δ`,
      isCritical: true,
      isImportant: false,
    },
    {
      key: 'npc',
      labelZhTW: '集合近點',
      labelZhCN: '集合近点',
      labelEn: 'NPC',
      getValue: () => `${values.npc ?? norms.npc}cm`,
      isCritical: true,
      isImportant: false,
    },
    {
      key: 'biB',
      labelZhTW: '近距 BI 破裂',
      labelZhCN: '近距 BI 破裂',
      labelEn: 'Near BI Break',
      getValue: () => `${values.biB ?? CLINICAL_NORMS.fusionalReserves.near.bi.break}Δ`,
      isCritical: true,
      isImportant: false,
    },
    {
      key: 'boB',
      labelZhTW: '近距 BO 破裂',
      labelZhCN: '近距 BO 破裂',
      labelEn: 'Near BO Break',
      getValue: () => `${values.boB ?? CLINICAL_NORMS.fusionalReserves.near.bo.break}Δ`,
      isCritical: true,
      isImportant: false,
    },
    // 重要欄位 (IMPORTANT)
    {
      key: 'vf',
      labelZhTW: '輻輳靈活度',
      labelZhCN: '辐辏灵活度',
      labelEn: 'Vergence Facility',
      getValue: () => `${values.vf ?? norms.vf} cpm`,
      isCritical: false,
      isImportant: true,
    },
    {
      key: 'biR',
      labelZhTW: '近距 BI 恢復',
      labelZhCN: '近距 BI 恢复',
      labelEn: 'Near BI Recovery',
      getValue: () => `${values.biR ?? CLINICAL_NORMS.fusionalReserves.near.bi.recovery}Δ`,
      isCritical: false,
      isImportant: true,
    },
    {
      key: 'boR',
      labelZhTW: '近距 BO 恢復',
      labelZhCN: '近距 BO 恢复',
      labelEn: 'Near BO Recovery',
      getValue: () => `${values.boR ?? CLINICAL_NORMS.fusionalReserves.near.bo.recovery}Δ`,
      isCritical: false,
      isImportant: true,
    },
    {
      key: 'distBiB',
      labelZhTW: '遠距 BI 破裂',
      labelZhCN: '远距 BI 破裂',
      labelEn: 'Distance BI Break',
      getValue: () => `${values.distBiB ?? CLINICAL_NORMS.fusionalReserves.distance.bi.break}Δ`,
      isCritical: false,
      isImportant: true,
    },
    {
      key: 'distBoB',
      labelZhTW: '遠距 BO 破裂',
      labelZhCN: '远距 BO 破裂',
      labelEn: 'Distance BO Break',
      getValue: () => `${values.distBoB ?? CLINICAL_NORMS.fusionalReserves.distance.bo.break}Δ`,
      isCritical: false,
      isImportant: true,
    },
  ];

  return fieldConfigs.map(config => ({
    fieldKey: config.key,
    labelZhTW: config.labelZhTW,
    labelZhCN: config.labelZhCN,
    labelEn: config.labelEn,
    currentValue: config.getValue(),
    isDefault: isDefaultValues[config.key] ?? true,
    isCritical: config.isCritical,
    isImportant: config.isImportant,
  }));
}

/**
 * 計算考慮預設值的完整度分數
 */
export function calculateCompletenessWithDefaults(
  isDefaultValues: Record<string, boolean>
): number {
  const criticalFields = ['distPhoria', 'nearPhoria', 'npc', 'biB', 'boB'];
  const importantFields = ['vf', 'biR', 'boR', 'distBiB', 'distBoB', 'distBiR', 'distBoR'];
  
  let criticalFilled = 0;
  let importantFilled = 0;
  
  criticalFields.forEach(field => {
    if (!isDefaultValues[field]) criticalFilled++;
  });
  
  importantFields.forEach(field => {
    if (!isDefaultValues[field]) importantFilled++;
  });
  
  // 關鍵欄位佔 60%，重要欄位佔 40%
  const criticalScore = (criticalFilled / criticalFields.length) * 60;
  const importantScore = (importantFilled / importantFields.length) * 40;
  
  return Math.round(criticalScore + importantScore);
}
