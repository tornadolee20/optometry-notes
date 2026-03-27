import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Hospital } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

export interface MedicalHistoryData {
  conditions: string[];
  cataract_surgery: 'not_yet' | 'done' | null;
  diabetes_control: 'good' | 'poor' | 'unknown' | null;
  notes: string;
  none_checked: boolean;
}

export const EMPTY_MEDICAL_HISTORY: MedicalHistoryData = {
  conditions: [],
  cataract_surgery: null,
  diabetes_control: null,
  notes: '',
  none_checked: false,
};

// Condition codes mapping
export const CONDITION_CODES = {
  // Ocular
  amblyopia: { zhTW: '弱視（單眼視力不良）', zhCN: '弱视（单眼视力不良）', en: 'Amblyopia (Lazy Eye)' },
  strabismus: { zhTW: '斜視（眼位偏斜）', zhCN: '斜视（眼位偏斜）', en: 'Strabismus (Eye Turn)' },
  glaucoma: { zhTW: '青光眼', zhCN: '青光眼', en: 'Glaucoma' },
  cataract: { zhTW: '白內障', zhCN: '白内障', en: 'Cataract' },
  retinopathy: { zhTW: '視網膜病變', zhCN: '视网膜病变', en: 'Retinopathy' },
  eye_surgery: { zhTW: '眼部手術史（近視雷射/其他）', zhCN: '眼部手术史（近视激光/其他）', en: 'Eye Surgery (LASIK/Other)' },
  // Systemic
  diabetes: { zhTW: '糖尿病', zhCN: '糖尿病', en: 'Diabetes' },
  hypertension: { zhTW: '高血壓', zhCN: '高血压', en: 'Hypertension' },
  head_trauma_stroke: { zhTW: '腦部外傷或中風史', zhCN: '脑部外伤或中风史', en: 'Head Trauma/Stroke' },
  // Other
  steroid_use: { zhTW: '長期使用類固醇（眼藥水/口服/吸入劑）', zhCN: '长期使用类固醇（眼药水/口服/吸入剂）', en: 'Long-term Steroid Use' },
  family_glaucoma_myopia: { zhTW: '家族有青光眼或高度近視（-6.00D以上）', zhCN: '家族有青光眼或高度近视（-6.00D以上）', en: 'Family History of Glaucoma/High Myopia (-6.00D+)' },
} as const;

export type ConditionCode = keyof typeof CONDITION_CODES;

const OCULAR_CONDITIONS: ConditionCode[] = ['amblyopia', 'strabismus', 'glaucoma', 'cataract', 'retinopathy', 'eye_surgery'];
const SYSTEMIC_CONDITIONS: ConditionCode[] = ['diabetes', 'hypertension', 'head_trauma_stroke'];
const OTHER_CONDITIONS: ConditionCode[] = ['steroid_use', 'family_glaucoma_myopia'];

interface MedicalHistorySectionProps {
  value: MedicalHistoryData;
  onChange: (data: MedicalHistoryData) => void;
}

// ============================================
// Component
// ============================================

