// Visual Analysis Report View Component
import { CalculationResult } from '@/lib/calculateLogic';
import { ViewMode } from './ViewModeSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import { Download } from 'lucide-react';
import { useRef, useState, useMemo } from 'react';

// Report components
import { ReportHeader } from './report/ReportHeader';
import { ReportFooter } from './report/ReportFooter';
import { EmpathyOpener } from './report/EmpathyOpener';
import { QuickSummary } from './report/QuickSummary';
import { LifeImpactSection } from './report/LifeImpactSection';
import { MeasurementDataSection } from './report/MeasurementDataSection';
import { LensRecommendationCard } from './report/LensRecommendationCard';
import { TrainingRecommendationCard } from './report/TrainingRecommendationCard';
import { EyeCareReminders } from './report/EyeCareReminders';
import { ClinicInfoSection } from './report/ClinicInfoSection';
import { PdfExportDialog, PdfExportOptions } from './report/PdfExportDialog';
import { PatientInfoCard } from './report/PatientInfoCard';
import { PathologyAlertSection } from './report/PathologyAlertSection';
import { ExpertReportTabs } from './report/ExpertReportTabs';
import { VisionAcuityCard } from './report/VisionAcuityCard';
import { NextStepsCTA } from './report/NextStepsCTA';
// Expert mode components
import { DiagnosticLogicCard } from './report/DiagnosticLogicCard';
import { ScoreBreakdownCard } from './report/ScoreBreakdownCard';
import { PrismCalculationCard } from './report/PrismCalculationCard';
import { CissAnalysisCard } from './report/CissAnalysisCard';
import { AccommodationAnalysisCard } from './report/AccommodationAnalysisCard';
import { StereoAnalysisCard } from './report/StereoAnalysisCard';
import { VergenceReserveCard } from './report/VergenceReserveCard';
// Pathology screening
import { screenForPathology, type PathologyScreeningInput } from '@/lib/screening/pathologyScreening';


interface ReportViewProps {
  result: CalculationResult;
  distPhoria: number;
  nearPhoria: number;
  biBreak: number;
  boBreak: number;
  distBiBreak?: number;
  distBoBreak?: number;
  pd: number;
  nra?: number;
  pra?: number;
  mem?: number;
  age?: number;
  aaOD?: number;
  aaOS?: number;
  flipper?: number;
  npc?: number;
  cissScore?: number;
  viewMode?: ViewMode;
  // Patient info
  patientCode?: string;
  patientName?: string;
  workDist?: number;
  // Pathology screening inputs
  suddenOnsetDiplopia?: boolean;
  headacheWithDiplopia?: boolean;
  odSph?: number;
  osSph?: number;
  odCyl?: number;
  osCyl?: number;
  // Visual Acuity
  vaDistBcvaOD?: string | null;
  vaDistBcvaOS?: string | null;
  vaNearBcvaOD?: string | null;
  vaNearBcvaOS?: string | null;
  vaDistUaOD?: string | null;
  vaDistUaOS?: string | null;
}

