import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ExamRecord } from '@/lib/examRecordService';
import { calculateLogic } from '@/lib/calculateLogic';
import { ReportView } from '@/components/ReportView';
import { ViewMode } from '@/components/ViewModeSelector';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, X } from 'lucide-react';

interface RecordDetailDialogProps {
  record: ExamRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RecordDetailDialog = ({ record, open, onOpenChange }: RecordDetailDialogProps) => {
  const { language } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('basic');
  const reportRef = useRef<HTMLDivElement>(null);

  const t = (zhTW: string, zhCN: string) => language === 'zh-TW' ? zhTW : zhCN;

  if (!record) return null;

  const examData = record.exam_data || {};
  
  // Extract values from exam_data with defaults
  const dist = examData.dist ?? 0;
  const near = examData.near ?? -6;
  const biB = examData.biB ?? 12;
  const boB = examData.boB ?? 20;
  const distBiB = examData.distBiB;
  const distBoB = examData.distBoB;
  const pd = examData.pd ?? 64;
  const nra = examData.nra ?? 2.0;
  const pra = examData.pra ?? -2.5;
  const mem = examData.mem ?? 0.5;
  const aaOD = examData.aaOD ?? 8;
  const aaOS = examData.aaOS ?? 8;
  const flipper = examData.flipper ?? 12;
  const npc = examData.npc ?? 6;
  const ciss = examData.ciss ?? 0;
  const stereo = examData.stereo ?? 40;
  const workDist = examData.workDist ?? 40;
  const harmonDist = examData.harmonDist ?? 40;
  const age = record.age;
  
  // Additional refraction data
  const odSph = examData.odSph ?? 0;
  const odCyl = examData.odCyl ?? 0;
  const odAxis = examData.odAxis ?? 180;
  const osSph = examData.osSph ?? 0;
  const osCyl = examData.osCyl ?? 0;
  const osAxis = examData.osAxis ?? 180;
  const add = examData.add ?? 0;
  const vergenceFacility = examData.vergenceFacility ?? 15;
  const vergenceFacilityAborted = examData.vergenceFacilityAborted ?? false;
  const vert = examData.vert ?? 0;
  const gradPhoria = examData.gradPhoria ?? null;
  const biR = examData.biR ?? 8;
  const boR = examData.boR ?? 15;
  
  // Calculate the result
  const result = calculateLogic({
    age,
    pd,
    workDist,
    harmonDist,
    cissScore: ciss,
    stereo,
    odSph,
    odCyl,
    odAxis,
    osSph,
    osCyl,
    osAxis,
    add,
    aaOD,
    aaOS,
    nra,
    pra,
    mem,
    flipper,
    npc,
    vergenceFacilityCpm: vergenceFacility,
    vergenceFacilityAborted,
    distPhoria: dist,
    nearPhoria: near,
    vertPhoria: vert,
    nearPhoriaGradient: gradPhoria,
    biBreak: biB,
    biRec: biR,
    boBreak: boB,
    boRec: boR,
  });

  const handleDownloadPDF = async () => {
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

    pdf.save(`${t('視覺分析報告', '视觉分析报告')}_${record.patient_code}_${record.exam_date}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">
              {t('檢查報告', '检查报告')} - {record.patient_code}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList className="h-8">
                  <TabsTrigger value="basic" className="text-xs px-2 h-6">
                    {t('簡易', '简易')}
                  </TabsTrigger>
                  <TabsTrigger value="pro" className="text-xs px-2 h-6">
                    {t('專業', '专业')}
                  </TabsTrigger>
                  <TabsTrigger value="expert" className="text-xs px-2 h-6">
                    {t('專家', '专家')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('檢查日期', '检查日期')}：{record.exam_date} | 
            {t('年齡', '年龄')}：{record.age} | 
            {t('健康分數', '健康分数')}：{record.health_score ?? '-'}
            {record.diagnostic_classification && (
              <span className="ml-2">
                | {t('診斷', '诊断')}：
                <span className="font-medium text-primary">{record.diagnostic_classification}</span>
              </span>
            )}
          </p>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto" ref={reportRef}>
          <ReportView
            result={result}
            distPhoria={dist}
            nearPhoria={near}
            biBreak={biB}
            boBreak={boB}
            distBiBreak={distBiB}
            distBoBreak={distBoB}
            pd={pd}
            nra={nra}
            pra={pra}
            mem={mem}
            age={age}
            aaOD={aaOD}
            aaOS={aaOS}
            flipper={flipper}
            npc={npc}
            cissScore={ciss}
            viewMode={viewMode}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};