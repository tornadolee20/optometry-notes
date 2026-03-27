import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const CollapsibleSection = ({ 
  title, 
  children, 
  defaultOpen = false,
  className 
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { t } = useLanguage();

  return (
    <div className={cn("border-l-2 border-muted pl-3", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {isOpen ? t('collapse') : t('expandStepsText')}
      </button>
      {isOpen && (
        <div className="mt-2 text-sm text-muted-foreground animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};
