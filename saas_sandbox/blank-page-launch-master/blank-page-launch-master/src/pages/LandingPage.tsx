import { useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Target, Shield, Clock, Sparkles, ArrowRight, Check, MessageSquare, BarChart3, Smartphone, BookUser, Smile,
// 替換 SmilePlus
PersonStanding, MousePointerClick,
// 新增圖示
Wand2,
// 新增圖示
Send,
// 新增圖示
KeyRound,
// 新增圖示
TrendingUp,
// 新增圖示
Zap,
// 新增圖示
Gem,
// 新增圖示
ShieldCheck // 新增圖示
} from "lucide-react";
import { Link } from "react-router-dom";
import { EnhancedNavigation } from "@/components/enhanced/EnhancedNavigation";
import { EnhancedTestimonials } from "@/components/enhanced/EnhancedTestimonials";

// Lazy load PaymentModal for better performance
const PaymentModal = lazy(() => import("@/components/subscription/PaymentModal").then(module => ({
  default: module.PaymentModal
})));

// **全新：魔法展示間 (How It Works) 區塊元件**
const HowItWorksSection = () => <section id="how-it-works" className="py-20 bg-background" aria-labelledby="how-it-works-title">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div className="text-center max-w-3xl mx-auto mb-16" initial={{
      opacity: 0,
      y: 20
    }} whileInView={{
      opacity: 1,
      y: 0
    }} viewport={{
      once: true
    }}>
        <h2 id="how-it-works-title" className="text-3xl md:text-4xl font-bold text-foreground">
          三步驟，釋放顧客心中最真實的感謝
        </h2>
        <p className="mt-4 text-xl text-muted-foreground">
          從「寫不出來」，到「這就是我想說的！」
        </p>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {[{
        icon: <MousePointerClick className="w-10 h-10 text-primary" />,
        title: "1. 點選真實感受",
        description: "系統會呈現您精心設定的「關鍵感受」。客人只需點選符合當下體驗的幾個詞，更能手動添加獨特感受，確保100%真實。"
      }, {
        icon: <Wand2 className="w-10 h-10 text-primary" />,
        title: "2. AI 智慧串連",
        description: "我們的AI智慧引擎，會像一位貼心的寫手，將顧客挑選的零散感受，串連成一篇有溫度、有結構、語氣自然的評論草稿。"
      }, {
        icon: <Send className="w-10 h-10 text-primary" />,
        title: "3. 顧客感動確認",
        description: "草稿會呈現給客人做最終確認或微調。顧客認可後，一鍵即可發布。這，就是他們最想說的話。"
      }].map((step, index) => <motion.div key={index} initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        delay: index * 0.15
      }}>
            <Card className="h-full text-center bg-muted border-0">
              <CardHeader>
                <div className="mx-auto w-fit p-4 bg-background rounded-full mb-4 ring-1 ring-border">
                  {step.icon}
                </div>
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          </motion.div>)}
      </div>
    </div>
  </section>;
