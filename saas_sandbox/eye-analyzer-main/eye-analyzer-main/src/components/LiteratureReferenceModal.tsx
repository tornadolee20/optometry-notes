import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { literatureReferences } from '@/lib/clinicalDefaults';

interface LiteratureReferenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LiteratureReferenceModal = ({ open, onOpenChange }: LiteratureReferenceModalProps) => {
  const { language } = useLanguage();
  const tLocal = (zhTW: string, zhCN: string) => language === 'zh-TW' ? zhTW : zhCN;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            {tLocal('文獻依據', '文献依据')}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground border-l-4 border-primary/50 pl-3 py-1">
              {tLocal(
                '本系統所有預設值與正常範圍均基於以下國際臨床研究',
                '本系统所有预设值与正常范围均基于以下国际临床研究'
              )}
            </p>

            {literatureReferences.map((category, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="font-bold text-base text-primary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {language === 'zh-TW' ? category.categoryZhTW : category.categoryZhCN}
                </h3>
                
                <div className="space-y-2 pl-3">
                  {category.references.map((ref, refIdx) => (
                    <div 
                      key={refIdx} 
                      className="bg-secondary/50 rounded-lg p-3 border border-border/50"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-medium text-sm">
                          {language === 'zh-TW' ? ref.parameterZhTW : ref.parameterZhCN}
                        </span>
                        <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded">
                          {ref.normalRange}
                        </span>
                      </div>
                      <div className="mt-1.5 text-xs text-muted-foreground space-y-0.5">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{tLocal('來源', '来源')}:</span>
                          <span>{ref.source}</span>
                          {ref.year && <span>({ref.year})</span>}
                        </div>
                        {ref.sampleSize && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{tLocal('樣本數', '样本数')}:</span>
                            <span>{ref.sampleSize}</span>
                          </div>
                        )}
                        {(ref.notesZhTW || ref.notes) && (
                          <div className="text-muted-foreground/80 italic">
                            {language === 'zh-TW' ? (ref.notesZhTW || ref.notes) : (ref.notesZhCN || ref.notes)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                {tLocal(
                  '參考文獻可能隨臨床研究更新而調整，建議定期查閱最新文獻。',
                  '参考文献可能随临床研究更新而调整，建议定期查阅最新文献。'
                )}
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
