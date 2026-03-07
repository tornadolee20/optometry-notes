import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export type ViewMode = 'basic' | 'pro' | 'expert';

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  className?: string;
  showHint?: boolean;
}

export const ViewModeSelector = ({ viewMode, setViewMode, className, showHint = true }: ViewModeSelectorProps) => {
  const { t } = useLanguage();

  const modeHints: Record<ViewMode, string> = {
    basic: t('basicModeHint'),
    pro: t('proModeHint'),
    expert: t('expertModeHint'),
  };

  const modes: { value: ViewMode; label: string }[] = [
    { value: 'basic', label: t('basicMode') },
    { value: 'pro', label: t('proMode') },
    { value: 'expert', label: t('expertMode') },
  ];

  return (
    <div className={cn("flex flex-col items-end gap-1.5", className)}>
      {/* Phase 2: Mobile-optimized mode selector with larger touch targets */}
      <div className="inline-flex items-center bg-secondary/50 rounded-xl p-1.5 md:p-1 border border-border gap-1.5 md:gap-0">
        {modes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => setViewMode(mode.value)}
            className={cn(
              "font-medium rounded-lg transition-all duration-200 touch-manipulation",
              "px-4 py-2.5 text-base md:px-3 md:py-1.5 md:text-sm", // Larger on mobile
              "min-h-[44px] md:min-h-0", // 44px min-height on mobile
              viewMode === mode.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary active:scale-95"
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>
      {showHint && (
        <span className="text-xs md:text-[10px] text-muted-foreground">
          {modeHints[viewMode]}
        </span>
      )}
    </div>
  );
};
