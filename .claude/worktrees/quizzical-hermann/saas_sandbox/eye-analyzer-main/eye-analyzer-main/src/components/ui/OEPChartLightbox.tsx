/**
 * OEP Chart Lightbox - 全螢幕圖表檢視器
 * 點擊圖表可放大至全螢幕模式，支援列印和下載
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, Printer, ZoomIn, ZoomOut } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface OEPChartLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  onDownloadPNG?: () => void;
  onDownloadPDF?: () => void;
}

export const OEPChartLightbox: React.FC<OEPChartLightboxProps> = ({
  isOpen,
  onClose,
  children,
  onDownloadPNG,
  onDownloadPDF,
}) => {
  const { language } = useLanguage();
  const t = (tw: string, cn: string, en: string) =>
    language === 'en' ? en : language === 'zh-CN' ? cn : tw;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="absolute top-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm border-b p-4 flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold">
            {t('OEP 雙眼視覺機能圖 - 全螢幕檢視', 'OEP 双眼视觉机能图 - 全屏查看', 'OEP Binocular Vision Graph - Fullscreen View')}
          </DialogTitle>
          <div className="flex items-center gap-2">
            {onDownloadPNG && (
              <Button size="sm" variant="outline" onClick={onDownloadPNG}>
                <Download className="h-4 w-4 mr-1" />
                PNG
              </Button>
            )}
            {onDownloadPDF && (
              <Button size="sm" variant="outline" onClick={onDownloadPDF}>
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" />
              {t('列印', '打印', 'Print')}
            </Button>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        <div className="pt-16 pb-4 px-4 h-full overflow-auto flex items-center justify-center">
          <div className="w-full max-w-6xl scale-110 origin-center">
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OEPChartLightbox;
