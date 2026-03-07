import { cn } from '@/lib/utils';
import { LucideIcon, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ReportCardProps {
  children: React.ReactNode;
  className?: string;
  icon?: LucideIcon;
  title?: string;
  variant?: 'default' | 'highlight' | 'warning' | 'success' | 'destructive';
  collapsible?: boolean;
  defaultOpen?: boolean;
  noPadding?: boolean;
}

export const ReportCard = ({ 
  children, 
  className,
  icon: Icon,
  title,
  variant = 'default',
  collapsible = false,
  defaultOpen = true,
  noPadding = false
}: ReportCardProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const variantStyles = {
    default: 'bg-card',
    highlight: 'bg-primary/5 border-primary/15',
    warning: 'bg-warning/5 border-warning/15',
    success: 'bg-success/5 border-success/15',
    destructive: 'bg-destructive/5 border-destructive/15',
  };

  const iconStyles = {
    default: 'icon-box-primary',
    highlight: 'icon-box-primary',
    warning: 'icon-box-warning',
    success: 'icon-box-success',
    destructive: 'icon-box-destructive',
  };

  const content = (
    <div className={cn(!noPadding && "p-4", className)}>
      {children}
    </div>
  );

  if (collapsible && title) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className={cn(
          "app-card overflow-hidden",
          variantStyles[variant]
        )}>
          <CollapsibleTrigger className="w-full">
            <div className={cn(
              "flex items-center justify-between p-4 touch-feedback",
              "active:bg-secondary/50"
            )}>
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className={cn("icon-box", iconStyles[variant])}>
                    <Icon size={18} />
                  </div>
                )}
                <h3 className="font-semibold text-base text-foreground text-left">
                  {title}
                </h3>
              </div>
              <ChevronDown 
                size={20} 
                className={cn(
                  "text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="animate-collapsible-down data-[state=closed]:animate-collapsible-up">
            <div className={cn("px-4 pb-4", noPadding && "px-0 pb-0")}>
              {children}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }

  return (
    <div className={cn(
      "app-card",
      variantStyles[variant]
    )}>
      {title && (
        <div className={cn("flex items-center gap-3 mb-4", noPadding ? "px-4 pt-4" : "")}>
          {Icon && (
            <div className={cn("icon-box", iconStyles[variant])}>
              <Icon size={18} />
            </div>
          )}
          <h3 className="font-semibold text-base text-foreground">
            {title}
          </h3>
        </div>
      )}
      {content}
    </div>
  );
};