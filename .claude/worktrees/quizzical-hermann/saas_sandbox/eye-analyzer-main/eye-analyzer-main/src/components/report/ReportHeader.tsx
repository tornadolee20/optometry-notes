import { FileText, Calendar, User, Building2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ReportHeaderProps {
  patientName?: string;
  clinicName?: string;
  includeDate?: boolean;
}

export const ReportHeader = ({ 
  patientName, 
  clinicName,
  includeDate = true 
}: ReportHeaderProps) => {
  const { t, language } = useLanguage();
  const reportId = Date.now().toString(36).toUpperCase();
  const locale = language === 'en' ? 'en-US' : language === 'zh-CN' ? 'zh-CN' : 'zh-TW';
  const reportDate = new Date().toLocaleDateString(locale, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="gradient-header safe-top">
      <div className="px-4 py-5">
        {/* Custom clinic name or default title */}
        <h1 className="text-xl font-bold text-primary-foreground">
          {clinicName || t('reportTitle')}
        </h1>
        <p className="text-sm text-primary-foreground/70 mt-0.5">
          {clinicName ? t('reportTitle') : t('reportSubtitle')}
        </p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {includeDate && (
            <div className="flex items-center gap-1.5 bg-primary-foreground/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-primary-foreground/90">
              <Calendar size={12} />
              <span>{reportDate}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-primary-foreground/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-primary-foreground/90">
            <FileText size={12} />
            <span>#{reportId}</span>
          </div>
          {patientName && (
            <div className="flex items-center gap-1.5 bg-primary-foreground/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-primary-foreground/90">
              <User size={12} />
              <span>{patientName}</span>
            </div>
          )}
          {clinicName && (
            <div className="flex items-center gap-1.5 bg-primary-foreground/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-primary-foreground/90">
              <Building2 size={12} />
              <span>{clinicName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
