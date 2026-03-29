import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Layers, PiggyBank } from "lucide-react";

const benefits = [
  {
    icon: QrCode,
    title: "掃一個 QR code 就能教顧客怎麼寫",
    description:
      "不用你一個字一個字教，顧客照著問題回答，就能寫出真實又好看的評論。",
  },
  {
    icon: Layers,
    title: "各行各業都有專屬話術",
    description:
      "眼鏡、美業、診所、宮廟… 已經幫你設計好顧客看得懂、也寫得出來的關鍵提示。",
  },
  {
    icon: PiggyBank,
    title: "每天不到 10 元，幫你養一個評論小編",
    description:
      "月付 500、季付 1,200、年付 3,600，比請人處理評論便宜很多，也不會請假。",
  },
];

const BenefitsSection = () => {
  return (
    <section className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-foreground text-center leading-snug">
        接下來，讓顧客自己幫你
        <br className="sm:hidden" />
        寫出這種評論
      </h2>

      <div className="grid gap-4">
        {benefits.map((b) => (
          <Card key={b.title} className="border border-border bg-card">
            <CardContent className="p-5 flex gap-4 items-start">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <b.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground leading-snug">
                  {b.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {b.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default BenefitsSection;
