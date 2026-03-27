/**
 * Treatment Tab Content - 處置建議
 */

import { CalculationResult } from '@/lib/calculateLogic';
import { LensRecommendationCard } from '../LensRecommendationCard';
import { TrainingRecommendationCard } from '../TrainingRecommendationCard';
import { PrismCalculationCard } from '../PrismCalculationCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Scale, BookOpen, CheckCircle2 } from 'lucide-react';

interface TreatmentTabContentProps {
  result: CalculationResult;
  trainingNeeds: { category: string; target: string; items: string[] }[];
  nearPhoria: number;
  distPhoria: number;
  biBreak: number;
  boBreak: number;
}

interface ScenarioCardProps {
  priority: 'A' | 'B' | 'C';
  title: string;
  description: string;
  items: string[];
  isCN: boolean;
}

const ScenarioCard = ({ priority, title, description, items, isCN }: ScenarioCardProps) => {
  const priorityConfig = {
    A: {
      label: isCN ? '🔥 首选方案' : '🔥 首選方案',
      color: 'bg-red-500 text-white',
      borderColor: 'border-red-500/30',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
    },
    B: {
      label: isCN ? '⚖️ 替代方案' : '⚖️ 替代方案',
      color: 'bg-orange-500 text-white',
      borderColor: 'border-orange-500/30',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    },
    C: {
      label: isCN ? '📚 保守方案' : '📚 保守方案',
      color: 'bg-blue-500 text-white',
      borderColor: 'border-blue-500/30',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
  };

  const config = priorityConfig[priority];

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border-2`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-2">
          <Badge className={config.color}>{config.label}</Badge>
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export const TreatmentTabContent = ({
  result,
  trainingNeeds,
  nearPhoria,
  distPhoria,
  biBreak,
  boBreak,
}: TreatmentTabContentProps) => {
  const { language } = useLanguage();
  const isCN = language === 'zh-CN';

  // Generate scenario recommendations based on diagnosis
  const diagCode = result.diag.code;
  
  const getScenarios = (): { priority: 'A' | 'B' | 'C'; title: string; description: string; items: string[] }[] => {
    if (diagCode === 'CI' || diagCode === 'Pseudo-CI') {
      return [
        {
          priority: 'A',
          title: isCN ? '办公室视觉训练' : '診間視覺訓練',
          description: isCN ? '12-24周的专业视觉训练课程' : '12-24 週的專業視覺訓練課程',
          items: [
            isCN ? 'Brock String 训练（建立生理复视认知）' : 'Brock String 訓練（建立生理複視認知）',
            isCN ? 'Pencil Push-ups（提升 NPC）' : 'Pencil Push-ups（提升 NPC）',
            isCN ? '集合力融像训练' : '集合力融像訓練',
            isCN ? '预期成功率：80-90%（基于 CITT 研究）' : '預期成功率：80-90%（基於 CITT 研究）',
          ],
        },
        {
          priority: 'B',
          title: isCN ? '居家视觉训练' : '居家視覺訓練',
          description: isCN ? '每日15-20分钟的居家训练计划' : '每日 15-20 分鐘的居家訓練計畫',
          items: [
            isCN ? 'Pencil Push-ups（每日3组，每组10次）' : 'Pencil Push-ups（每日 3 組，每組 10 次）',
            isCN ? 'Brock String 练习' : 'Brock String 練習',
            isCN ? '预期成功率：50-60%' : '預期成功率：50-60%',
          ],
        },
        {
          priority: 'C',
          title: isCN ? '棱镜处方' : '稜鏡處方',
          description: isCN ? '症状缓解但不治本' : '症狀緩解但不治本',
          items: [
            isCN ? '基底内（BI）棱镜缓解症状' : '基底內（BI）稜鏡緩解症狀',
            isCN ? '适用于无法配合训练者' : '適用於無法配合訓練者',
            isCN ? '需定期追踪评估' : '需定期追蹤評估',
          ],
        },
      ];
    } else if (diagCode === 'CE') {
      return [
        {
          priority: 'A',
          title: isCN ? '近用附加镜片' : '近用附加鏡片',
          description: isCN ? '降低调节需求，减少集合过度' : '降低調節需求，減少集合過度',
          items: [
            isCN ? '渐进多焦或抗疲劳镜片' : '漸進多焦或抗疲勞鏡片',
            isCN ? '针对高 AC/A 的首选方案' : '針對高 AC/A 的首選方案',
            isCN ? '立即见效，舒适度高' : '立即見效，舒適度高',
          ],
        },
        {
          priority: 'B',
          title: isCN ? '散开训练' : '散開訓練',
          description: isCN ? '增加散开力融像储备' : '增加散開力融像儲備',
          items: [
            isCN ? 'Lifesaver Card 训练' : 'Lifesaver Card 訓練',
            isCN ? 'BO 棱镜融像训练' : 'BO 稜鏡融像訓練',
            isCN ? '需较长训练时间' : '需較長訓練時間',
          ],
        },
        {
          priority: 'C',
          title: isCN ? '基底外棱镜' : '基底外稜鏡',
          description: isCN ? '严重案例的辅助处方' : '嚴重案例的輔助處方',
          items: [
            isCN ? '基底外（BO）棱镜' : '基底外（BO）稜鏡',
            isCN ? '通常与镜片 ADD 合并使用' : '通常與鏡片 ADD 合併使用',
          ],
        },
      ];
    } else if (diagCode === 'BX' || diagCode === 'DE') {
      return [
        {
          priority: 'A',
          title: isCN ? '集合力训练' : '集合力訓練',
          description: isCN ? '增强 BO 融像储备' : '增強 BO 融像儲備',
          items: [
            isCN ? 'Pencil Push-ups' : 'Pencil Push-ups',
            isCN ? 'Brock String' : 'Brock String',
            isCN ? 'BI 棱镜融像训练' : 'BI 稜鏡融像訓練',
          ],
        },
        {
          priority: 'B',
          title: isCN ? '基底内棱镜' : '基底內稜鏡',
          description: isCN ? '症状严重时的辅助方案' : '症狀嚴重時的輔助方案',
          items: [
            isCN ? '小量 BI 棱镜（通常 2-4Δ）' : '小量 BI 稜鏡（通常 2-4Δ）',
            isCN ? '可与训练并行' : '可與訓練並行',
          ],
        },
        {
          priority: 'C',
          title: isCN ? '观察追踪' : '觀察追蹤',
          description: isCN ? '轻微案例的保守方案' : '輕微案例的保守方案',
          items: [
            isCN ? '定期追踪检查' : '定期追蹤檢查',
            isCN ? '卫教用眼习惯' : '衛教用眼習慣',
          ],
        },
      ];
    } else if (diagCode === 'BE' || diagCode === 'DI') {
      return [
        {
          priority: 'A',
          title: isCN ? '基底外棱镜' : '基底外稜鏡',
          description: isCN ? '缓解内斜症状' : '緩解內斜症狀',
          items: [
            isCN ? 'BO 棱镜处方' : 'BO 稜鏡處方',
            isCN ? '根据 Sheard/Percival 准则计算' : '根據 Sheard/Percival 準則計算',
          ],
        },
        {
          priority: 'B',
          title: isCN ? '散开力训练' : '散開力訓練',
          description: isCN ? '增强 BI 融像储备' : '增強 BI 融像儲備',
          items: [
            isCN ? 'Lifesaver Card' : 'Lifesaver Card',
            isCN ? 'BO 棱镜融像训练' : 'BO 稜鏡融像訓練',
          ],
        },
        {
          priority: 'C',
          title: isCN ? '观察追踪' : '觀察追蹤',
          description: isCN ? '轻微案例的保守方案' : '輕微案例的保守方案',
          items: [
            isCN ? '定期追踪检查' : '定期追蹤檢查',
          ],
        },
      ];
    }
    
    // Default/Normal
    return [
      {
        priority: 'A',
        title: isCN ? '定期追踪' : '定期追蹤',
        description: isCN ? '维持良好的双眼视觉功能' : '維持良好的雙眼視覺功能',
        items: [
          isCN ? '每年例行检查' : '每年例行檢查',
          isCN ? '卫教健康用眼习惯' : '衛教健康用眼習慣',
        ],
      },
      {
        priority: 'B',
        title: isCN ? '预防性保健' : '預防性保健',
        description: isCN ? '减少未来视觉问题风险' : '減少未來視覺問題風險',
        items: [
          isCN ? '适当的工作距离' : '適當的工作距離',
          isCN ? '20-20-20 法则' : '20-20-20 法則',
        ],
      },
      {
        priority: 'C',
        title: isCN ? '抗疲劳镜片' : '抗疲勞鏡片',
        description: isCN ? '数字设备重度使用者' : '數位設備重度使用者',
        items: [
          isCN ? '可选择抗疲劳或蓝光镜片' : '可選擇抗疲勞或藍光鏡片',
        ],
      },
    ];
  };

  const scenarios = getScenarios();

  return (
    <div className="space-y-4">
      {/* Scenario Cards */}
      <div className="space-y-4">
        {scenarios.map((scenario, idx) => (
          <ScenarioCard
            key={idx}
            priority={scenario.priority}
            title={scenario.title}
            description={scenario.description}
            items={scenario.items}
            isCN={isCN}
          />
        ))}
      </div>

      {/* Prism Calculation Details */}
      {result.finalRx.hPrism > 0 && (
        <PrismCalculationCard
          result={result}
          nearPhoria={nearPhoria}
          distPhoria={distPhoria}
          biBreak={biBreak}
          boBreak={boBreak}
        />
      )}

      {/* Lens Recommendation */}
      <LensRecommendationCard result={result} viewMode="expert" />

      {/* Training Recommendations */}
      {trainingNeeds.length > 0 && (
        <TrainingRecommendationCard trainingNeeds={trainingNeeds} viewMode="expert" />
      )}
    </div>
  );
};
