import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ClipboardPaste, BarChart2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CLINICAL_NORMS, getNormDisplayString, FUSIONAL_RESERVE_NORMS } from '@/constants/clinicalNorms';
import { cn } from '@/lib/utils';

interface FusionalReserveInputProps {
  // Near BI
  biBl: number | null;
  setBiBl: (v: number | null) => void;
  biB: number;
  setBiB: (v: number) => void;
  biR: number;
  setBiR: (v: number) => void;
  // Near BO
  boBl: number | null;
  setBoBl: (v: number | null) => void;
  boB: number;
  setBoB: (v: number) => void;
  boR: number;
  setBoR: (v: number) => void;
  // Distance BI
  distBiBl: number | null;
  setDistBiBl: (v: number | null) => void;
  distBiB: number;
  setDistBiB: (v: number) => void;
  distBiR: number;
  setDistBiR: (v: number) => void;
  // Distance BO
  distBoBl: number | null;
  setDistBoBl: (v: number | null) => void;
  distBoB: number;
  setDistBoB: (v: number) => void;
  distBoR: number;
  setDistBoR: (v: number) => void;
  // Default tracking
  isDefaultValues?: Record<string, boolean>;
  onFieldChange?: (field: string) => void;
  // Literature reference
  onOpenLiterature?: () => void;
}

// 單一輸入卡片元件
interface InputCardProps {
  label: string;
  normDisplay: string | null;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  isDefault?: boolean;
  isOptional?: boolean;
  placeholder?: string;
  isLow?: boolean; // 是否低於正常值
}

const InputCard = ({ 
  label, 
  normDisplay, 
  value, 
  onChange, 
  min, 
  max, 
  isDefault = false,
  isOptional = false,
  placeholder,
  isLow = false,
}: InputCardProps) => {
  return (
    <div className={cn(
      "border rounded-lg p-4 md:p-3 space-y-3 md:space-y-2 transition-colors",
      isLow 
        ? "bg-destructive/10 border-destructive/50" 
        : isDefault 
          ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800" 
          : "bg-card border-border"
    )}>
      {/* 標籤行 */}
      <div className="flex items-center justify-between">
        <span className={cn(
          "font-medium text-base md:text-sm",
          isLow ? "text-destructive" : "text-foreground"
        )}>{label}</span>
        {isLow ? (
          <span className="inline-flex items-center gap-1 text-xs md:text-[9px] text-destructive font-medium">
            <AlertTriangle size={12} className="md:w-[10px] md:h-[10px]" />
            偏低
          </span>
        ) : isDefault ? (
          <span className="inline-flex items-center gap-1 text-xs md:text-[9px] text-blue-600 dark:text-blue-400">
            <BarChart2 size={12} className="md:w-[10px] md:h-[10px]" />
            預填
          </span>
        ) : null}
      </div>
      
      {/* 正常值 */}
      {normDisplay && (
        <div className="text-sm md:text-xs text-muted-foreground">
          正常: {normDisplay}
        </div>
      )}
      {isOptional && !normDisplay && (
        <div className="text-sm md:text-xs text-muted-foreground italic">
          (選填)
        </div>
      )}
      
      {/* 輸入框 - 52px height on mobile */}
      <div className="relative">
        <input
          type="number"
          value={value === 0 && isOptional ? '' : value}
          onChange={(e) => {
            const v = e.target.value === '' ? 0 : Number(e.target.value);
            onChange(Math.min(max, Math.max(min, v)));
          }}
          placeholder={placeholder}
          className={cn(
            "w-full h-[52px] md:h-10 text-xl md:text-lg text-center font-medium rounded-md border bg-background",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            isLow 
              ? "border-destructive text-destructive" 
              : isDefault 
                ? "border-blue-300 dark:border-blue-700" 
                : "border-input"
          )}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-base md:text-sm text-muted-foreground">
          Δ
        </span>
      </div>
    </div>
  );
};

// 快速判讀警示區塊
interface QuickAlertProps {
  isLow: boolean;
  message: string;
  normalMessage: string;
}

