import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const DemoLoginSection = () => {
  const navigate = useNavigate();

  return (
    <section className="rounded-xl border bg-muted/40 p-4 sm:p-6 space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        已經有帳號？從這裡登入完整系統
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed">
        登入後，可以看到完整的 48 個關鍵字選擇、顧客實際勾選 16 個，以及真正會出現在 Google 的評論頁面。
      </p>
      <Button size="sm" onClick={() => navigate("/login")}>
        <LogIn className="mr-1.5 h-3.5 w-3.5" />
        會員登入
      </Button>
      <p className="text-[11px] text-muted-foreground/70">
        小提醒：業主可以用自己的帳號登入，我會用測試帳號示範完整流程。
      </p>
    </section>
  );
};

export default DemoLoginSection;
