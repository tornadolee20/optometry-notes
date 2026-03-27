import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { X, Bell, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

const priorityStyles = {
  low: 'bg-muted border-muted-foreground/20',
  normal: 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300',
  high: 'bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-300',
  urgent: 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300',
};

const priorityIcons = {
  low: Info,
  normal: Bell,
  high: AlertCircle,
  urgent: AlertTriangle,
};

export const AnnouncementBanner = () => {
  const { language } = useLanguage();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load dismissed announcements from localStorage
    const dismissed = localStorage.getItem('dismissed_announcements');
    if (dismissed) {
      setDismissedIds(new Set(JSON.parse(dismissed)));
    }

    // Fetch active announcements
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('id, title, content, priority')
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('priority', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(3);

      if (data) {
        setAnnouncements(data as Announcement[]);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleDismiss = (id: string) => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(id);
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissed_announcements', JSON.stringify([...newDismissed]));
  };

  const visibleAnnouncements = announcements.filter(a => !dismissedIds.has(a.id));

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="space-y-2 print:hidden">
      {visibleAnnouncements.map((announcement) => {
        const Icon = priorityIcons[announcement.priority];
        return (
          <div
            key={announcement.id}
            className={cn(
              'relative px-4 py-3 rounded-lg border flex items-start gap-3',
              priorityStyles[announcement.priority]
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{announcement.title}</p>
              <p className="text-xs opacity-80 mt-0.5 line-clamp-2">{announcement.content}</p>
            </div>
            <button
              onClick={() => handleDismiss(announcement.id)}
              className="p-1 hover:bg-black/10 rounded transition-colors flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};