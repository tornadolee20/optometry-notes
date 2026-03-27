import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  ChevronDown, 
  ChevronUp,
  BarChart3,
  Target,
  Shield,
  TrendingUp,
  Award,
  FlaskConical
} from 'lucide-react';
import { 
  ValidationResult, 
  DataQualityScore, 
  getValidationSummary 
} from '@/lib/dataValidation';
import { 
  evaluateResearchEligibility, 
  ResearchEligibility,
  getTierSummary
} from '@/lib/dataQuality/researchTiers';

interface DataQualityPanelProps {
  validationResults: ValidationResult[];
  qualityScore: DataQualityScore;
  showDetails?: boolean;
  examData?: Record<string, any>;
}

export function DataQualityPanel({ 
  validationResults, 
  qualityScore, 
  showDetails = false,
  examData
}: DataQualityPanelProps) {
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const summary = getValidationSummary(validationResults);
  
  // 計算研究資格
  const researchEligibility = examData 
    ? evaluateResearchEligibility(examData, qualityScore.overall)
    : null;
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };
  
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'error':
        return <Badge variant="destructive" className="text-xs">錯誤</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500 text-white text-xs">警告</Badge>;
      case 'info':
        return <Badge variant="secondary" className="text-xs">提示</Badge>;
      default:
        return null;
    }
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 90) return '優秀';
    if (score >= 80) return '良好';
    if (score >= 60) return '尚可';
    if (score >= 40) return '偏低';
    return '不足';
  };
  
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          📊 資料品質檢查
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 品質評分概覽 */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className={`text-2xl font-bold ${getScoreColor(qualityScore.overall)}`}>
              {qualityScore.overall}
            </div>
            <div className="text-xs text-muted-foreground">總分</div>
            <Badge variant="outline" className="mt-1 text-xs">
              {getScoreLabel(qualityScore.overall)}
            </Badge>
          </div>
          
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <div className="flex items-center justify-center gap-1">
              <Target className="h-3 w-3 text-muted-foreground" />
              <span className={`text-lg font-semibold ${getScoreColor(qualityScore.completeness)}`}>
                {qualityScore.completeness}%
              </span>
            </div>
            <div className="text-xs text-muted-foreground">完整度</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {qualityScore.details.filledFields}/{qualityScore.details.totalFields} 項
            </div>
          </div>
          
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <div className="flex items-center justify-center gap-1">
              <Shield className="h-3 w-3 text-muted-foreground" />
              <span className={`text-lg font-semibold ${getScoreColor(qualityScore.consistency)}`}>
                {qualityScore.consistency}%
              </span>
            </div>
            <div className="text-xs text-muted-foreground">一致性</div>
            {summary.errors + summary.warnings > 0 && (
              <div className="text-[10px] text-yellow-600 mt-0.5">
                {summary.errors + summary.warnings} 項待確認
              </div>
            )}
          </div>
          
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <span className={`text-lg font-semibold ${getScoreColor(qualityScore.reliability)}`}>
                {qualityScore.reliability}%
              </span>
            </div>
            <div className="text-xs text-muted-foreground">信度</div>
          </div>
        </div>
        
        {/* 研究資格標示 */}
        {researchEligibility && (
          <ResearchEligibilityBadge eligibility={researchEligibility} />
        )}
        
        {/* 快速狀態列 */}
        <div className="flex flex-wrap gap-2 items-center justify-between bg-muted/30 rounded-lg p-2">
          <div className="flex gap-3">
            <div className="flex items-center gap-1">
              {summary.errors === 0 ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
              <span className="text-sm">
                測量邏輯：{summary.errors === 0 ? '正常' : `${summary.errors} 個錯誤`}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              {summary.warnings === 0 ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-sm">
                生理合理性：{summary.warnings === 0 ? '正常' : `${summary.warnings} 個警告`}
              </span>
            </div>
            
            {summary.infos > 0 && (
              <div className="flex items-center gap-1">
                <Info className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">
                  {summary.infos} 個提示
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* 詳細內容區 */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span>{isExpanded ? '收起詳細' : '展開詳細'}</span>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-3 space-y-3">
            {/* 驗證問題列表 */}
            {validationResults.filter(r => !r.isValid).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">🔍 檢測到的問題</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {validationResults.filter(r => !r.isValid).map((result, index) => (
                    <div 
                      key={index}
                      className={`flex items-start gap-2 p-2 rounded-md text-sm ${
                        result.severity === 'error' ? 'bg-destructive/10' :
                        result.severity === 'warning' ? 'bg-yellow-500/10' :
                        'bg-blue-500/10'
                      }`}
                    >
                      {getSeverityIcon(result.severity || 'info')}
                      <div className="flex-1">
                        <span>{result.message}</span>
                      </div>
                      {getSeverityBadge(result.severity || 'info')}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 研究資格詳細資訊 */}
            {researchEligibility && (
              <ResearchEligibilityDetails eligibility={researchEligibility} />
            )}
            
            {/* 建議補充項目 */}
            {qualityScore.details.missingRecommended.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">📋 建議補充項目</h4>
                <div className="flex flex-wrap gap-1.5">
                  {qualityScore.details.missingRecommended.slice(0, 6).map((item, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                  {qualityScore.details.missingRecommended.length > 6 && (
                    <Badge variant="secondary" className="text-xs">
                      +{qualityScore.details.missingRecommended.length - 6} 項
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  補充以上項目可提高分析準確度與信度評分
                </p>
              </div>
            )}
            
            {/* 無問題時的正面訊息 */}
            {validationResults.filter(r => !r.isValid).length === 0 && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-700">
                  所有測量數據通過邏輯與生理合理性檢查！
                </span>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

/**
 * 研究資格標示組件
 */
interface ResearchEligibilityBadgeProps {
  eligibility: ResearchEligibility;
}

function ResearchEligibilityBadge({ eligibility }: ResearchEligibilityBadgeProps) {
  const { tierInfo, isEligible, coreCompleteness, qualityScore } = eligibility;
  
  return (
    <div className={`p-3 rounded-lg border ${tierInfo.borderColor} ${tierInfo.bgColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className={`h-5 w-5 ${tierInfo.color}`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">研究資格：</span>
              <Badge className={`${tierInfo.bgColor} ${tierInfo.color} border ${tierInfo.borderColor}`}>
                <Award className="h-3 w-3 mr-1" />
                {tierInfo.labelZh}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEligible ? tierInfo.descriptionZh : '資料未達最低研究標準，需補充核心變數'}
            </p>
          </div>
        </div>
        <div className="text-right text-xs">
          <div>核心完整度：<span className="font-semibold">{coreCompleteness}%</span></div>
          <div>品質分數：<span className="font-semibold">{qualityScore}</span></div>
        </div>
      </div>
    </div>
  );
}

/**
 * 研究資格詳細資訊組件
 */
interface ResearchEligibilityDetailsProps {
  eligibility: ResearchEligibility;
}

function ResearchEligibilityDetails({ eligibility }: ResearchEligibilityDetailsProps) {
  const { tierInfo, missingCoreFields, missingOptionalFields, details } = eligibility;
  const tierSummary = getTierSummary();
  
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <FlaskConical className="h-4 w-4" />
        研究資料分級標準
      </h4>
      
      {/* 三層分級說明 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {tierSummary.filter(t => t.tier !== 'insufficient').map(({ tier, info, criteria }) => (
          <div 
            key={tier}
            className={`p-2 rounded-lg border text-xs ${
              eligibility.tier === tier 
                ? `${info.borderColor} ${info.bgColor}` 
                : 'border-border bg-muted/30'
            }`}
          >
            <div className={`font-semibold ${eligibility.tier === tier ? info.color : 'text-muted-foreground'}`}>
              {info.labelZh}
            </div>
            <div className="text-muted-foreground mt-0.5">
              {criteria}
            </div>
          </div>
        ))}
      </div>
      
      {/* 缺失欄位 */}
      {missingCoreFields.length > 0 && (
        <div className="space-y-1.5">
          <h5 className="text-xs font-medium text-destructive">⚠️ 缺少核心變數 ({missingCoreFields.length} 項)</h5>
          <div className="flex flex-wrap gap-1">
            {missingCoreFields.map((field, i) => (
              <Badge key={i} variant="destructive" className="text-xs">
                {field}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {missingOptionalFields.length > 0 && (
        <div className="space-y-1.5">
          <h5 className="text-xs font-medium text-muted-foreground">📋 缺少選填變數 ({missingOptionalFields.length} 項)</h5>
          <div className="flex flex-wrap gap-1">
            {missingOptionalFields.map((field, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {field}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* 適用場景 */}
      {eligibility.isEligible && (
        <div className="space-y-1.5">
          <h5 className="text-xs font-medium">✓ 適用場景</h5>
          <ul className="text-xs text-muted-foreground list-disc list-inside">
            {tierInfo.useCasesZh.map((useCase, i) => (
              <li key={i}>{useCase}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * 小型驗證提示元件，用於欄位旁顯示
 */
interface FieldValidationHintProps {
  result: ValidationResult | null;
}

export function FieldValidationHint({ result }: FieldValidationHintProps) {
  if (!result || result.isValid) return null;
  
  const getColorClass = () => {
    switch (result.severity) {
      case 'error': return 'text-destructive';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-muted-foreground';
    }
  };
  
  const getIcon = () => {
    switch (result.severity) {
      case 'error': return <AlertCircle className="h-3 w-3" />;
      case 'warning': return <AlertTriangle className="h-3 w-3" />;
      case 'info': return <Info className="h-3 w-3" />;
      default: return null;
    }
  };
  
  return (
    <div className={`flex items-center gap-1 text-xs mt-1 ${getColorClass()}`}>
      {getIcon()}
      <span>{result.message}</span>
    </div>
  );
}

/**
 * 迷你品質指示器
 */
interface QualityIndicatorProps {
  score: number;
  size?: 'sm' | 'md';
}

export function QualityIndicator({ score, size = 'sm' }: QualityIndicatorProps) {
  const getColor = () => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const sizeClass = size === 'sm' ? 'h-1.5 w-16' : 'h-2 w-24';
  
  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeClass} bg-muted rounded-full overflow-hidden`}>
        <div 
          className={`h-full ${getColor()} transition-all duration-300`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{score}%</span>
    </div>
  );
}
