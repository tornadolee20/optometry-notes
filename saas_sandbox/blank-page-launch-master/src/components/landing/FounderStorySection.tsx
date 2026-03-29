import { motion } from "framer-motion";
import { BookUser } from "lucide-react";

export const FounderStorySection = () => (
  <section id="founder-story" className="py-20 bg-background scroll-mt-24" aria-labelledby="founder-story-title">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div className="text-center max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
        <BookUser className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 id="founder-story-title" className="text-3xl md:text-4xl font-bold text-foreground mb-6">我的故事</h2>
        <p className="text-xl text-muted-foreground mb-6">從「自己的眼鏡」到「Myownreviews」</p>
        <div className="bg-muted rounded-xl p-8 border text-left space-y-4 text-lg text-foreground/85 leading-relaxed max-w-none">
          <p>「大家好，我是一位驗光師。我在三峽，開了一間眼鏡行，店名就叫做<strong className="text-foreground">『自己的眼鏡』</strong>。</p>
          <p>我的初衷很簡單，就是實現一句話：『配自己的眼鏡』——幫助每位客人，找到一副從度數到風格，都真正屬於他們自己的眼鏡。</p>
          <p>在服務客人的過程中我發現，他們對我們專業的感謝、對找到命定眼鏡的喜悅，常常只留在心裡。所以我將『配自己的眼鏡』這個理念，延伸到了數位世界，開發了<strong className="text-foreground">『Myownreviews』</strong>這套系統。</p>
          <p className="font-bold text-foreground">我希望用我服務客人的專業，幫助更多像我一樣的店家，將顧客最真實的感受，配成最有價值的網路口碑。」</p>
        </div>
      </motion.div>
    </div>
  </section>
);
