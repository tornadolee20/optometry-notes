import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, Download, Save, Info } from 'lucide-react';
import { createExamRecord, ExamRecordInput } from '@/lib/examRecordService';
import { DataQualityWarningDialog, generateDefaultFieldsInfo, calculateCompletenessWithDefaults, ValidationContext } from '@/components/DataQualityWarningDialog';
import { MedicalHistoryData } from '@/components/MedicalHistorySection';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface SaveReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientCode: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  examData: Record<string, any>;
  healthScore: number;
  diagnosticClassification: string;
  reportRef: React.RefObject<HTMLDivElement>;
  patientName?: string;
  patientPhone?: string;
  isDefaultValues?: Record<string, boolean>;
  // Visual Acuity props
  vaDistanceUaOd?: string | null;
  vaDistanceUaOs?: string | null;
  vaDistanceHcOd?: string | null;
  vaDistanceHcOs?: string | null;
  vaDistanceBcvaOd?: string | null;
  vaDistanceBcvaOs?: string | null;
  vaNearUaOd?: string | null;
  vaNearUaOs?: string | null;
  vaNearHcOd?: string | null;
  vaNearHcOs?: string | null;
  vaNearBcvaOd?: string | null;
  vaNearBcvaOs?: string | null;
  vaDistanceTestMeters?: number;
  vaNearTestCm?: number;
  vaCorrectionType?: string | null;
  // Medical History
  medicalHistory?: MedicalHistoryData;
}

