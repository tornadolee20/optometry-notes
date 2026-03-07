import { Eye, Clock, Sun } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ReportCard } from './ReportCard';

export const EyeCareReminders = () => {
  const { t, language } = useLanguage();

  // Show only top 2 reminders to keep it concise
  const reminders = [
    { icon: Clock, text: t('reminder202020') },
    { icon: Sun, text: t('reminderOutdoor') },
  ];

  const title = language === 'en' ? 'Eye Care Tips' : language === 'zh-CN' ? '护眼小提醒' : '護眼小提醒';

  return (
    <ReportCard
      icon={Eye}
      title={title}
      collapsible
      defaultOpen={false}
    >
      <ul className="space-y-2">
        {reminders.map((reminder, idx) => {
          const Icon = reminder.icon;
          return (
            <li key={idx} className="list-item">
              <div className="icon-box-primary">
                <Icon size={16} />
              </div>
              <p className="text-sm text-foreground leading-relaxed flex-1">
                {reminder.text}
              </p>
            </li>
          );
        })}
      </ul>
    </ReportCard>
  );
};
