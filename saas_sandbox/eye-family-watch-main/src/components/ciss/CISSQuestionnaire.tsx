import { useState } from 'react';
import { cissQuestions } from '@/data/mockData';
import { ArrowLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CISSQuestionnaireProps {
  profileId: string;
  onBack: () => void;
  onComplete: (totalScore: number) => void;
}

const scaleOptions = [
  { value: 0, label: '從不' },
  { value: 1, label: '很少' },
  { value: 2, label: '有時' },
  { value: 3, label: '時常' },
  { value: 4, label: '總是' },
];

const CISSQuestionnaire = ({ onBack, onComplete }: CISSQuestionnaireProps) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(15).fill(-1));
  const [showResult, setShowResult] = useState(false);

  const totalScore = answers.reduce((sum, a) => sum + (a >= 0 ? a : 0), 0);
  const riskLevel = totalScore <= 15 ? 'low' : totalScore <= 21 ? 'moderate' : 'high';

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = value;
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQ < 14) {
        setCurrentQ(currentQ + 1);
      } else {
        setShowResult(true);
      }
    }, 300);
  };

  const riskDisplay = {
    low: { color: 'text-success', bg: 'bg-success/15', icon: '🟢', label: '低風險', desc: '症狀輕微，維持定期追蹤即可' },
    moderate: { color: 'text-warning', bg: 'bg-warning/15', icon: '🟡', label: '中度風險', desc: '建議預約視光師進行雙眼視覺功能評估' },
    high: { color: 'text-destructive', bg: 'bg-destructive/15', icon: '🔴', label: '高風險', desc: '強烈建議進行完整雙眼視覺與調節功能評估' },
  };

  const risk = riskDisplay[riskLevel];

  if (showResult) {
    return (
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-0 z-50 bg-background overflow-y-auto"
      >
        <div className="safe-top px-5 py-4">
          <button onClick={onBack} className="touch-target flex items-center gap-1 text-primary mb-6">
            <ArrowLeft size={20} /> 返回
          </button>
        </div>
        <div className="px-5 flex flex-col items-center text-center pt-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Check size={48} className="text-primary" />
            </div>
          </motion.div>
          <h2 className="text-heading font-bold text-foreground mb-2">問卷完成</h2>
          <div className="text-[48px] font-bold text-foreground mb-2">{totalScore}</div>
          <div className={`inline-flex items-center gap-1 px-4 py-2 rounded-full ${risk.bg} ${risk.color} font-semibold text-body mb-4`}>
            {risk.icon} {risk.label}
          </div>
          <p className="text-body text-muted-foreground mb-8 max-w-[300px]">{risk.desc}</p>
          <p className="text-[12px] text-muted-foreground max-w-[320px] leading-relaxed">
            本問卷依 CISS V-15 (PMID: 15545807) 改編，僅供參考，非正式診斷工具
          </p>
          <button
            onClick={() => onComplete(totalScore)}
            className="mt-8 w-full max-w-[300px] py-4 rounded-md bg-primary text-primary-foreground font-semibold text-body touch-target active:scale-[0.98] transition-transform"
          >
            儲存結果
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="safe-top px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="touch-target flex items-center gap-1 text-primary">
            <ArrowLeft size={20} /> 返回
          </button>
          <span className="text-label text-muted-foreground">{currentQ + 1} / 15</span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${((currentQ + 1) / 15) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Title */}
      <div className="px-5 pt-2 pb-2">
        <h2 className="text-subtitle font-bold text-foreground">雙眼視覺症狀問卷</h2>
        <p className="text-label text-muted-foreground mt-1">請根據近期閱讀或近距離工作的狀況作答</p>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center px-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-title font-semibold text-foreground mb-8 leading-relaxed">
              Q{currentQ + 1}. {cissQuestions[currentQ]}
            </p>
            <div className="space-y-3">
              {scaleOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(opt.value)}
                  className={`w-full py-4 px-5 rounded-md text-left font-medium text-body transition-all touch-target active:scale-[0.98] ${
                    answers[currentQ] === opt.value
                      ? 'bg-primary text-primary-foreground shadow-card'
                      : 'bg-card text-card-foreground shadow-card'
                  }`}
                >
                  <span className="text-muted-foreground mr-3">{opt.value}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className="px-5 pb-8 safe-bottom">
        {currentQ > 0 && (
          <button
            onClick={() => setCurrentQ(currentQ - 1)}
            className="w-full py-3 text-primary font-medium text-body touch-target"
          >
            上一題
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default CISSQuestionnaire;
