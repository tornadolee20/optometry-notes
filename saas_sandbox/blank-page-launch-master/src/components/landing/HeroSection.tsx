import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, BookUser, Smile } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = () => (
  <section id="hero" className="pt-32 pb-20 relative overflow-hidden hero-gradient scroll-mt-24" aria-labelledby="hero-title">
    <div className="section-container">
      <div className="text-center max-w-4xl mx-auto relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
            <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              <BookUser className="w-4 h-4 mr-2" />
              一位驗光師的碩士論文實踐
            </Badge>
          </motion.div>

          <motion.h1 id="hero-title" className="text-4xl md:text-6xl font-bold mb-6 leading-loose" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
            別讓你的<span className="text-error animate-pulse font-bold">專業</span>
            <br className="mb-4" />
            <span className="text-gradient animate-gradient">只留在客人的心裡</span>
          </motion.h1>

          <motion.div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-primary/20 brand-shadow" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.6 }} whileHover={{ scale: 1.02, boxShadow: "0 20px 60px -10px hsl(var(--primary) / 0.25)" }}>
            <p className="text-lg text-foreground/85 font-medium flex items-center justify-center gap-2 leading-relaxed">
              <Smile className="w-5 h-5 text-primary animate-bounce" />
              每次客人說：「服務很好耶～」我總是笑著點頭。<br />但到了結帳，還是只能尷尬地說：「有空幫我留個好評喔！」然後……就沒有然後了。
            </p>
          </motion.div>

          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}>
            <Link to="/register?plan=trial">
              <Button size="lg" className="text-lg px-8 py-4 brand-shadow hover:shadow-button animate-glow">
                我也想讓客人幫我說出服務亮點
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 hover:bg-primary/10 transition-all duration-300">
                <Sparkles className="mr-2 h-5 w-5" />
                讓系統來輔助你的客戶完成評論
              </Button>
            </a>
          </motion.div>
        </motion.div>

        <motion.div className="absolute top-20 right-10 w-20 h-20 bg-primary/10 rounded-full blur-xl" animate={{ y: [-10, 10, -10] }} transition={{ duration: 3, repeat: Infinity }} />
        <motion.div className="absolute bottom-20 left-10 w-16 h-16 bg-accent/10 rounded-full blur-xl" animate={{ y: [10, -10, 10] }} transition={{ duration: 4, repeat: Infinity }} />
      </div>
    </div>
  </section>
);
