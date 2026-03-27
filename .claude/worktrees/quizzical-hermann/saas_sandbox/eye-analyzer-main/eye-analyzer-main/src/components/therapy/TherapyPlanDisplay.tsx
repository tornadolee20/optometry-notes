import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Target, 
  Dumbbell, 
  CheckCircle2, 
  Play, 
  Clock, 
  TrendingUp,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { VisionTherapyProtocol, getPatternDisplayName } from '@/lib/visionTherapy/therapyProtocol';
import { useLanguage } from '@/contexts/LanguageContext';

interface TherapyPlanDisplayProps {
  protocol: VisionTherapyProtocol;
}

export function TherapyPlanDisplay({ protocol }: TherapyPlanDisplayProps) {
  const { language } = useLanguage();
  const isEN = language === 'en';
  const isCN = language === 'zh-CN';

  const getDifficultyBadge = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">{isEN ? 'Easy' : isCN ? '简单' : '簡單'}</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">{isEN ? 'Medium' : isCN ? '中等' : '中等'}</Badge>;
      case 'hard':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">{isEN ? 'Hard' : isCN ? '困难' : '困難'}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 訓練計畫總覽 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            {isEN ? 'Vision Training Plan' : isCN ? '视觉训练计划' : '視覺訓練計畫'}
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            {getPatternDisplayName(protocol.pattern)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{isEN ? `Total Duration: ${protocol.totalWeeks} weeks` : isCN ? `总疗程：${protocol.totalWeeks} 周` : `總療程：${protocol.totalWeeks} 週`}</span>
        </div>
      </div>

      {/* 各階段訓練內容 */}
      <Accordion type="single" collapsible className="w-full" defaultValue="phase-0">
        {protocol.phases.map((phase, phaseIndex) => (
          <AccordionItem key={phaseIndex} value={`phase-${phaseIndex}`}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {phaseIndex + 1}
                </div>
                <div>
                  <div className="font-semibold">{phase.phaseName}</div>
                  <div className="text-sm text-muted-foreground">{phase.weeks}</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              {/* 階段目標 */}
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-600" />
                    {isEN ? 'Training Goals' : isCN ? '训练目标' : '訓練目標'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {phase.goals.map((goal, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* 訓練項目 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-primary" />
                    {isEN ? 'Exercises' : isCN ? '训练项目' : '訓練項目'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {phase.exercises.map((exercise, i) => (
                    <div 
                      key={i} 
                      className="p-4 bg-muted/50 rounded-lg border space-y-3"
                    >
                      {/* 訓練名稱與難度 */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h4 className="font-semibold">{exercise.name}</h4>
                          {exercise.nameEn && (
                            <span className="text-sm text-muted-foreground">
                              ({exercise.nameEn})
                            </span>
                          )}
                        </div>
                        {getDifficultyBadge(exercise.difficulty)}
                      </div>

                      {/* 訓練說明 */}
                      <p className="text-sm text-muted-foreground">
                        {exercise.description}
                      </p>

                      {/* 訓練參數 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="text-muted-foreground">{isEN ? 'Frequency:' : isCN ? '频率：' : '頻率：'}</span>
                          <span className="font-medium">{exercise.frequency}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-500" />
                          <span className="text-muted-foreground">{isEN ? 'Duration:' : isCN ? '时长：' : '時長：'}</span>
                          <span className="font-medium">{exercise.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-green-500" />
                          <span className="text-muted-foreground">{isEN ? 'Target:' : isCN ? '目标：' : '目標：'}</span>
                          <span className="font-medium">{exercise.target}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-orange-500" />
                          <span className="text-muted-foreground">{isEN ? 'Progression:' : isCN ? '进度：' : '進度：'}</span>
                          <span className="font-medium">{exercise.progression}</span>
                        </div>
                      </div>

                      {/* 示範影片按鈕 */}
                      {exercise.videoUrl && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="mt-2"
                          onClick={() => window.open(exercise.videoUrl, '_blank')}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {isEN ? 'Watch Demo Video' : isCN ? '观看示范视频' : '觀看示範影片'}
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 預期成果 */}
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    {isEN ? `Expected Outcomes (Week ${phase.reEvaluationWeek})` : isCN ? `预期成果（Week ${phase.reEvaluationWeek}）` : `預期成果（Week ${phase.reEvaluationWeek}）`}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {phase.expectedOutcomes.map((outcome, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* 居家訓練注意事項 */}
      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription>
          <h4 className="font-semibold mb-2 text-amber-800 dark:text-amber-400">
            {isEN ? 'Home Training Notes' : isCN ? '居家训练注意事项' : '居家訓練注意事項'}
          </h4>
          <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
            {protocol.homeTherapyNotes.map((note, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-500">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
