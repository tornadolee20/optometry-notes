
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
interface StatusAlertsProps {
  payment_status?: 'pending' | 'confirmed' | 'failed';
  daysUntilExpiry: number;
  auto_renew: boolean;
  isExpired: boolean;
}

export const StatusAlerts = ({
  payment_status,
  daysUntilExpiry,
  auto_renew,
  isExpired
}: StatusAlertsProps) => {
  return (
    <>
      {payment_status === 'pending' && (
        <Alert>
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle>付款確認中</AlertTitle>
          <AlertDescription className="text-gray-600">
            我們將在 24 小時內確認您的付款狀態。如有問題，請聯繫客服。
          </AlertDescription>
        </Alert>
      )}

      {daysUntilExpiry <= 7 && !auto_renew && !isExpired && (
        <Alert>
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-yellow-700">訂閱即將到期</AlertTitle>
          <AlertDescription className="text-yellow-600">
            建議開啟自動續費以確保服務不中斷。方案到期後，將無法使用評論生成和QR Code下載等功能。
          </AlertDescription>
          <div className="mt-3">
            <Button asChild size="sm" variant="outline">
              <Link to="/pricing">前往訂購頁</Link>
            </Button>
          </div>
        </Alert>
      )}

      {isExpired && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>訂閱已到期</AlertTitle>
          <AlertDescription>
            您的訂閱已經到期，部分功能將無法使用。請盡快續約以恢復完整功能。
          </AlertDescription>
          <div className="mt-3">
            <Button asChild size="sm" variant="default">
              <Link to="/pricing">立即續訂</Link>
            </Button>
          </div>
        </Alert>
      )}
    </>
  );
};