const StrategicInsightsSection = () => {
  const insights = [{
    icon: <KeyRound className="w-8 h-8 text-amber-500" />,
    title: "顧客記憶的真相 (95% 的沉默)",
    description: "高達 95% 的顧客並非不滿意，而是寫評論成了費力的「記憶提取任務」。抓住消費當下的「黃金窗口」邀請，成功率比事後高出 12 倍。",
    gradient: "from-amber-50 to-orange-50",
    iconBg: "bg-amber-100"
  }, {
    icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
    title: "評論是您的數位店面 (4 星門檻)",
    description: "高達 92% 的消費者只會選擇 4 星以上的店家，這是隱形的信任門檻。好的評論能主宰在地搜尋排名，更能帶來高達 31% 的銷售增長。",
    gradient: "from-blue-50 to-cyan-50",
    iconBg: "bg-blue-100"
  }, {
    icon: <Zap className="w-8 h-8 text-purple-600" />,
    title: "擺脫「全面提升」的謬誤",
    description: "資源要用在刀口上。與其追求全面良好，不如將資源集中創造卓越的「高峰」與完美的「終點」，才能在顧客心中留下深刻印記。",
    gradient: "from-purple-50 to-violet-50",
    iconBg: "bg-purple-100"
  }, {
    icon: <Gem className="w-8 h-8 text-emerald-600" />,
    title: "簡單，才是最強大的策略",
    description: "QR Code 是跨越「費力鴻溝」的最佳橋樑。它將複雜的步驟簡化為一次「掃描」，在顧客體驗的自然終點，輕鬆捕捉最有價值的評論。",
    gradient: "from-emerald-50 to-teal-50",
    iconBg: "bg-emerald-100"
  }, {
    icon: <ShieldCheck className="w-8 h-8 text-rose-600" />,
    title: "優雅的感謝邀請",
    description: "我們不買評論，而是創造感動。一個意料外的小驚喜，就能觸發顧客真心想回報的心情，自然留下最真實的好評，完全合規。",
    gradient: "from-rose-50 to-pink-50",
    iconBg: "bg-rose-100"
  }];
  return <section id="strategy" className="py-20 bg-gradient-to-b from-muted/30 to-background scroll-mt-24" aria-labelledby="strategy-title">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center max-w-3xl mx-auto mb-16" initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }}>
          <h2 id="strategy-title" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            決勝點：讓您脫穎而出的口碑策略
          </h2>
          <p className="text-lg text-muted-foreground">
            為什麼 95% 的好評都消失了？問題的根源，在這裡。
          </p>
        </motion.div>
        
        <div className="max-w-7xl mx-auto">
          {/* 前四個卡片：2x2 佈局 */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            {insights.slice(0, 4).map((insight, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.15,
            duration: 0.6
          }} whileHover={{
            y: -8,
            transition: {
              duration: 0.3
            }
          }}>
                <Card className={`relative h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br ${insight.gradient} backdrop-blur-sm group`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 group-hover:from-white/90 group-hover:to-white/60 transition-all duration-500" />
                  <CardContent className="relative p-8 h-full flex flex-col">
                    <div className="flex items-start gap-4 mb-6">
                      <motion.div className={`${insight.iconBg} p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300`} whileHover={{
                    rotate: [0, -5, 5, 0]
                  }} transition={{
                    duration: 0.5
                  }}>
                        {insight.icon}
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                          {insight.title}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-foreground/75 leading-relaxed text-base">
                        {insight.description}
                      </p>
                    </div>
                    
                    <motion.div className="mt-6 w-12 h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full" initial={{
                  width: 0
                }} whileInView={{
                  width: 48
                }} viewport={{
                  once: true
                }} transition={{
                  delay: index * 0.15 + 0.5,
                  duration: 0.8
                }} />
                  </CardContent>
                </Card>
              </motion.div>)}
          </div>
          
          {/* 第五個卡片：居中顯示 */}
          <div className="flex justify-center">
            <motion.div className="w-full max-w-md" initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: 0.6,
            duration: 0.6
          }} whileHover={{
            y: -8,
            transition: {
              duration: 0.3
            }
          }}>
              <Card className={`relative h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br ${insights[4].gradient} backdrop-blur-sm group`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 group-hover:from-white/90 group-hover:to-white/60 transition-all duration-500" />
                <CardContent className="relative p-8 h-full flex flex-col">
                  <div className="flex items-start gap-4 mb-6">
                    <motion.div className={`${insights[4].iconBg} p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300`} whileHover={{
                    rotate: [0, -5, 5, 0]
                  }} transition={{
                    duration: 0.5
                  }}>
                      {insights[4].icon}
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                        {insights[4].title}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-foreground/75 leading-relaxed text-base">
                      {insights[4].description}
                    </p>
                  </div>
                  
                  <motion.div className="mt-6 w-12 h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full" initial={{
                  width: 0
                }} whileInView={{
                  width: 48
                }} viewport={{
                  once: true
                }} transition={{
                  delay: 0.8,
                  duration: 0.8
                }} />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>;
};
const PainPointResonanceSection = () => <section id="pain-points" className="py-20 bg-gradient-to-b from-muted/30 to-background scroll-mt-24" aria-labelledby="pain-points-title">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div className="text-center max-w-4xl mx-auto mb-16" initial={{
      opacity: 0,
      y: 20
    }} whileInView={{
      opacity: 1,
      y: 0
    }} viewport={{
      once: true
    }}>
        <motion.div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6" whileHover={{
        scale: 1.05
      }}>
          <MessageSquare className="w-4 h-4" />
          店家心聲共鳴區
        </motion.div>
        
        <h2 id="pain-points-title" className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">「帥哥，幫我留個五星好評好嗎？」</h2>
        <div className="space-y-4">
          <p className="text-xl text-foreground/80 leading-relaxed">
            ...你也說過這句心虛的台詞嗎？
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            我們都知道口碑很重要，但「開口」的過程，卻充滿了尷尬、無力，甚至恐懼。
          </p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {[{
          icon: <Smile className="w-8 h-8 text-amber-500" />,
          title: "瞬間尷尬的「請託」",
          description: "結帳那刻，看著客人滿意地微笑，心裡千頭萬緒。\n你鼓起勇氣擠出一句：「有空幫我留個評論好嗎？」\n說完卻像從職人變成拜託人的推銷員。\n明明是用心服務，怎麼說出這句話時會有點心虛？",
          gradient: "from-amber-50 to-orange-50",
          iconBg: "bg-amber-100"
        }, {
          icon: <PersonStanding className="w-8 h-8 text-slate-600" />,
          title: "超熟悉的「下次一定」",
          description: "客人總是笑著點頭：「好啊，沒問題～」\n但你知道，當他一踏出門，被日常生活一淹沒，\n這句「好啊」通常就消失在風裡了。\n不是他不想，是這世界太忙。",
          gradient: "from-slate-50 to-gray-50",
          iconBg: "bg-slate-100"
        }, {
          icon: <Clock className="w-8 h-8 text-blue-600" />,
          title: "一刷再刷的「落空期待」",
          description: "你明明跟自己說要放下，\n但還是一天幾次打開商家頁面，偷偷期待有紅點通知出現。\n每次打開，卻又是失望。\n這種等待的焦躁，只有店主才懂。",
          gradient: "from-blue-50 to-cyan-50",
          iconBg: "bg-blue-100"
        }, {
          icon: <Star className="w-8 h-8 text-gray-500" />,
          title: "無聲無息的「五顆星」",
          description: "終於等來一則評價，滿心期待點開，卻只有五顆星，什麼都沒寫。\n你心裡是感激的，但也清楚：\n對還不認識你的人來說，這樣的評論，說服力實在太弱。",
          gradient: "from-gray-50 to-slate-50",
          iconBg: "bg-gray-100"
        }].map((painPoint, index) => <motion.div key={index} initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: index * 0.15,
          duration: 0.6
        }} whileHover={{
          y: -8,
          transition: {
            duration: 0.3
          }
        }}>
              <Card className={`relative h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br ${painPoint.gradient} backdrop-blur-sm group`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 group-hover:from-white/90 group-hover:to-white/60 transition-all duration-500" />
                <CardContent className="relative p-8 h-full flex flex-col">
                  <div className="flex items-start gap-4 mb-6">
                    <motion.div className={`${painPoint.iconBg} p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300`} whileHover={{
                  rotate: [0, -5, 5, 0]
                }} transition={{
                  duration: 0.5
                }}>
                      {painPoint.icon}
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                        {painPoint.title}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-foreground/75 leading-relaxed whitespace-pre-line text-base">
                      {painPoint.description}
                    </p>
                  </div>
                  
                  <motion.div className="mt-6 w-12 h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full" initial={{
                width: 0
              }} whileInView={{
                width: 48
              }} viewport={{
                once: true
              }} transition={{
                delay: index * 0.15 + 0.5,
                duration: 0.8
              }} />
                </CardContent>
              </Card>
            </motion.div>)}
        </div>
        
        {/* Call to Action */}
        <motion.div className="text-center mt-16" initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        delay: 0.8
      }}>
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-8 border border-primary/20 brand-shadow max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              還在為這些困擾煩惱嗎？
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              讓我們幫您打破這個困境，讓客人的真實感受，自然而然地成為您最好的口碑推廣。
            </p>
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
  </section>;