export const MedicalHistorySection: React.FC<MedicalHistorySectionProps> = ({
  value,
  onChange,
}) => {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem('medicalHistoryExpanded');
    return saved === 'true';
  });

  const t = useCallback((zhTW: string, zhCN: string, en: string) => {
    if (language === 'en') return en;
    if (language === 'zh-CN') return zhCN;
    return zhTW;
  }, [language]);

  const getConditionLabel = useCallback((code: ConditionCode) => {
    const labels = CONDITION_CODES[code];
    if (language === 'en') return labels.en;
    if (language === 'zh-CN') return labels.zhCN;
    return labels.zhTW;
  }, [language]);

  // Persist expansion state
  useEffect(() => {
    localStorage.setItem('medicalHistoryExpanded', String(isExpanded));
  }, [isExpanded]);

  // Handle condition toggle
  const handleConditionChange = useCallback((code: ConditionCode, checked: boolean) => {
    const newConditions = checked
      ? [...value.conditions, code]
      : value.conditions.filter(c => c !== code);
    
    const newData: MedicalHistoryData = {
      ...value,
      conditions: newConditions,
      none_checked: false, // Uncheck "none" when any condition is selected
    };

    // Clear sub-options if parent condition is unchecked
    if (code === 'cataract' && !checked) {
      newData.cataract_surgery = null;
    }
    if (code === 'diabetes' && !checked) {
      newData.diabetes_control = null;
    }

    onChange(newData);
  }, [value, onChange]);

  // Handle "none" checkbox
  const handleNoneChange = useCallback((checked: boolean) => {
    if (checked) {
      onChange({
        conditions: [],
        cataract_surgery: null,
        diabetes_control: null,
        notes: '',
        none_checked: true,
      });
    } else {
      onChange({
        ...value,
        none_checked: false,
      });
    }
  }, [value, onChange]);

  // Check if a condition is selected
  const isConditionChecked = useCallback((code: ConditionCode) => {
    return value.conditions.includes(code);
  }, [value.conditions]);

  // Render condition checkbox
  const renderCondition = useCallback((code: ConditionCode) => (
    <div key={code} className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`mh-${code}`}
          checked={isConditionChecked(code)}
          onCheckedChange={(checked) => handleConditionChange(code, checked as boolean)}
          disabled={value.none_checked}
        />
        <Label 
          htmlFor={`mh-${code}`} 
          className={cn(
            "text-sm cursor-pointer",
            value.none_checked && "text-muted-foreground"
          )}
        >
          {getConditionLabel(code)}
        </Label>
      </div>
      
      {/* Cataract sub-options */}
      {code === 'cataract' && isConditionChecked('cataract') && (
        <div className="ml-8">
          <RadioGroup
            value={value.cataract_surgery || ''}
            onValueChange={(val) => onChange({ ...value, cataract_surgery: val as 'not_yet' | 'done' })}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="not_yet" id="cataract-not-yet" />
              <Label htmlFor="cataract-not-yet" className="text-sm font-normal text-muted-foreground cursor-pointer">
                {t('未手術', '未手术', 'Not yet operated')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="done" id="cataract-done" />
              <Label htmlFor="cataract-done" className="text-sm font-normal text-muted-foreground cursor-pointer">
                {t('已手術', '已手术', 'Operated')}
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}
      
      {/* Diabetes sub-options */}
      {code === 'diabetes' && isConditionChecked('diabetes') && (
        <div className="ml-8">
          <RadioGroup
            value={value.diabetes_control || ''}
            onValueChange={(val) => onChange({ ...value, diabetes_control: val as 'good' | 'poor' | 'unknown' })}
            className="flex gap-4 flex-wrap"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="good" id="dm-good" />
              <Label htmlFor="dm-good" className="text-sm font-normal text-muted-foreground cursor-pointer">
                {t('控制良好', '控制良好', 'Well controlled')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="poor" id="dm-poor" />
              <Label htmlFor="dm-poor" className="text-sm font-normal text-muted-foreground cursor-pointer">
                {t('控制不佳', '控制不佳', 'Poorly controlled')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unknown" id="dm-unknown" />
              <Label htmlFor="dm-unknown" className="text-sm font-normal text-muted-foreground cursor-pointer">
                {t('不清楚', '不清楚', 'Unknown')}
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}
    </div>
  ), [isConditionChecked, handleConditionChange, value, onChange, getConditionLabel, t]);

  // Section divider
  const renderSectionDivider = useCallback((label: string) => (
    <div className="flex items-center gap-2 my-3">
      <div className="h-px bg-muted-foreground/30 flex-1" />
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="h-px bg-muted-foreground/30 flex-1" />
    </div>
  ), []);

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="mt-4">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full flex items-center justify-between px-4 py-3",
            "bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50",
            "transition-all duration-300 cursor-pointer",
            isExpanded ? "rounded-t-lg" : "rounded-lg"
          )}
        >
          <span className="flex items-center gap-2 font-semibold text-base text-foreground">
            <Hospital className="h-4 w-4" />
            {t('重要病史（選填）', '重要病史（选填）', 'Medical History (Optional)')}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-b-lg border-t border-blue-200 dark:border-blue-800">
          <p className="text-sm text-muted-foreground mb-4">
            {t(
              '請勾選患者曾有或目前有的重要病史：',
              '请勾选患者曾有或目前有的重要病史：',
              'Please select any significant medical history:'
            )}
          </p>

          {/* Ocular Conditions */}
          {renderSectionDivider(t('眼部相關', '眼部相关', 'Ocular'))}
          <div className="space-y-3">
            {OCULAR_CONDITIONS.map(renderCondition)}
          </div>

          {/* Systemic Conditions */}
          {renderSectionDivider(t('全身疾病', '全身疾病', 'Systemic'))}
          <div className="space-y-3">
            {SYSTEMIC_CONDITIONS.map(renderCondition)}
          </div>

          {/* Other Conditions */}
          {renderSectionDivider(t('其他', '其他', 'Other'))}
          <div className="space-y-3">
            {OTHER_CONDITIONS.map(renderCondition)}
          </div>

          {/* Notes */}
          <div className="mt-4 space-y-2">
            <Label htmlFor="mh-notes" className="text-sm">
              {t('補充說明（選填）', '补充说明（选填）', 'Additional Notes (Optional)')}
            </Label>
            <Textarea
              id="mh-notes"
              value={value.notes}
              onChange={(e) => onChange({ ...value, notes: e.target.value.slice(0, 200) })}
              placeholder={t(
                '如有需要，請簡述病況或注意事項...',
                '如有需要，请简述病况或注意事项...',
                'Briefly describe conditions or concerns if needed...'
              )}
              className="h-20 resize-none bg-background"
              maxLength={200}
              disabled={value.none_checked}
            />
            <p className="text-xs text-muted-foreground text-right">
              {value.notes.length}/200
            </p>
          </div>

          {/* None Checkbox */}
          <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mh-none"
                checked={value.none_checked}
                onCheckedChange={(checked) => handleNoneChange(checked as boolean)}
              />
              <Label htmlFor="mh-none" className="text-sm cursor-pointer font-medium">
                {t('無特殊病史', '无特殊病史', 'No significant medical history')}
              </Label>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// ============================================
// CSV Export Utilities
// ============================================

export interface MedicalHistoryCSVFields {
  MedHx_HasConditions: 0 | 1;
  MedHx_OcularList: string;
  MedHx_SystemicList: string;
  MedHx_HighRisk: 0 | 1;
  MedHx_RiskFactors: string;
  MedHx_Notes: string;
}

export function exportMedicalHistoryToCSV(medicalHistory: MedicalHistoryData | null | undefined): MedicalHistoryCSVFields {
  // Default empty result
  const emptyResult: MedicalHistoryCSVFields = {
    MedHx_HasConditions: 0,
    MedHx_OcularList: '',
    MedHx_SystemicList: '',
    MedHx_HighRisk: 0,
    MedHx_RiskFactors: '',
    MedHx_Notes: '',
  };

  if (!medicalHistory || medicalHistory.none_checked) {
    return emptyResult;
  }

  const conditions = medicalHistory.conditions || [];
  if (conditions.length === 0 && !medicalHistory.notes) {
    return emptyResult;
  }

  // Classify conditions
  const ocularList: string[] = [];
  const systemicList: string[] = [];
  const riskFactors: string[] = [];

  // Ocular conditions
  if (conditions.includes('amblyopia')) {
    ocularList.push('弱視');
    riskFactors.push('弱視');
  }
  if (conditions.includes('strabismus')) {
    ocularList.push('斜視');
    riskFactors.push('斜視');
  }
  if (conditions.includes('glaucoma')) {
    ocularList.push('青光眼');
  }
  if (conditions.includes('cataract')) {
    const surgeryStatus = medicalHistory.cataract_surgery === 'done' ? '已手術' :
                          medicalHistory.cataract_surgery === 'not_yet' ? '未手術' : '';
    ocularList.push(`白內障${surgeryStatus ? `(${surgeryStatus})` : ''}`);
  }
  if (conditions.includes('retinopathy')) {
    ocularList.push('視網膜病變');
  }
  if (conditions.includes('eye_surgery')) {
    ocularList.push('眼部手術史');
  }

  // Systemic conditions
  if (conditions.includes('diabetes')) {
    const control = medicalHistory.diabetes_control === 'good' ? '控制良好' :
                    medicalHistory.diabetes_control === 'poor' ? '控制不佳' :
                    medicalHistory.diabetes_control === 'unknown' ? '不清楚' : '';
    systemicList.push(`糖尿病${control ? `(${control})` : ''}`);
    if (medicalHistory.diabetes_control === 'poor') {
      riskFactors.push('糖尿病控制不佳');
    }
  }
  if (conditions.includes('hypertension')) {
    systemicList.push('高血壓');
  }
  if (conditions.includes('head_trauma_stroke')) {
    systemicList.push('腦部外傷/中風');
    riskFactors.push('腦部外傷/中風');
  }

  // Other conditions -> add to risk factors or systemic
  if (conditions.includes('steroid_use')) {
    systemicList.push('長期類固醇');
  }
  if (conditions.includes('family_glaucoma_myopia')) {
    riskFactors.push('家族青光眼/高度近視');
  }

  return {
    MedHx_HasConditions: (conditions.length > 0 || medicalHistory.notes) ? 1 : 0,
    MedHx_OcularList: ocularList.join('; '),
    MedHx_SystemicList: systemicList.join('; '),
    MedHx_HighRisk: riskFactors.length > 0 ? 1 : 0,
    MedHx_RiskFactors: riskFactors.join('; '),
    MedHx_Notes: medicalHistory.notes || '',
  };
}
