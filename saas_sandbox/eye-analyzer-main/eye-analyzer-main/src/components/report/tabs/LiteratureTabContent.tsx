/**
 * Literature Tab Content - 文獻依據
 */

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LITERATURE_DATABASE, 
  EVIDENCE_LEVEL_DESCRIPTION, 
  EvidenceLevel,
  findReferencesByCondition,
  findReferencesByIntervention,
  type LiteratureReference 
} from '@/lib/references/literatureDatabase';
import { 
  getEvidenceForCondition,
  RECOMMENDATION_EVIDENCE_MAP 
} from '@/lib/references/recommendationEvidence';
import { EvidenceBadge } from '@/components/EvidenceBadge';
import { ReferencesCitation } from '@/components/ReferencesCitation';
import { BookOpen, ExternalLink, Info } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LiteratureTabContentProps {
  diagCode: string;
}

export const LiteratureTabContent = ({ diagCode }: LiteratureTabContentProps) => {
  const { language } = useLanguage();
  const isCN = language === 'zh-CN';

  // Map diagnosis code to condition
  const conditionMap: Record<string, string> = {
    'CI': 'CI',
    'Pseudo-CI': 'CI',
    'CE': 'CE',
    'BX': 'BX',
    'BE': 'BE',
    'DE': 'DE',
    'DI': 'DI',
  };

  const condition = conditionMap[diagCode] || 'CI';
  
  // Get relevant references for this condition
  const conditionReferences = findReferencesByCondition(condition);
  const interventionReferences = [
    ...findReferencesByIntervention('vision_training'),
    ...findReferencesByIntervention('prism'),
  ];
  
  // Combine and deduplicate
  const allReferenceIds = new Set([
    ...conditionReferences.map(r => r.id),
    ...interventionReferences.map(r => r.id),
  ]);
  
  const relevantReferenceIds = Array.from(allReferenceIds).slice(0, 10);

  // Get evidence recommendations for this condition
  const evidenceRecommendations = getEvidenceForCondition(condition);

  // Evidence level descriptions for the table
  const evidenceLevels = Object.entries(EVIDENCE_LEVEL_DESCRIPTION);

  return (
    <div className="space-y-4">
      {/* Evidence Level Explanation Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-5 w-5 text-primary" />
            {isCN ? '证据等级说明' : '證據等級說明'}
          </CardTitle>
          <CardDescription>
            {isCN 
              ? '基于 Oxford CEBM 证据分级系统' 
              : '基於 Oxford CEBM 證據分級系統'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">{isCN ? '等级' : '等級'}</TableHead>
                  <TableHead>{isCN ? '说明' : '說明'}</TableHead>
                  <TableHead className="w-32">{isCN ? '示例' : '示例'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evidenceLevels.map(([level, desc]) => (
                  <TableRow key={level}>
                    <TableCell>
                      <Badge className={desc.color}>
                        {desc.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {isCN ? desc.descriptionCN : desc.description}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {level === 'IA' && 'CITT'}
                      {level === 'IB' && 'RCT'}
                      {level === 'IIA' && (isCN ? '世代研究' : '世代研究')}
                      {level === 'IIB' && (isCN ? '队列研究' : '隊列研究')}
                      {level === 'III' && (isCN ? '病例对照' : '病例對照')}
                      {level === 'IV' && (isCN ? '病例系列' : '病例系列')}
                      {level === 'V' && (isCN ? '专家意见' : '專家意見')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Evidence for Current Condition */}
      {evidenceRecommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5 text-primary" />
              {isCN 
                ? `${condition} 的治疗证据摘要` 
                : `${condition} 的治療證據摘要`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {evidenceRecommendations.map((evidence) => (
              <div 
                key={evidence.id} 
                className="p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <EvidenceBadge 
                    level={evidence.evidenceLevel} 
                    size="sm" 
                  />
                  <Badge variant="outline">
                    {evidence.recommendationType === 'vision_training' 
                      ? (isCN ? '视觉训练' : '視覺訓練')
                      : evidence.recommendationType === 'prism'
                      ? (isCN ? '棱镜处方' : '稜鏡處方')
                      : evidence.recommendationType === 'lens'
                      ? (isCN ? '镜片处方' : '鏡片處方')
                      : (isCN ? '观察追踪' : '觀察追蹤')
                    }
                  </Badge>
                  <Badge 
                    variant="secondary"
                    className={
                      evidence.recommendationStrength === 'Strong' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                        : evidence.recommendationStrength === 'Moderate'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }
                  >
                    {isCN ? evidence.recommendationStrengthCN : evidence.recommendationStrength}
                  </Badge>
                </div>
                <p className="text-sm">
                  {isCN ? evidence.benefitSummaryCN : evidence.benefitSummary}
                </p>
                {evidence.effectSize && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Effect Size: {evidence.effectSize}
                  </p>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  {isCN ? '支持研究' : '支持研究'}: {evidence.numberOfStudies} | 
                  {evidence.totalSampleSize && ` N = ${evidence.totalSampleSize}`}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Reference List */}
      <ReferencesCitation 
        referenceIds={relevantReferenceIds}
        collapsible={true}
        defaultExpanded={false}
      />
    </div>
  );
};
