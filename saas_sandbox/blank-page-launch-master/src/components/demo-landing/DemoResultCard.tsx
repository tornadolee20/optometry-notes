import { Card } from "@/components/ui/card";

interface DemoResultCardProps {
  review: string | null;
}

const DemoResultCard = ({ review }: DemoResultCardProps) => {
  if (!review) {
    return (
      <section className="rounded-xl border bg-muted/30 p-4 sm:p-5 space-y-2">
        <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug">
          為什麼「多一篇好評論」這麼重要？
        </h3>
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            同一排店家裡，那幾篇寫得真實又詳細的 Google 評論，往往決定客人先點誰、先走進哪一家。
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            問題是，客人願意幫忙，卻不知道怎麼寫，不會打字、怕講不好。
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            這套系統做的，就是把客人口頭說的優點，整理成一篇看得懂、看了就想來的評論。
          </p>
        </div>
      </section>);

  }

  return (
    <section className="space-y-3">
      <p className="text-sm font-semibold text-status-success-fg text-center">
        這樣的評論，顧客看到會更敢來第一次。
      </p>

      {/* Google review mock card */}
      <Card className="border border-border shadow-lg bg-card">
        





























        
      </Card>
    </section>);

};

export default DemoResultCard;