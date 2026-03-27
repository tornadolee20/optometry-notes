import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Check } from 'lucide-react';

export const ContrastComparisonSection = () => {
  const comparisons = [
    {
      traditional: {
        title: "傳統人工評論",
        items: [
          { text: "耗時數小時完成一則評論", negative: true },
          { text: "品質不穩定，依賴個人能力", negative: true },
          { text: "成本高昂，需要專業人員", negative: true },
          { text: "難以大規模複製", negative: true },
          { text: "缺乏數據洞察", negative: true }
        ]
      },
      ai: {
        title: "AI 智慧評論生成",
        items: [
          { text: "數分鐘內生成高品質評論", negative: false },
          { text: "品質穩定，標準化流程", negative: false },
          { text: "成本效益高，自動化處理", negative: false },
          { text: "易於擴展，批量處理", negative: false },
          { text: "豐富數據分析與洞察", negative: false }
        ]
      }
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">
            對比分析
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            為什麼選擇 AI 智慧解決方案？
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            傳統方法 vs. AI 智慧方案，差異一目了然
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {comparisons.map((comparison, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* 傳統方法 */}
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-red-800 flex items-center justify-center">
                    <X className="w-6 h-6 mr-2" />
                    {comparison.traditional.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {comparison.traditional.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <X className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* AI 方案 */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-green-800 flex items-center justify-center">
                    <Check className="w-6 h-6 mr-2" />
                    {comparison.ai.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {comparison.ai.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              效率提升高達 95%
            </h3>
            <p className="text-lg text-gray-600 mb-4">
              從數小時縮短到數分鐘，讓您的團隊專注於更重要的策略工作
            </p>
            <div className="flex justify-center items-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500">8小時</div>
                <div className="text-sm text-gray-600">傳統方法</div>
              </div>
              <div className="text-gray-400">→</div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">5分鐘</div>
                <div className="text-sm text-gray-600">AI 智慧</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};