import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lightbulb, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export const KeywordGuideHint = () => {
  const [expanded, setExpanded] = useState(false);
  const { storeId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-medium text-emerald-800">
            關鍵字設定小提示
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-emerald-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-emerald-500" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 text-sm text-emerald-700">
          <ul className="list-disc pl-5 space-y-1">
            <li>每家店最多 <strong>48 個</strong>關鍵字，建議每個 3～7 字</li>
            <li>可手動輸入、使用 <strong>AI 智能建議</strong>、或批次匯入 CSV</li>
            <li>設定越豐富，AI 生成的評論越精準有特色</li>
            <li>修改後<strong>立即生效</strong>，顧客掃 QR Code 即可看到</li>
          </ul>
          <Button
            variant="link"
            size="sm"
            className="text-emerald-600 hover:text-emerald-800 p-0 h-auto"
            onClick={() => navigate(`/store/${storeId}/guide`)}
          >
            <BookOpen className="w-3.5 h-3.5 mr-1" />
            查看完整操作手冊
          </Button>
        </div>
      )}
    </div>
  );
};