// Founder Story Section Component (已修改，加入痛點連結)
const FounderStorySection = () => <section id="founder-story" className="py-20 bg-background scroll-mt-24" aria-labelledby="founder-story-title">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div className="text-center max-w-3xl mx-auto" initial={{
      opacity: 0,
      y: 20
    }} whileInView={{
      opacity: 1,
      y: 0
    }} viewport={{
      once: true
    }} transition={{
      duration: 0.6
    }}>
        <BookUser className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 id="founder-story-title" className="text-3xl md:text-4xl font-bold text-foreground mb-6">
          我的故事
        </h2>
        <p className="text-xl text-muted-foreground mb-6">
          從「自己的眼鏡」到「自己的評論」
        </p>
        <div className="bg-muted rounded-xl p-8 border text-left space-y-4 text-lg text-foreground/85 leading-relaxed max-w-none">
          <p>
            「大家好，我是一位驗光師。我在三峽，開了一間眼鏡行，店名就叫做<strong className="text-foreground">『自己的眼鏡』</strong>。
          </p>
          <p>
            我的初衷很簡單，就是實現一句話：『配自己的眼鏡』——幫助每位客人，找到一副從度數到風格，都真正屬於他們自己的眼鏡。
          </p>
          <p>
            在服務客人的過程中我發現，他們對我們專業的感謝、對找到命定眼鏡的喜悅，常常只留在心裡。所以我將『配自己的眼鏡』這個理念，延伸到了數位世界，開發了<strong className="text-foreground">『自己的評論』</strong>這套系統。
          </p>
          <p className="font-bold text-foreground">
            我希望用我服務客人的專業，幫助更多像我一樣的店家，將顧客最真實的感受，配成最有價值的網路口碑。」
          </p>
        </div>
      </motion.div>
    </div>
  </section>;
