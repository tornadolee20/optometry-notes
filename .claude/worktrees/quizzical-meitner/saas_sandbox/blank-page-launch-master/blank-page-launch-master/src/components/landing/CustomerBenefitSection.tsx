import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Clock, Users, Star, Zap } from 'lucide-react';

export const CustomerBenefitSection = () => {
  const benefits = [
    {
      icon: <TrendingUp className="w-8 h-8 text-blue-500" />,
      title: "營收增長",
      value: "+35%",
      description: "平均提升客戶轉換率和復購率",
      details: [
        "提升品牌信任度",
        "增加客戶黏性",
        "擴大市場影響力",
        "優化客戶體驗"
      ]
    },
    {
      icon: <DollarSign className="w-8 h-8 text-green-500" />,
      title: "成本節省",
      value: "70%",
      description: "大幅降低內容創作與管理成本",
      details: [
        "減少人力投入",
        "提高工作效率",
        "降低外包費用",
        "優化資源配置"
      ]
    },
    {
      icon: <Clock className="w-8 h-8 text-purple-500" />,
      title: "時間效率",
      value: "95%",
      description: "極速完成評論生成與發布流程",
      details: [
        "自動化處理",
        "即時響應",
        "批量操作",
        "智能排程"
      ]
    },
    {
      icon: <Users className="w-8 h-8 text-orange-500" />,
      title: "客戶滿意度",
      value: "+28%",
      description: "顯著提升客戶滿意度和忠誠度",
      details: [
        "個人化體驗",
        "快速回應",
        "專業內容",
        "持續優化"
      ]
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      title: "品質提升",
      value: "99%",
      description: "確保評論內容的高品質和一致性",
      details: [
        "AI 品質檢測",
        "多重驗證",
        "標準化流程",
        "持續學習"
      ]
    },
    {
      icon: <Zap className="w-8 h-8 text-red-500" />,
      title: "競爭優勢",
      value: "3x",
      description: "三倍提升市場競爭力和品牌影響力",
      details: [
        "技術領先",
        "創新思維",
        "快速迭代",
        "市場洞察"
      ]
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
            客戶效益
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            量化您的成功成果
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            真實數據證明我們的解決方案為客戶帶來的具體價值
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <CardTitle className="text-xl mb-2">{benefit.title}</CardTitle>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {benefit.value}
                  </div>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {benefit.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};