import { useState, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronUp, Eye, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { VA_OPTIONS, CORRECTION_TYPE_OPTIONS, getLocalizedVAOptions, getLocalizedCorrectionTypeOptions } from '@/lib/vaOptions';
import { formatVASummary, VAData, hasVAData } from '@/lib/vaConverter';
import { BinocularVisionFeasibilityAlert } from '@/components/BinocularVisionFeasibilityAlert';

export interface VisionAcuitySectionProps {
  // Distance vision
  vaDistanceUaOd: string | null;
  setVaDistanceUaOd: (v: string | null) => void;
  vaDistanceUaOs: string | null;
  setVaDistanceUaOs: (v: string | null) => void;
  vaDistanceHcOd: string | null;
  setVaDistanceHcOd: (v: string | null) => void;
  vaDistanceHcOs: string | null;
  setVaDistanceHcOs: (v: string | null) => void;
  vaDistanceBcvaOd: string | null;
  setVaDistanceBcvaOd: (v: string | null) => void;
  vaDistanceBcvaOs: string | null;
  setVaDistanceBcvaOs: (v: string | null) => void;
  // Near vision
  vaNearUaOd: string | null;
  setVaNearUaOd: (v: string | null) => void;
  vaNearUaOs: string | null;
  setVaNearUaOs: (v: string | null) => void;
  vaNearHcOd: string | null;
  setVaNearHcOd: (v: string | null) => void;
  vaNearHcOs: string | null;
  setVaNearHcOs: (v: string | null) => void;
  vaNearBcvaOd: string | null;
  setVaNearBcvaOd: (v: string | null) => void;
  vaNearBcvaOs: string | null;
  setVaNearBcvaOs: (v: string | null) => void;
  // Metadata
  vaDistanceTestMeters: number;
  setVaDistanceTestMeters: (v: number) => void;
  vaNearTestCm: number;
  setVaNearTestCm: (v: number) => void;
  vaCorrectionType: string | null;
  setVaCorrectionType: (v: string | null) => void;
}

export const VisionAcuitySection = (props: VisionAcuitySectionProps) => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    vaDistanceUaOd, setVaDistanceUaOd,
    vaDistanceUaOs, setVaDistanceUaOs,
    vaDistanceHcOd, setVaDistanceHcOd,
    vaDistanceHcOs, setVaDistanceHcOs,
    vaDistanceBcvaOd, setVaDistanceBcvaOd,
    vaDistanceBcvaOs, setVaDistanceBcvaOs,
    vaNearUaOd, setVaNearUaOd,
    vaNearUaOs, setVaNearUaOs,
    vaNearHcOd, setVaNearHcOd,
    vaNearHcOs, setVaNearHcOs,
    vaNearBcvaOd, setVaNearBcvaOd,
    vaNearBcvaOs, setVaNearBcvaOs,
    vaDistanceTestMeters, setVaDistanceTestMeters,
    vaNearTestCm, setVaNearTestCm,
    vaCorrectionType, setVaCorrectionType,
  } = props;

  // Build VAData for summary
  const vaData: VAData = useMemo(() => ({
    va_distance_ua_od_raw: vaDistanceUaOd,
    va_distance_ua_os_raw: vaDistanceUaOs,
    va_distance_hc_od_raw: vaDistanceHcOd,
    va_distance_hc_os_raw: vaDistanceHcOs,
    va_distance_bcva_od_raw: vaDistanceBcvaOd,
    va_distance_bcva_os_raw: vaDistanceBcvaOs,
    va_near_ua_od_raw: vaNearUaOd,
    va_near_ua_os_raw: vaNearUaOs,
    va_near_hc_od_raw: vaNearHcOd,
    va_near_hc_os_raw: vaNearHcOs,
    va_near_bcva_od_raw: vaNearBcvaOd,
    va_near_bcva_os_raw: vaNearBcvaOs,
  }), [
    vaDistanceUaOd, vaDistanceUaOs, vaDistanceHcOd, vaDistanceHcOs,
    vaDistanceBcvaOd, vaDistanceBcvaOs, vaNearUaOd, vaNearUaOs,
    vaNearHcOd, vaNearHcOs, vaNearBcvaOd, vaNearBcvaOs
  ]);

  const summary = useMemo(() => formatVASummary(vaData, language), [vaData, language]);
  const hasData = useMemo(() => hasVAData(vaData), [vaData]);

  const tLocal = useCallback((zhTW: string, zhCN: string, en?: string) => {
    if (language === 'en' && en) return en;
    return language === 'zh-TW' ? zhTW : zhCN;
  }, [language]);

  const vaOptions = useMemo(() => getLocalizedVAOptions(language), [language]);
  const correctionOptions = useMemo(() => getLocalizedCorrectionTypeOptions(language), [language]);

  // VA Select component for reuse - Mobile optimized with 52px height
  const VASelect = ({ value, onChange, isRecommended = false }: { 
    value: string | null; 
    onChange: (v: string | null) => void;
    isRecommended?: boolean;
  }) => (
    <div className="relative">
      <Select 
        value={value || ''} 
        onValueChange={(v) => onChange(v === '' ? null : v)}
      >
        <SelectTrigger className={cn(
          "h-[52px] md:h-10 min-h-[52px] md:min-h-[44px] text-base md:text-sm",
          isRecommended && !value && "border-amber-400/50 bg-amber-50/30 dark:bg-amber-900/10"
        )}>
          <SelectValue placeholder="—" />
        </SelectTrigger>
        <SelectContent>
          {vaOptions.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value || 'empty'}
              className="min-h-[44px] md:min-h-0 text-base md:text-sm"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isRecommended && !value && (
        <span className="absolute -top-1 -right-1 text-amber-500 text-xs font-bold">✱</span>
      )}
    </div>
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4">
      <CollapsibleTrigger className="w-full min-h-[56px] md:min-h-0">
        <div className={cn(
          "flex items-center justify-between p-4 md:p-3 rounded-lg border transition-colors",
          isOpen 
            ? "bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" 
            : "bg-secondary/30 hover:bg-secondary/50 border-border/50"
        )}>
          <div className="flex items-center gap-3 md:gap-2">
            <Eye className="w-6 h-6 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-base md:text-sm">
              {tLocal('視力摘要', '视力摘要', 'Visual Acuity')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm md:text-xs truncate max-w-[150px] sm:max-w-[300px]",
              hasData ? "text-muted-foreground" : "text-muted-foreground/60 italic"
            )}>
              {summary}
            </span>
            {isOpen ? <ChevronUp size={20} className="md:w-4 md:h-4" /> : <ChevronDown size={20} className="md:w-4 md:h-4" />}
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="pt-3">
        <div className="border border-border/50 rounded-lg p-4 bg-card/50">
          {/* Legend */}
          <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="text-amber-500 font-bold">✱</span>
              {tLocal('建議填寫', '建议填写', 'Recommended')}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <Info size={12} />
                    {tLocal('說明', '说明', 'Info')}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-xs">
                    {tLocal(
                      'UA = 裸視 (Uncorrected)，HC = 習慣矯正 (Habitual Correction)，BCVA = 最佳矯正視力 (Best Corrected)',
                      'UA = 裸视 (Uncorrected)，HC = 习惯矫正 (Habitual Correction)，BCVA = 最佳矫正视力 (Best Corrected)',
                      'UA = Uncorrected, HC = Habitual Correction, BCVA = Best Corrected Visual Acuity'
                    )}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Table - responsive with horizontal scroll on mobile */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[320px] border-collapse">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border/50">
                  <th className="text-left py-2 pr-2 w-24 sm:w-32"></th>
                  <th className="text-center py-2 px-1 sm:px-2 w-24 sm:w-28">
                    OD <span className="hidden sm:inline">({tLocal('右眼', '右眼', 'Right')})</span>
                  </th>
                  <th className="text-center py-2 px-1 sm:px-2 w-24 sm:w-28">
                    OS <span className="hidden sm:inline">({tLocal('左眼', '左眼', 'Left')})</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Distance Vision Section */}
                <tr className="border-b border-border/30">
                  <td colSpan={3} className="py-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      {tLocal('遠方視力', '远方视力', 'Distance Vision')} ({vaDistanceTestMeters}m)
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-border/20">
                  <td className="py-2 pr-2 text-sm">{tLocal('裸視 UA', '裸视 UA', 'Uncorrected')}</td>
                  <td className="py-2 px-1 sm:px-2">
                    <VASelect value={vaDistanceUaOd} onChange={setVaDistanceUaOd} />
                  </td>
                  <td className="py-2 px-1 sm:px-2">
                    <VASelect value={vaDistanceUaOs} onChange={setVaDistanceUaOs} />
                  </td>
                </tr>
                <tr className="border-b border-border/20">
                  <td className="py-2 pr-2 text-sm">{tLocal('習慣 HC', '习惯 HC', 'Habitual')}</td>
                  <td className="py-2 px-1 sm:px-2">
                    <VASelect value={vaDistanceHcOd} onChange={setVaDistanceHcOd} />
                  </td>
                  <td className="py-2 px-1 sm:px-2">
                    <VASelect value={vaDistanceHcOs} onChange={setVaDistanceHcOs} />
                  </td>
                </tr>
                <tr className="border-b border-border/30">
                  <td className="py-2 pr-2 text-sm font-medium">
                    BCVA <span className="text-amber-500">✱</span>
                  </td>
                  <td className="py-2 px-1 sm:px-2">
                    <VASelect value={vaDistanceBcvaOd} onChange={setVaDistanceBcvaOd} isRecommended />
                  </td>
                  <td className="py-2 px-1 sm:px-2">
                    <VASelect value={vaDistanceBcvaOs} onChange={setVaDistanceBcvaOs} isRecommended />
                  </td>
                </tr>

                {/* Near Vision Section */}
                <tr className="border-b border-border/30">
                  <td colSpan={3} className="py-2 pt-4">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      {tLocal('近方視力', '近方视力', 'Near Vision')} ({vaNearTestCm}cm)
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-border/20">
                  <td className="py-2 pr-2 text-sm">{tLocal('裸視 UA', '裸视 UA', 'Uncorrected')}</td>
                  <td className="py-2 px-1 sm:px-2">
                    <VASelect value={vaNearUaOd} onChange={setVaNearUaOd} />
                  </td>
                  <td className="py-2 px-1 sm:px-2">
                    <VASelect value={vaNearUaOs} onChange={setVaNearUaOs} />
                  </td>
                </tr>
                <tr className="border-b border-border/20">
                  <td className="py-2 pr-2 text-sm">{tLocal('習慣 HC', '习惯 HC', 'Habitual')}</td>
                  <td className="py-2 px-1 sm:px-2">
                    <VASelect value={vaNearHcOd} onChange={setVaNearHcOd} />
                  </td>
                  <td className="py-2 px-1 sm:px-2">
                    <VASelect value={vaNearHcOs} onChange={setVaNearHcOs} />
                  </td>
                </tr>
                <tr className="border-b border-border/30">
                  <td className="py-2 pr-2 text-sm font-medium">
                    BCVA <span className="text-amber-500">✱</span>
                  </td>
                  <td className="py-2 px-1 sm:px-2">
                    <VASelect value={vaNearBcvaOd} onChange={setVaNearBcvaOd} isRecommended />
                  </td>
                  <td className="py-2 px-1 sm:px-2">
                    <VASelect value={vaNearBcvaOs} onChange={setVaNearBcvaOs} isRecommended />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Binocular Vision Feasibility Alert */}
          <BinocularVisionFeasibilityAlert
            bcvaOD={vaDistanceBcvaOd}
            bcvaOS={vaDistanceBcvaOs}
          />

          {/* Metadata Section */}
          <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
            {/* Test Distance */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  {tLocal('遠距測量', '远距测量', 'Distance')}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={vaDistanceTestMeters}
                    onChange={(e) => setVaDistanceTestMeters(parseFloat(e.target.value) || 6)}
                    className="h-9 w-16 text-center"
                    min={3}
                    max={10}
                    step={0.5}
                  />
                  <span className="text-sm text-muted-foreground">m</span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  {tLocal('近距測量', '近距测量', 'Near')}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={vaNearTestCm}
                    onChange={(e) => setVaNearTestCm(parseInt(e.target.value) || 40)}
                    className="h-9 w-16 text-center"
                    min={30}
                    max={50}
                    step={5}
                  />
                  <span className="text-sm text-muted-foreground">cm</span>
                </div>
              </div>
            </div>

            {/* Correction Type */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                {tLocal('矯正方式', '矫正方式', 'Correction Type')}
              </Label>
              <RadioGroup
                value={vaCorrectionType || ''}
                onValueChange={(v) => setVaCorrectionType(v || null)}
                className="flex flex-wrap gap-3"
              >
                {correctionOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`correction-${option.value}`} />
                    <Label 
                      htmlFor={`correction-${option.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
