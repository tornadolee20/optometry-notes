import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TrialCtaSection = () => {
  const navigate = useNavigate();

  return (
    <section>
      <Card className="border-2 border-primary/30 bg-primary/5 shadow-lg">
        <CardContent className="p-6 sm:p-8 space-y-4 text-center">
          <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
            想讓你的 Google 評論也長這樣？
            <br />
            先從 7 天免費試用開始
          </h2>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            不用綁約、隨時可以停用。試用期間我會用 LINE 教你怎麼導入到你的店。
          </p>

          <Button
            size="lg"
            className="w-full sm:w-auto h-12 text-base px-8"
            onClick={() => navigate("/register")}
          >
            我要免費試用 7 天
            <ArrowRight />
          </Button>

          <p className="text-xs text-muted-foreground">
            還在想？
            <button
              onClick={() => navigate("/")}
              className="underline underline-offset-2 text-primary hover:text-primary/80 transition-colors ml-1"
            >
              先看看完整介紹與教學 →
            </button>
          </p>
        </CardContent>
      </Card>
    </section>
  );
};

export default TrialCtaSection;