const LandingPage = () => {
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    plan: any;
  }>({
    isOpen: false,
    plan: null
  });
  const features = [{
    icon: <MessageSquare className="w-8 h-8 text-brand-sage" />,
    title: "心理引導系統",
    description: "用行銷心理學引導問題，幫助顧客說出連自己都沒意識到的感受",
    highlight: "核心功能"
  }, {
    icon: <Target className="w-8 h-8 text-brand-gold" />,
    title: "E-E-A-T 品質保證",
    description: "符合 Google 高品質內容標準，產生真正有價值的體驗分享",
    highlight: "Google 喜歡"
  }, {
    icon: <BarChart3 className="w-8 h-8 text-brand-coral" />,
    title: "真實性分析",
    description: "監測分享內容的真實性和可信度，確保符合平台規範",
    highlight: "可信度高"
  }, {
    icon: <Clock className="w-8 h-8 text-brand-indigo" />,
    title: "智慧感受捕捉",
    description: "自動識別顧客的情緒和體驗，建議最合適的表達方式",
    highlight: "AI 智慧"
  }, {
    icon: <Shield className="w-8 h-8 text-success" />,
    title: "負面體驗也能分享",
    description: "不強制正面評價，尊重真實感受，讓負面體驗成為改進的動力",
    highlight: "真實為本"
  }, {
    icon: <Smartphone className="w-8 h-8 text-brand-sage-light" />,
    title: "體驗分享範例",
    description: "提供真實的分享範例，學習如何將感受轉化為有價值的經驗分享",
    highlight: "學習淺高"
  }];
  const handlePaymentSuccess = async () => {
    try {
      // Capture planType before closing modal to avoid potential null reference
      const planType = paymentModal.plan?.planType;

      // 在實際應用中，這裡會創建用戶帳號和店家記錄
      // 然後創建訂閱記錄
      console.log("🎉 歡迎加入 自己的評論！");

      // 關閉付款模態框
      setPaymentModal({
        isOpen: false,
        plan: null
      });

      // 導向註冊頁面並帶上方案資訊
      window.location.href = `/register?plan=${planType}&payment=success`;
    } catch (error) {
      console.error("訂閱創建錯誤:", error);
    }
  };
  const handlePlanSelect = (plan: any) => {
    if (plan.planType === "trial") {
      // 免費試用直接跳轉註冊
      window.location.href = `/register?plan=trial`;
    } else if (plan.planType === "monthly" || plan.planType === "quarterly" || plan.planType === "yearly") {
      // 付費方案直接跳轉到專業版價格頁面
      window.location.href = `/pricing`;
    } else {
      // 其他方案開啟付款模態框
      setPaymentModal({
        isOpen: true,
        plan
      });
    }
  };
  const pricingPlans = [{
    name: "7天免費試用",
    price: "免費",
    period: "7天試用",
    description: "新店家限定，體驗完整功能",
    features: ["48個關鍵感受配額（最佳配置）", "無限制評論生成", "AI智慧評論優化", "優先客服支援"],
    buttonText: "立即開始試用",
    buttonVariant: "outline" as const,
    popular: false,
    planType: "trial"
  }, {
    name: "月訂閱",
    price: "NT$ 500",
    period: "每月",
    description: "彈性使用，隨時可調整",
    features: ["48個關鍵感受配額（最佳配置）", "無限制評論生成", "AI智慧評論優化", "優先客服支援"],
    buttonText: "立即訂閱",
    buttonVariant: "default" as const,
    popular: false,
    planType: "monthly"
  }, {
    name: "季訂閱",
    price: "NT$ 1,200",
    period: "每季",
    originalPrice: "NT$ 1,500",
    discount: "省下20%",
    description: "平衡選擇，一季省下300元",
    features: ["48個關鍵感受配額（最佳配置）", "無限制評論生成", "AI智慧評論優化", "優先客服支援"],
    buttonText: "立即訂閱",
    buttonVariant: "default" as const,
    popular: false,
    planType: "quarterly"
  }, {
    name: "年訂閱",
    price: "NT$ 3,600",
    period: "每年",
    originalPrice: "NT$ 6,000",
    discount: "省下40%",
    description: "最受歡迎，一年省下2,400元",
    features: ["48個關鍵感受配額（最佳配置）", "無限制評論生成", "AI智慧評論優化", "優先客服支援", "⭐ 年付優惠，平均每月僅300元"],
    buttonText: "立即訂閱（最划算）",
    buttonVariant: "default" as const,
    popular: true,
    planType: "yearly"
  }];
  return <div className="min-h-screen bg-background text-foreground">
      <EnhancedNavigation />

      <main>
        <section id="hero" className="pt-32 pb-20 relative overflow-hidden hero-gradient scroll-mt-24" aria-labelledby="hero-title">
          <div className="section-container">
            <div className="text-center max-w-4xl mx-auto relative">
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.6
            }}>
                <motion.div whileHover={{
                scale: 1.05
              }} transition={{
                type: "spring",
                stiffness: 300
              }}>
                  <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    <BookUser className="w-4 h-4 mr-2" />
                    一位驗光師的碩士論文實踐
                  </Badge>
                </motion.div>
                
                <motion.h1 id="hero-title" className="text-4xl md:text-6xl font-bold mb-6 leading-loose" initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.2,
                duration: 0.6
              }}>
                  別讓你的<span className="text-error animate-pulse font-bold">專業</span>
                  <br className="mb-4" />
                  <span className="text-gradient animate-gradient">
                    只留在客人的心裡
                  </span>
                </motion.h1>
                
                <motion.div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-primary/20 brand-shadow" initial={{
                opacity: 0,
                scale: 0.95
              }} animate={{
                opacity: 1,
                scale: 1
              }} transition={{
                delay: 0.4,
                duration: 0.6
              }} whileHover={{
                scale: 1.02,
                boxShadow: "0 20px 60px -10px hsl(var(--primary) / 0.25)"
              }}>
                  <p className="text-lg text-foreground/85 font-medium flex items-center justify-center gap-2 leading-relaxed">
                    <Smile className="w-5 h-5 text-primary animate-bounce" />
                    每次客人說：「服務很好耶～」我總是笑著點頭。<br />但到了結帳，還是只能尷尬地說：「有空幫我留個好評喔！」然後……就沒有然後了。
                  </p>
                </motion.div>
                
                <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12" initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.6,
                duration: 0.6
              }}>
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
              
              {/* Floating decoration */}
              <motion.div className="absolute top-20 right-10 w-20 h-20 bg-primary/10 rounded-full blur-xl" animate={{
              y: [-10, 10, -10]
            }} transition={{
              duration: 3,
              repeat: Infinity
            }} />
              <motion.div className="absolute bottom-20 left-10 w-16 h-16 bg-accent/10 rounded-full blur-xl" animate={{
              y: [10, -10, 10]
            }} transition={{
              duration: 4,
              repeat: Infinity
            }} />
            </div>
          </div>
        </section>

        <PainPointResonanceSection />
        
        <StrategicInsightsSection />
        
        {/* **這裡是全新的魔法展示間** */}
        <HowItWorksSection />

        <FounderStorySection />
        
        {/* 功能特色 */}
        <section id="features" className="py-20 bg-background scroll-mt-24" aria-labelledby="features-title">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }}>
            <h2 id="features-title" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              一個為「專業」而生的系統
            </h2>
            <p className="text-xl text-foreground/85 max-w-2xl mx-auto leading-relaxed">
              每個功能，都來自第一線的深刻體會，只為解決店家最真實的痛點。
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => <motion.div key={index} initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              delay: index * 0.1
            }}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 bg-card border-0 shadow-md">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      {feature.icon}
                      <Badge variant="secondary" className="text-xs">
                        {feature.highlight}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/85 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>)}
          </div>
        </div>
      </section>

        {/* 價格方案 */}
        <section id="pricing" className="py-20 bg-gray-50 scroll-mt-24" aria-labelledby="pricing-title">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              選擇最適合您的方案
            </h2>
            <p className="text-xl text-primary font-semibold max-w-2xl mx-auto">
              一個讓每家小店都用得起的專業工具
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {pricingPlans.map((plan, index) => <motion.div key={index} initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              delay: index * 0.1
            }}>
                <Card className={`h-full relative ${plan.popular ? 'border-primary border-2' : 'border-border'}`}>
                  {plan.popular && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3 py-1">
                        🔥 最受歡迎
                      </Badge>
                    </div>}
                  
                  {(plan as any).discount && <div className="absolute -top-3 right-4">
                      <Badge className="bg-destructive text-destructive-foreground px-2 py-1 text-xs">
                        {(plan as any).discount}
                      </Badge>
                    </div>}
                  
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-primary">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground ml-2">/ {plan.period}</span>}
                    </div>
                    
                    {(plan as any).originalPrice && <div className="text-sm text-muted-foreground line-through mb-1">
                        原價 {(plan as any).originalPrice}
                      </div>}
                    
                    <p className="text-muted-foreground h-10">{plan.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                     <ul className="space-y-3 flex-grow">
                       {plan.features.map((feature, featureIndex) => <li key={featureIndex} className="flex items-start gap-3">
                           <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                           <span className="text-foreground/80">{feature}</span>
                         </li>)}
                     </ul>
                    
                    <div className="pt-6">
                      <Button className="w-full" variant={plan.buttonVariant} size="lg" onClick={() => handlePlanSelect(plan)}>
                        {plan.buttonText}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>)}
          </div>
        </div>
      </section>

        {/* 客戶見證 - 使用 EnhancedTestimonials */}
        <EnhancedTestimonials />

        {/* CTA 區塊 */}
      <section className="relative py-24 md:py-28 hero-gradient">
  {/* 細緻背景紋理，讓漸層更有層次（可移除） */}
  <div className="pointer-events-none absolute inset-0 opacity-15 [background:radial-gradient(60rem_30rem_at_50%_-10%,white,transparent)]" />

  <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} className="max-w-3xl mx-auto">

      {/* 主標 */}
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
        準備好，讓你的「專業」被看見
      </h2>

      {/* 副標 */}
      <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
        我就是你的第一個客戶顧問。<br />立即開始免費試用，讓我親自協助你，把你的好，變成更多生意。
      </p>

      {/* CTA 區：玻璃卡片承載，對比更清楚 */}
      <div className="mx-auto max-w-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch">
          <Link to="/register" className="sm:flex-1">
            <Button size="lg" className="w-full bg-white text-blue-700 hover:bg-blue-50 text-base md:text-lg px-6 py-4 font-semibold shadow">
              立即免費註冊
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Button>
          </Link>

          {/* 次要 CTA：方案一（藍底白字） */}
         <a href="https://lin.ee/DkXrNAq" target="_blank" rel="noopener noreferrer" className="sm:flex-1">
    <Button size="lg" className="w-full bg-blue-700 text-white hover:bg-blue-800 text-base md:text-lg px-6 py-4 font-semibold shadow">
      <MessageSquare className="mr-2 h-5 w-5" aria-hidden="true" />
      直接與我聊聊
    </Button>
  </a>
        </div>

        {/* 免責提詞 */}
        <p className="text-muted-foreground mt-3 text-xs md:text-sm">
          💳 免費試用 · 無需信用卡 · 隨時取消
        </p>
      </div>
    </motion.div>
  </div>
      </section>



      </main>

      {/* --- 全新設計：頁尾 --- */}
      <footer className="bg-muted/50 text-foreground py-8 border-t">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <img src="/lovable-uploads/40b8add3-b8f5-4e78-8a90-9987bc19b773.png" alt="Myownreviews" className="h-6 w-6" />
            <span className="text-lg font-bold">Myownreviews 自己的評論</span>
          </div>
          <p className="text-muted-foreground text-sm">
            華文小店家的數位轉型夥伴
          </p>
          <div className="flex justify-center space-x-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary">關於我們</a>
            <a href="#" className="hover:text-primary">聯繫客服</a>
          </div>
          <p className="text-xs text-muted-foreground/80">
            &copy; 2024 自己的評論. 版權所有.
          </p>
        </div>
      </footer>


      <Suspense fallback={<div>載入中...</div>}>
        <PaymentModal isOpen={paymentModal.isOpen} onClose={() => setPaymentModal({
        isOpen: false,
        plan: null
      })} plan={paymentModal.plan} onPaymentSuccess={handlePaymentSuccess} />
      </Suspense>
    </div>;
};
export default LandingPage;