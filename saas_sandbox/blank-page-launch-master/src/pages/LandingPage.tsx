import { useState, lazy, Suspense } from "react";
import { EnhancedNavigation } from "@/components/enhanced/EnhancedNavigation";
import { EnhancedTestimonials } from "@/components/enhanced/EnhancedTestimonials";
import { HeroSection, FeaturesSection, PricingSection, CTASection, FooterSection } from "@/components/landing";
import type { PricingPlan } from "@/components/landing";
import { SEOHead } from "@/components/SEOHead";

// Inline section components kept here since they're tightly coupled to this page's copy
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { StrategicInsightsSection } from "@/components/landing/StrategicInsightsSection";
import { PainPointResonanceSection } from "@/components/landing/PainPointResonanceSection";
import { FounderStorySection } from "@/components/landing/FounderStorySection";

const PaymentModal = lazy(() => import("@/components/subscription/PaymentModal").then(module => ({
  default: module.PaymentModal
})));

const LandingPage = () => {
  const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; plan: PricingPlan | null }>({
    isOpen: false,
    plan: null,
  });

  const handlePaymentSuccess = async () => {
    try {
      const planType = paymentModal.plan?.planType;
      setPaymentModal({ isOpen: false, plan: null });
      window.location.href = `/register?plan=${planType}&payment=success`;
    } catch (error) {
      console.error("訂閱創建錯誤:", error);
    }
  };

  const handlePlanSelect = (plan: PricingPlan) => {
    if (plan.planType === "trial") {
      window.location.href = `/register?plan=trial`;
    } else if (plan.planType === "monthly" || plan.planType === "quarterly" || plan.planType === "yearly") {
      window.location.href = `/pricing`;
    } else {
      setPaymentModal({ isOpen: true, plan });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Myownreviews｜AI 評論系統，自動蒐集 Google 評論，幫實體門市每天穩定長出好口碑"
        description="Myownreviews 是專為眼鏡行、視光所與實體門市設計的 AI 評論系統，透過 LINE 蒐集真實顧客回饋，自動生成可貼上 Google 的評論草稿，提升自然搜尋流量與新客預約。"
        canonical="https://myownreviews.com"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Myownreviews",
            url: "https://myownreviews.com",
            logo: "https://myownreviews.com/lovable-uploads/40b8add3-b8f5-4e78-8a90-9987bc19b773.png",
          },
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Myownreviews AI 評論系統",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description: "專為眼鏡行、視光所與實體門市設計的 AI 評論系統，透過 LINE 蒐集顧客回饋，自動生成 Google 評論草稿，幫助店家穩定累積真實口碑。",
            offers: { "@type": "Offer", price: "0", priceCurrency: "TWD" },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "為什麼實體門市需要 AI 評論系統？",
                acceptedAnswer: { "@type": "Answer", text: "Google 評論是新客決定是否到店消費的關鍵依據。AI 評論系統幫你自動且持續地累積真實好評，提升自然搜尋排名與來客數。" },
              },
              {
                "@type": "Question",
                name: "顧客留下的內容會不會是假的？",
                acceptedAnswer: { "@type": "Answer", text: "不會。所有內容都來自真實顧客透過掃碼或 LINE 對話留下的回饋，AI 只是協助將口語整理成結構化的評論草稿。" },
              },
              {
                "@type": "Question",
                name: "需要員工會打字或寫文案嗎？",
                acceptedAnswer: { "@type": "Answer", text: "完全不需要。員工只要依照 SOP 請顧客掃碼、回答幾句話，系統就會自動生成評論草稿。" },
              },
              {
                "@type": "Question",
                name: "支援哪些產業？",
                acceptedAnswer: { "@type": "Answer", text: "目前主打眼鏡行與視光所，並逐步擴展到宮廟、社團法人等需要口碑累積的場域。" },
              },
            ],
          },
        ]}
      />
      <EnhancedNavigation />
      <main>
        <HeroSection />
        <PainPointResonanceSection />
        <StrategicInsightsSection />
        <HowItWorksSection />
        <FounderStorySection />
        <FeaturesSection />
        <PricingSection onPlanSelect={handlePlanSelect} />
        <EnhancedTestimonials />
        <CTASection />
      </main>
      <FooterSection />
      <Suspense fallback={<div>載入中...</div>}>
        <PaymentModal
          isOpen={paymentModal.isOpen}
          onClose={() => setPaymentModal({ isOpen: false, plan: null })}
          plan={paymentModal.plan!}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </Suspense>
    </div>
  );
};

export default LandingPage;
