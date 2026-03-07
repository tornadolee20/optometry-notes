import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ValidationResult } from '@/lib/clinicalTooltips';
import { cn } from '@/lib/utils';

interface ValidationAlertProps {
  validation: ValidationResult | null;
  showNormal?: boolean;
  className?: string;
}

export const ValidationAlert = ({ 
  validation, 
  showNormal = false,
  className 
}: ValidationAlertProps) => {
  const { language } = useLanguage();
  
  if (!validation) return null;
  
  // Don't show normal status unless explicitly requested
  if (validation.level === 'normal' && !showNormal) return null;

  const getMessage = () => {
    if (language === 'en') return validation.messageEn;
    if (language === 'zh-CN') return validation.messageZhCN;
    return validation.messageZhTW;
  };

  const getIcon = () => {
    switch (validation.level) {
      case 'abnormal':
        return <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />;
      case 'normal':
        return <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />;
      default:
        return null;
    }
  };

  const getColorClass = () => {
    switch (validation.level) {
      case 'abnormal':
        return 'bg-destructive/10 border-destructive/30 text-destructive';
      case 'warning':
        return 'bg-warning/10 border-warning/30 text-warning';
      case 'normal':
        return 'bg-success/10 border-success/30 text-success';
      default:
        return '';
    }
  };

  return (
    <div 
      className={cn(
        "flex items-start gap-2 px-3 py-2 rounded-lg border text-xs font-medium mt-2 animate-fade-in",
        getColorClass(),
        className
      )}
      role="alert"
    >
      {getIcon()}
      <span className="leading-relaxed">{getMessage()}</span>
    </div>
  );
};
