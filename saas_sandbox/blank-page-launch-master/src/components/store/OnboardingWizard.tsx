import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useIndustryTree } from "@/hooks/useIndustryTree";
import { CheckCircle, ArrowRight, ArrowLeft, Sparkles, Loader2 } from "lucide-react";

interface OnboardingWizardProps {
  storeId: string;
  onComplete: () => void;
}

export const OnboardingWizard = ({ storeId, onComplete }: OnboardingWizardProps) => {
  const { toast } = useToast();
  const { data: tree = [], isLoading: treeLoading } = useIndustryTree();
  const [step, setStep] = useState(1);
  const [selectedParent, setSelectedParent] = useState("");
  const [selectedChild, setSelectedChild] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const currentParent = tree.find((p) => p.value === selectedParent);
  const children = currentParent?.children || [];
  const selectedChildObj = children.find((c) => c.value === selectedChild);

  const handleApplyTemplate = async () => {
    if (!selectedChild) return;
    setIsApplying(true);

    try {
      // 1. Update store industry with child template_id
      const { error: updateError } = await supabase
        .from("stores")
        .update({
          industry: selectedChild,
          onboarding_completed: true,
        })
        .eq("id", storeId);

      if (updateError) throw updateError;

      // 2. Fetch template keywords from DB
      const { data: template, error: templateError } = await supabase
        .from("industry_templates")
        .select("keywords")
        .eq("template_id", selectedChild)
        .eq("is_active", true)
        .single();

      if (templateError) throw templateError;

      if (template?.keywords && Array.isArray(template.keywords)) {
        // 3. Delete any existing keywords for this store
        await supabase.from("store_keywords").delete().eq("store_id", storeId);

        // 4. Insert template keywords
        const mapCat = (cat: string): "general" | "product" | "service" | "location" | "experience" => {
          const m: Record<string, "general" | "product" | "service" | "location" | "experience"> = {
            general: "general", product: "product", service: "service", location: "location", experience: "experience",
            price: "general", tech: "product", env: "experience",
          };
          return m[cat] || "general";
        };
        const rawKeywords = template.keywords as Array<{ text?: string; keyword?: string; category?: string }>;
        const keywordsToInsert = rawKeywords.map((kw, idx) => ({
          store_id: storeId,
          keyword: kw.text || kw.keyword || '',
          category: mapCat(kw.category || "general"),
          source: "system",
          priority: idx,
          industry: selectedChild,
          is_sandbox: false,
        }));

        const { error: insertError } = await supabase
          .from("store_keywords")
          .insert(keywordsToInsert);

        if (insertError) throw insertError;
      }

      toast({
        title: "🎉 設定完成！",
        description: "已為你準備好專屬關鍵字，可以開始邀請顧客留下評論了。",
      });

      onComplete();
    } catch (err) {
      console.error("Onboarding error:", err);
      toast({
        variant: "destructive",
        title: "設定失敗",
        description: "請稍後再試，或聯繫客服協助。",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const steps = [
    { num: 1, label: "選擇大類" },
    { num: 2, label: "選擇子類" },
    { num: 3, label: "開始使用" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-sage-light/20 via-background to-brand-sage/10 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step >= s.num
                    ? "bg-brand-sage text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-sm hidden sm:inline ${step >= s.num ? "text-brand-sage-dark font-medium" : "text-muted-foreground"}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${step > s.num ? "bg-brand-sage" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Select Parent Industry */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 shadow-2xl">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      歡迎！請選擇你的產業大類
                    </h2>
                    <p className="text-muted-foreground">
                      先選擇產業大類，下一步再選擇更精確的子類別。
                    </p>
                  </div>

                  {treeLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-sage" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {tree.map((parent) => (
                        <motion.button
                          key={parent.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedParent(parent.value);
                            setSelectedChild(""); // reset child
                          }}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            selectedParent === parent.value
                              ? "border-brand-sage bg-brand-sage/10 shadow-md"
                              : "border-border hover:border-brand-sage/40 hover:bg-accent"
                          }`}
                        >
                          <span className="text-2xl">{parent.emoji}</span>
                          <p className="font-semibold text-sm mt-1 text-foreground">{parent.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {parent.children.length} 個子類
                          </p>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!selectedParent}
                      className="bg-brand-sage hover:bg-brand-sage-dark"
                    >
                      下一步
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Select Child Template */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 shadow-2xl">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      選擇「{currentParent?.emoji} {currentParent?.label}」的子類別
                    </h2>
                    <p className="text-muted-foreground">
                      系統將根據你選的子類別，套用 48 個專屬推薦關鍵字。
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {children.map((child) => (
                      <motion.button
                        key={child.value}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedChild(child.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                          selectedChild === child.value
                            ? "border-brand-sage bg-brand-sage/10 shadow-md"
                            : "border-border hover:border-brand-sage/40 hover:bg-accent"
                        }`}
                      >
                        <span className="text-2xl">{child.emoji}</span>
                        <div>
                          <p className="font-semibold text-foreground">{child.label}</p>
                          <p className="text-xs text-muted-foreground">48 個專屬關鍵字</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      上一步
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!selectedChild}
                      className="bg-brand-sage hover:bg-brand-sage-dark"
                    >
                      下一步
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Apply & Complete */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 shadow-2xl">
                <CardContent className="p-8 text-center">
                  {isApplying ? (
                    <div className="py-8">
                      <Loader2 className="w-12 h-12 animate-spin text-brand-sage mx-auto mb-4" />
                      <h2 className="text-xl font-bold text-foreground">正在為你設定...</h2>
                      <p className="text-muted-foreground mt-2">套用產業模板與關鍵字中</p>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-16 h-16 text-brand-gold mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-foreground mb-2">準備就緒！</h2>
                      <div className="bg-accent rounded-xl p-6 mb-6">
                        <p className="text-sm text-muted-foreground">你選擇的產業模板</p>
                        <p className="text-lg font-bold mt-1 text-foreground">
                          {currentParent?.emoji} {currentParent?.label} → {selectedChildObj?.emoji} {selectedChildObj?.label}
                        </p>
                        <Badge className="mt-2 bg-brand-sage/10 text-brand-sage-dark">
                          48 個專屬推薦關鍵字
                        </Badge>
                      </div>
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm text-primary text-left mb-6">
                        <p>✨ 套用後你可以隨時修改、新增或刪除關鍵字。</p>
                        <p className="mt-1">💡 這些關鍵字會在顧客生成評論時自動顯示。</p>
                      </div>
                      <Button
                        size="lg"
                        onClick={handleApplyTemplate}
                        className="bg-brand-sage hover:bg-brand-sage-dark text-lg px-8"
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        開始使用
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setStep(2)}
                        className="mt-3 block mx-auto text-muted-foreground"
                      >
                        返回上一步
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