export const ReportView = ({ 
  result, 
  distPhoria, 
  nearPhoria, 
  biBreak, 
  boBreak, 
  distBiBreak, 
  distBoBreak, 
  pd, 
  nra = 2.0, 
  pra = -2.5, 
  mem = 0.5,
  age = 30,
  aaOD = 8,
  aaOS = 8,
  flipper = 12,
  npc = 6,
  cissScore = 0,
  viewMode = 'basic',
  patientCode = '',
  patientName = '',
  workDist = 40,
  suddenOnsetDiplopia,
  headacheWithDiplopia,
  odSph,
  osSph,
  odCyl,
  osCyl,
  vaDistBcvaOD,
  vaDistBcvaOS,
  vaNearBcvaOD,
  vaNearBcvaOS,
  vaDistUaOD,
  vaDistUaOS,
}: ReportViewProps) => {
  const { t, language } = useLanguage();
  const reportRef = useRef<HTMLDivElement>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportOptions, setExportOptions] = useState<PdfExportOptions | null>(null);
  const labelText = (zhTW: string, zhCN: string) => language === 'zh-CN' ? zhCN : zhTW;
  
  // Calculate training needs
  const avgAA = (aaOD + aaOS) / 2;
  const expectedAA = Math.max(0, 15 - 0.25 * age);
  
  // Morgan/Sheard calculations
  const sheardDemand = Math.abs(nearPhoria) * 2;
  const sheardReserve = nearPhoria < 0 ? boBreak : biBreak;
  const sheardNearPass = sheardReserve >= sheardDemand;
  
  const distSheardDemand = Math.abs(distPhoria) * 2;
  const distSheardReserve = distPhoria < 0 ? (distBoBreak || 9) : (distBiBreak || 7);
  const sheardDistPass = distSheardReserve >= distSheardDemand;

  // Build training needs array
  const trainingNeeds: { category: string; target: string; items: string[] }[] = [];
  
  // Run pathology screening for expert mode
  const pathologyAlerts = useMemo(() => {
    const screeningInput: PathologyScreeningInput = {
      suddenOnsetDiplopia,
      headacheWithDiplopia,
      npc,
      vertPhoria: result.vRes.has ? result.vRes.val : undefined,
      sphereOD: odSph,
      sphereOS: osSph,
      cylinderOD: odCyl,
      cylinderOS: osCyl,
      age,
    };
    return screenForPathology(screeningInput);
  }, [suddenOnsetDiplopia, headacheWithDiplopia, npc, result.vRes, odSph, osSph, odCyl, osCyl, age]);

  if (!sheardNearPass || !sheardDistPass) {
    trainingNeeds.push({
      category: nearPhoria < 0 ? t('trainingCatBoFusion') : t('trainingCatBiFusion'),
      target: `${t('trainingTargetEnhance')}${nearPhoria < 0 ? 'BO' : 'BI'}${t('trainingTargetReserveTo')} ${Math.ceil(sheardDemand)}Δ ${t('trainingTargetAbove')}`,
      items: nearPhoria < 0 
        ? [t('trainingBoPencil'), t('trainingBoBrock'), t('trainingBoPrism')]
        : [t('trainingBiLifesaver'), t('trainingBiDivergence'), t('trainingBiPrism')]
    });
  }

  if (npc > 6) {
    trainingNeeds.push({
      category: t('trainingCatNpc'),
      target: `${npc} cm → 6 cm`,
      items: [t('trainingNpcPencil'), t('trainingNpcBrock'), t('trainingNpcCard')]
    });
  }

  if (avgAA < expectedAA) {
    trainingNeeds.push({ 
      category: t('trainingCatAa'), 
      target: `${avgAA.toFixed(1)} D → ${expectedAA.toFixed(1)} D`,
      items: [t('trainingAaPushup'), t('trainingAaMinus'), t('trainingTargetToAge')]
    });
  }

  if (flipper < 12) {
    trainingNeeds.push({ 
      category: t('trainingCatFacility'), 
      target: `${flipper} cpm → 12 cpm`,
      items: [t('trainingFacilityFlipper'), t('trainingFacilityHart'), t('trainingFacilityDaily')]
    });
  }

  if (nra < 1.75 || pra > -2.0) {
    const items: string[] = [];
    if (nra < 1.75) {
      items.push(t('trainingRelativeDistant'));
      items.push(t('trainingRelative202020'));
    }
    if (pra > -2.0) items.push(t('trainingRelativeMinus'));
    trainingNeeds.push({ category: t('trainingCatRelative'), target: t('trainingTargetNraPraNormal'), items });
  }

  const handleExportPDF = async (options: PdfExportOptions) => {
    setExportOptions(options);
    
    // Wait for re-render with new options
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!reportRef.current) return;
    
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;
    
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pdfHeight = 297;
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Handle multi-page PDF
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
    
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
    
    const patientPart = options.patientName ? `_${options.patientName}` : '';
    pdf.save(`視覺分析報告${patientPart}_${new Date().toLocaleDateString('zh-TW')}.pdf`);
    
    // Reset export options
    setExportOptions(null);
  };

  // Determine which viewMode to use for display
  const displayMode = exportOptions?.exportMode || viewMode;

  return (
    <div className="max-w-lg mx-auto bg-background min-h-screen">
      {/* PDF Export Dialog */}
      <PdfExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={handleExportPDF}
        currentMode={viewMode}
      />

      {/* PDF Export Button */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-2 no-print">
        <button
          onClick={() => setShowExportDialog(true)}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-semibold text-sm touch-feedback min-h-touch"
        >
          <Download size={18} />
          {labelText('匯出 PDF 報告', '导出 PDF 报告')}
        </button>
      </div>

      <div ref={reportRef}>
        {/* Header */}
        <ReportHeader 
          patientName={exportOptions?.patientName}
          clinicName={exportOptions?.clinicName}
          includeDate={exportOptions?.includeDate ?? true}
        />
        
        {/* Main content - Mobile-first with increased spacing */}
        <div className="p-4 space-y-6">
          {/* Expert Mode: Use Tabs Architecture */}
          {displayMode === 'expert' ? (
            <>
              <ExpertReportTabs
                result={result}
                pathologyAlerts={pathologyAlerts}
                npc={npc}
                cissScore={cissScore}
                age={age}
                distPhoria={distPhoria}
                nearPhoria={nearPhoria}
                biBreak={biBreak}
                boBreak={boBreak}
                distBiBreak={distBiBreak}
                distBoBreak={distBoBreak}
                aaOD={aaOD}
                aaOS={aaOS}
                flipper={flipper}
                pd={pd}
                nra={nra}
                pra={pra}
                mem={mem}
                trainingNeeds={trainingNeeds}
                odSph={odSph}
                osSph={osSph}
                odCyl={odCyl}
                osCyl={osCyl}
              />
              
              {/* Next Steps CTA - After tabs */}
              <NextStepsCTA result={result} />
            </>
          ) : (
            <>
              {/* Basic/Pro Mode: Original Layout */}
              <PatientInfoCard
                patientCode={patientCode || Date.now().toString(36).toUpperCase()}
                patientName={exportOptions?.patientName || patientName}
                age={age}
                functionalAge={result.accom.functionalAge}
                pd={pd}
                workDist={workDist}
                cissScore={cissScore}
              />

              {/* Vision Acuity Card - After Patient Info */}
              <VisionAcuityCard
                distBcvaOD={vaDistBcvaOD}
                distBcvaOS={vaDistBcvaOS}
                nearBcvaOD={vaNearBcvaOD}
                nearBcvaOS={vaNearBcvaOS}
                distUaOD={vaDistUaOD}
                distUaOS={vaDistUaOS}
              />

              <EmpathyOpener 
                result={result} 
                cissScore={cissScore}
                npc={npc}
              />
              
              <QuickSummary 
                result={result} 
                alerts={result.alerts}
              />
              
              <LifeImpactSection
                result={result}
                viewMode={displayMode}
                npc={npc}
                flipper={flipper}
                age={age}
              />
              
              <LensRecommendationCard 
                result={result} 
                viewMode={displayMode}
              />
              
              {trainingNeeds.length > 0 && (
                <TrainingRecommendationCard 
                  trainingNeeds={trainingNeeds}
                  viewMode={displayMode}
                />
              )}
              
              {displayMode === 'pro' && (
                <MeasurementDataSection
                  result={result}
                  distPhoria={distPhoria}
                  nearPhoria={nearPhoria}
                  biBreak={biBreak}
                  boBreak={boBreak}
                  distBiBreak={distBiBreak}
                  distBoBreak={distBoBreak}
                  pd={pd}
                  nra={nra}
                  pra={pra}
                  age={age}
                  aaOD={aaOD}
                  aaOS={aaOS}
                  flipper={flipper}
                  npc={npc}
                  viewMode={displayMode}
                />
              )}
              
              <EyeCareReminders />
              <ClinicInfoSection />
            </>
          )}
        </div>
        
        {/* Footer */}
        <ReportFooter 
          optometristName={exportOptions?.optometristName}
          customFooterNote={exportOptions?.customFooterNote}
        />
      </div>
    </div>
  );
};
