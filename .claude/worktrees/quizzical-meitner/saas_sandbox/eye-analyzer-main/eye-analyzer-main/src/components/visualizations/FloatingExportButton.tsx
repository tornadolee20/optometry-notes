import React from 'react';
import { Download, FileImage, FileText, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';

interface FloatingExportButtonProps {
  onExportPNG: () => void;
  onExportPDF: () => void;
  onPrint?: () => void;
}

export const FloatingExportButton: React.FC<FloatingExportButtonProps> = ({
  onExportPNG,
  onExportPDF,
  onPrint,
}) => {
  const { language } = useLanguage();
  const isEN = language === 'en';
  const isCN = language === 'zh-CN';

  const t = (tw: string, cn: string, en: string) =>
    isEN ? en : isCN ? cn : tw;

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-50"
      role="region"
      aria-label={t('匯出選項', '导出选项', 'Export Options')}
    >
      <TooltipProvider>
        <Tooltip>
          <DropdownMenu>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  size="lg"
                  className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  aria-label={t('開啟匯出選單', '打开导出菜单', 'Open export menu')}
                >
                  <Download className="h-6 w-6" aria-hidden="true" />
                  <span className="sr-only">{t('匯出選項', '导出选项', 'Export Options')}</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onExportPNG} className="cursor-pointer">
                <FileImage className="h-4 w-4 mr-2" aria-hidden="true" />
                {t('匯出 PNG', '导出 PNG', 'Export PNG')}
                <span className="ml-auto text-xs text-muted-foreground">Ctrl+E</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportPDF} className="cursor-pointer">
                <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
                {t('匯出 PDF', '导出 PDF', 'Export PDF')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrint} className="cursor-pointer">
                <Printer className="h-4 w-4 mr-2" aria-hidden="true" />
                {t('列印', '打印', 'Print')}
                <span className="ml-auto text-xs text-muted-foreground">Ctrl+P</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <TooltipContent side="left">
            <p>{t('匯出圖表', '导出图表', 'Export Chart')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default FloatingExportButton;
