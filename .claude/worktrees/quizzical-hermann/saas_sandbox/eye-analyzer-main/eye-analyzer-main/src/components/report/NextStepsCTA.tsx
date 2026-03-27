/**
 * Next Steps CTA Component - 建議您的下一步
 */

import { useState } from 'react';
import { CalculationResult } from '@/lib/calculateLogic';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowRight, 
  Download, 
  Bell, 
  HelpCircle, 
  MessageCircle,
  BookOpen,
  Eye,
  Glasses,
  Target
} from 'lucide-react';

interface NextStepsCTAProps {
  result: CalculationResult;
}

export const NextStepsCTA = ({ result }: NextStepsCTAProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [showExplanationDialog, setShowExplanationDialog] = useState(false);
  const isCN = language === 'zh-CN';

  const diagCode = result.diag.code;

  // Get primary action based on diagnosis
  const getPrimaryAction = () => {
    switch (diagCode) {
      case 'CI':
      case 'Pseudo-CI':
        return {
          title: isCN ? '立即预约视觉训练初诊' : '立即預約視覺訓練初診',
          description: isCN 
            ? '基于您的 CI 诊断，建议在 2 周内开始视觉训练计划' 
            : '基於您的 CI 診斷，建議在 2 週內開始視覺訓練計畫',
          icon: Target,
        };
      case 'CE':
        return {
          title: isCN ? '评估近用附加镜片处方' : '評估近用附加鏡片處方',
          description: isCN 
            ? '建议配戴抗疲劳或渐进镜片，改善近距离工作舒适度' 
            : '建議配戴抗疲勞或漸進鏡片，改善近距離工作舒適度',
          icon: Glasses,
        };
      case 'BX':
      case 'DE':
        return {
          title: isCN ? '安排融像功能详细评估' : '安排融像功能詳細評估',
          description: isCN 
            ? '建议进一步评估是否需要视觉训练或棱镜处方' 
            : '建議進一步評估是否需要視覺訓練或稜鏡處方',
          icon: Eye,
        };
      case 'BE':
      case 'DI':
        return {
          title: isCN ? '评估棱镜处方需求' : '評估稜鏡處方需求',
          description: isCN 
            ? '基于内斜模式，建议评估棱镜矫正方案' 
            : '基於內斜模式，建議評估稜鏡矯正方案',
          icon: Glasses,
        };
      default:
        return {
          title: isCN ? '安排年度追踪检查' : '安排年度追蹤檢查',
          description: isCN 
            ? '维持健康的双眼视觉功能，建议每年例行检查' 
            : '維持健康的雙眼視覺功能，建議每年例行檢查',
          icon: Eye,
        };
    }
  };

  const primaryAction = getPrimaryAction();
  const PrimaryIcon = primaryAction.icon;

  // FAQ items for the explanation dialog
  const faqItems = [
    {
      q: isCN ? '什么是 CI（集合不足）？' : '什麼是 CI（集合不足）？',
      a: isCN 
        ? '集合不足是指双眼无法有效地向内转动聚焦于近距离物体，导致阅读或近距离工作时容易疲劳、视力模糊或复视。' 
        : '集合不足是指雙眼無法有效地向內轉動聚焦於近距離物體，導致閱讀或近距離工作時容易疲勞、視力模糊或複視。',
    },
    {
      q: isCN ? '什么是 NPC？' : '什麼是 NPC？',
      a: isCN 
        ? 'NPC（近点集合）是指眼睛能够维持单一视觉的最近距离。正常值应小于 6 公分。' 
        : 'NPC（近點集合）是指眼睛能夠維持單一視覺的最近距離。正常值應小於 6 公分。',
    },
    {
      q: isCN ? '什么是 CISS？' : '什麼是 CISS？',
      a: isCN 
        ? 'CISS（集合不足症状问卷）是一份标准化问卷，用于评估与双眼视觉问题相关的症状严重程度。' 
        : 'CISS（集合不足症狀問卷）是一份標準化問卷，用於評估與雙眼視覺問題相關的症狀嚴重程度。',
    },
    {
      q: isCN ? '视觉训练有效吗？' : '視覺訓練有效嗎？',
      a: isCN 
        ? '根据 CITT 随机对照试验研究，诊间视觉训练对 CI 的成功率达 80-90%，是最有效的治疗方式。' 
        : '根據 CITT 隨機對照試驗研究，診間視覺訓練對 CI 的成功率達 80-90%，是最有效的治療方式。',
    },
    {
      q: isCN ? '棱镜处方的作用是什么？' : '稜鏡處方的作用是什麼？',
      a: isCN 
        ? '棱镜可以改变光线进入眼睛的角度，减少眼睛为维持双眼视觉所需的努力，从而缓解症状。但这是症状性治疗，不能根治问题。' 
        : '稜鏡可以改變光線進入眼睛的角度，減少眼睛為維持雙眼視覺所需的努力，從而緩解症狀。但這是症狀性治療，不能根治問題。',
    },
  ];

  const handleUnderstand = () => {
    toast({
      title: isCN ? '感谢您的回馈！' : '感謝您的回饋！',
      description: isCN ? '如有任何问题，请随时联系我们' : '如有任何問題，請隨時聯繫我們',
    });
  };

  return (
    <>
      {/* Understanding Feedback Card */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium mb-3">
                {isCN ? '您是否理解了检查结果与建议？' : '您是否理解了檢查結果與建議？'}
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="default"
                  size="sm"
                  onClick={handleUnderstand}
                >
                  ✅ {isCN ? '完全理解' : '完全理解'}
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExplanationDialog(true)}
                >
                  ❓ {isCN ? '需要进一步说明' : '需要進一步說明'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps CTA */}
      <Card className="border-2 border-primary bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            🎯 {isCN ? '建议您的下一步' : '建議您的下一步'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Primary Action */}
            <Button 
              className="w-full justify-start h-auto py-4 text-left" 
              size="lg"
            >
              <div className="flex items-center gap-3 flex-1">
                <PrimaryIcon className="h-6 w-6 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base mb-1">
                    {primaryAction.title}
                  </div>
                  <div className="text-sm opacity-90 font-normal line-clamp-2">
                    {primaryAction.description}
                  </div>
                </div>
                <ArrowRight className="ml-2 h-5 w-5 flex-shrink-0" />
              </div>
            </Button>

            {/* Secondary Action */}
            <Button 
              variant="outline" 
              className="w-full justify-between h-auto py-3"
            >
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>{isCN ? '下载居家训练指南 PDF' : '下載居家訓練指南 PDF'}</span>
              </div>
            </Button>

            {/* Tertiary Action */}
            <Button 
              variant="ghost" 
              className="w-full justify-between"
            >
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>{isCN ? '设定追踪提醒（每周训练打卡）' : '設定追蹤提醒（每週訓練打卡）'}</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Explanation Dialog */}
      <Dialog open={showExplanationDialog} onOpenChange={setShowExplanationDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {isCN ? '常见问题解答' : '常見問題解答'}
            </DialogTitle>
            <DialogDescription>
              {isCN ? '以下是关于检查结果的常见问题' : '以下是關於檢查結果的常見問題'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {faqItems.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <p className="font-medium text-sm">{item.q}</p>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowExplanationDialog(false)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {isCN ? '联系专业人员咨询' : '聯繫專業人員諮詢'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
