import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, Users, Zap, Target } from 'lucide-react';

export const ScenarioResonanceSection = () => {
  const scenarios = [
    {
      icon: <Store className="w-8 h-8 text-blue-500" />,
      title: "小型店家",
      description: "資源有限，需要快速有效的評論管理",
      challenges: ["時間不足", "人力短缺", "預算限制"],
      solution: "自動化評論產生，節省時間成本"
    },
    {
      icon: <Users className="w-8 h-8 text-green-500" />,
      title: "連鎖品牌",
      description: "多店面管理，需要統一品質標準",
      challenges: ["品質不一", "管理複雜", "成本控制"],
      solution: "統一管理平台，確保品質一致性"
    },
    {
      icon: <Zap className="w-8 h-8 text-purple-500" />,
      title: "電商平台",
      description: "大量商品，需要快速回應客戶",
      challenges: ["商品眾多", "回應速度", "個人化需求"],
      solution: "AI 智慧分析，快速生成個人化評論"
    },
    {
      icon: <Target className="w-8 h-8 text-orange-500" />,
      title: "行銷團隊",
      description: "需要提升品牌形象和客戶滿意度",
      challenges: ["內容創作", "效果追蹤", "ROI 計算"],
      solution: "數據驅動的內容策略，量化行銷效果"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">
            情境共鳴
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            深度理解您的挑戰
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            不同類型的企業面臨不同的挑戰，我們為每種情境提供量身打造的解決方案
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {scenarios.map((scenario, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    {scenario.icon}
                    <CardTitle className="text-2xl">{scenario.title}</CardTitle>
                  </div>
                  <CardDescription className="text-lg">
                    {scenario.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">主要挑戰：</h4>
                    <div className="flex flex-wrap gap-2">
                      {scenario.challenges.map((challenge, challengeIndex) => (
                        <Badge key={challengeIndex} variant="secondary">
                          {challenge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-1">我們的解決方案：</h4>
                    <p className="text-blue-800">{scenario.solution}</p>
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