export const SaveReportDialog = ({
  open,
  onOpenChange,
  patientCode,
  patientAge,
  patientGender,
  examData,
  healthScore,
  diagnosticClassification,
  reportRef,
  patientName = '',
  patientPhone = '',
  isDefaultValues = {},
  // Visual Acuity props
  vaDistanceUaOd,
  vaDistanceUaOs,
  vaDistanceHcOd,
  vaDistanceHcOs,
  vaDistanceBcvaOd,
  vaDistanceBcvaOs,
  vaNearUaOd,
  vaNearUaOs,
  vaNearHcOd,
  vaNearHcOs,
  vaNearBcvaOd,
  vaNearBcvaOs,
  vaDistanceTestMeters,
  vaNearTestCm,
  vaCorrectionType,
  medicalHistory,
}: SaveReportDialogProps) => {
  const { language } = useLanguage();
  const { profile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [localPatientName, setLocalPatientName] = useState(patientName);
  const [localPatientPhone, setLocalPatientPhone] = useState(patientPhone);
  
  // 驗證對話框狀態
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationContext, setValidationContext] = useState<ValidationContext>('save');
  const [pendingAction, setPendingAction] = useState<'save' | 'pdf' | null>(null);

  const t = (zhTW: string, zhCN: string, en: string) => {
    if (language === 'en') return en;
    return language === 'zh-TW' ? zhTW : zhCN;
  };

  // 計算完整度和預設欄位資訊
  const completeness = useMemo(() => 
    calculateCompletenessWithDefaults(isDefaultValues), 
    [isDefaultValues]
  );

  const defaultFieldsInfo = useMemo(() => 
    generateDefaultFieldsInfo(isDefaultValues, {
      distPhoria: examData.distPhoria,
      nearPhoria: examData.nearPhoria,
      npc: examData.npc,
      biB: examData.biBreak,
      boB: examData.boBreak,
      vf: examData.vergenceFacilityCpm,
      biR: examData.biR,
      boR: examData.boR,
      distBiB: examData.distBiB,
      distBoB: examData.distBoB,
    }, patientAge),
    [isDefaultValues, examData, patientAge]
  );

  // 檢查是否需要顯示驗證警告
  const shouldShowValidation = (context: ValidationContext): boolean => {
    const hasDefaultCriticalFields = defaultFieldsInfo.some(f => f.isCritical && f.isDefault);
    
    if (context === 'save') {
      // 儲存時：完整度 < 80% 或有關鍵欄位使用預填值時顯示輕度提示
      return completeness < 80 || hasDefaultCriticalFields;
    } else {
      // 產生報告時：完整度 < 80% 時嚴格警告
      return completeness < 80;
    }
  };

  const executeSave = async () => {
    if (!patientCode.trim()) {
      toast({
        title: t('請填寫顧客編號', '请填写客户编号', 'Please enter patient code'),
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Include isDefaultValues tracking in exam_data for research export
      const examDataWithTracking = {
        ...examData,
        _isDefaultValues: isDefaultValues,
        _dataCompleteness: completeness,
        // Include medical history in exam_data
        medical_history_simple: medicalHistory || null,
      };
      
      const record: ExamRecordInput = {
        patient_code: patientCode.trim(),
        age: patientAge,
        gender: patientGender,
        exam_data: examDataWithTracking,
        health_score: healthScore,
        diagnostic_classification: diagnosticClassification,
        // Visual Acuity fields - pass raw values, logMAR will be auto-calculated
        va_distance_ua_od_raw: vaDistanceUaOd,
        va_distance_ua_os_raw: vaDistanceUaOs,
        va_distance_hc_od_raw: vaDistanceHcOd,
        va_distance_hc_os_raw: vaDistanceHcOs,
        va_distance_bcva_od_raw: vaDistanceBcvaOd,
        va_distance_bcva_os_raw: vaDistanceBcvaOs,
        va_near_ua_od_raw: vaNearUaOd,
        va_near_ua_os_raw: vaNearUaOs,
        va_near_hc_od_raw: vaNearHcOd,
        va_near_hc_os_raw: vaNearHcOs,
        va_near_bcva_od_raw: vaNearBcvaOd,
        va_near_bcva_os_raw: vaNearBcvaOs,
        va_distance_test_meters: vaDistanceTestMeters,
        va_near_test_cm: vaNearTestCm,
        va_correction_type: vaCorrectionType,
      };

      await createExamRecord(record);
      
      toast({
        title: t('儲存成功', '保存成功', 'Saved Successfully'),
        description: t('檢查紀錄已儲存至系統', '检查记录已保存至系统', 'Examination record has been saved to the system'),
      });
      onOpenChange(false);
    } catch (err: any) {
      console.error('Save error:', err);
      toast({
        title: t('儲存失敗', '保存失败', 'Save Failed'),
        description: err.message || t('請稍後再試', '请稍后再试', 'Please try again later'),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const executePdfExport = async () => {
    if (!reportRef.current) {
      toast({
        title: t('無法匯出', '无法导出', 'Cannot Export'),
        description: t('請先切換至報告模式', '请先切换至报告模式', 'Please switch to report mode first'),
        variant: 'destructive',
      });
      return;
    }

    setIsExportingPdf(true);
    try {
      const element = reportRef.current;
      
      // Create canvas from the report element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Calculate PDF dimensions (A4)
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;
      let heightLeft = imgHeight;

      // Add first page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename
      const date = new Date().toISOString().split('T')[0];
      const filename = `report_${patientCode || 'unnamed'}_${date}.pdf`;
      
      pdf.save(filename);
      
      toast({
        title: t('PDF 匯出成功', 'PDF 导出成功', 'PDF Exported Successfully'),
        description: filename,
      });
    } catch (err) {
      console.error('PDF export error:', err);
      toast({
        title: t('PDF 匯出失敗', 'PDF 导出失败', 'PDF Export Failed'),
        variant: 'destructive',
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleSaveToDatabase = () => {
    if (!patientCode.trim()) {
      toast({
        title: t('請填寫顧客編號', '请填写客户编号', 'Please enter patient code'),
        variant: 'destructive',
      });
      return;
    }

    if (shouldShowValidation('save')) {
      setValidationContext('save');
      setPendingAction('save');
      setShowValidationDialog(true);
    } else {
      executeSave();
    }
  };

  const handleExportPdf = () => {
    if (shouldShowValidation('report')) {
      setValidationContext('report');
      setPendingAction('pdf');
      setShowValidationDialog(true);
    } else {
      executePdfExport();
    }
  };

  const handleValidationConfirm = () => {
    if (pendingAction === 'save') {
      executeSave();
    } else if (pendingAction === 'pdf') {
      executePdfExport();
    }
    setPendingAction(null);
  };

  return (
    <>
      {/* 資料品質驗證對話框 */}
      <DataQualityWarningDialog
        open={showValidationDialog}
        onOpenChange={setShowValidationDialog}
        context={validationContext}
        completeness={completeness}
        defaultFields={defaultFieldsInfo}
        onConfirm={handleValidationConfirm}
      />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('儲存報告', '保存报告', 'Save Report')}</DialogTitle>
            <DialogDescription>
              {t(
                '您可以將檢查紀錄儲存至系統，或下載為 PDF 檔案',
                '您可以将检查记录保存至系统，或下载为 PDF 文件',
                'You can save the examination record to the system or download it as a PDF file'
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Patient info summary */}
            <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('顧客編號', '客户编号', 'Patient Code')}:</span>
                <span className="font-medium">{patientCode || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('年齡/性別', '年龄/性别', 'Age/Gender')}:</span>
                <span className="font-medium">
                  {patientAge} {t('歲', '岁', 'y/o')} / {patientGender === 'male' ? t('男', '男', 'Male') : patientGender === 'female' ? t('女', '女', 'Female') : t('其他', '其他', 'Other')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('健康分數', '健康分数', 'Health Score')}:</span>
                <span className="font-medium">{healthScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('資料完整度', '数据完整度', 'Data Completeness')}:</span>
                <span className={`font-medium ${completeness >= 80 ? 'text-success' : completeness >= 50 ? 'text-warning' : 'text-destructive'}`}>
                  {completeness}%
                </span>
              </div>
            </div>

            {/* Optional fields for PDF */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {t(
                    '以下資訊僅用於 PDF 報告顯示，不會儲存至系統',
                    '以下信息仅用于 PDF 报告显示，不会保存至系统',
                    'The following information is only used for PDF report display and will not be saved to the system'
                  )}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="reportName" className="text-sm">
                    {t('顧客姓名（選填）', '客户姓名（选填）', 'Patient Name (Optional)')}
                  </Label>
                  <Input
                    id="reportName"
                    value={localPatientName}
                    onChange={(e) => setLocalPatientName(e.target.value)}
                    placeholder={t('張小明', '张小明', 'John Doe')}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="reportPhone" className="text-sm">
                    {t('顧客電話（選填）', '客户电话（选填）', 'Patient Phone (Optional)')}
                  </Label>
                  <Input
                    id="reportPhone"
                    value={localPatientPhone}
                    onChange={(e) => setLocalPatientPhone(e.target.value)}
                    placeholder={t('0912-345-678', '138-0000-0000', '123-456-7890')}
                  />
                </div>
              </div>
            </div>

            {/* Clinic info */}
            {profile && (
              <div className="text-xs text-muted-foreground border-t pt-3">
                <p>{t('報告將包含以下驗光所資訊：', '报告将包含以下视光中心信息：', 'The report will include the following optometry center information:')}</p>
                <p className="mt-1 font-medium text-foreground">
                  {profile.clinic_name} · {profile.optometrist_name}
                  {profile.optometrist_license_number && ` (${profile.optometrist_license_number})`}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="w-full sm:w-auto"
            >
              {isExportingPdf ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {t('下載 PDF', '下载 PDF', 'Download PDF')}
            </Button>
            
            <Button
              onClick={handleSaveToDatabase}
              disabled={isSaving || !patientCode.trim()}
              className="w-full sm:w-auto"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {t('儲存至系統', '保存至系统', 'Save to System')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
