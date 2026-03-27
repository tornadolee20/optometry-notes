
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import QrScanner from "qr-scanner";

const ScanQR = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    if (videoRef.current && isScanning) {
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => handleScan(result.data),
        {
          onDecodeError: (err) => console.log("QR decode error:", err),
          preferredCamera: 'environment',
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      qrScannerRef.current.start().catch((err) => {
        handleError(err);
      });

      return () => {
        if (qrScannerRef.current) {
          qrScannerRef.current.stop();
          qrScannerRef.current.destroy();
        }
      };
    }
  }, [isScanning]);

  const handleError = (err: any) => {
    setError("無法啟動相機，請確認權限設定");
    console.error("QR Scanner error:", err);
    toast({
      variant: "destructive",
      title: "掃描錯誤",
      description: "無法啟動相機，請確認權限設定"
    });
  };

  const handleScan = (data: string) => {
    if (data) {
      try {
        // 停止掃描以避免重複處理
        setIsScanning(false);
        if (qrScannerRef.current) {
          qrScannerRef.current.stop();
        }
        
        const storeId = data;
        // 確保 storeId 是一個數字
        const storeNumber = parseInt(storeId, 10);
        
        if (isNaN(storeNumber)) {
          throw new Error("無效的店家代碼");
        }

        console.log("Scanned store number:", storeNumber);
        navigate(`/${storeNumber}/generate-review`);
        
        toast({
          title: "掃描成功",
          description: "正在前往評論頁面..."
        });
      } catch (error) {
        console.error("QR code processing error:", error);
        setError("無效的 QR Code");
        toast({
          variant: "destructive",
          title: "掃描錯誤",
          description: "無效的 QR Code，請重新掃描"
        });
        // 重新啟動掃描
        setIsScanning(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 relative"
      >
        {isScanning && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
        )}
        
        {!isScanning && (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>正在載入相機...</p>
            </div>
          </div>
        )}
        
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white rounded-lg pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-sm text-center px-4">
              將 QR Code 對準框框內
            </span>
          </div>
        </div>
        
        {error && (
          <div className="absolute bottom-20 left-0 right-0 text-center text-white bg-red-500 p-4">
            {error}
          </div>
        )}
      </motion.div>
      
      <div className="p-4 bg-white rounded-t-3xl">
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          className="w-full py-6"
        >
          返回首頁
        </Button>
      </div>
    </div>
  );
};

export default ScanQR;
