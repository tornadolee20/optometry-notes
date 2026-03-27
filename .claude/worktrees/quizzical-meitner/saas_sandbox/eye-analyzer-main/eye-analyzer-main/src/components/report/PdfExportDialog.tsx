import { useState } from 'react';
import { Download, X, Settings2, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ViewMode } from '../ViewModeSelector';

interface PdfExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: PdfExportOptions) => void;
  currentMode: ViewMode;
}

export interface PdfExportOptions {
  exportMode: ViewMode;
  patientName: string;
  clinicName: string;
  optometristName: string;
  customFooterNote: string;
  includeDate: boolean;
  includeQRCode: boolean;
}

export const PdfExportDialog = ({ 
  isOpen, 
  onClose, 
  onExport,
  currentMode 
}: PdfExportDialogProps) => {
  const { t, language } = useLanguage();
  
  const [options, setOptions] = useState<PdfExportOptions>({
    exportMode: currentMode,
    patientName: '',
    clinicName: '',
    optometristName: '',
    customFooterNote: '',
    includeDate: true,
    includeQRCode: false,
  });

  const handleExport = () => {
    onExport(options);
    onClose();
  };

  if (!isOpen) return null;

  const modeLabels: Record<ViewMode, { zhTW: string; zhCN: string; en: string }> = {
    basic: { zhTW: '簡易模式', zhCN: '简易模式', en: 'Basic' },
    pro: { zhTW: '專業模式', zhCN: '专业模式', en: 'Pro' },
    expert: { zhTW: '專家模式', zhCN: '专家模式', en: 'Expert' },
  };

  const labelText = (zhTW: string, zhCN: string, en?: string) => 
    language === 'en' ? (en || zhTW) : language === 'zh-CN' ? zhCN : zhTW;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative w-full max-w-md bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {labelText('匯出 PDF 報告', '导出 PDF 报告', 'Export PDF Report')}
              </h2>
              <p className="text-xs text-muted-foreground">
                {labelText('自訂報告內容與格式', '自定义报告内容与格式', 'Customize report content and format')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors touch-feedback"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5 overflow-y-auto max-h-[60vh]">
          {/* Export Mode Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Settings2 size={16} className="text-muted-foreground" />
              {labelText('報告模式', '报告模式', 'Report Mode')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['basic', 'pro', 'expert'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setOptions(prev => ({ ...prev, exportMode: mode }))}
                  className={`
                    py-3 px-2 rounded-xl text-sm font-medium transition-all touch-feedback
                    ${options.exportMode === mode 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }
                  `}
                >
                  {modeLabels[mode][language === 'en' ? 'en' : language === 'zh-CN' ? 'zhCN' : 'zhTW']}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {options.exportMode === 'basic' && labelText(
                '適合給顧客帶走，只包含簡單說明',
                '适合给顾客带走，只包含简单说明',
                'Suitable for customers, contains simple explanations only'
              )}
              {options.exportMode === 'pro' && labelText(
                '包含專業術語解釋，適合進階討論',
                '包含专业术语解释，适合进阶讨论',
                'Includes professional terminology, suitable for advanced discussions'
              )}
              {options.exportMode === 'expert' && labelText(
                '包含完整數據與專業分析',
                '包含完整数据与专业分析',
                'Includes complete data and professional analysis'
              )}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Patient Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {labelText('顧客姓名', '顾客姓名', 'Patient Name')}
            </label>
            <input
              type="text"
              value={options.patientName}
              onChange={(e) => setOptions(prev => ({ ...prev, patientName: e.target.value }))}
              placeholder={labelText('選填，將顯示於報告頁首', '选填，将显示于报告页首', 'Optional, will be shown in report header')}
              className="w-full px-4 py-3 rounded-xl bg-muted border-0 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
            />
          </div>

          {/* Clinic Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {labelText('驗光所/店家名稱', '验光所/店家名称', 'Clinic/Store Name')}
            </label>
            <input
              type="text"
              value={options.clinicName}
              onChange={(e) => setOptions(prev => ({ ...prev, clinicName: e.target.value }))}
              placeholder={labelText('選填，將顯示於報告頁首', '选填，将显示于报告页首', 'Optional, will be shown in report header')}
              className="w-full px-4 py-3 rounded-xl bg-muted border-0 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
            />
          </div>

          {/* Optometrist Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {labelText('驗光師姓名', '验光师姓名', 'Optometrist Name')}
            </label>
            <input
              type="text"
              value={options.optometristName}
              onChange={(e) => setOptions(prev => ({ ...prev, optometristName: e.target.value }))}
              placeholder={labelText('選填，將顯示於報告頁尾', '选填，将显示于报告页尾', 'Optional, will be shown in report footer')}
              className="w-full px-4 py-3 rounded-xl bg-muted border-0 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
            />
          </div>

          {/* Custom Footer Note */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {labelText('自訂頁尾備註', '自定页尾备注', 'Custom Footer Note')}
            </label>
            <textarea
              value={options.customFooterNote}
              onChange={(e) => setOptions(prev => ({ ...prev, customFooterNote: e.target.value }))}
              placeholder={labelText('選填，例如：下次回診建議時間、特別注意事項等', '选填，例如：下次回诊建议时间、特别注意事项等', 'Optional, e.g., next appointment suggestion, special notes, etc.')}
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-muted border-0 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Toggle Options */}
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-foreground">
                {labelText('包含檢查日期', '包含检查日期', 'Include Exam Date')}
              </span>
              <button
                onClick={() => setOptions(prev => ({ ...prev, includeDate: !prev.includeDate }))}
                className={`
                  w-12 h-7 rounded-full transition-colors relative
                  ${options.includeDate ? 'bg-primary' : 'bg-muted'}
                `}
              >
                <span className={`
                  absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform
                  ${options.includeDate ? 'translate-x-5' : 'translate-x-0.5'}
                `} />
              </button>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-semibold text-base touch-feedback min-h-touch shadow-lg shadow-primary/20"
          >
            <Download size={20} />
            {labelText('產生 PDF 報告', '生成 PDF 报告', 'Generate PDF Report')}
          </button>
        </div>
      </div>
    </div>
  );
};
