import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart2, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { ReportCard } from './ReportCard';
import { VisualAnalysisGraph } from '../VisualAnalysisGraph';
import { CalculationResult } from '@/lib/calculateLogic';
import { ViewMode } from '../ViewModeSelector';
import { useState } from 'react';

interface MeasurementDataSectionProps {
  result: CalculationResult;
  distPhoria: number;
  nearPhoria: number;
  biBreak: number;
  boBreak: number;
  distBiBreak?: number;
  distBoBreak?: number;
  pd: number;
  nra: number;
  pra: number;
  age: number;
  aaOD: number;
  aaOS: number;
  flipper: number;
  npc: number;
  viewMode: ViewMode;
}

export const MeasurementDataSection = ({
  result,
  distPhoria,
  nearPhoria,
  biBreak,
  boBreak,
  distBiBreak,
  distBoBreak,
  pd,
  nra,
  pra,
  age,
  aaOD,
  aaOS,
  flipper,
  npc,
  viewMode,
}: MeasurementDataSectionProps) => {
  const { t } = useLanguage();
  const [showDetails, setShowDetails] = useState(viewMode === 'expert');

  // Morgan/Sheard/Percival calculations
  const sheardDemand = Math.abs(nearPhoria) * 2;
  const sheardReserve = nearPhoria < 0 ? boBreak : biBreak;
  const sheardNearPass = sheardReserve >= sheardDemand;
  
  const distSheardDemand = Math.abs(distPhoria) * 2;
  const distSheardReserve = distPhoria < 0 ? (distBoBreak || 9) : (distBiBreak || 7);
  const sheardDistPass = distSheardReserve >= distSheardDemand;

  const morganNearPass = nearPhoria >= -6 && nearPhoria <= 0;
  const morganDistPass = distPhoria >= -1 && distPhoria <= 1;

  const totalNear = biBreak + boBreak;
  const percivalNearPass = Math.min(biBreak, boBreak) >= totalNear / 3;
  const totalDist = (distBiBreak || 7) + (distBoBreak || 9);
  const percivalDistPass = Math.min(distBiBreak || 7, distBoBreak || 9) >= totalDist / 3;

  if (viewMode === 'basic') {
    return null;
  }

  const CriteriaRow = ({ name, distPass, nearPass }: { name: string; distPass: boolean; nearPass: boolean }) => (
    <div className="list-item justify-between">
      <span className="font-medium text-sm w-16">{name}</span>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{t('distance')}</span>
          {distPass ? <CheckCircle size={16} className="text-success" /> : <XCircle size={16} className="text-destructive" />}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{t('near')}</span>
          {nearPass ? <CheckCircle size={16} className="text-success" /> : <XCircle size={16} className="text-destructive" />}
        </div>
      </div>
    </div>
  );

  return (
    <ReportCard
      icon={BarChart2}
      title={t('measurementDataSummary')}
      collapsible
      defaultOpen={false}
    >
      {/* Graph */}
      <div className="bg-secondary/50 rounded-xl p-3 mb-4">
        <VisualAnalysisGraph
          distPhoria={distPhoria}
          nearPhoria={nearPhoria}
          biBreak={biBreak}
          boBreak={boBreak}
          distBiBreak={distBiBreak}
          distBoBreak={distBoBreak}
          pd={pd}
          acaVal={result.aca.val}
          workDemandD={2.5}
          age={age}
          aaOD={aaOD}
          aaOS={aaOS}
          nra={nra}
          pra={pra}
          flipper={flipper}
          npc={npc}
        />
      </div>

      {/* Criteria Summary */}
      <div className="space-y-2">
        <div className="section-title">{t('criteriaInterpretation')}</div>
        <CriteriaRow name="Morgan" distPass={morganDistPass} nearPass={morganNearPass} />
        <CriteriaRow name="Sheard" distPass={sheardDistPass} nearPass={sheardNearPass} />
        <CriteriaRow name="Percival" distPass={percivalDistPass} nearPass={percivalNearPass} />
      </div>

      {/* Expandable detailed values */}
      <div className="mt-4 pt-3 border-t border-border">
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground touch-feedback min-h-touch"
        >
          <span>{t('detailedValues')}</span>
          <ChevronDown
            size={18} 
            className={cn("transition-transform", showDetails && "rotate-180")} 
          />
        </button>
        
        {showDetails && (
          <div className="grid grid-cols-2 gap-2 mt-3 animate-fade-in">
            <div className="list-item flex-col items-start py-2">
              <div className="text-xs text-muted-foreground">{t('distancePhoriaLabel')}</div>
              <div className="font-semibold text-sm">
                {distPhoria > 0 ? t('eso') : distPhoria < 0 ? t('exo') : t('ortho')} {Math.abs(distPhoria)}Δ
              </div>
            </div>
            <div className="list-item flex-col items-start py-2">
              <div className="text-xs text-muted-foreground">{t('nearPhoriaLabel')}</div>
              <div className="font-semibold text-sm">
                {nearPhoria > 0 ? t('eso') : nearPhoria < 0 ? t('exo') : t('ortho')} {Math.abs(nearPhoria)}Δ
              </div>
            </div>
            <div className="list-item flex-col items-start py-2">
              <div className="text-xs text-muted-foreground">NPC</div>
              <div className={cn("font-semibold text-sm", npc > 6 ? "text-warning" : "text-success")}>
                {npc} cm
              </div>
            </div>
            <div className="list-item flex-col items-start py-2">
              <div className="text-xs text-muted-foreground">Flipper</div>
              <div className={cn("font-semibold text-sm", flipper < 12 ? "text-warning" : "text-success")}>
                {flipper} cpm
              </div>
            </div>
          </div>
        )}
      </div>
    </ReportCard>
  );
};