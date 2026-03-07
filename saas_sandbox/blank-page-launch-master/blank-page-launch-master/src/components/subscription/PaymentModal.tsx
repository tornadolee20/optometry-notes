import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BankTransferService } from "@/services/bankTransferService";
import { 
  X, 
  Shield, 
  Check, 
  Loader2
} from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    name: string;
    price: string;
    period: string;
    features: string[];
    planType: "trial" | "monthly" | "quarterly" | "yearly";
    amount?: number;
  };
  onPaymentSuccess: (subscriptionData: any) => void;
}

export const PaymentModal = ({ isOpen, onClose, plan, onPaymentSuccess }: PaymentModalProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardData, setCardData] = useState({
    transferCode: "",
    email: "",
    phone: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { transferCode, email } = cardData;
    
    if (!transferCode || transferCode.length !== 5) {
      toast({
        variant: "destructive",
        title: "轉帳資訊不完整",
        description: "請輸入轉帳帳號末 5 碼"
      });
      return false;
    }
    
    if (!email || !email.includes("@")) {
      toast({
        variant: "destructive",
        title: "電子郵件錯誤",
        description: "請輸入有效的電子郵件地址"
      });
      return false;
    }
    
    return true;
  };

  const submitTransferInfo = async () => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("請先登入");
    }

    // Get user's store
    const { data: stores, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (storeError) {
      throw new Error("無法取得店家資訊");
    }

    if (!stores || stores.length === 0) {
      throw new Error("找不到店家資訊，請先創建店家");
    }

    const storeId = stores[0].id;
    const amount = plan.amount || parseInt(plan.price.replace(/[^\d]/g, ""));

    // Submit transfer code to database
    const result = await BankTransferService.submitTransferCode(
      storeId,
      cardData.transferCode,
      amount
    );

    return result;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    try {
      // 提交轉帳資訊
      const transferResult = await submitTransferInfo();
      
      // 創建訂閱記錄（等待驗證狀態）
      const subscriptionData = {
        planType: plan.planType,
        status: "pending_verification",
        transferResult,
        features: plan.features,
        customerData: cardData
      };
      
      toast({
        title: "轉帳資訊已提交！",
        description: "我們將於 1-2 個工作天內確認您的轉帳並開通服務。",
      });
      
      // 觸發成功回調
      onPaymentSuccess(subscriptionData);
      
    } catch (error) {
      console.error("提交處理錯誤:", error);
      toast({
        variant: "destructive",
        title: "提交失敗",
        description: "提交轉帳資訊時發生錯誤，請稍後再試。"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">完成付款</h2>
                <p className="text-gray-600">選擇 {plan.name} 方案</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* 方案摘要 */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{plan.name}</h3>
                      <p className="text-gray-600">{plan.features.length} 項功能</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{plan.price}</div>
                      <div className="text-gray-500">{plan.period}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ATM 轉帳資訊 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">ATM 轉帳資訊</h3>
                <div className="border rounded-lg p-4 space-y-4 bg-blue-50">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">銀行</span>
                      <span className="font-medium">中國信託銀行</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">分行</span>
                      <span className="font-medium">中崙分行</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">戶名</span>
                      <span className="font-medium">李錫彥</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">帳戶</span>
                      <span className="font-mono text-lg font-bold text-blue-700">093-53405060-1</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm text-gray-600">轉帳金額</span>
                      <span className="font-bold text-lg text-red-600">{plan.price}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">轉帳注意事項</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• 請於轉帳後保留轉帳收據</li>
                    <li>• 轉帳完成後，請輸入您的轉帳帳號末 5 碼</li>
                    <li>• 管理員將於 1-2 個工作天內確認並開通服務</li>
                    <li>• 如有疑問請聯絡客服</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    您的轉帳帳號末 5 碼（供核對用）
                  </label>
                  <Input
                    value={cardData.transferCode}
                    onChange={(e) => handleInputChange('transferCode', e.target.value.slice(0, 5))}
                    placeholder="請輸入您的轉帳帳號末 5 碼"
                    maxLength={5}
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500">
                    此資訊將協助管理員快速核對您的轉帳記錄
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    聯絡電子郵件
                  </label>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={cardData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    聯絡電話（選填）
                  </label>
                  <Input
                    placeholder="09xx-xxx-xxx"
                    value={cardData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
              </div>

              {/* 安全提示 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-green-800">安全保障</p>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>• 我們將透過人工方式驗證您的轉帳記錄</li>
                      <li>• 轉帳資訊經過加密保護</li>
                      <li>• 如有任何問題，將透過電子郵件與您聯繫</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-6">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="sm:w-auto"
                >
                  取消
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 sm:w-auto"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      提交轉帳資訊
                    </>
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 mt-3 text-center">
                點擊「提交轉帳資訊」即表示您同意我們的服務條款和隱私政策
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};