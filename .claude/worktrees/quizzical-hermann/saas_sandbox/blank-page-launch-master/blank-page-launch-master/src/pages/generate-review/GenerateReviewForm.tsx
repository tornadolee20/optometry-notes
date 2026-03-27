
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Star, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { Store, Keyword } from '@/types/store';

interface GenerateReviewFormProps {
  store: Store;
  keywords: Keyword[];
  setKeywords: React.Dispatch<React.SetStateAction<Keyword[]>>;
}

export const GenerateReviewForm: React.FC<GenerateReviewFormProps> = ({ 
  store, 
  keywords
}) => {
  const { toast } = useToast();
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [generatedReview, setGeneratedReview] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleKeywordToggle = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const handleGenerateReview = async () => {
    if (selectedKeywords.length === 0) {
      toast({
        title: "請選擇關鍵字",
        description: "至少選擇一個關鍵字來生成評論",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI review generation
    setTimeout(() => {
      const sampleReview = `我最近去了${store.store_name}，真的很棒！${selectedKeywords.join('、')}都讓我印象深刻。店家的服務很用心，環境也很舒適，推薦大家來體驗看看！`;
      setGeneratedReview(sampleReview);
      setIsGenerating(false);
      
      toast({
        title: "評論生成完成！",
        description: "您可以複製並使用這則評論",
      });
    }, 2000);
  };

  const groupedKeywords = keywords.reduce((acc, keyword) => {
    if (!acc[keyword.category]) {
      acc[keyword.category] = [];
    }
    acc[keyword.category].push(keyword);
    return acc;
  }, {} as Record<string, Keyword[]>);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Store Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            {store.store_name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{store.address}</p>
          {store.description && (
            <p className="mt-2 text-sm text-gray-500">{store.description}</p>
          )}
        </CardContent>
      </Card>

      {/* Keyword Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            選擇關鍵字
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(groupedKeywords).map(([category, categoryKeywords]) => (
            <div key={category}>
              <h4 className="font-medium mb-2 capitalize">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {categoryKeywords.map((keyword) => (
                  <Badge
                    key={keyword.id}
                    variant={selectedKeywords.includes(keyword.keyword) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleKeywordToggle(keyword.keyword)}
                  >
                    {keyword.keyword}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="text-center">
        <Button
          onClick={handleGenerateReview}
          disabled={isGenerating || selectedKeywords.length === 0}
          size="lg"
          className="min-w-48"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4 mr-2" />
              生成評論
            </>
          )}
        </Button>
      </div>

      {/* Generated Review */}
      {generatedReview && (
        <Card>
          <CardHeader>
            <CardTitle>生成的評論</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedReview}
              onChange={(e) => setGeneratedReview(e.target.value)}
              rows={4}
              className="w-full"
            />
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => navigator.clipboard.writeText(generatedReview)}
                variant="outline"
              >
                複製評論
              </Button>
              <Button
                onClick={() => setGeneratedReview('')}
                variant="outline"
              >
                清除
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
