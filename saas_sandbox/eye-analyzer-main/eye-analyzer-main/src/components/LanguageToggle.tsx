import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Language } from '@/lib/translations';

interface LanguageToggleProps {
  className?: string;
}

const languageOptions: { value: Language; label: string; shortLabel: string }[] = [
  { value: 'zh-TW', label: '繁體中文', shortLabel: '繁' },
  { value: 'zh-CN', label: '简体中文', shortLabel: '简' },
  { value: 'en', label: 'English', shortLabel: 'EN' },
];

export const LanguageToggle = ({ className }: LanguageToggleProps) => {
  const { language, setLanguage } = useLanguage();

  const currentLanguage = languageOptions.find(opt => opt.value === language) || languageOptions[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "rounded-full bg-muted/50 hover:bg-muted text-foreground text-xs sm:text-sm font-medium px-2 sm:px-3 gap-1.5",
            className
          )}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.shortLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {languageOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setLanguage(option.value)}
            className={cn(
              "cursor-pointer",
              language === option.value && "bg-accent font-medium"
            )}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
