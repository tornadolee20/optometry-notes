import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: "default" | "outline";
  popular: boolean;
  planType: "trial" | "monthly" | "quarterly" | "yearly";
  originalPrice?: string;
  discount?: string;
}

const pricingPlans: PricingPlan[] = [
  { name: "7天免費試用", price: "免費", period: "7天試用", description: "新店家限定，體驗完整功能", features: ["48個關鍵感受配額（最佳配置）", "無限制評論生成", "AI智慧評論優化", "優先客服支援"], buttonText: "立即開始試用", buttonVariant: "outline", popular: false, planType: "trial" },
  { name: "月訂閱", price: "NT$ 500", period: "每月", description: "彈性使用，隨時可調整", features: ["48個關鍵感受配額（最佳配置）", "無限制評論生成", "AI智慧評論優化", "優先客服支援"], buttonText: "立即訂閱", buttonVariant: "default", popular: false, planType: "monthly" },
  { name: "季訂閱", price: "NT$ 1,200", period: "每季", originalPrice: "NT$ 1,500", discount: "省下20%", description: "平衡選擇，一季省下300元", features: ["48個關鍵感受配額（最佳配置）", "無限制評論生成", "AI智慧評論優化", "優先客服支援"], buttonText: "立即訂閱", buttonVariant: "default", popular: false, planType: "quarterly" },
  { name: "年訂閱", price: "NT$ 3,600", period: "每年", originalPrice: "NT$ 6,000", discount: "省下40%", description: "最受歡迎，一年省下2,400元", features: ["48個關鍵感受配額（最佳配置）", "無限制評論生成", "AI智慧評論優化", "優先客服支援", "⭐ 年付優惠，平均每月僅300元"], buttonText: "立即訂閱（最划算）", buttonVariant: "default", popular: true, planType: "yearly" },
];

interface PricingSectionProps {
  onPlanSelect: (plan: PricingPlan) => void;
}

export const PricingSection = ({ onPlanSelect }: PricingSectionProps) => (
  <section id="pricing" className="py-20 bg-muted scroll-mt-24" aria-labelledby="pricing-title">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">選擇最適合您的方案</h2>
        <p className="text-xl text-primary font-semibold max-w-2xl mx-auto">一個讓每家小店都用得起的專業工具</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {pricingPlans.map((plan, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
            <Card className={`h-full relative ${plan.popular ? 'border-primary border-2' : 'border-border'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">🔥 最受歡迎</Badge>
                </div>
              )}
              {plan.discount && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-destructive text-destructive-foreground px-2 py-1 text-xs">{plan.discount}</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground ml-2">/ {plan.period}</span>}
                </div>
                {plan.originalPrice && <div className="text-sm text-muted-foreground line-through mb-1">原價 {plan.originalPrice}</div>}
                <p className="text-muted-foreground h-10">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 flex-grow">
                  {plan.features.map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-6">
                  <Button className="w-full" variant={plan.buttonVariant} size="lg" onClick={() => onPlanSelect(plan)}>
                    {plan.buttonText}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export type { PricingPlan };
