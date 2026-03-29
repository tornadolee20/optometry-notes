import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ResetKeywordsButtonProps {
  storeId: string;
  keywordCount: number;
  onReset: () => void;
}

export const ResetKeywordsButton = ({
  storeId,
  keywordCount,
  onReset,
}: ResetKeywordsButtonProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmStep, setConfirmStep] = useState(0);

  const handleReset = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('store_keywords')
        .delete()
        .eq('store_id', storeId);

      if (error) throw error;

      toast({
        title: "已重置",
        description: `已刪除所有 ${keywordCount} 個關鍵字`,
      });
      
      setConfirmStep(0);
      onReset();
    } catch (error) {
      console.error('重置關鍵字失敗:', error);
      toast({
        variant: "destructive",
        title: "重置失敗",
        description: "請稍後重試",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (keywordCount === 0) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          重置所有關鍵字
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        {confirmStep === 0 ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                確定要重置所有關鍵字？
              </AlertDialogTitle>
              <AlertDialogDescription>
                此操作將刪除您設定的 <strong>{keywordCount}</strong> 個關鍵字，
                <span className="text-red-600 font-medium">刪除後無法復原</span>。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmStep(0)}>取消</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={() => setConfirmStep(1)}
              >
                我確定要刪除
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                最後確認
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                您即將<strong className="text-red-600">永久刪除</strong>所有 {keywordCount} 個關鍵字。
                <br /><br />
                這將影響您的評論生成品質，確定要繼續嗎？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmStep(0)}>返回</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReset}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "刪除中..." : "確認刪除全部"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};
