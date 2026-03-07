
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const defaultKeywords = [
  "服務態度好", "環境舒適", "價格合理", "食物美味",
  "停車方便", "交通便利", "氣氛佳", "衛生乾淨",
  "份量充足", "服務迅速", "裝潢優雅", "親子友善",
  "寵物友善", "無障礙設施", "專業技術", "值得推薦"
];

const Review = () => {
  const { } = useParams();
  const navigate = useNavigate();
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [generatedReview, setGeneratedReview] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleKeywordSelect = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(prev => prev.filter(k => k !== keyword));
    } else if (selectedKeywords.length < 6) {
      setSelectedKeywords(prev => [...prev, keyword]);
    } else {
      toast.error("最多只能選擇6個關鍵字");
    }
  };

  const generateReview = async () => {
    if (selectedKeywords.length < 3) {
      toast.error("請至少選擇3個關鍵字");
      return;
    }
    
    setIsGenerating(true);
    // TODO: Implement AI review generation
    setTimeout(() => {
      setGeneratedReview("這家店的服務態度非常好，環境也很舒適。最讓人驚喜的是價格相當合理，物超所值。店內裝潢優雅，整體氣氛佳，是個值得推薦的好地方。下次有機會一定會再來！");
      setIsGenerating(false);
    }, 2000);
  };

  const publishToGoogle = () => {
    // TODO: Implement Google review publishing
    toast.success("已成功發布評論！");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto space-y-6"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">選擇關鍵字</h1>
          <p className="text-gray-600">請選擇3-6個關鍵字</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {defaultKeywords.map((keyword) => (
            <Badge
              key={keyword}
              variant={selectedKeywords.includes(keyword) ? "default" : "outline"}
              className={`text-center py-3 cursor-pointer transition-all ${
                selectedKeywords.includes(keyword)
                  ? "bg-black hover:bg-gray-800"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => handleKeywordSelect(keyword)}
            >
              {keyword}
            </Badge>
          ))}
        </div>

        {!generatedReview ? (
          <Button
            onClick={generateReview}
            disabled={selectedKeywords.length < 3 || isGenerating}
            className="w-full py-6"
          >
            {isGenerating ? "生成中..." : "生成評論"}
          </Button>
        ) : (
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-4 rounded-lg shadow"
            >
              <p className="text-gray-800">{generatedReview}</p>
            </motion.div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => setGeneratedReview("")}
                className="py-6"
              >
                重新生成
              </Button>
              <Button
                onClick={publishToGoogle}
                className="py-6 bg-black hover:bg-gray-800"
              >
                發布評論
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Review;
