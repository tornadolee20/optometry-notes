import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

export const CTASection = () => (
  <section className="relative py-24 md:py-28 hero-gradient">
    <div className="pointer-events-none absolute inset-0 opacity-15 [background:radial-gradient(60rem_30rem_at_50%_-10%,white,transparent)]" />
    <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
          準備好，讓你的「專業」被看見
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
          我就是你的第一個客戶顧問。<br />立即開始免費試用，讓我親自協助你，把你的好，變成更多生意。
        </p>
        <div className="mx-auto max-w-xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch">
            <Link to="/register" className="sm:flex-1">
              <Button size="lg" className="w-full bg-background text-primary hover:bg-primary/5 text-base md:text-lg px-6 py-4 font-semibold shadow">
                立即免費註冊
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
            <a href="https://lin.ee/DkXrNAq" target="_blank" rel="noopener noreferrer" className="sm:flex-1">
              <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base md:text-lg px-6 py-4 font-semibold shadow">
                <MessageSquare className="mr-2 h-5 w-5" aria-hidden="true" />
                直接與我聊聊
              </Button>
            </a>
          </div>
          <p className="text-muted-foreground mt-3 text-xs md:text-sm">
            💳 免費試用 · 無需信用卡 · 隨時取消
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);
