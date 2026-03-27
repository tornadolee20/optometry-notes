import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Lightbulb, Rocket, Shield } from 'lucide-react';

export const CoreInsightsSection = () => {
  const insights = [
    {
      icon: <Brain className="w-12 h-12 text-purple-500" />,
      title: "AI 智慧分析",
      description: "運用先進的自然語言處理技術，深度理解客戶需求",
      features: ["情感分析", "關鍵字提取", "語調調整", "個人化推薦"]
    },
    {
      icon: <Lightbulb className="w-12 h-12 text-yellow-500" />,
      title: "創新思維",
      description: "結合創意和數據，打造獨特且有效的評論內容",
      features: ["創意生成", "多樣化風格", "品牌一致性", "趨勢洞察"]
    },
    {
      icon: <Rocket className="w-12 h-12 text-blue-500" />,
      title: "效率提升",
      description: "大幅縮短評論生成時間，讓您專注於核心業務",
      features: ["批量處理", "即時生成", "自動優化", "快速部署"]
    },
    {
      icon: <Shield className="w-12 h-12 text-green-500" />,
      title: "品質保證",
      description: "多重檢驗機制，確保每則評論都符合高品質標準",
      features: ["內容審核", "語法檢查", "重複性檢測", "合規性驗證"]
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">
            核心洞察
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            技術驅動的創新解決方案
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            深入了解我們如何運用最新技術，為您的業務帶來真正的價值
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {insight.icon}
                  </div>
                  <CardTitle className="text-xl mb-2">{insight.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{insight.description}</p>
                  <div className="space-y-2">
                    {insight.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="text-sm text-gray-500 flex items-center justify-center"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};