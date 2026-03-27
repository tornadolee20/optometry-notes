import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Calendar, TrendingUp, TrendingDown, Minus, 
  ChevronDown, ChevronUp, Activity, Target, Clock, Bell
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  HistoryRecord,
  evaluateTrainingEffect,
  calculateImprovement,
  formatTrendDisplay,
  calculateFollowUpDate
} from '@/lib/trendAnalysis';

interface PatientHistoryTimelineProps {
  patientCode: string;
  historyRecords: HistoryRecord[];
  currentExamDate?: string;
}

export function PatientHistoryTimeline({ 
  patientCode, 
  historyRecords,
  currentExamDate 
}: PatientHistoryTimelineProps) {
  const { language } = useLanguage();
  const t = (zhTW: string, zhCN: string) => language === 'zh-TW' ? zhTW : zhCN;
  
  const [showAllRecords, setShowAllRecords] = useState(false);
  const [showTrendChart, setShowTrendChart] = useState(true);

  // 按日期排序（新到舊）
  const sortedRecords = useMemo(() => 
    [...historyRecords].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
    [historyRecords]
  );

  // 計算療效評估
  const trainingEffect = useMemo(() => 
    evaluateTrainingEffect(historyRecords),
    [historyRecords]
  );

  // 準備圖表數據（舊到新）
  const chartData = useMemo(() => {
    return [...historyRecords]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(record => ({
        date: new Date(record.date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
        fullDate: record.date,
        NPC: record.keyMetrics.npc,
        CISS: record.keyMetrics.ciss,
        '健康分數': record.healthScore,
        'BO Break': record.keyMetrics.boBreakNear
      }));
  }, [historyRecords]);

  // 顯示的記錄（限制數量除非展開）
  const displayRecords = showAllRecords ? sortedRecords : sortedRecords.slice(0, 3);

  // 獲取最新和最舊記錄
  const latestRecord = sortedRecords[0];
  const oldestRecord = sortedRecords[sortedRecords.length - 1];

  // 計算下次回診日期
  const nextFollowUp = latestRecord 
    ? calculateFollowUpDate(latestRecord.treatmentPlan, latestRecord.date)
    : null;

  // 判斷是否為今天
  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  // 計算距離天數
  const getDaysAgo = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return t('今天', '今天');
    if (days === 1) return t('昨天', '昨天');
    if (days < 30) return t(`${days} 天前`, `${days} 天前`);
    if (days < 365) {
      const months = Math.floor(days / 30);
      return t(`${months} 個月前`, `${months} 个月前`);
    }
    const years = Math.floor(days / 365);
    return t(`${years} 年前`, `${years} 年前`);
  };

  // 獲取效果標籤
  const getEffectivenessLabel = (eff: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      excellent: { label: t('優異', '优异'), variant: 'default' },
      good: { label: t('良好', '良好'), variant: 'secondary' },
      fair: { label: t('一般', '一般'), variant: 'outline' },
      poor: { label: t('待改善', '待改善'), variant: 'destructive' }
    };
    return map[eff] || { label: eff, variant: 'outline' as const };
  };

  if (historyRecords.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>{t('尚無歷史記錄', '暂无历史记录')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 療效評估卡片 */}
      {historyRecords.length >= 2 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {t('療效評估', '疗效评估')}
              <Badge variant={getEffectivenessLabel(trainingEffect.overallEffectiveness).variant}>
                {getEffectivenessLabel(trainingEffect.overallEffectiveness).label}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 改善摘要 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {trainingEffect.improvementSummary.npc && (
                <div className="text-center p-2 bg-background rounded-lg">
                  <div className="text-xs text-muted-foreground">NPC</div>
                  <div className={`font-bold ${formatTrendDisplay(trainingEffect.improvementSummary.npc.trend, trainingEffect.improvementSummary.npc.percentChange).colorClass}`}>
                    {oldestRecord?.keyMetrics.npc}→{latestRecord?.keyMetrics.npc} cm
                  </div>
                  <div className={`text-xs ${formatTrendDisplay(trainingEffect.improvementSummary.npc.trend, trainingEffect.improvementSummary.npc.percentChange).colorClass}`}>
                    {formatTrendDisplay(trainingEffect.improvementSummary.npc.trend, trainingEffect.improvementSummary.npc.percentChange).arrow}
                    {formatTrendDisplay(trainingEffect.improvementSummary.npc.trend, trainingEffect.improvementSummary.npc.percentChange).text}
                  </div>
                </div>
              )}
              {trainingEffect.improvementSummary.ciss && (
                <div className="text-center p-2 bg-background rounded-lg">
                  <div className="text-xs text-muted-foreground">CISS</div>
                  <div className={`font-bold ${formatTrendDisplay(trainingEffect.improvementSummary.ciss.trend, trainingEffect.improvementSummary.ciss.percentChange).colorClass}`}>
                    {oldestRecord?.keyMetrics.ciss}→{latestRecord?.keyMetrics.ciss}
                  </div>
                  <div className={`text-xs ${formatTrendDisplay(trainingEffect.improvementSummary.ciss.trend, trainingEffect.improvementSummary.ciss.percentChange).colorClass}`}>
                    {formatTrendDisplay(trainingEffect.improvementSummary.ciss.trend, trainingEffect.improvementSummary.ciss.percentChange).arrow}
                    {formatTrendDisplay(trainingEffect.improvementSummary.ciss.trend, trainingEffect.improvementSummary.ciss.percentChange).text}
                  </div>
                </div>
              )}
              {trainingEffect.improvementSummary.healthScore && (
                <div className="text-center p-2 bg-background rounded-lg">
                  <div className="text-xs text-muted-foreground">{t('健康分數', '健康分数')}</div>
                  <div className={`font-bold ${formatTrendDisplay(trainingEffect.improvementSummary.healthScore.trend, trainingEffect.improvementSummary.healthScore.percentChange).colorClass}`}>
                    {oldestRecord?.healthScore}→{latestRecord?.healthScore}
                  </div>
                  <div className={`text-xs ${formatTrendDisplay(trainingEffect.improvementSummary.healthScore.trend, trainingEffect.improvementSummary.healthScore.percentChange).colorClass}`}>
                    {formatTrendDisplay(trainingEffect.improvementSummary.healthScore.trend, trainingEffect.improvementSummary.healthScore.percentChange).arrow}
                    {formatTrendDisplay(trainingEffect.improvementSummary.healthScore.trend, trainingEffect.improvementSummary.healthScore.percentChange).text}
                  </div>
                </div>
              )}
              {trainingEffect.improvementSummary.boBreakNear && (
                <div className="text-center p-2 bg-background rounded-lg">
                  <div className="text-xs text-muted-foreground">BO Break</div>
                  <div className={`font-bold ${formatTrendDisplay(trainingEffect.improvementSummary.boBreakNear.trend, trainingEffect.improvementSummary.boBreakNear.percentChange).colorClass}`}>
                    {oldestRecord?.keyMetrics.boBreakNear}→{latestRecord?.keyMetrics.boBreakNear}Δ
                  </div>
                  <div className={`text-xs ${formatTrendDisplay(trainingEffect.improvementSummary.boBreakNear.trend, trainingEffect.improvementSummary.boBreakNear.percentChange).colorClass}`}>
                    {formatTrendDisplay(trainingEffect.improvementSummary.boBreakNear.trend, trainingEffect.improvementSummary.boBreakNear.percentChange).arrow}
                    {formatTrendDisplay(trainingEffect.improvementSummary.boBreakNear.trend, trainingEffect.improvementSummary.boBreakNear.percentChange).text}
                  </div>
                </div>
              )}
            </div>

            {/* 建議 */}
            {trainingEffect.recommendations.length > 0 && (
              <div className="text-sm">
                <div className="font-medium mb-1">{t('建議', '建议')}：</div>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {trainingEffect.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 趨勢圖表 */}
      {historyRecords.length >= 2 && (
        <Collapsible open={showTrendChart} onOpenChange={setShowTrendChart}>
          <Card>
            <CardHeader className="pb-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    {t('指標變化趨勢', '指标变化趋势')}
                  </CardTitle>
                  {showTrendChart ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="健康分數" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="NPC" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        dot={{ fill: '#ef4444' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="CISS" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        dot={{ fill: '#f59e0b' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="BO Break" 
                        stroke="#22c55e" 
                        strokeWidth={2}
                        dot={{ fill: '#22c55e' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* 回診提醒 */}
      {nextFollowUp && (
        <Card className="border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-900/10">
          <CardContent className="p-4 flex items-center gap-3">
            <Bell className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="font-medium text-yellow-800 dark:text-yellow-200">
                {t('下次建議回診', '下次建议回诊')}
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                {nextFollowUp.toLocaleDateString('zh-TW', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
                {latestRecord?.treatmentPlan && (
                  <span className="ml-2 text-xs opacity-75">
                    ({latestRecord.treatmentPlan.includes('A') ? t('訓練療程追蹤', '训练疗程追踪') :
                      latestRecord.treatmentPlan.includes('B') ? t('稜鏡效果評估', '棱镜效果评估') :
                      t('觀察追蹤', '观察追踪')})
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 時間軸 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t('檢查歷程', '检查历程')}
            <span className="text-sm font-normal text-muted-foreground">
              ({historyRecords.length} {t('筆記錄', '条记录')})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative pl-6 space-y-4">
            {/* 時間軸線 */}
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border" />
            
            {displayRecords.map((record, index) => (
              <div key={record.date} className="relative">
                {/* 時間軸節點 */}
                <div className={`absolute -left-4 w-4 h-4 rounded-full border-2 
                  ${index === 0 ? 'bg-primary border-primary' : 'bg-background border-muted-foreground'}`} 
                />
                
                {/* 記錄卡片 */}
                <div className={`ml-2 p-3 rounded-lg border ${
                  index === 0 ? 'border-primary/30 bg-primary/5' : 'bg-muted/30'
                }`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {new Date(record.date).toLocaleDateString('zh-TW', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        {index === 0 && (
                          <Badge variant="default" className="text-xs">
                            {t('最新', '最新')}
                          </Badge>
                        )}
                        {index === displayRecords.length - 1 && historyRecords.length > 1 && (
                          <Badge variant="outline" className="text-xs">
                            {t('初診', '初诊')}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getDaysAgo(record.date)}
                      </div>
                    </div>
                    {record.healthScore !== null && (
                      <div className={`text-lg font-bold ${
                        record.healthScore >= 80 ? 'text-green-600' :
                        record.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {record.healthScore}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    {record.diagnosis && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{t('診斷', '诊断')}：</span>
                        <span>{record.diagnosis}</span>
                      </div>
                    )}
                    {record.treatmentPlan && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{t('處置', '处置')}：</span>
                        <Badge variant="outline" className="text-xs">
                          {record.treatmentPlan}
                        </Badge>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                      {record.keyMetrics.npc !== null && (
                        <span>NPC: {record.keyMetrics.npc}cm</span>
                      )}
                      {record.keyMetrics.ciss !== null && (
                        <span>CISS: {record.keyMetrics.ciss}</span>
                      )}
                      {record.keyMetrics.boBreakNear !== null && (
                        <span>BO: {record.keyMetrics.boBreakNear}Δ</span>
                      )}
                      {record.keyMetrics.nearPhoria !== null && (
                        <span>{t('近距眼位', '近距眼位')}: {record.keyMetrics.nearPhoria > 0 ? 'exo' : 'eso'} {Math.abs(record.keyMetrics.nearPhoria)}Δ</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* 展開/收起按鈕 */}
            {historyRecords.length > 3 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAllRecords(!showAllRecords)}
                className="ml-2"
              >
                {showAllRecords ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    {t('收起', '收起')}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    {t(`顯示全部 ${historyRecords.length} 筆`, `显示全部 ${historyRecords.length} 条`)}
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
