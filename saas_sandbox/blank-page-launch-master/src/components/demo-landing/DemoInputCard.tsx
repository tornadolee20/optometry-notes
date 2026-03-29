import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";

interface DemoInputCardProps {
  onGenerate: (input: string, industry: string | null, industryLabel: string | null) => void;
  isGenerating: boolean;
}

const INDUSTRIES = [
{ value: "restaurant", label: "餐廳" },
{ value: "cafe", label: "咖啡廳" },
{ value: "retail", label: "零售店" },
{ value: "beauty", label: "美容美髮" },
{ value: "hotel", label: "飯店住宿" },
{ value: "fitness", label: "健身運動" },
{ value: "medical", label: "醫療診所" },
{ value: "education", label: "教育培訓" },
{ value: "entertainment", label: "娛樂休閒" },
{ value: "automotive", label: "汽車服務" }];


const DemoInputCard = ({ onGenerate, isGenerating }: DemoInputCardProps) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [industryLabel, setIndustryLabel] = useState<string | null>(null);

  const handleIndustryChange = (value: string) => {
    setSelectedIndustry(value);
    const found = INDUSTRIES.find((i) => i.value === value);
    setIndustryLabel(found?.label ?? null);
  };

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    onGenerate(inputValue, selectedIndustry, industryLabel);
  };


  return (
    <Card className="p-6">
      <div className="space-y-4">
        <Select onValueChange={handleIndustryChange}>
          <SelectTrigger>
            <SelectValue placeholder="選擇產業類型" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map((ind) => (
              <SelectItem key={ind.value} value={ind.value}>{ind.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          placeholder="輸入您的店家體驗..."
        />
        <Button onClick={handleSubmit} disabled={isGenerating || !inputValue.trim()} className="w-full">
          {isGenerating ? "生成中..." : "生成評論"}
        </Button>
      </div>
    </Card>
  );
};

export default DemoInputCard;