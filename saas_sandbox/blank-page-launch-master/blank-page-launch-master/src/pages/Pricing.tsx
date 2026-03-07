import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PaymentModal } from "@/components/subscription/PaymentModal";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const plans = [
    {
      name: "7 天免費試用",
      price: "NT$0",
      period: "（每店一次）",
      description: "新店建立自動開啟，7 天到期後需訂閱方可使用",
      planType: "trial",
      features: [
        "完整功能試用（7 天）",
        "每店限一次",
        "到期自動停用評論生成"
      ]
    },
    {
      name: "月訂閱",
      price: "NT$500",
      period: "/月",
      description: "短期彈性使用",
      planType: "monthly",
      amount: 500,
      features: [
        "完整功能",
        "不限功能模組",
        "ATM 轉帳後由管理員開通"
      ]
    },
    {
      name: "季訂閱",
      price: "NT$1200",
      period: "/季",
      description: "較划算的選擇",
      planType: "quarterly",
      amount: 1200,
      features: [
        "完整功能",
        "不限功能模組",
        "ATM 轉帳後由管理員開通"
      ]
    },
    {
      name: "年訂閱",
      price: "NT$3600",
      period: "/年",
      description: "最優惠方案",
      planType: "yearly",
      amount: 3600,
      features: [
        "完整功能",
        "不限功能模組",
        "ATM 轉帳後由管理員開通"
      ],
      popular: true
    }
  ];

  const handlePlanSelect = async (plan: any) => {
    if (plan.planType === "trial") {
      // 免費試用不需要登入，直接導向註冊+建立店家
      if (!user) {
        toast.error("請先註冊以開始免費試用");
        navigate("/register?trial=true");
        return;
      }
      
      // 檢查是否已經使用過免費試用
      try {
        const { data: existingStore } = await supabase
          .from('stores')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (existingStore) {
          toast.error("每個帳號僅能建立一間店家並享有一次免費試用");
          return;
        }
      } catch (error) {
        console.error("檢查店家失敗:", error);
      }
      
      navigate("/create-store?trial=true");
      return;
    }

    // 付費方案需要登入
    if (!user) {
      toast.error("請先登入以選擇方案");
      navigate("/login");
      return;
    }

    // 付費方案開啟付款模式
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    if (!selectedPlan || !user) return;

    setIsLoading(true);
    try {
      // 這裡實作付款成功後的邏輯
      toast.success("付款資訊已提交，等待管理員確認開通");
      setIsPaymentModalOpen(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error("處理付款成功時發生錯誤:", error);
      toast.error("處理付款時發生錯誤");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactUs = () => {
    window.open("https://lin.ee/DkXrNAq", "_blank");
  };

  useEffect(() => {
    const title = "定價方案｜7 天免費試用與訂閱";
    document.title = title;
    const desc = "7 天免費試用；月 NT$500 / 季 NT$1200 / 年 NT$3600。付費方案功能一致。";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", desc);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            選擇適合您的方案
          </h1>
          <p className="text-xl text-primary font-semibold mb-2">
            一個讓每家小店都用得起的專業工具
          </p>
          <p className="text-lg text-gray-600">
            7 天免費試用；付費方案功能一致（ATM 轉帳＋管理員開通）
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'border-blue-500 border-2 shadow-xl' : 'border-gray-200'}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    最受歡迎
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${plan.popular ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-800 hover:bg-gray-900'}`}
                  size="lg"
                  onClick={() => handlePlanSelect(plan)}
                  disabled={isLoading}
                >
                  {plan.name.includes("試用") ? "立即開始試用" : "申請訂閱（ATM 轉帳）"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center text-gray-600">
          <p>所有付費方案功能一致。付款方式：ATM 轉帳，由管理員手動開通。</p>
          <p className="mt-1">試用將於 7 天後自動停用評論生成功能，需訂閱後才能使用。</p>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            需要客製化方案嗎？
          </p>
          <Button variant="outline" size="lg" onClick={handleContactUs}>
            聯絡我們
          </Button>
        </div>

        {/* Payment Modal */}
        {selectedPlan && (
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false);
              setSelectedPlan(null);
            }}
            plan={selectedPlan}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default Pricing;