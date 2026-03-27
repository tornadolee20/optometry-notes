import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, History } from 'lucide-react';
import { PatientHistoryTimeline } from './PatientHistoryTimeline';
import { fetchPatientHistory, ExamRecord } from '@/lib/examRecordService';
import { convertToHistoryRecords } from '@/lib/trendAnalysis';

interface PatientHistoryDialogProps {
  patientCode: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PatientHistoryDialog({ 
  patientCode, 
  open, 
  onOpenChange 
}: PatientHistoryDialogProps) {
  const { language } = useLanguage();
  const t = (zhTW: string, zhCN: string) => language === 'zh-TW' ? zhTW : zhCN;
  
  const [records, setRecords] = useState<ExamRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && patientCode) {
      loadPatientHistory();
    }
  }, [open, patientCode]);

  const loadPatientHistory = async () => {
    if (!patientCode) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchPatientHistory(patientCode);
      setRecords(data);
    } catch (err: any) {
      console.error('Error loading patient history:', err);
      setError(err.message || t('載入失敗', '加载失败'));
    } finally {
      setIsLoading(false);
    }
  };

  const historyRecords = convertToHistoryRecords(records);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {t('患者歷史追蹤', '患者历史追踪')} - {patientCode}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              {error}
            </div>
          ) : (
            <PatientHistoryTimeline 
              patientCode={patientCode || ''} 
              historyRecords={historyRecords}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
