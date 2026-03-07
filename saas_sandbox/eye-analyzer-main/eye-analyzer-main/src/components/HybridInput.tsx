import { Zap, Minus, Plus, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRef, useCallback, useMemo } from 'react';
import { ValueStatus, getStatusColorClass } from '@/lib/clinicalDefaults';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ClinicalInfoIcon } from './ClinicalInfoIcon';
import { ValidationAlert } from './ValidationAlert';
import { validateClinicalValue, ValidationResult } from '@/lib/clinicalTooltips';

interface HybridInputProps {
  label: string;
  value: number;
  setter: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  hint?: string;
  important?: boolean;
  disabled?: boolean;
  onExtraClick?: () => void;
  extraIcon?: React.ReactNode;
  className?: string;
  // New props for clinical validation
  status?: ValueStatus;
  clinicalRange?: string;
  clinicalSource?: string;
  autoFillHint?: string; // e.g., "(Hofstetter 公式)"
  // Compact mode for grid layouts
  compact?: boolean;
  placeholder?: string;
  // New: Clinical tooltip key for detailed info icon
  clinicalTooltipKey?: string;
  // Age for age-dependent validation
  age?: number;
  // Show validation alert inline
  showValidationAlert?: boolean;
}

export const HybridInput = ({
  label,
  value,
  setter,
  min,
  max,
  step = 1,
  unit = '',
  hint = '',
  important = false,
  disabled = false,
  onExtraClick,
  extraIcon,
  className,
  status,
  clinicalRange,
  clinicalSource,
  autoFillHint,
  compact = false,
  placeholder,
  clinicalTooltipKey,
  age,
  showValidationAlert = false
}: HybridInputProps) => {
  const { language } = useLanguage();
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);

  // Calculate percentage position and value state
  const { percentage, isNegative, isPositive, isZero } = useMemo(() => {
    const range = max - min;
    const pct = range > 0 ? ((safeValue - min) / range) * 100 : 0;
    return {
      percentage: Math.min(100, Math.max(0, pct)),
      isNegative: safeValue < 0,
      isPositive: safeValue > 0,
      isZero: safeValue === 0
    };
  }, [safeValue, min, max]);

  // Calculate validation result if clinical tooltip key is provided
  const validationResult: ValidationResult | null = useMemo(() => {
    if (!clinicalTooltipKey) return null;
    return validateClinicalValue(clinicalTooltipKey, safeValue, age);
  }, [clinicalTooltipKey, safeValue, age]);

  // Save scroll position before input focus
  const saveScrollPosition = useCallback(() => {
    scrollPositionRef.current = window.scrollY;
  }, []);

  // Restore scroll position after value change
  const restoreScrollPosition = useCallback(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' });
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      saveScrollPosition();
      setter(val);
      restoreScrollPosition();
    }
  };

  const handleDecrement = () => {
    saveScrollPosition();
    setter(Number((Math.max(min, safeValue - step)).toFixed(2)));
    restoreScrollPosition();
  };

  const handleIncrement = () => {
    saveScrollPosition();
    setter(Number((Math.min(max, safeValue + step)).toFixed(2)));
    restoreScrollPosition();
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    saveScrollPosition();
    setter(Number(e.target.value));
    restoreScrollPosition();
  };

  // Format min/max display with sign for better clarity
  const formatValue = (val: number) => {
    if (val > 0 && min < 0) return `+${val}`;
    return val.toString();
  };

  // Get track gradient based on value position
  const getTrackStyle = () => {
    const hasNegativeRange = min < 0;
    const zeroPosition = hasNegativeRange ? ((0 - min) / (max - min)) * 100 : 0;
    
    if (hasNegativeRange) {
      // For ranges that include negative values, show different colors
      if (isNegative) {
        return {
          background: `linear-gradient(to right, 
            hsl(var(--muted)) 0%, 
            hsl(var(--muted)) ${percentage}%, 
            hsl(var(--destructive) / 0.4) ${percentage}%, 
            hsl(var(--destructive) / 0.4) ${zeroPosition}%, 
            hsl(var(--muted)) ${zeroPosition}%, 
            hsl(var(--muted)) 100%)`
        };
      } else if (isPositive) {
        return {
          background: `linear-gradient(to right, 
            hsl(var(--muted)) 0%, 
            hsl(var(--muted)) ${zeroPosition}%, 
            hsl(var(--success) / 0.4) ${zeroPosition}%, 
            hsl(var(--success) / 0.4) ${percentage}%, 
            hsl(var(--muted)) ${percentage}%, 
            hsl(var(--muted)) 100%)`
        };
      }
      return {
        background: `linear-gradient(to right, 
          hsl(var(--muted)) 0%, 
          hsl(var(--muted)) ${zeroPosition}%, 
          hsl(var(--primary) / 0.3) ${zeroPosition}%, 
          hsl(var(--muted)) 100%)`
      };
    }
    
    // For positive-only ranges
    return {
      background: `linear-gradient(to right, 
        hsl(var(--primary) / 0.5) 0%, 
        hsl(var(--primary) / 0.5) ${percentage}%, 
        hsl(var(--muted)) ${percentage}%, 
        hsl(var(--muted)) 100%)`
    };
  };

  // Get status-based border color
  const getStatusBorderClass = () => {
    if (!status) return '';
    return getStatusColorClass(status);
  };

  // Compact mode for grid layouts - simplified input only
  if (compact) {
    return (
      <div className={cn("relative", className)}>
        <div className={cn(
          "flex items-center px-3 py-2 md:px-2 md:py-1.5 rounded-lg border transition-colors",
          "min-h-[52px] md:min-h-[40px]", // 52px mobile, 40px desktop
          disabled ? "bg-muted opacity-60" : "bg-card",
          important ? "border-primary/40 ring-1 ring-primary/20" : "border-border hover:border-primary/40",
          status === 'abnormal' && "border-destructive bg-destructive/10",
          status === 'warning' && "border-warning bg-warning/10"
        )}>
          <input
            type="number"
            inputMode="decimal"
            value={value === 0 && placeholder ? '' : value}
            onChange={handleInputChange}
            onFocus={saveScrollPosition}
            step={step}
            min={min}
            max={max}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              "w-full text-base md:text-sm font-mono font-medium text-center bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
              status === 'abnormal' && "text-destructive",
              status === 'warning' && "text-warning"
            )}
          />
          {unit && (
            <span className="text-sm md:text-[10px] text-muted-foreground ml-1 flex-shrink-0">
              {unit}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "p-4 md:p-3 rounded-xl border shadow-sm flex flex-col gap-3 md:gap-2 relative group transition-all duration-200 mb-1.5 touch-manipulation",
        disabled ? "bg-muted opacity-60" : important ? "bg-card border-primary/40 ring-2 ring-primary/20" : "bg-card border-border hover:border-primary/40",
        important && "relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary before:rounded-l-xl",
        status && getStatusBorderClass(),
        className
      )}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <label
            className={cn(
              "text-base md:text-[11px] font-bold uppercase truncate cursor-help flex items-center gap-1.5",
              important ? "text-primary" : "text-muted-foreground"
            )}
            title={hint}
          >
            {important && <Zap size={14} className="text-warning fill-warning md:w-[10px] md:h-[10px]" />}
            {label}
          </label>
          
          {/* Clinical info icon - New detailed tooltip */}
          {clinicalTooltipKey && (
            <ClinicalInfoIcon tooltipKey={clinicalTooltipKey} age={age} />
          )}
          
          {/* Clinical tooltip - Legacy simple version (fallback when no clinicalTooltipKey) */}
          {!clinicalTooltipKey && (clinicalRange || clinicalSource) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-primary transition-colors p-1 -m-1">
                  <Lightbulb size={16} className="md:w-3 md:h-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-base md:text-xs">
                <div className="space-y-1.5">
                  {clinicalRange && (
                    <div>
                      <span className="font-semibold">{language === 'en' ? 'Normal Range' : language === 'zh-TW' ? '正常範圍' : '正常范围'}: </span>
                      {clinicalRange}
                    </div>
                  )}
                  {clinicalSource && (
                    <div className="text-muted-foreground">
                      <span className="font-semibold">{language === 'en' ? 'Reference' : language === 'zh-TW' ? '參考文獻' : '参考文献'}: </span>
                      {clinicalSource}
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
          
          {/* Auto-fill hint badge */}
          {autoFillHint && (
            <span className="text-xs md:text-[9px] text-primary/70 font-medium bg-primary/10 px-2 py-0.5 rounded">
              {autoFillHint}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {onExtraClick && (
            <button
              onClick={onExtraClick}
              className="text-sm md:text-[10px] bg-primary/10 text-primary px-3 py-1.5 md:px-2 md:py-0.5 rounded-full font-bold hover:bg-primary/20 flex items-center gap-1.5 transition-colors min-h-[40px] md:min-h-0"
            >
              {extraIcon} {language === 'en' ? 'Fill' : language === 'zh-CN' ? '填写' : '填寫'}
            </button>
          )}
          <div className={cn(
            "flex items-center px-2 py-1 md:px-1.5 md:py-0.5 rounded-full transition-colors",
            important ? "bg-primary" : "bg-muted/80 border border-border/50",
            !important && isNegative && "border-destructive/50",
            !important && isPositive && min < 0 && "border-success/50",
            status === 'abnormal' && !important && "border-destructive bg-destructive/10",
            status === 'warning' && !important && "border-warning bg-warning/10"
          )}>
            <input
              type="number"
              inputMode="decimal"
              value={safeValue}
              onChange={handleInputChange}
              onFocus={saveScrollPosition}
              step={step}
              disabled={disabled}
              className={cn(
                "w-12 md:w-10 text-base md:text-xs font-mono font-semibold text-right bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                important ? "text-primary-foreground" : "text-foreground",
                !important && isNegative && "text-destructive",
                !important && isPositive && min < 0 && "text-success",
                status === 'abnormal' && !important && "text-destructive",
                status === 'warning' && !important && "text-warning"
              )}
            />
            <span className={cn(
              "text-sm md:text-[10px]",
              important ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              {unit}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-1.5">
        {/* Decrement button - Phase 2: 48px touch target */}
        <button
          disabled={disabled}
          onClick={handleDecrement}
          className="flex w-12 h-12 md:w-8 md:h-8 items-center justify-center rounded-xl md:rounded-lg bg-secondary hover:bg-muted text-foreground font-bold shadow-sm active:shadow-inner active:scale-95 transition-all flex-shrink-0 touch-manipulation"
          type="button"
          aria-label={`Decrease to ${formatValue(min)}`}
        >
          <Minus size={20} className="md:w-4 md:h-4" />
        </button>
        
        {/* Slider container - Phase 2: Enhanced track height */}
        <div className="flex-1 flex flex-col gap-1.5 md:gap-1 min-w-0">
          {/* Custom slider track with gradient */}
          <div className="relative h-4 md:h-2.5 flex items-center">
            <div 
              className="absolute inset-0 rounded-full overflow-hidden"
              style={getTrackStyle()}
            />
            <input
              disabled={disabled}
              type="range"
              min={min}
              max={max}
              step={step}
              value={safeValue}
              onChange={handleSliderChange}
              className="relative w-full h-4 md:h-2.5 rounded-full appearance-none cursor-pointer bg-transparent touch-manipulation
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-11
                [&::-webkit-slider-thumb]:h-11
                [&::-webkit-slider-thumb]:md:w-5
                [&::-webkit-slider-thumb]:md:h-5
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-primary
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-background
                [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:active:scale-110
                [&::-moz-range-thumb]:w-11
                [&::-moz-range-thumb]:h-11
                [&::-moz-range-thumb]:md:w-5
                [&::-moz-range-thumb]:md:h-5
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-primary
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-background
                [&::-moz-range-thumb]:shadow-md
                [&::-moz-range-thumb]:cursor-pointer"
            />
          </div>
          
          {/* Min/Max labels - Phase 2: Larger font on mobile */}
          <div className="flex justify-between text-xs md:text-[10px] text-muted-foreground font-mono px-0.5">
            <span className={cn(min < 0 && "text-destructive/70")}>{formatValue(min)}</span>
            {min < 0 && max > 0 && (
              <span className="text-muted-foreground/50">0</span>
            )}
            <span className={cn(max > 0 && min < 0 && "text-success/70")}>{formatValue(max)}</span>
          </div>
        </div>
        
        {/* Increment button - Phase 2: 48px touch target */}
        <button
          disabled={disabled}
          onClick={handleIncrement}
          className="flex w-12 h-12 md:w-8 md:h-8 items-center justify-center rounded-xl md:rounded-lg bg-secondary hover:bg-muted text-foreground font-bold shadow-sm active:shadow-inner active:scale-95 transition-all flex-shrink-0 touch-manipulation"
          type="button"
          aria-label={`Increase to ${formatValue(max)}`}
        >
          <Plus size={20} className="md:w-4 md:h-4" />
        </button>
      </div>
      
      {hint && (
        <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 bg-foreground text-background text-sm md:text-[10px] p-3 md:p-2 rounded z-20 w-56 md:w-48 mb-2 shadow-xl text-center pointer-events-none">
          {hint}
        </div>
      )}
      
      {/* Validation Alert - shows warning/abnormal status */}
      {showValidationAlert && validationResult && validationResult.level !== 'normal' && (
        <ValidationAlert validation={validationResult} />
      )}
    </div>
  );
};
