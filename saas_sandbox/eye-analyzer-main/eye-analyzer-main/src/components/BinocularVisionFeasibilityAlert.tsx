import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  checkBinocularVisionFeasibility, 
  BinocularVisionFeasibilityResult 
} from '@/lib/binocularVisionFeasibility';
import { cn } from '@/lib/utils';

interface BinocularVisionFeasibilityAlertProps {
  bcvaOD: string | null;
  bcvaOS: string | null;
  className?: string;
}

export const BinocularVisionFeasibilityAlert = ({
  bcvaOD,
  bcvaOS,
  className
}: BinocularVisionFeasibilityAlertProps) => {
  const { language } = useLanguage();
  
  const result = checkBinocularVisionFeasibility(bcvaOD, bcvaOS);
  
  // No BCVA data or full feasibility - don't show alert
  if (!result || result.level === 'full') {
    return null;
  }
  
  const lang = language as 'zh-TW' | 'zh-CN' | 'en';
  
  const getAlertConfig = (level: BinocularVisionFeasibilityResult['level']) => {
    switch (level) {
      case 'severe':
        return {
          variant: 'destructive' as const,
          Icon: AlertCircle,
          bgClass: 'bg-destructive/10 border-destructive/50',
          titleClass: 'text-destructive',
          listClass: 'text-destructive/90'
        };
      case 'moderate':
        return {
          variant: 'default' as const,
          Icon: AlertTriangle,
          bgClass: 'bg-amber-50 dark:bg-amber-950/30 border-amber-400/50',
          titleClass: 'text-amber-700 dark:text-amber-400',
          listClass: 'text-amber-600 dark:text-amber-300'
        };
      case 'limited':
        return {
          variant: 'default' as const,
          Icon: Info,
          bgClass: 'bg-blue-50 dark:bg-blue-950/30 border-blue-400/50',
          titleClass: 'text-blue-700 dark:text-blue-400',
          listClass: 'text-blue-600 dark:text-blue-300'
        };
      default:
        return {
          variant: 'default' as const,
          Icon: CheckCircle2,
          bgClass: 'bg-green-50 dark:bg-green-950/30 border-green-400/50',
          titleClass: 'text-green-700 dark:text-green-400',
          listClass: 'text-green-600 dark:text-green-300'
        };
    }
  };
  
  const config = getAlertConfig(result.level);
  const Icon = config.Icon;
  
  const t = (key: 'recommendedTests' | 'unreliableTests' | 'blockedTests') => {
    const labels: Record<string, Record<string, string>> = {
      recommendedTests: {
        'zh-TW': '建議處置',
        'zh-CN': '建议处置',
        en: 'Recommended actions'
      },
      unreliableTests: {
        'zh-TW': '結果可靠性較低',
        'zh-CN': '结果可靠性较低',
        en: 'Results may be unreliable'
      },
      blockedTests: {
        'zh-TW': '以下測試將被停用',
        'zh-CN': '以下测试将被停用',
        en: 'The following tests are blocked'
      }
    };
    return labels[key][lang];
  };
  
  return (
    <Alert 
      className={cn(
        'mt-4 transition-all duration-300',
        config.bgClass,
        className
      )}
    >
      <Icon className={cn('h-5 w-5', config.titleClass)} />
      <AlertTitle className={cn('font-semibold', config.titleClass)}>
        {result.message[lang]}
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p className="text-sm text-muted-foreground">
          {result.reason[lang]}
        </p>
        
        {/* Recommended Tests */}
        {result.recommendedTests[lang].length > 0 && (
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">
              {t('recommendedTests')}
            </p>
            <ul className="list-disc list-inside text-xs space-y-0.5">
              {result.recommendedTests[lang].map((test, idx) => (
                <li key={idx}>{test}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Unreliable Tests (for limited level) */}
        {result.unreliableTests && result.unreliableTests[lang].length > 0 && (
          <div>
            <p className={cn('text-xs font-semibold mb-1', config.listClass)}>
              ⚠️ {t('unreliableTests')}
            </p>
            <ul className="list-disc list-inside text-xs space-y-0.5">
              {result.unreliableTests[lang].map((test, idx) => (
                <li key={idx} className={config.listClass}>{test}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Blocked Tests */}
        {result.blockedTests && result.blockedTests[lang].length > 0 && (
          <div>
            <p className={cn(
              'text-xs font-semibold mb-1',
              result.level === 'severe' ? 'text-destructive' : 'text-red-600 dark:text-red-400'
            )}>
              ✗ {t('blockedTests')}
            </p>
            <ul className="list-disc list-inside text-xs space-y-0.5">
              {result.blockedTests[lang].map((test, idx) => (
                <li key={idx} className="text-red-600 dark:text-red-400">{test}</li>
              ))}
            </ul>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};
