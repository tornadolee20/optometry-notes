
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { KeywordInput } from "./keyword-manager/KeywordInput";
import { KeywordList } from "./keyword-manager/KeywordList";
import { useStoreKeywords } from "@/hooks/use-store-keywords";
import { regenerateKeywords } from "@/utils/regenerate-keywords";
import { 
  getCurrentUserPlan, 
  validateOperation, 
  SUBSCRIPTION_LIMITS, 
  PLAN_NAMES,
  getUsagePercentage,
  getRemainingCount,
  getSuggestedUpgrade,
  type SubscriptionPlan
} from "@/utils/subscription-limits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, Crown, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  storeId: string;
}

export const KeywordManager = ({ storeId }: Props) => {
  const { toast } = useToast();
  const [newKeyword, setNewKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<'service' | 'environment' | 'product' | 'general' | 'area'>('general');
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>('monthly');
  const {
    keywords,
    isLoading,
    fetchKeywords,
    addKeyword,
    deleteKeyword
  } = useStoreKeywords(storeId);
  
  // 獲取用戶當前方案
  useEffect(() => {
    const loadPlan = async () => {
      const plan = await getCurrentUserPlan(storeId);
      setCurrentPlan(plan);
    };
    loadPlan();
  }, [storeId]);

  // 監聽訂閱狀態變化，定期檢查
  useEffect(() => {
    const checkPlanUpdate = async () => {
      const plan = await getCurrentUserPlan(storeId);
      if (plan !== currentPlan) {
        setCurrentPlan(plan);
        toast({
          title: "方案已更新",
          description: `您的方案已更新為 ${PLAN_NAMES[plan]}`,
        });
      }
    };

    const interval = setInterval(checkPlanUpdate, 30000); // 每30秒檢查一次
    return () => clearInterval(interval);
  }, [storeId, currentPlan, toast]);
  const currentLimit = SUBSCRIPTION_LIMITS[currentPlan].maxKeywords;
  // 硬性上限：每家店最多 48 個關鍵字（不論方案）
  const HARD_CAP = 48;
  const effectiveLimit = HARD_CAP;
  const usagePercentage = getUsagePercentage(keywords.length, effectiveLimit);
  const remainingCount = getRemainingCount(keywords.length, effectiveLimit);
  const suggestedPlan = getSuggestedUpgrade(currentPlan);

  const handleAddKeyword = async () => {
    const trimmed = newKeyword.trim();
    if (!trimmed) return;

    // 文字長度限制：3~7 字
    if (trimmed.length < 3 || trimmed.length > 7) {
      toast({
        variant: "destructive",
        title: "格式不符",
        description: "關鍵字長度需為 3~7 個字",
      });
      return;
    }

    // 硬性上限：每家店最多 48 個
    if (keywords.length >= effectiveLimit) {
      toast({
        variant: "destructive",
        title: "已達上限",
        description: `每家店最多可建立 ${HARD_CAP} 個關鍵字`,
      });
      return;
    }

    // 仍保留方案驗證（若有額外方案限制）
    const isValid = await validateOperation(storeId, 'add_keyword', keywords.length);
    if (!isValid) {
      toast({
        variant: "destructive",
        title: "已達使用限制",
        description: `您的${PLAN_NAMES[currentPlan]}方案已達到 ${currentLimit} 個關鍵字的限制`,
      });
      return;
    }

    const result = await addKeyword(trimmed, selectedCategory);
    if (result) {
      setNewKeyword("");

      // 當接近上限時提醒用戶
      if (keywords.length + 1 >= Math.floor(effectiveLimit * 0.8)) {
        toast({
          title: "提醒",
          description: `您已使用了 ${keywords.length + 1}/${effectiveLimit} 個關鍵字`,
        });
      }
    }
  };

  const handleRegenerateKeywords = async () => {
    try {
      await regenerateKeywords(storeId);
      await fetchKeywords();
      
      toast({
        title: "成功",
        description: "已更新關鍵字組合",
      });
    } catch (error) {
      console.error('Error regenerating keywords:', error);
      toast({
        variant: "destructive",
        title: "錯誤",
        description: "無法更新關鍵字組合",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              真實感受管理
              <Badge className={`${
                currentPlan === 'trial' ? 'bg-blue-100 text-blue-700' :
                currentPlan === 'monthly' ? 'bg-green-100 text-green-700' :
                currentPlan === 'quarterly' ? 'bg-orange-100 text-orange-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {currentPlan === 'trial' && <Zap className="w-3 h-3 mr-1" />}
                {currentPlan === 'monthly' && <Sparkles className="w-3 h-3 mr-1" />}
                {currentPlan === 'quarterly' && <Sparkles className="w-3 h-3 mr-1" />}
                {currentPlan === 'yearly' && <Crown className="w-3 h-3 mr-1" />}
                {PLAN_NAMES[currentPlan]}
              </Badge>
            </CardTitle>
            <CardDescription>管理評論真實感受和優先順序</CardDescription>
          </div>
        </div>
        
        {/* 使用量顯示 */}
        {
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                已使用 {keywords.length}/{effectiveLimit} 個關鍵字
              </span>
              <span className={`font-medium ${
                usagePercentage >= 90 ? 'text-red-600' :
                usagePercentage >= 70 ? 'text-orange-600' :
                'text-green-600'
              }`}>
                {remainingCount > 0 ? `剩餘 ${remainingCount} 個` : '已用完'}
              </span>
            </div>
            <Progress 
              value={usagePercentage} 
              className={`h-2 ${
                usagePercentage >= 90 ? 'bg-red-100' :
                usagePercentage >= 70 ? 'bg-orange-100' :
                'bg-green-100'
              }`}
            />
            
            {/* 升級提示 */}
            {usagePercentage >= 80 && suggestedPlan && currentPlan === 'trial' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800 mb-1">
                      接近使用限制
                    </p>
                    <p className="text-xs text-blue-600">
                      升級到 {PLAN_NAMES[suggestedPlan]} 可獲得 48 個關鍵字額度（最佳配置）
                    </p>
                  </div>
                  <Link to="/pricing">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      升級
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            
            {/* 付費版達到限制的提示 */}
            {usagePercentage >= 95 && currentPlan !== 'trial' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800 mb-1">
                      🎉 關鍵字庫已完整
                    </p>
                    <p className="text-xs text-green-600">
                      48個關鍵字足以覆蓋所有感受面向，可隨時刪除不常用的關鍵字進行優化
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        }
        
        {/* 付費版最佳配置顯示 */}
        {currentPlan !== 'trial' && effectiveLimit === 48 && (
          <div className="mt-4">
            <div className={`${
              currentPlan === 'monthly' ? 'bg-green-50 border-green-200' :
              currentPlan === 'quarterly' ? 'bg-orange-50 border-orange-200' : 
              'bg-purple-50 border-purple-200'
            } border rounded-lg p-3`}>
              <div className="flex items-center gap-2">
                {currentPlan === 'monthly' ? (
                  <Sparkles className="w-4 h-4 text-green-600" />
                ) : currentPlan === 'quarterly' ? (
                  <Sparkles className="w-4 h-4 text-orange-600" />
                ) : (
                  <Crown className="w-4 h-4 text-purple-600" />
                )}
                <span className={`text-sm font-medium ${
                  currentPlan === 'monthly' ? 'text-green-800' :
                  currentPlan === 'quarterly' ? 'text-orange-800' :
                  'text-purple-800'
                }`}>
                  {PLAN_NAMES[currentPlan]} - 最佳關鍵字配置 (48個)
                </span>
              </div>
              <p className={`text-xs mt-1 ${
                currentPlan === 'monthly' ? 'text-green-600' :
                currentPlan === 'quarterly' ? 'text-orange-600' :
                'text-purple-600'
              }`}>
                48個關鍵字足以覆蓋所有感受面向，可隨時調整優化
              </p>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <KeywordInput
          newKeyword={newKeyword}
          selectedCategory={selectedCategory}
          onKeywordChange={setNewKeyword}
          onCategoryChange={(category) => setSelectedCategory(category as 'service' | 'environment' | 'product' | 'general' | 'area')}
          onAdd={handleAddKeyword}
          disabled={keywords.length >= effectiveLimit}
          limitReached={keywords.length >= effectiveLimit}
          remainingCount={remainingCount}
          storeId={storeId}
          onKeywordSuggest={(keyword, category) => {
            setNewKeyword(keyword);
            setSelectedCategory(category);
          }}
        />
        {isLoading ? (
          <div className="text-center py-4">載入中...</div>
        ) : (
          <KeywordList
            keywords={keywords}
            onDelete={deleteKeyword}
            onRegenerate={handleRegenerateKeywords}
          />
        )}
      </CardContent>
    </Card>
  );
};
