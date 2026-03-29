import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { KeyRound, TrendingUp, Zap, Gem, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

interface Insight {
  icon: ReactNode;
  title: string;
  description: string;
  gradient: string;
  iconBg: string;
}

const insights: Insight[] = [
  { icon: <KeyRound className="w-8 h-8 text-amber-500" />, title: "顧客記憶的真相 (95% 的沉默)", description: "高達 95% 的顧客並非不滿意，而是寫評論成了費力的「記憶提取任務」。抓住消費當下的「黃金窗口」邀請，成功率比事後高出 12 倍。", gradient: "from-amber-50 to-orange-50", iconBg: "bg-amber-100" },
  { icon: <TrendingUp className="w-8 h-8 text-blue-600" />, title: "評論是您的數位店面 (4 星門檻)", description: "高達 92% 的消費者只會選擇 4 星以上的店家，這是隱形的信任門檻。好的評論能主宰在地搜尋排名，更能帶來高達 31% 的銷售增長。", gradient: "from-blue-50 to-cyan-50", iconBg: "bg-blue-100" },
  { icon: <Zap className="w-8 h-8 text-purple-600" />, title: "擺脫「全面提升」的謬誤", description: "資源要用在刀口上。與其追求全面良好，不如將資源集中創造卓越的「高峰」與完美的「終點」，才能在顧客心中留下深刻印記。", gradient: "from-purple-50 to-violet-50", iconBg: "bg-purple-100" },
  { icon: <Gem className="w-8 h-8 text-emerald-600" />, title: "簡單，才是最強大的策略", description: "QR Code 是跨越「費力鴻溝」的最佳橋樑。它將複雜的步驟簡化為一次「掃描」，在顧客體驗的自然終點，輕鬆捕捉最有價值的評論。", gradient: "from-emerald-50 to-teal-50", iconBg: "bg-emerald-100" },
  { icon: <ShieldCheck className="w-8 h-8 text-rose-600" />, title: "優雅的感謝邀請", description: "我們不買評論，而是創造感動。一個意料外的小驚喜，就能觸發顧客真心想回報的心情，自然留下最真實的好評，完全合規。", gradient: "from-rose-50 to-pink-50", iconBg: "bg-rose-100" },
];

const InsightCard = ({ insight, index }: { insight: Insight; index: number }) => (
  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15, duration: 0.6 }} whileHover={{ y: -8, transition: { duration: 0.3 } }}>
    <Card className={`relative h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br ${insight.gradient} backdrop-blur-sm group`}>
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/40 group-hover:from-background/90 group-hover:to-background/60 transition-all duration-500" />
      <CardContent className="relative p-8 h-full flex flex-col">
        <div className="flex items-start gap-4 mb-6">
          <motion.div className={`${insight.iconBg} p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300`} whileHover={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 0.5 }}>
            {insight.icon}
          </motion.div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">{insight.title}</h3>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-foreground/75 leading-relaxed text-base">{insight.description}</p>
        </div>
        <motion.div className="mt-6 w-12 h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full" initial={{ width: 0 }} whileInView={{ width: 48 }} viewport={{ once: true }} transition={{ delay: index * 0.15 + 0.5, duration: 0.8 }} />
      </CardContent>
    </Card>
  </motion.div>
);

export const StrategicInsightsSection = () => (
  <section id="strategy" className="py-20 bg-gradient-to-b from-muted/30 to-background scroll-mt-24" aria-labelledby="strategy-title">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div className="text-center max-w-3xl mx-auto mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 id="strategy-title" className="text-3xl md:text-4xl font-bold text-foreground mb-4">決勝點：讓您脫穎而出的口碑策略</h2>
        <p className="text-lg text-muted-foreground">為什麼 95% 的好評都消失了？問題的根源，在這裡。</p>
      </motion.div>
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {insights.slice(0, 4).map((insight, index) => (
            <InsightCard key={index} insight={insight} index={index} />
          ))}
        </div>
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <InsightCard insight={insights[4]} index={4} />
          </div>
        </div>
      </div>
    </div>
  </section>
);
