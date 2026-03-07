import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Heart, 
  Lightbulb, 
  Target, 
  Users,
  Zap,
  Info
} from "lucide-react";

interface PsychologyPrompt {
  id: string;
  name: string;
  description: string;
  category: string;
  impact: 'high' | 'medium' | 'low';
  examples: string[];
  enabled: boolean;
}

interface PsychologyPromptsProps {
  onPromptsChange: (prompts: PsychologyPrompt[]) => void;
  selectedPrompts: string[];
  className?: string;
}

export const PsychologyPrompts = ({ 
  onPromptsChange, 
  selectedPrompts = [], 
  className 
}: PsychologyPromptsProps) => {
  const [prompts, setPrompts] = useState<PsychologyPrompt[]>([
    {
      id: 'social-proof',
      name: '社會認同',
      description: '利用他人的行為和選擇來影響決定',
      category: 'social',
      impact: 'high',
      examples: [
        '很多客戶都選擇這個產品',
        '朋友推薦才知道這家店',
        '看到評價很好才決定購買'
      ],
      enabled: selectedPrompts?.includes('social-proof') ?? false
    },
    {
      id: 'scarcity',
      name: '稀缺性',
      description: '強調產品或機會的稀有性和有限性',
      category: 'urgency',
      impact: 'high',
      examples: [
        '限量商品很快就售完了',
        '難得遇到這樣的優惠',
        '這個季節的限定商品'
      ],
      enabled: selectedPrompts?.includes('scarcity') ?? false
    },
    {
      id: 'authority',
      name: '權威性',
      description: '引用專家意見或權威機構的認可',
      category: 'credibility',
      impact: 'medium',
      examples: [
        '專業人士推薦的品牌',
        '獲得多項認證的產品',
        '業界領導品牌'
      ],
      enabled: selectedPrompts?.includes('authority') ?? false
    },
    {
      id: 'reciprocity',
      name: '互惠原則',
      description: '強調獲得的額外價值或服務',
      category: 'value',
      impact: 'medium',
      examples: [
        '店家還額外贈送小禮物',
        '超出期待的服務品質',
        '比預期得到更多'
      ],
      enabled: selectedPrompts?.includes('reciprocity') ?? false
    },
    {
      id: 'commitment',
      name: '承諾一致性',
      description: '展現對品牌或產品的忠誠度',
      category: 'loyalty',
      impact: 'low',
      examples: [
        '一直都是這個品牌的忠實客戶',
        '再次選擇這家店',
        '持續回購的原因'
      ],
      enabled: selectedPrompts?.includes('commitment') ?? false
    },
    {
      id: 'liking',
      name: '喜好原則',
      description: '強調個人喜好和情感連結',
      category: 'emotion',
      impact: 'medium',
      examples: [
        '完全符合我的喜好',
        '一見鍾情的設計',
        '讓人心情愉悅的體驗'
      ],
      enabled: selectedPrompts?.includes('liking') ?? false
    }
  ]);

  const handlePromptToggle = (promptId: string) => {
    const updatedPrompts = prompts.map(prompt => 
      prompt.id === promptId 
        ? { ...prompt, enabled: !prompt.enabled }
        : prompt
    );
    
    setPrompts(updatedPrompts);
    onPromptsChange(updatedPrompts);
  };

  const categories = [
    { id: 'social', name: '社交影響', icon: <Users className="w-4 h-4" />, color: 'bg-blue-100 text-blue-800' },
    { id: 'urgency', name: '緊迫感', icon: <Zap className="w-4 h-4" />, color: 'bg-red-100 text-red-800' },
    { id: 'credibility', name: '可信度', icon: <Target className="w-4 h-4" />, color: 'bg-green-100 text-green-800' },
    { id: 'value', name: '價值感', icon: <Lightbulb className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-800' },
    { id: 'loyalty', name: '忠誠度', icon: <Heart className="w-4 h-4" />, color: 'bg-purple-100 text-purple-800' },
    { id: 'emotion', name: '情感連結', icon: <Brain className="w-4 h-4" />, color: 'bg-pink-100 text-pink-800' }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactLabel = (impact: string) => {
    switch (impact) {
      case 'high': return '高影響';
      case 'medium': return '中影響';
      case 'low': return '低影響';
      default: return '未知';
    }
  };

  const enabledPrompts = prompts.filter(p => p.enabled);

  return (
    <div className={`space-y-6 ${className || ''}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            心理學提示詞
          </CardTitle>
          <CardDescription>
            選擇適合的心理學原則來增強評論的說服力和真實感
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              已啟用 {enabledPrompts.length} 個心理學提示
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-blue-600">影響評論的心理說服力</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {categories.map((category) => {
          const categoryPrompts = prompts.filter(p => p.category === category.id);
          
          return (
            <Card key={category.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    {category.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base">{category.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {categoryPrompts.filter(p => p.enabled).length} / {categoryPrompts.length} 個已啟用
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <Separator />
              
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {categoryPrompts.map((prompt) => (
                    <div key={prompt.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Switch
                            id={prompt.id}
                            checked={prompt.enabled}
                            onCheckedChange={() => handlePromptToggle(prompt.id)}
                          />
                          <div>
                            <Label htmlFor={prompt.id} className="text-sm font-medium cursor-pointer">
                              {prompt.name}
                            </Label>
                            <p className="text-xs text-gray-600 mt-1">
                              {prompt.description}
                            </p>
                          </div>
                        </div>
                        <Badge className={getImpactColor(prompt.impact)}>
                          {getImpactLabel(prompt.impact)}
                        </Badge>
                      </div>
                      
                      {prompt.enabled && (
                        <div className="ml-8 p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs font-medium text-gray-700 mb-2">
                            應用範例：
                          </div>
                          <div className="space-y-1">
                            {prompt.examples.map((example, index) => (
                              <div 
                                key={index}
                                className="text-xs text-gray-600 italic"
                              >
                                "• {example}"
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {prompt !== categoryPrompts[categoryPrompts.length - 1] && (
                        <Separator className="my-3" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {enabledPrompts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">啟用的心理學提示摘要</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {enabledPrompts.map((prompt) => {
                const category = categories.find(c => c.id === prompt.category);
                return (
                  <div 
                    key={prompt.id}
                    className="flex items-center gap-2 p-2 rounded-lg border"
                  >
                    {category && (
                      <div className={`p-1 rounded ${category.color}`}>
                        {category.icon}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium">{prompt.name}</div>
                      <div className="text-xs text-gray-500">{category?.name}</div>
                    </div>
                    <Badge className={getImpactColor(prompt.impact)}>
                      {getImpactLabel(prompt.impact)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};