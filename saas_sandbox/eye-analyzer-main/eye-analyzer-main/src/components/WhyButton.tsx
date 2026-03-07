import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface WhyButtonProps {
  explanation: string;
  className?: string;
}

export const WhyButton = ({ explanation, className }: WhyButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className={cn("inline-block", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
      >
        <HelpCircle size={12} />
        {isOpen ? t('collapse') : t('why')}
      </button>
      {isOpen && (
        <div className="mt-2 p-3 bg-secondary/50 rounded-lg text-sm text-muted-foreground animate-fade-in border border-border">
          {explanation}
        </div>
      )}
    </div>
  );
};
