import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MousePointerClick, Wand2, Send } from "lucide-react";

const steps = [
  { icon: <MousePointerClick className="w-10 h-10 text-primary" />, title: "1. 點選真實感受", description: "系統會呈現您精心設定的「關鍵感受」。客人只需點選符合當下體驗的幾個詞，更能手動添加獨特感受，確保100%真實。" },
  { icon: <Wand2 className="w-10 h-10 text-primary" />, title: "2. AI 智慧串連", description: "我們的AI智慧引擎，會像一位貼心的寫手，將顧客挑選的零散感受，串連成一篇有溫度、有結構、語氣自然的評論草稿。" },
  { icon: <Send className="w-10 h-10 text-primary" />, title: "3. 顧客感動確認", description: "草稿會呈現給客人做最終確認或微調。顧客認可後，一鍵即可發布。這，就是他們最想說的話。" },
];

export const HowItWorksSection = () => (
  <section id="how-it-works" className="py-20 bg-background" aria-labelledby="how-it-works-title">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div className="text-center max-w-3xl mx-auto mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 id="how-it-works-title" className="text-3xl md:text-4xl font-bold text-foreground">
          三步驟，釋放顧客心中最真實的感謝
        </h2>
        <p className="mt-4 text-xl text-muted-foreground">從「寫不出來」，到「這就是我想說的！」</p>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {steps.map((step, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }}>
            <Card className="h-full text-center bg-muted border-0">
              <CardHeader>
                <div className="mx-auto w-fit p-4 bg-background rounded-full mb-4 ring-1 ring-border">{step.icon}</div>
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
