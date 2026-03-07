import { useLanguage } from '@/contexts/LanguageContext';
import { CalculationResult } from '@/lib/calculateLogic';
import { PieChart, Minus, Plus } from 'lucide-react';
import { ReportCard } from './ReportCard';
import { cn } from '@/lib/utils';

interface ScoreBreakdownCardProps {
  result: CalculationResult;
  age: number;
  mem: number;
}

interface ScoreItem {
  label: string;
  deduction: number;
  condition: boolean;
}

export const ScoreBreakdownCard = ({
  result,
  age,
  mem,
}: ScoreBreakdownCardProps) => {
  const { language } = useLanguage();
  const isEN = language === 'en';
  const isCN = language === 'zh-CN';

  const scoreItems: ScoreItem[] = [
    {
      label: isEN ? 'Diagnosis Abnormal' : isCN ? '诊断异常' : '診斷異常',
      deduction: 15,
      condition: result.diag.code !== 'NORMAL'
    },
    {
      label: isEN ? 'Accommodation Abnormal' : isCN ? '调节状态异常' : '調節狀態異常',
      deduction: 10,
      condition: result.accom.status !== 'Normal'
    },
    {
      label: isEN ? 'CISS Threshold Exceeded' : isCN ? 'CISS 症状阈值超标' : 'CISS 症狀閾值超標',
      deduction: 10,
      condition: result.ciss.score > 20
    },
    {
      label: isEN ? 'Vertical Phoria' : isCN ? '垂直斜位' : '垂直斜位',
      deduction: 5,
      condition: result.vRes.has
    },
    {
      label: isEN ? 'BCC Abnormal' : isCN ? 'BCC 异常' : 'BCC 異常',
      deduction: 5,
      condition: age < 40 ? (mem > 1.0 || mem < -0.25) : mem > 1.5
    },
    {
      label: isEN ? 'Functional Age High (>actual+10)' : isCN ? '机能年龄过高 (>实际+10岁)' : '機能年齡過高 (>實際+10歲)',
      deduction: 10,
      condition: result.accom.functionalAge > age + 10
    },
    {
      label: isEN ? 'Posture Risk (working distance too close)' : isCN ? '姿势风险 (工作距离过近)' : '姿勢風險 (工作距離過近)',
      deduction: 5,
      condition: result.ergoRisk
    },
  ];

  const activeDeductions = scoreItems.filter(item => item.condition);
  const totalDeduction = activeDeductions.reduce((sum, item) => sum + item.deduction, 0);

  return (
    <ReportCard
      icon={PieChart}
      title={isEN ? 'Health Score Breakdown' : isCN ? '健康分数拆解' : '健康分數拆解'}
      collapsible
      defaultOpen={false}
    >
      <div className="space-y-4">
        {/* Base Score */}
        <div className="flex items-center justify-between p-3 bg-success/10 rounded-xl border border-success/20">
          <span className="text-sm font-medium text-success">{isEN ? 'Base Score' : isCN ? '基础分数' : '基礎分數'}</span>
          <span className="text-xl font-bold text-success">100</span>
        </div>

        {/* Deductions */}
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {isEN ? 'Deduction Items' : isCN ? '扣分项目' : '扣分項目'}
          </h5>
          
          {scoreItems.map((item, idx) => (
            <div 
              key={idx}
              className={cn(
                "flex items-center justify-between p-2.5 rounded-lg transition-colors",
                item.condition 
                  ? "bg-destructive/5 border border-destructive/15" 
                  : "bg-muted/30 border border-transparent"
              )}
            >
              <div className="flex items-center gap-2">
                {item.condition ? (
                  <Minus size={14} className="text-destructive" />
                ) : (
                  <Plus size={14} className="text-muted-foreground/50" />
                )}
                <span className={cn(
                  "text-sm",
                  item.condition ? "text-foreground" : "text-muted-foreground/60"
                )}>
                  {item.label}
                </span>
              </div>
              <span className={cn(
                "text-sm font-semibold",
                item.condition ? "text-destructive" : "text-muted-foreground/50"
              )}>
                {item.condition ? `-${item.deduction}` : '—'}
              </span>
            </div>
          ))}
        </div>

        {/* Final Score */}
        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-foreground">{isEN ? 'Total Deduction:' : isCN ? '总扣分:' : '總扣分:'}</span>
              <span className="ml-2 text-sm font-semibold text-destructive">-{totalDeduction}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-muted-foreground">{isEN ? 'Final Score:' : isCN ? '最终分数:' : '最終分數:'}</span>
              <span className={cn(
                "text-2xl font-bold",
                result.healthScore >= 80 ? "text-success" :
                result.healthScore >= 60 ? "text-warning" : "text-destructive"
              )}>
                {result.healthScore}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {isEN 
              ? `* Minimum score limited to 40 (100 - ${totalDeduction} = ${Math.max(40, 100 - totalDeduction)})`
              : isCN 
              ? `* 最低分数限制为 40 分 (100 - ${totalDeduction} = ${Math.max(40, 100 - totalDeduction)})`
              : `* 最低分數限制為 40 分 (100 - ${totalDeduction} = ${Math.max(40, 100 - totalDeduction)})`}
          </p>
        </div>
      </div>
    </ReportCard>
  );
};
