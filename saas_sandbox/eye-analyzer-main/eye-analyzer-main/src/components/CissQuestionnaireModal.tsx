import { useState } from 'react';
import { ClipboardList, X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface CissQuestionnaireModalProps {
  onClose: () => void;
  onSave: (score: number) => void;
  age: number;
}

const questionsTW = [
  "1. 看書或近距離工作時，眼睛覺得累？",
  "2. 看書或近距離工作時，眼睛覺得不舒服？",
  "3. 看書或近距離工作時，覺得頭痛？",
  "4. 看書或近距離工作時，覺得想睡覺？",
  "5. 看書或近距離工作時，難以集中精神？",
  "6. 看書或近距離工作時，覺得字體模糊？",
  "7. 看書或近距離工作時，看到字體變兩個(複視)？",
  "8. 看書或近距離工作時，眼睛覺得痠痛？",
  "9. 看書或近距離工作時，覺得眼球有拉扯感？",
  "10. 看書或近距離工作時，眼睛覺得灼熱或流淚？",
  "11. 看書或近距離工作時，字體會在紙上移動？",
  "12. 看書或近距離工作時，看東西變慢？",
  "13. 看完近物後看遠方，需要一點時間才能看清？",
  "14. 閱讀時會跳行或漏字？",
  "15. 閱讀時需要用手指輔助閱讀？"
];

const questionsCN = [
  "1. 看书或近距离工作时，眼睛觉得累？",
  "2. 看书或近距离工作时，眼睛觉得不舒服？",
  "3. 看书或近距离工作时，觉得头痛？",
  "4. 看书或近距离工作时，觉得想睡觉？",
  "5. 看书或近距离工作时，难以集中精神？",
  "6. 看书或近距离工作时，觉得字体模糊？",
  "7. 看书或近距离工作时，看到字体变两个(复视)？",
  "8. 看书或近距离工作时，眼睛觉得酸痛？",
  "9. 看书或近距离工作时，觉得眼球有拉扯感？",
  "10. 看书或近距离工作时，眼睛觉得灼热或流泪？",
  "11. 看书或近距离工作时，字体会在纸上移动？",
  "12. 看书或近距离工作时，看东西变慢？",
  "13. 看完近物后看远方，需要一点时间才能看清？",
  "14. 阅读时会跳行或漏字？",
  "15. 阅读时需要用手指辅助阅读？"
];

const questionsEN = [
  "1. Do your eyes feel tired when reading or doing close work?",
  "2. Do your eyes feel uncomfortable when reading or doing close work?",
  "3. Do you get headaches when reading or doing close work?",
  "4. Do you feel sleepy when reading or doing close work?",
  "5. Do you have trouble concentrating when reading or doing close work?",
  "6. Does your vision become blurry when reading or doing close work?",
  "7. Do you see double when reading or doing close work?",
  "8. Do your eyes feel sore when reading or doing close work?",
  "9. Do your eyes feel like they're being pulled when reading or doing close work?",
  "10. Do your eyes burn or water when reading or doing close work?",
  "11. Do the words move on the page when reading?",
  "12. Do you read more slowly?",
  "13. After looking at something close, does it take time to see clearly far away?",
  "14. Do you skip lines or lose your place when reading?",
  "15. Do you need to use your finger to keep your place when reading?"
];

export const CissQuestionnaireModal = ({ onClose, onSave, age }: CissQuestionnaireModalProps) => {
  const { language } = useLanguage();
  const [scores, setScores] = useState<number[]>(Array(15).fill(0));
  const totalScore = scores.reduce((a, b) => a + b, 0);
  const threshold = age < 18 ? 16 : 21;
  const isSymptomatic = totalScore >= threshold;

  const questions = language === 'en' ? questionsEN : language === 'zh-CN' ? questionsCN : questionsTW;
  const labelText = (tw: string, cn: string, en?: string) => {
    if (language === 'en' && en) return en;
    return language === 'zh-CN' ? cn : tw;
  };

  const handleScoreChange = (index: number, value: number) => {
    const newScores = [...scores];
    newScores[index] = value;
    setScores(newScores);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in border border-border">
        {/* Header - Mobile optimized */}
        <div className="p-5 border-b border-border flex justify-between items-center bg-muted/50 rounded-t-2xl">
          <div>
            <h2 className="text-2xl md:text-xl font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="text-primary w-6 h-6 md:w-5 md:h-5" />
              {labelText('CISS 量表', 'CISS 量表', 'CISS Questionnaire')}
            </h2>
            <p className="text-sm md:text-xs text-muted-foreground mt-1">
              {labelText('請依據過去一個月的感受填寫', '请依据过去一个月的感受填写', 'Rate based on your experience in the past month')}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 md:p-2 rounded-lg hover:bg-muted transition-colors min-h-[48px] min-w-[48px] md:min-h-0 md:min-w-0 flex items-center justify-center"
          >
            <X size={24} className="text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        {/* Questions - Mobile optimized */}
        <div className="flex-1 overflow-y-auto p-6 md:p-6 space-y-6">
          <div className="grid grid-cols-6 gap-2 text-center text-sm md:text-xs font-bold text-muted-foreground mb-2 sticky top-0 bg-card py-3 md:py-2 z-10 border-b border-border">
            <span className="col-span-1"></span>
            <span>{labelText('從不', '从不', 'Never')}</span>
            <span>{labelText('偶爾', '偶尔', 'Rarely')}</span>
            <span>{labelText('有時', '有时', 'Sometimes')}</span>
            <span>{labelText('經常', '经常', 'Often')}</span>
            <span>{labelText('總是', '总是', 'Always')}</span>
          </div>
          
          {questions.map((q, idx) => (
            <div key={idx} className="space-y-3 md:space-y-2 pb-5 md:pb-4 border-b border-border/50 last:border-0">
              <div className="text-base md:text-sm font-medium text-foreground leading-relaxed">{q}</div>
              <div className="grid grid-cols-6 gap-2">
                <div className="col-span-1"></div>
                {[0, 1, 2, 3, 4].map((val) => (
                  <label key={val} className="flex flex-col items-center gap-2 md:gap-1 cursor-pointer group">
                    <input
                      type="radio"
                      name={`q-${idx}`}
                      checked={scores[idx] === val}
                      onChange={() => handleScoreChange(idx, val)}
                      className="w-8 h-8 md:w-5 md:h-5 accent-primary cursor-pointer"
                    />
                    <span className={cn(
                      "text-sm md:text-[10px] font-bold transition-colors",
                      scores[idx] === val ? "text-primary" : "text-muted-foreground/50"
                    )}>
                      {val}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer - Mobile optimized */}
        <div className="p-5 border-t border-border bg-muted/50 rounded-b-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
          <div>
            <div className="text-sm md:text-xs font-bold text-muted-foreground uppercase">Score</div>
            <div className={cn(
              "text-4xl md:text-3xl font-bold",
              isSymptomatic ? "text-destructive" : "text-success"
            )}>
              {totalScore} <span className="text-base md:text-sm text-muted-foreground">/ 60</span>
            </div>
            <div className="text-sm md:text-xs text-muted-foreground mt-1">
              {labelText(
                `${age < 18 ? '兒童' : '成人'}閾值: ${threshold}`,
                `${age < 18 ? '儿童' : '成人'}阈值: ${threshold}`,
                `${age < 18 ? 'Child' : 'Adult'} Threshold: ${threshold}`
              )}
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={onClose}
              className="flex-1 md:flex-none px-5 py-3 md:px-4 md:py-2 text-muted-foreground font-bold text-base md:text-sm hover:bg-muted rounded-lg transition-colors min-h-[48px] md:min-h-0"
            >
              {labelText('取消', '取消', 'Cancel')}
            </button>
            <button
              onClick={() => onSave(totalScore)}
              className="flex-1 md:flex-none px-6 py-3 md:px-6 md:py-2 gradient-primary text-primary-foreground font-bold rounded-lg shadow-lg hover:opacity-90 flex items-center justify-center gap-2 transition-all min-h-[48px] md:min-h-0"
            >
              <Save size={20} className="md:w-[18px] md:h-[18px]" />
              {labelText('儲存', '保存', 'Save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
