
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, ExternalLink, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getQRCodeBaseUrl, shouldShowEnvWarning } from "@/utils/constants";

interface Props {
  storeId: string;
  storeNumber: string;
  reviewUrl: string;
}

export const ReviewSystemUrl = ({ reviewUrl }: Props) => {
  const { toast } = useToast();
  const baseUrl = getQRCodeBaseUrl();
  const fullUrl = `${baseUrl}/${reviewUrl}/generate-review`;
  const showWarning = shouldShowEnvWarning();

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast({
        title: "複製成功",
        description: "評論系統網址已複製到剪貼簿",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "複製失敗",
        description: "無法複製網址",
      });
    }
  };

  const handleOpenPreview = () => {
    window.open(fullUrl, '_blank');
  };

  return (
    <>
      {showWarning && (
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            注意：您目前在測試環境瀏覽，但網址將指向正式網站 ({baseUrl})，確保顧客可以正常存取。
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
      <CardHeader>
        <CardTitle>評論系統網址</CardTitle>
        <CardDescription>此網址用於生成店家專屬 QR Code</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={fullUrl}
            readOnly
            className="font-mono text-sm bg-gray-50"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyUrl}
            title="複製網址"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleOpenPreview}
            title="在新分頁開啟預覽"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
    </>
  );
};
