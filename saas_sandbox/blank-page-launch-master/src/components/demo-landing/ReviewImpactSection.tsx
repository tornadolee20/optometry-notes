import { CheckCircle } from "lucide-react";

const bullets = [
  "在同一排店家裡，多幾篇 4–5 星評論，實驗顯示可以多拿到 20–30% 的點擊，客人會先點你再說。",
  "國外研究發現，評分每多 1 星，店家營收平均可以多 5–9%，等於同樣房租、人力，多賺一個『隱形分店』。",
  "有評論、而且看起來寫得真實詳細的店家，超過一半以上的消費者會優先選它，連名字普通也沒關係。",
  "好評論累積起來，Google 比較願意把你排在前面，帶來更多人點進來看、打電話、直接走進門市。",
];

const ReviewImpactSection = () => (
  <section className="rounded-xl border bg-muted/30 p-4 sm:p-6 space-y-4">
    <h2 className="text-base sm:text-lg font-bold text-foreground leading-snug">
      一篇寫得好的 Google 評論，可以帶來什麼？
    </h2>
    <ul className="space-y-3">
      {bullets.map((text, i) => (
        <li key={i} className="flex gap-2.5 items-start">
          <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span className="text-sm text-foreground/90 leading-relaxed">{text}</span>
        </li>
      ))}
    </ul>
    <p className="text-xs text-muted-foreground leading-relaxed pt-1">
      問題是，多數客人願意幫忙，卻不知道怎麼寫。我們做的，就是把他們嘴巴說的優點，整理成一篇看得懂、會想來的評論。
    </p>
  </section>
);

export default ReviewImpactSection;
