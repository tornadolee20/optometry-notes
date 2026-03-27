import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, CheckCircle2, Circle, Loader2, Target } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface Milestone {
  week: number;
  goal: string;
  goalCN?: string;
  status: 'completed' | 'in-progress' | 'pending';
  description?: string;
  descriptionCN?: string;
}

interface ProgressTimelineProps {
  currentWeek: number;
  totalWeeks: number;
  milestones: Milestone[];
}

const defaultMilestones: Milestone[] = [
  {
    week: 0,
    goal: 'Start',
    goalCN: '開始',
    status: 'completed',
    description: 'Initial assessment complete',
    descriptionCN: '完成初始評估'
  },
  {
    week: 4,
    goal: 'NPC < 8cm',
    goalCN: 'NPC < 8cm',
    status: 'pending',
    description: 'Near point of convergence improvement',
    descriptionCN: '近點聚合改善'
  },
  {
    week: 8,
    goal: 'CISS < 21',
    goalCN: 'CISS < 21',
    status: 'pending',
    description: 'Symptom reduction target',
    descriptionCN: '症狀減輕目標'
  },
  {
    week: 12,
    goal: 'Complete',
    goalCN: '完成療程',
    status: 'pending',
    description: 'Full treatment completion',
    descriptionCN: '完整療程完成'
  }
];

const ProgressTimeline: React.FC<ProgressTimelineProps> = ({
  currentWeek,
  totalWeeks,
  milestones = defaultMilestones
}) => {
  const { language } = useLanguage();
  const isCN = language === 'zh-CN';
  const progressPercent = Math.min((currentWeek / totalWeeks) * 100, 100);

  const getMilestoneStatus = (milestone: Milestone): Milestone['status'] => {
    if (milestone.week < currentWeek) return 'completed';
    if (milestone.week === currentWeek) return 'in-progress';
    return milestone.status;
  };

  const renderMilestoneIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return (
          <CheckCircle2 className="h-5 w-5 text-white" />
        );
      case 'in-progress':
        return (
          <Loader2 className="h-5 w-5 text-white animate-spin" />
        );
      default:
        return (
          <Circle className="h-5 w-5 text-white" />
        );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          {isCN ? '治療時程規劃' : '治療時程規劃'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              {isCN ? '整體進度' : '整體進度'}
            </span>
            <span className="font-medium">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="relative pt-2 pb-16">
          {/* Timeline Track */}
          <div className="absolute top-7 left-0 right-0 h-1 bg-muted rounded-full">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Milestones */}
          <div className="relative flex justify-between">
            {milestones.map((milestone) => {
              const status = getMilestoneStatus(milestone);
              
              return (
                <TooltipProvider key={milestone.week}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center cursor-pointer">
                        {/* Milestone Node */}
                        <div 
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 z-10",
                            status === 'completed' && "bg-green-600 ring-4 ring-green-200 dark:ring-green-900",
                            status === 'in-progress' && "bg-primary ring-4 ring-primary/30 animate-pulse",
                            status === 'pending' && "bg-muted-foreground/50"
                          )}
                        >
                          {renderMilestoneIcon(status)}
                        </div>
                        
                        {/* Week Label */}
                        <div className="text-xs text-muted-foreground mt-2 font-medium">
                          {milestone.week === 0 
                            ? (isCN ? '開始' : '開始')
                            : `W${milestone.week}`
                          }
                        </div>
                        
                        {/* Goal Label */}
                        <div className="text-xs mt-1 text-center max-w-[70px] line-clamp-2 font-medium">
                          {isCN ? (milestone.goalCN || milestone.goal) : milestone.goal}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[200px]">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {isCN ? (milestone.goalCN || milestone.goal) : milestone.goal}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isCN ? (milestone.descriptionCN || milestone.description) : milestone.description}
                        </p>
                        <p className="text-xs">
                          {isCN ? '狀態' : '狀態'}: 
                          <span className={cn(
                            "ml-1 font-medium",
                            status === 'completed' && "text-green-600",
                            status === 'in-progress' && "text-primary",
                            status === 'pending' && "text-muted-foreground"
                          )}>
                            {status === 'completed' 
                              ? (isCN ? '已完成' : '已完成')
                              : status === 'in-progress'
                              ? (isCN ? '進行中' : '進行中')
                              : (isCN ? '待完成' : '待完成')
                            }
                          </span>
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>

        {/* Current Status Alert */}
        <Alert className="mt-4">
          <Clock className="h-4 w-4" />
          <AlertTitle>
            {isCN ? '目前進度' : '目前進度'}
          </AlertTitle>
          <AlertDescription>
            {currentWeek === 0 
              ? (isCN ? '尚未開始訓練療程' : '尚未開始訓練療程')
              : (isCN 
                  ? `第 ${currentWeek} 週，已完成 ${Math.round(progressPercent)}% 療程`
                  : `第 ${currentWeek} 週，已完成 ${Math.round(progressPercent)}% 療程`
                )
            }
          </AlertDescription>
        </Alert>

        {/* Upcoming Milestone */}
        {currentWeek < totalWeeks && (
          <div className="mt-4 p-3 rounded-lg border bg-primary/5">
            <div className="text-sm font-medium text-primary mb-1">
              {isCN ? '下一個里程碑' : '下一個里程碑'}
            </div>
            {(() => {
              const nextMilestone = milestones.find(m => m.week > currentWeek);
              if (!nextMilestone) return null;
              return (
                <div className="text-sm text-muted-foreground">
                  Week {nextMilestone.week}: {isCN ? (nextMilestone.goalCN || nextMilestone.goal) : nextMilestone.goal}
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressTimeline;
