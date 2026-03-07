import { useLanguage } from '@/contexts/LanguageContext';
import { SuggestionItem } from '@/lib/getBasicSuggestions';

interface BasicSuggestionsProps {
  suggestions: SuggestionItem[];
}

export const BasicSuggestions = ({ suggestions }: BasicSuggestionsProps) => {
  const { t } = useLanguage();

  return (
    <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 print-avoid-break">
      <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
        <span className="text-xl">👋</span>
        {t('basicSuggestionsTitle')}
      </h3>
      <ul className="space-y-3">
        {suggestions.map((suggestion, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm text-foreground leading-relaxed">
            <span className="bg-accent/20 text-accent-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              {idx + 1}
            </span>
            <span>
              <span className="font-bold text-primary mr-1">{t(suggestion.keywordKey)}：</span>
              {t(suggestion.textKey)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
