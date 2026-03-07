
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PaymentSectionProps {
  transferCode: string;
  onTransferCodeChange: (value: string) => void;
  onTransferCodeSubmit: () => void;
}

export const PaymentSection = ({
  transferCode,
  onTransferCodeChange,
  onTransferCodeSubmit
}: PaymentSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-medium">ATM 轉帳資訊</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">銀行</p>
              <p className="font-medium">中國信託銀行</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">分行</p>
              <p className="font-medium">中崙分行</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">戶名</p>
            <p className="font-medium">李錫彥</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">銀行帳號</p>
            <p className="font-mono text-lg font-bold text-blue-700">093-53405060-1</p>
          </div>
          <p className="text-sm text-gray-500">轉帳完成後，請輸入您的轉帳帳號末 5 碼以供管理員確認</p>
          <div className="flex gap-2">
            <Input
              value={transferCode}
              onChange={(e) => onTransferCodeChange(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="轉帳代碼後5碼"
              maxLength={5}
              className="font-mono"
              pattern="[0-9]{5}"
            />
            <Button 
              onClick={onTransferCodeSubmit}
              disabled={transferCode.length !== 5}
            >
              提交
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            請完成轉帳後，輸入ATM顯示的轉帳代碼後五碼數字
          </p>
        </div>
      </div>

      <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
        <div className="flex items-center gap-2 text-gray-500">
          <h3 className="font-medium">信用卡支付</h3>
          <Badge variant="outline">即將開放</Badge>
        </div>
        <p className="text-sm text-gray-500">
          信用卡支付功能即將推出，敬請期待！目前請使用 ATM 轉帳方式付款。
        </p>
      </div>
    </div>
  );
};
