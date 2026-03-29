import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Clock, ArrowRight, MessageSquare, Smile, PersonStanding } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface PainPoint {
  icon: ReactNode;
  title: string;
  description: string;
  gradient: string;
  iconBg: string;
}

const painPoints: PainPoint[] = [
  { icon: <Smile className="w-8 h-8 text-amber-500" />, title: "瞬間尷尬的「請託」", description: "結帳那刻，看著客人滿意地微笑，心裡千頭萬緒。\n你鼓起勇氣擠出一句：「有空幫我留個評論好嗎？」\n說完卻像從職人變成拜託人的推銷員。\n明明是用心服務，怎麼說出這句話時會有點心虛？", gradient: "from-amber-50 to-orange-50", iconBg: "bg-amber-100" },
  { icon: <PersonStanding className="w-8 h-8 text-slate-600" />, title: "超熟悉的「下次一定」", description: "客人總是笑著點頭：「好啊，沒問題～」\n但你知道，當他一踏出門，被日常生活一淹沒，\n這句「好啊」通常就消失在風裡了。\n不是他不想，是這世界太忙。", gradient: "from-slate-50 to-gray-50", iconBg: "bg-slate-100" },
  { icon: <Clock className="w-8 h-8 text-blue-600" />, title: "一刷再刷的「落空期待」", description: "你明明跟自己說要放下，\n但還是一天幾次打開商家頁面，偷偷期待有紅點通知出現。\n每次打開，卻又是失望。\n這種等待的焦躁，只有店主才懂。", gradient: "from-blue-50 to-cyan-50", iconBg: "bg-blue-100" },
  { icon: <Star className="w-8 h-8 text-gray-500" />, title: "無聲無息的「五顆星」", description: "終於等來一則評價，滿心期待點開，卻只有五顆星，什麼都沒寫。\n你心裡是感激的，但也清楚：\n對還不認識你的人來說，這樣的評論，說服力實在太弱。", gradient: "from-gray-50 to-slate-50", iconBg: "bg-gray-100" },
];

export const PainPointResonanceSection = () => (
  <section id="pain-points" className="py-20 bg-gradient-to-b from-muted/30 to-background scroll-mt-24" aria-labelledby="pain-points-title">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div className="text-center max-w-4xl mx-auto mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <motion.div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6" whileHover={{ scale: 1.05 }}>
          <MessageSquare className="w-4 h-4" />
          店家心聲共鳴區
        </motion.div>
        <h2 id="pain-points-title" className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">「帥哥，幫我留個五星好評好嗎？」</h2>
        <div className="space-y-4">
          <p className="text-xl text-foreground/80 leading-relaxed">...你也說過這句心虛的台詞嗎？</p>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">我們都知道口碑很重要，但「開口」的過程，卻充滿了尷尬、無力，甚至恐懼。</p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {painPoints.map((painPoint, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15, duration: 0.6 }} whileHover={{ y: -8, transition: { duration: 0.3 } }}>
              <Card className={`relative h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br ${painPoint.gradient} backdrop-blur-sm group`}>
                <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/40 group-hover:from-background/90 group-hover:to-background/60 transition-all duration-500" />
                <CardContent className="relative p-8 h-full flex flex-col">
                  <div className="flex items-start gap-4 mb-6">
                    <motion.div className={`${painPoint.iconBg} p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300`} whileHover={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 0.5 }}>
                      {painPoint.icon}
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">{painPoint.title}</h3>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground/75 leading-relaxed whitespace-pre-line text-base">{painPoint.description}</p>
                  </div>
                  <motion.div className="mt-6 w-12 h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full" initial={{ width: 0 }} whileInView={{ width: 48 }} viewport={{ once: true }} transition={{ delay: index * 0.15 + 0.5, duration: 0.8 }} />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div className="text-center mt-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.8 }}>
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-8 border border-primary/20 brand-shadow max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">還在為這些困擾煩惱嗎？</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">讓我們幫您打破這個困境，讓客人的真實感受，自然而然地成為您最好的口碑推廣。</p>
            <Link to="/register?plan=trial">
              <Button size="lg" className="text-lg px-8 py-4 animate-glow">
                立即體驗解決方案
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);
