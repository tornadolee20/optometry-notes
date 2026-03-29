import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Target, BarChart3, Clock, Shield, Smartphone } from "lucide-react";

const features = [
  { icon: <MessageSquare className="w-8 h-8 text-brand-sage" />, title: "心理引導系統", description: "用行銷心理學引導問題，幫助顧客說出連自己都沒意識到的感受", highlight: "核心功能" },
  { icon: <Target className="w-8 h-8 text-brand-gold" />, title: "E-E-A-T 品質保證", description: "符合 Google 高品質內容標準，產生真正有價值的體驗分享", highlight: "Google 喜歡" },
  { icon: <BarChart3 className="w-8 h-8 text-brand-coral" />, title: "真實性分析", description: "監測分享內容的真實性和可信度，確保符合平台規範", highlight: "可信度高" },
  { icon: <Clock className="w-8 h-8 text-brand-indigo" />, title: "智慧感受捕捉", description: "自動識別顧客的情緒和體驗，建議最合適的表達方式", highlight: "AI 智慧" },
  { icon: <Shield className="w-8 h-8 text-success" />, title: "負面體驗也能分享", description: "不強制正面評價，尊重真實感受，讓負面體驗成為改進的動力", highlight: "真實為本" },
  { icon: <Smartphone className="w-8 h-8 text-brand-sage-light" />, title: "體驗分享範例", description: "提供真實的分享範例，學習如何將感受轉化為有價值的經驗分享", highlight: "學習淺高" },
];

export const FeaturesSection = () => (
  <section id="features" className="py-20 bg-background scroll-mt-24" aria-labelledby="features-title">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 id="features-title" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          一個為「專業」而生的系統
        </h2>
        <p className="text-xl text-foreground/85 max-w-2xl mx-auto leading-relaxed">
          每個功能，都來自第一線的深刻體會，只為解決店家最真實的痛點。
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-300 bg-card border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  {feature.icon}
                  <Badge variant="secondary" className="text-xs">{feature.highlight}</Badge>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/85 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
