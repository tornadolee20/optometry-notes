import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AlertsSectionProps {
  alerts: string[];
}

export const AlertsSection = ({ alerts }: AlertsSectionProps) => {
  const { t } = useLanguage();

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="app-card bg-destructive/5 border-destructive/15">
      <div className="flex items-center gap-3 mb-3">
        <div className="icon-box-destructive">
          <AlertTriangle size={18} />
        </div>
        <h3 className="font-semibold text-sm text-destructive">
          {t('alertsTitle')}
        </h3>
      </div>
      <ul className="space-y-2">
        {alerts.map((alert, i) => (
          <li key={i} className="text-sm text-destructive/90 leading-relaxed flex items-start gap-2 pl-1">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-destructive/50 flex-shrink-0" />
            <span>{alert}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};