import { CalculationResult } from '@/lib/calculateLogic';
import { useLanguage } from '@/contexts/LanguageContext';
import { Heart } from 'lucide-react';
import { empathyTranslations, tr } from '@/lib/translations/reportTranslations';

interface EmpathyOpenerProps {
  result: CalculationResult;
  cissScore?: number;
  npc?: number;
}

export const EmpathyOpener = ({ result, cissScore = 0, npc = 6 }: EmpathyOpenerProps) => {
  const { language } = useLanguage();
  
  const getEmpathyMessage = () => {
    const score = result.healthScore;
    
    // Based on CISS score
    if (cissScore > 21) {
      return tr(empathyTranslations.cissHigh, language);
    }
    
    // Based on diagnosis
    const diagKey = result.diag.nameKey;
    if (diagKey === 'diagCI' || diagKey === 'diagPseudoCI') {
      return tr(empathyTranslations.diagCI, language);
    } else if (diagKey === 'diagCE') {
      return tr(empathyTranslations.diagCE, language);
    } else if (diagKey === 'diagAI') {
      return tr(empathyTranslations.diagAI, language);
    }
    
    // Based on NPC
    if (npc > 10) {
      return tr(empathyTranslations.npcHigh, language);
    }
    
    // Default based on score
    if (score >= 80) {
      return tr(empathyTranslations.scoreHigh, language);
    } else if (score >= 60) {
      return tr(empathyTranslations.scoreMedium, language);
    } else {
      return tr(empathyTranslations.scoreLow, language);
    }
  };

  return (
    <div className="empathy-card">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Heart size={16} className="text-primary" />
        </div>
        <p className="text-base text-foreground leading-relaxed font-medium">
          {getEmpathyMessage()}
        </p>
      </div>
    </div>
  );
};
