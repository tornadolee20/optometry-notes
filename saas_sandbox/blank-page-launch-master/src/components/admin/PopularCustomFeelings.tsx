import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";

interface PopularCustomFeelingsProps {
  storeId: string;
}

interface FeelingCount {
  feeling: string;
  count: number;
}

export const PopularCustomFeelings = ({ storeId }: PopularCustomFeelingsProps) => {
  const [feelings, setFeelings] = useState<FeelingCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeelings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("customer_keyword_logs")
          .select("custom_feelings")
          .eq("store_id", storeId)
          .not("custom_feelings", "is", null)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) {
          console.error("Error fetching custom feelings:", error);
          return;
        }

        // Count occurrences
        const countMap = new Map<string, number>();
        for (const row of data || []) {
          const arr = row.custom_feelings as string[] | null;
          if (!arr) continue;
          for (const f of arr) {
            if (f && f.trim()) {
              const key = f.trim();
              countMap.set(key, (countMap.get(key) || 0) + 1);
            }
          }
        }

        const sorted = Array.from(countMap.entries())
          .map(([feeling, count]) => ({ feeling, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20);

        setFeelings(sorted);
      } catch (e) {
        console.error("Failed to fetch custom feelings:", e);
      } finally {
        setIsLoading(false);
      }
    };

    if (storeId) fetchFeelings();
  }, [storeId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          載入中...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          熱門自訂感受
          <Badge variant="outline" className="ml-auto text-xs font-normal">
            最近 50 筆
          </Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          顧客最常輸入的自訂感受詞彙，可作為關鍵字模板微調參考
        </p>
      </CardHeader>
      <CardContent>
        {feelings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            尚無自訂感受資料
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {feelings.map((item, i) => (
              <Badge
                key={i}
                variant="secondary"
                className={`px-3 py-1.5 text-sm ${
                  i < 3
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {i < 3 && <TrendingUp className="w-3 h-3 mr-1" />}
                {item.feeling}
                <span className="ml-1.5 text-xs opacity-60">×{item.count}</span>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
