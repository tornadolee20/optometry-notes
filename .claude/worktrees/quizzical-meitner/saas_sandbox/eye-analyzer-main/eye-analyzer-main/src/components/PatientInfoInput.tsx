import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Info } from 'lucide-react';

interface PatientInfoInputProps {
  patientCode: string;
  setPatientCode: (value: string) => void;
  patientAge: number;
  setPatientAge: (value: number) => void;
  patientGender: 'male' | 'female' | 'other';
  setPatientGender: (value: 'male' | 'female' | 'other') => void;
  // Optional fields for report display only (not saved to DB)
  patientName?: string;
  setPatientName?: (value: string) => void;
  patientPhone?: string;
  setPatientPhone?: (value: string) => void;
  showReportFields?: boolean;
  // Children for medical history section
  children?: React.ReactNode;
}

export const PatientInfoInput = ({
  patientCode,
  setPatientCode,
  patientAge,
  setPatientAge,
  patientGender,
  setPatientGender,
  patientName = '',
  setPatientName,
  patientPhone = '',
  setPatientPhone,
  showReportFields = false,
  children,
}: PatientInfoInputProps) => {
  const { language } = useLanguage();
  
  const t = (zhTW: string, zhCN: string, en?: string) => {
    if (language === 'en' && en) return en;
    return language === 'zh-TW' ? zhTW : zhCN;
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-4 w-4" />
          {t('顧客基本資訊', '客户基本信息', 'Patient Information')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Patient Code - Required */}
        <div className="space-y-2">
          <Label htmlFor="patientCode" className="text-sm">
            {t('顧客編號（店內編號）', '客户编号（店内编号）', 'Patient Code (Store ID)')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="patientCode"
            value={patientCode}
            onChange={(e) => setPatientCode(e.target.value)}
            placeholder={t('例如：C0123、A-2025-0001', '例如：C0123、A-2025-0001', 'e.g., C0123, A-2025-0001')}
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="h-3 w-3" />
            {t('請使用您店內的顧客編號', '请使用您店内的客户编号', 'Use your store patient ID')}
          </p>
        </div>

        {/* Gender - Required */}
        <div className="space-y-2">
          <Label className="text-sm">
            {t('性別', '性别', 'Gender')} <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={patientGender}
            onValueChange={(value) => setPatientGender(value as 'male' | 'female' | 'other')}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male" className="font-normal cursor-pointer">{t('男', '男', 'Male')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female" className="font-normal cursor-pointer">{t('女', '女', 'Female')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="font-normal cursor-pointer">{t('其他', '其他', 'Other')}</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Age - Required */}
        <div className="space-y-2">
          <Label htmlFor="patientAge" className="text-sm">
            {t('年齡', '年龄', 'Age')} <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="patientAge"
              type="number"
              value={patientAge}
              onChange={(e) => setPatientAge(Math.max(1, Math.min(120, parseInt(e.target.value) || 1)))}
              min={1}
              max={120}
              className="w-24 bg-background"
            />
            <span className="text-sm text-muted-foreground">{t('歲', '岁', 'years')}</span>
          </div>
        </div>

        {/* Optional fields for report display only */}
        {showReportFields && (
          <>
            <div className="border-t border-border pt-4 mt-4">
              <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                <Info className="h-3 w-3" />
                {t(
                  '以下資訊僅用於報告顯示與列印，不會上傳至伺服器',
                  '以下信息仅用于报告显示与打印，不会上传至服务器',
                  'The following info is for report display only, not uploaded to server'
                )}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientName" className="text-sm">
                {t('顧客姓名（選填，僅供報告顯示）', '客户姓名（选填，仅供报告显示）', 'Patient Name (Optional, for report only)')}
              </Label>
              <Input
                id="patientName"
                value={patientName}
                onChange={(e) => setPatientName?.(e.target.value)}
                placeholder={t('張小明', '张小明', 'John Doe')}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientPhone" className="text-sm">
                {t('顧客電話（選填，僅供報告顯示）', '客户电话（选填，仅供报告显示）', 'Patient Phone (Optional, for report only)')}
              </Label>
              <Input
                id="patientPhone"
                value={patientPhone}
                onChange={(e) => setPatientPhone?.(e.target.value)}
                placeholder={t('0912-345-678', '138-0000-0000', '123-456-7890')}
                className="bg-background"
              />
            </div>
          </>
        )}

        {/* Medical History Section (passed as children) */}
        {children}
      </CardContent>
    </Card>
  );
};
