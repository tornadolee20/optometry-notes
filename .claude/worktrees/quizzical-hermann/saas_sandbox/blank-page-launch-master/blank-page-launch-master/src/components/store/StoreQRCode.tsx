
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import { getQRCodeBaseUrl, shouldShowEnvWarning } from "@/utils/constants";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Props {
  storeId: string;
  reviewUrl: string;
}

export const StoreQRCode = ({ reviewUrl }: Props) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const baseUrl = getQRCodeBaseUrl();
  
  // reviewUrl 已經是格式化的店家編號 (如 "00011")，直接組成完整URL
  const fullUrl = `${baseUrl}/${reviewUrl}/generate-review`;
  const showWarning = shouldShowEnvWarning();
  
  console.log('🔗 QR Code URL生成:', {
    baseUrl,
    reviewUrl,
    fullUrl,
    timestamp: new Date().toISOString()
  });

  const handleDownload = async () => {
    try {
      if (!qrRef.current) {
        throw new Error("QR Code container not found");
      }

      const canvas = await html2canvas(qrRef.current, {
        backgroundColor: "white",
        scale: 2,
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error("Failed to create image");
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = "qrcode.png";
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "下載成功",
          description: "QR Code 已開始下載",
        });
      }, "image/png", 1.0);

    } catch (error) {
      console.error("Error in download process:", error);
      toast({
        variant: "destructive",
        title: "下載失敗",
        description: "無法下載 QR Code",
      });
    }
  };

  return (
    <>
      {showWarning && (
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            目前生成的 QR Code 指向測試環境 ({baseUrl})。如需正式環境請聯繫管理員。
          </AlertDescription>
        </Alert>
      )}
      
      {/* 移動端測試說明 */}
      <Alert className="mb-4 bg-blue-50 border-blue-200">
        <AlertDescription className="text-sm">
          💡 QR Code 網址: <code className="bg-gray-100 px-1 rounded text-xs">{fullUrl}</code>
          <br />
          手機掃描此QR code即可直接進入評論系統。
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>店家 QR Code</CardTitle>
          <CardDescription>顧客掃描後可快速完成評論</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <div 
            ref={qrRef}
            className="w-[200px] h-[200px] bg-white p-4"
          >
            <QRCodeSVG
              value={fullUrl}
              size={200}
              level="H"
              includeMargin
              style={{ 
                display: 'block',
                width: '100%',
                height: '100%',
                backgroundColor: 'white'
              }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <Button
          variant="outline"
          className="w-full py-6"
          onClick={handleDownload}
        >
          下載 QR Code
        </Button>
      </div>
    </>
  );
};
