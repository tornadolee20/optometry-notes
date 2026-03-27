import { useLanguage } from '@/contexts/LanguageContext';
import { AlertTriangle, CheckCircle, Info, HelpCircle, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

interface AcaReliabilityCardProps {
  calculatedAca: number;
  gradientAca: number | null;
  age: number;
  avgAA: number;
  expectedAA: number;
  acaMethod: string;
  className?: string;
}

/**
 * AC/A 可信度評估卡片
 * 根據年齡、調節幅度評估計算法 AC/A 的可信度
 * 提供梯度法測量建議
 */
export const AcaReliabilityCard = ({
  calculatedAca,
  gradientAca,
  age,
  avgAA,
  expectedAA,
  acaMethod,
  className,
}: AcaReliabilityCardProps) => {
  const { language } = useLanguage();
  
  const t = (tw: string, cn: string, en: string) =>
    language === 'en' ? en : language === 'zh-CN' ? cn : tw;
  
  // 評估 AC/A 可信度
  const aaDeficit = expectedAA - avgAA;
  const isPresbyopic = age >= 40;
  const hasAccommodativeDeficit = aaDeficit >= 2.0;
  const calculatedAcaAbnormal = calculatedAca < 2.0 || calculatedAca < 0;
  
  // 計算可信度等級
  const needsGradient = isPresbyopic || hasAccommodativeDeficit || calculatedAcaAbnormal;
  const hasGradient = gradientAca !== null;
  
  // 判斷可信度
  let reliabilityLevel: 'high' | 'medium' | 'low';
  let reliabilityText: string;
  let reliabilityColor: string;
  
  if (hasGradient) {
    reliabilityLevel = 'high';
    reliabilityText = t('可信度高', '可信度高', 'High Reliability');
    reliabilityColor = 'text-success';
  } else if (needsGradient) {
    reliabilityLevel = 'low';
    reliabilityText = t('可信度低', '可信度低', 'Low Reliability');
    reliabilityColor = 'text-warning';
  } else {
    reliabilityLevel = 'medium';
    reliabilityText = t('可信度中', '可信度中', 'Moderate Reliability');
    reliabilityColor = 'text-success';
  }
  
  // 只有需要梯度法但未測量時顯示警告
  if (!needsGradient && !hasGradient) {
    return null;
  }
  
  return (
    <div className={cn("space-y-3", className)}>
      {/* 可信度指示器 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {reliabilityLevel === 'high' ? (
            <CheckCircle className="w-4 h-4 text-success" />
          ) : reliabilityLevel === 'low' ? (
            <AlertTriangle className="w-4 h-4 text-warning" />
          ) : (
            <Info className="w-4 h-4 text-primary" />
          )}
          <span className={cn("text-sm font-semibold", reliabilityColor)}>
            {reliabilityText}
          </span>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <HelpCircle className="w-3 h-3 mr-1" />
              {t('為什麼？', '为什么？', 'Why?')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {t('AC/A 測量方法說明', 'AC/A 测量方法说明', 'AC/A Measurement Methods')}
              </DialogTitle>
            </DialogHeader>
            <GradientMethodExplanation language={language} />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* 梯度法提示 */}
      {needsGradient && !hasGradient && (
        <Alert className="bg-warning/10 border-warning/30">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertTitle className="text-warning text-sm font-semibold">
            {t('建議補測梯度法 AC/A', '建议补测梯度法 AC/A', 'Gradient AC/A Recommended')}
          </AlertTitle>
          <AlertDescription className="text-xs text-warning/90 mt-1">
            {isPresbyopic && (
              <p>
                • {t(
                  `年齡 ${age} 歲，調節功能可能不足`,
                  `年龄 ${age} 岁，调节功能可能不足`,
                  `Age ${age}, accommodation may be insufficient`
                )}
              </p>
            )}
            {hasAccommodativeDeficit && (
              <p>
                • {t(
                  `調節幅度不足 (${avgAA.toFixed(1)}D < 預期 ${expectedAA.toFixed(1)}D)`,
                  `调节幅度不足 (${avgAA.toFixed(1)}D < 预期 ${expectedAA.toFixed(1)}D)`,
                  `AA deficit (${avgAA.toFixed(1)}D < expected ${expectedAA.toFixed(1)}D)`
                )}
              </p>
            )}
            {calculatedAcaAbnormal && (
              <p>
                • {t(
                  `計算法 AC/A 異常低 (${calculatedAca.toFixed(1)})`,
                  `计算法 AC/A 异常低 (${calculatedAca.toFixed(1)})`,
                  `Calculated AC/A abnormally low (${calculatedAca.toFixed(1)})`
                )}
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {/* 已有梯度法時的比較顯示 */}
      {hasGradient && (
        <div className="bg-success/10 border border-success/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-sm font-semibold text-success">
              {t('梯度法已測量', '梯度法已测量', 'Gradient Method Measured')}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">
                {t('計算法', '计算法', 'Calculated')}:
              </span>
              <span className={cn(
                "ml-2 font-mono font-bold",
                calculatedAcaAbnormal ? "text-warning" : "text-foreground"
              )}>
                {calculatedAca.toFixed(1)} {calculatedAcaAbnormal && t('⚠️ 僅參考', '⚠️ 仅参考', '⚠️ Reference only')}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">
                {t('梯度法', '梯度法', 'Gradient')}:
              </span>
              <span className="ml-2 font-mono font-bold text-success">
                {gradientAca!.toFixed(1)} ✅
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {t(
              '處方決策請以梯度法 AC/A 為準',
              '处方决策请以梯度法 AC/A 为准',
              'Use Gradient AC/A for prescription decisions'
            )}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * 梯度法測量步驟說明
 */
const GradientMethodExplanation = ({ language }: { language: string }) => {
  const t = (tw: string, cn: string, en: string) =>
    language === 'en' ? en : language === 'zh-CN' ? cn : tw;
  
  return (
    <div className="space-y-4 text-sm">
      {/* 為什麼需要梯度法 */}
      <div>
        <h4 className="font-semibold text-foreground mb-2">
          {t('為什麼老花眼需要梯度法？', '为什么老花眼需要梯度法？', 'Why is Gradient Method needed for presbyopia?')}
        </h4>
        <p className="text-muted-foreground leading-relaxed">
          {t(
            '計算法 AC/A 會被調節不足嚴重干擾。老花眼患者的調節功能減退，導致計算法 AC/A 失真（常為負值或極低值）。梯度法透過外加鏡片刺激調節，測量純粹的「調節→輻輳」反應，不受距離性輻輳干擾。',
            '计算法 AC/A 会被调节不足严重干扰。老花眼患者的调节功能减退，导致计算法 AC/A 失真（常为负值或极低值）。梯度法通过外加镜片刺激调节，测量纯粹的「调节→辐辏」反应，不受距离性辐辏干扰。',
            'Calculated AC/A is severely affected by accommodative insufficiency. In presbyopic patients, reduced accommodation causes distorted AC/A values (often negative or very low). The Gradient method uses lens-induced accommodation to measure pure accommodative convergence, unaffected by proximal convergence.'
          )}
        </p>
      </div>
      
      {/* 測量步驟 */}
      <div>
        <h4 className="font-semibold text-foreground mb-2">
          {t('梯度法 AC/A 測量步驟', '梯度法 AC/A 测量步骤', 'Gradient AC/A Measurement Steps')}
        </h4>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>
            {t(
              '在患者目前處方上，雙眼各加 +1.00D 鏡片',
              '在患者目前处方上，双眼各加 +1.00D 镜片',
              'Add +1.00D lenses binocularly over current Rx'
            )}
          </li>
          <li>
            {t(
              '重新測量 40cm 近距斜位（Cover Test）',
              '重新测量 40cm 近距斜位（Cover Test）',
              'Re-measure near phoria at 40cm (Cover Test)'
            )}
          </li>
          <li>
            {t(
              '計算：梯度 AC/A = (原近距斜位 - 新近距斜位) / 1.0',
              '计算：梯度 AC/A = (原近距斜位 - 新近距斜位) / 1.0',
              'Calculate: Gradient AC/A = (Original - New Near Phoria) / 1.0'
            )}
          </li>
        </ol>
      </div>
      
      {/* 範例 */}
      <div className="bg-muted/50 p-3 rounded-lg">
        <h5 className="font-medium text-foreground mb-2">
          {t('計算範例', '计算范例', 'Example')}
        </h5>
        <div className="font-mono text-xs space-y-1 text-muted-foreground">
          <p>{t('原近距斜位', '原近距斜位', 'Original near phoria')}: +2Δ (eso)</p>
          <p>{t('加 +1.00D 後斜位', '加 +1.00D 后斜位', 'After +1.00D')}: +8Δ (eso)</p>
          <p className="font-bold text-foreground">
            {t('梯度 AC/A', '梯度 AC/A', 'Gradient AC/A')} = (8 - 2) / 1.0 = 6.0 Δ/D
          </p>
        </div>
      </div>
      
      {/* 臨床決策表 */}
      <div>
        <h4 className="font-semibold text-foreground mb-2">
          {t('何時使用哪種方法？', '何时使用哪种方法？', 'When to use which method?')}
        </h4>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-2 text-left">{t('患者類型', '患者类型', 'Patient Type')}</th>
                <th className="px-3 py-2 text-center">{t('計算法', '计算法', 'Calc')}</th>
                <th className="px-3 py-2 text-center">{t('梯度法', '梯度法', 'Grad')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-3 py-2">{t('兒童/青少年', '儿童/青少年', 'Children/Teens')}</td>
                <td className="px-3 py-2 text-center text-success">✅</td>
                <td className="px-3 py-2 text-center text-muted-foreground">⚠️</td>
              </tr>
              <tr>
                <td className="px-3 py-2">{t('青壯年 (AA 正常)', '青壮年 (AA 正常)', 'Young Adults (Normal AA)')}</td>
                <td className="px-3 py-2 text-center text-success">✅</td>
                <td className="px-3 py-2 text-center text-muted-foreground">⚠️</td>
              </tr>
              <tr>
                <td className="px-3 py-2">{t('初老花 (AA 稍低)', '初老花 (AA 稍低)', 'Early Presbyopia')}</td>
                <td className="px-3 py-2 text-center text-warning">⚠️</td>
                <td className="px-3 py-2 text-center text-success">✅</td>
              </tr>
              <tr>
                <td className="px-3 py-2">{t('重度老花 (AA &lt; 5D)', '重度老花 (AA < 5D)', 'Advanced Presbyopia')}</td>
                <td className="px-3 py-2 text-center text-destructive">❌</td>
                <td className="px-3 py-2 text-center text-success">✅</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
