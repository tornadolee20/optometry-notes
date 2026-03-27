import { useLanguage } from '@/contexts/LanguageContext';
import { UserCircle } from 'lucide-react';

interface ReportFooterProps {
  optometristName?: string;
  customFooterNote?: string;
}

export const ReportFooter = ({ 
  optometristName, 
  customFooterNote 
}: ReportFooterProps) => {
  const { t, language } = useLanguage();
  const labelText = (zhTW: string, zhCN: string, en?: string) => {
    if (language === 'en' && en) return en;
    return language === 'zh-CN' ? zhCN : zhTW;
  };

  return (
    <div className="bg-secondary/50 p-4 safe-bottom space-y-3">
      {/* Custom footer note */}
      {customFooterNote && (
        <div className="bg-card rounded-xl p-3 border border-border">
          <p className="text-sm text-foreground leading-relaxed">
            {customFooterNote}
          </p>
        </div>
      )}

      {/* Optometrist info */}
      {optometristName && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <UserCircle size={16} />
          <span>{labelText('驗光師', '验光师', 'Optometrist')}: {optometristName}</span>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-center text-muted-foreground leading-relaxed">
        {t('disclaimer')}
      </p>
      <p className="text-xs text-center text-muted-foreground">
        {t('systemVersion')}: v17.0 • {t('copyright')}
      </p>
    </div>
  );
};
