
import { ChartContainer } from "@/components/ui/chart";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import type { Keyword } from "@/types/store";

interface KeywordChartProps {
  keywords: Keyword[];
}

export const KeywordChart = ({ keywords }: KeywordChartProps) => {
  const chartData = keywords
    .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
    .slice(0, 5)
    .map(keyword => ({
      name: keyword.keyword,
      value: keyword.usage_count,
    }));

  if (chartData.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">熱門關鍵字統計</h3>
      <div className="h-48">
        <ChartContainer config={{}} className="w-full">
          <RechartsBarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" name="使用次數" />
          </RechartsBarChart>
        </ChartContainer>
      </div>
    </div>
  );
};