const QuickAlert = ({ isLow, message, normalMessage }: QuickAlertProps) => {
  if (isLow) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive/30 rounded-lg">
        <AlertTriangle size={14} className="text-destructive shrink-0" />
        <span className="text-xs text-destructive font-medium">{message}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
      <CheckCircle2 size={14} className="text-green-600 dark:text-green-400 shrink-0" />
      <span className="text-xs text-green-700 dark:text-green-400">{normalMessage}</span>
    </div>
  );
};


// 檢查破裂點是否低於正常值 (使用 mean - 1 SD 作為警示閾值)
function isBreakLow(value: number, distance: 'near' | 'distance', type: 'bi' | 'bo'): boolean {
  const norms = FUSIONAL_RESERVE_NORMS[distance][type] as Record<string, { mean: number; sd: number } | undefined>;
  const breakNorm = norms.break;
  if (!breakNorm) return false;
  const threshold = breakNorm.mean - breakNorm.sd;
  return value < threshold;
}

export const FusionalReserveInput = ({
  biBl, setBiBl, biB, setBiB, biR, setBiR,
  boBl, setBoBl, boB, setBoB, boR, setBoR,
  distBiBl, setDistBiBl, distBiB, setDistBiB, distBiR, setDistBiR,
  distBoBl, setDistBoBl, distBoB, setDistBoB, distBoR, setDistBoR,
  isDefaultValues = {},
  onFieldChange,
  onOpenLiterature,
}: FusionalReserveInputProps) => {
  const { language } = useLanguage();

  const tLocal = (zhTW: string, zhCN: string, en?: string) => {
    if (language === 'en' && en) return en;
    return language === 'zh-TW' ? zhTW : zhCN;
  };

  // Fill standard values for near
  const fillNearStandard = () => {
    const nearBI = CLINICAL_NORMS.fusionalReserves.near.bi;
    const nearBO = CLINICAL_NORMS.fusionalReserves.near.bo;
    
    setBiBl(nearBI.blur);
    setBiB(nearBI.break);
    setBiR(nearBI.recovery);
    setBoBl(nearBO.blur);
    setBoB(nearBO.break);
    setBoR(nearBO.recovery);
  };

  // Fill standard values for distance
  const fillDistanceStandard = () => {
    const distBI = CLINICAL_NORMS.fusionalReserves.distance.bi;
    const distBO = CLINICAL_NORMS.fusionalReserves.distance.bo;
    
    setDistBiBl(distBI.blur);
    setDistBiB(distBI.break);
    setDistBiR(distBI.recovery);
    setDistBoBl(distBO.blur);
    setDistBoB(distBO.break);
    setDistBoR(distBO.recovery);
  };

  // Wrapper to track field changes
  const handleChange = <T,>(setter: (v: T) => void, field: string) => (value: T) => {
    setter(value);
    onFieldChange?.(field);
  };

  // Check if a value is default
  const isDefault = (field: string) => isDefaultValues[field] === true;

  const ranges = CLINICAL_NORMS.ranges;

  // 計算各區塊的破裂點是否偏低
  const nearBiBLow = isBreakLow(biB, 'near', 'bi');
  const nearBoBLow = isBreakLow(boB, 'near', 'bo');
  const distBiBLow = isBreakLow(distBiB, 'distance', 'bi');
  const distBoBLow = isBreakLow(distBoB, 'distance', 'bo');


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-success uppercase tracking-wider">
          {tLocal('融像儲備', '融像储备', 'Fusional Reserve')}
        </div>
        {onOpenLiterature && (
          <button
            onClick={onOpenLiterature}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <span>📚</span>
            {tLocal('文獻參考', '文献参考', 'Literature')}
          </button>
        )}
      </div>

      {/* ========== 近距融像 (40cm) ========== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            {tLocal('近距融像 (40cm)', '近距融像 (40cm)', 'Near Fusion (40cm)')}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={fillNearStandard}
            className="h-12 md:h-7 px-4 md:px-2 text-sm md:text-xs gap-2 md:gap-1 text-primary hover:text-primary min-h-[48px] md:min-h-0"
          >
            <ClipboardPaste size={16} className="md:w-3 md:h-3" />
            {tLocal('填入標準值', '填入标准值', 'Fill Standard')}
          </Button>
        </div>

        {/* Near BI Row - 淡藍色背景 */}
        <div className="bg-blue-50/70 dark:bg-blue-950/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-blue-700 dark:text-blue-400">BI</span>
              <span className="text-xs text-muted-foreground">
                ({tLocal('內聚', '内聚', 'Base In')})
              </span>
            </div>
            {/* 快速判讀 */}
            <QuickAlert 
              isLow={nearBiBLow}
              message={tLocal('BI 破裂點偏低，內聚儲備不足', 'BI 破裂点偏低，内聚储备不足', 'BI Break low - insufficient convergence reserve')}
              normalMessage={tLocal('BI 儲備正常', 'BI 储备正常', 'BI reserve normal')}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <InputCard
              label={tLocal('模糊點', '模糊点', 'Blur')}
              normDisplay={getNormDisplayString('near', 'bi', 'blur')}
              value={biBl ?? 0}
              onChange={(v) => handleChange(setBiBl, 'biBl')(v === 0 ? null : v)}
              min={ranges.near.bi.blur[0]}
              max={ranges.near.bi.blur[1]}
              isDefault={isDefault('biBl')}
              isOptional={true}
              placeholder="-"
            />
            <InputCard
              label={tLocal('破裂點', '破裂点', 'Break')}
              normDisplay={getNormDisplayString('near', 'bi', 'break')}
              value={biB}
              onChange={handleChange(setBiB, 'biB')}
              min={ranges.near.bi.break[0]}
              max={ranges.near.bi.break[1]}
              isDefault={isDefault('biB')}
              isLow={nearBiBLow}
            />
            <InputCard
              label={tLocal('恢復點', '恢复点', 'Recovery')}
              normDisplay={getNormDisplayString('near', 'bi', 'recovery')}
              value={biR}
              onChange={handleChange(setBiR, 'biR')}
              min={ranges.near.bi.recovery[0]}
              max={ranges.near.bi.recovery[1]}
              isDefault={isDefault('biR')}
            />
          </div>
        </div>

        {/* Near BO Row - 淡紅色背景 */}
        <div className="bg-red-50/70 dark:bg-red-950/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-red-700 dark:text-red-400">BO</span>
              <span className="text-xs text-muted-foreground">
                ({tLocal('外展', '外展', 'Base Out')})
              </span>
            </div>
            {/* 快速判讀 */}
            <QuickAlert 
              isLow={nearBoBLow}
              message={tLocal('BO 破裂點偏低，外展儲備不足', 'BO 破裂点偏低，外展储备不足', 'BO Break low - insufficient divergence reserve')}
              normalMessage={tLocal('BO 儲備正常', 'BO 储备正常', 'BO reserve normal')}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <InputCard
              label={tLocal('模糊點', '模糊点', 'Blur')}
              normDisplay={getNormDisplayString('near', 'bo', 'blur')}
              value={boBl ?? 0}
              onChange={(v) => handleChange(setBoBl, 'boBl')(v === 0 ? null : v)}
              min={ranges.near.bo.blur[0]}
              max={ranges.near.bo.blur[1]}
              isDefault={isDefault('boBl')}
              isOptional={true}
              placeholder="-"
            />
            <InputCard
              label={tLocal('破裂點', '破裂点', 'Break')}
              normDisplay={getNormDisplayString('near', 'bo', 'break')}
              value={boB}
              onChange={handleChange(setBoB, 'boB')}
              min={ranges.near.bo.break[0]}
              max={ranges.near.bo.break[1]}
              isDefault={isDefault('boB')}
              isLow={nearBoBLow}
            />
            <InputCard
              label={tLocal('恢復點', '恢复点', 'Recovery')}
              normDisplay={getNormDisplayString('near', 'bo', 'recovery')}
              value={boR}
              onChange={handleChange(setBoR, 'boR')}
              min={ranges.near.bo.recovery[0]}
              max={ranges.near.bo.recovery[1]}
              isDefault={isDefault('boR')}
            />
          </div>
        </div>

      </div>

      {/* ========== 遠距融像 (6m) ========== */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            {tLocal('遠距融像 (6m)', '远距融像 (6m)', 'Distance Fusion (6m)')}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={fillDistanceStandard}
            className="h-12 md:h-7 px-4 md:px-2 text-sm md:text-xs gap-2 md:gap-1 text-primary hover:text-primary min-h-[48px] md:min-h-0"
          >
            <ClipboardPaste size={16} className="md:w-3 md:h-3" />
            {tLocal('填入標準值', '填入标准值', 'Fill Standard')}
          </Button>
        </div>

        {/* Distance BI Row - 淡藍色背景 */}
        <div className="bg-blue-50/70 dark:bg-blue-950/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-blue-700 dark:text-blue-400">BI</span>
              <span className="text-xs text-muted-foreground">
                ({tLocal('內聚', '内聚', 'Base In')})
              </span>
            </div>
            {/* 快速判讀 */}
            <QuickAlert 
              isLow={distBiBLow}
              message={tLocal('BI 破裂點偏低，遠距內聚儲備不足', 'BI 破裂点偏低，远距内聚储备不足', 'BI Break low - insufficient distance convergence')}
              normalMessage={tLocal('BI 儲備正常', 'BI 储备正常', 'BI reserve normal')}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <InputCard
              label={tLocal('模糊點', '模糊点', 'Blur')}
              normDisplay={getNormDisplayString('distance', 'bi', 'blur')}
              value={distBiBl ?? 0}
              onChange={(v) => handleChange(setDistBiBl, 'distBiBl')(v === 0 ? null : v)}
              min={ranges.distance.bi.blur[0]}
              max={ranges.distance.bi.blur[1]}
              isDefault={isDefault('distBiBl')}
              isOptional={true}
              placeholder="-"
            />
            <InputCard
              label={tLocal('破裂點', '破裂点', 'Break')}
              normDisplay={getNormDisplayString('distance', 'bi', 'break')}
              value={distBiB}
              onChange={handleChange(setDistBiB, 'distBiB')}
              min={ranges.distance.bi.break[0]}
              max={ranges.distance.bi.break[1]}
              isDefault={isDefault('distBiB')}
              isLow={distBiBLow}
            />
            <InputCard
              label={tLocal('恢復點', '恢复点', 'Recovery')}
              normDisplay={getNormDisplayString('distance', 'bi', 'recovery')}
              value={distBiR}
              onChange={handleChange(setDistBiR, 'distBiR')}
              min={ranges.distance.bi.recovery[0]}
              max={ranges.distance.bi.recovery[1]}
              isDefault={isDefault('distBiR')}
            />
          </div>
        </div>

        {/* Distance BO Row - 淡紅色背景 */}
        <div className="bg-red-50/70 dark:bg-red-950/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-red-700 dark:text-red-400">BO</span>
              <span className="text-xs text-muted-foreground">
                ({tLocal('外展', '外展', 'Base Out')})
              </span>
            </div>
            {/* 快速判讀 */}
            <QuickAlert 
              isLow={distBoBLow}
              message={tLocal('BO 破裂點偏低，遠距外展儲備不足', 'BO 破裂点偏低，远距外展储备不足', 'BO Break low - insufficient distance divergence')}
              normalMessage={tLocal('BO 儲備正常', 'BO 储备正常', 'BO reserve normal')}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <InputCard
              label={tLocal('模糊點', '模糊点', 'Blur')}
              normDisplay={getNormDisplayString('distance', 'bo', 'blur')}
              value={distBoBl ?? 0}
              onChange={(v) => handleChange(setDistBoBl, 'distBoBl')(v === 0 ? null : v)}
              min={ranges.distance.bo.blur[0]}
              max={ranges.distance.bo.blur[1]}
              isDefault={isDefault('distBoBl')}
              isOptional={true}
              placeholder="-"
            />
            <InputCard
              label={tLocal('破裂點', '破裂点', 'Break')}
              normDisplay={getNormDisplayString('distance', 'bo', 'break')}
              value={distBoB}
              onChange={handleChange(setDistBoB, 'distBoB')}
              min={ranges.distance.bo.break[0]}
              max={ranges.distance.bo.break[1]}
              isDefault={isDefault('distBoB')}
              isLow={distBoBLow}
            />
            <InputCard
              label={tLocal('恢復點', '恢复点', 'Recovery')}
              normDisplay={getNormDisplayString('distance', 'bo', 'recovery')}
              value={distBoR}
              onChange={handleChange(setDistBoR, 'distBoR')}
              min={ranges.distance.bo.recovery[0]}
              max={ranges.distance.bo.recovery[1]}
              isDefault={isDefault('distBoR')}
            />
          </div>
        </div>

      </div>
    </div>
  );
};
