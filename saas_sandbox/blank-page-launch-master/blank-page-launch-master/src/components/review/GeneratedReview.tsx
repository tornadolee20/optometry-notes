
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import type { Store } from "@/types/store";
import { isEducationInstitution } from "@/utils/keyword-utils";

interface GeneratedReviewProps {
  review: string;
  store: Store;
  onRegenerate?: () => void;
}

export const GeneratedReview = ({ review, store }: GeneratedReviewProps) => {
  const isEducation = isEducationInstitution(store.store_name, store.industry);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(review);
      toast({
        title: "成功",
        description: "評論已複製到剪貼簿",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "錯誤",
        description: "無法複製評論",
      });
    }
  };

  const handleRedirectToGoogleMaps = () => {
    if (!store.google_review_url) {
      toast({
        variant: "destructive",
        title: "錯誤",
        description: isEducation ? "此教育機構尚未設置 Google 評論連結" : "此商家尚未設置 Google 評論連結",
      });
      return;
    }
    
    // 複製評論內容到剪貼簿
    handleCopyToClipboard();
    
    // 顯示提示訊息
    toast({
      title: "提示",
      description: "點擊後，您將前往 Google Maps，請在評論欄貼上這段內容！",
    });
    
    // 在新分頁開啟商家的 Google 評論連結
    window.open(store.google_review_url, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="min-h-[200px] rounded-lg border p-4 bg-card text-card-foreground shadow-sm">
        <p className="whitespace-pre-wrap text-base">{review}</p>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <div className="container px-4 max-w-2xl mx-auto">
          <Button
            className="w-full h-[56px] text-lg font-medium rounded-xl"
            size="xl"
            onClick={handleRedirectToGoogleMaps}
          >
            發佈到 Google {isEducation ? "學校" : "商家"}評論
          </Button>
        </div>
      </div>
      
      <div className="h-24" />
    </div>
  );
};
