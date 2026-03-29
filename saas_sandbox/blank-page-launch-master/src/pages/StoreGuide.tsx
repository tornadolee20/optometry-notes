import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const StoreGuide = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-sage-light/10 via-background to-brand-sage/5">
      {/* 導航欄 */}
      <div className="bg-background/90 backdrop-blur-md border-b border-brand-sage/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 max-w-4xl mx-auto">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/store/${storeId}`)} className="text-brand-sage-dark hover:bg-brand-sage/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回儀表板
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-sage-dark" />
              <h1 className="text-xl font-bold text-brand-sage-dark">使用說明</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">店家操作手冊</h2>
          <p className="text-muted-foreground mt-1">關鍵字設定、評論生成與 QR Code 完整使用說明</p>
        </div>

        <div className="bg-background rounded-xl border shadow-sm p-6 lg:p-8">
          <Accordion type="multiple" defaultValue={["keywords"]} className="w-full space-y-2">
            {/* 關鍵字設定 */}
            <AccordionItem value="keywords" className="border rounded-lg px-4">
              <AccordionTrigger className="text-base font-semibold">關鍵字設定（最重要！）</AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                <h4 className="font-semibold text-foreground">■ 什麼是「感受關鍵字」？</h4>
                <p>感受關鍵字是店家提前設定的「顧客真實感受描述詞」。當顧客掃描 QR Code 要留評論時，這些關鍵字會出現在介面上，讓顧客快速點選符合的感受。AI 會根據這些關鍵字生成個人化、有溫度的 Google 評論內容。</p>

                <h4 className="font-semibold text-foreground mt-4">■ 關鍵字設定規則</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>每家店最多可設定 48 個關鍵字</li>
                  <li>每個關鍵字建議 3～7 字，簡短有力（例如：「服務親切」、「環境乾淨舒適」）</li>
                  <li>關鍵字依分類顯示（整體印象、服務、環境等）</li>
                  <li>常被顧客點選的關鍵字會標示為「最常用」</li>
                </ul>

                <h4 className="font-semibold text-foreground mt-4">■ 新增關鍵字（3 種方式）</h4>

                <p className="font-medium text-foreground mt-3">方式一：手動輸入</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>在「輸入自訂感受關鍵字（3-7字）」欄位輸入文字</li>
                  <li>按 Enter 或點擊「新增」</li>
                  <li>系統確認字數合規後加入列表</li>
                </ol>

                <p className="font-medium text-foreground mt-3">方式二：AI 智能建議</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>點擊「AI 智能建議」按鈕</li>
                  <li>系統自動依該店家的行業別，建議 8 個最適合的關鍵字</li>
                  <li>逐一點擊想要的建議詞，即可加入</li>
                </ol>

                <p className="font-medium text-foreground mt-3">方式三：批次匯入</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>準備 CSV 格式的關鍵字清單（每行一個）</li>
                  <li>點擊「下載」旁的匯入按鈕（若有開放）</li>
                  <li>上傳後系統自動驗證格式</li>
                </ol>

                <h4 className="font-semibold text-foreground mt-4">■ 刪除關鍵字</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>在關鍵字列表中找到要刪除的詞</li>
                  <li>點擊該詞右側的「✕」刪除</li>
                  <li>刪除後立即生效，顧客介面同步更新</li>
                </ul>

                <h4 className="font-semibold text-foreground mt-4">■ 搜尋關鍵字</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>使用「搜索關鍵字...」輸入框，即時篩選已設定的關鍵字</li>
                  <li>可依分類（全部 / 整體印象 / 服務...）切換查看</li>
                </ul>

                <h4 className="font-semibold text-foreground mt-4">■ 下載關鍵字清單</h4>
                <p>點擊右上角「下載」按鈕，匯出目前所有關鍵字為 CSV</p>

                <h4 className="font-semibold text-foreground mt-4">■ 常見問題</h4>
                <div className="space-y-3 mt-2">
                  <div>
                    <p className="font-medium text-foreground">Q：關鍵字設好後多久生效？</p>
                    <p>A：立即生效。顧客掃描 QR Code 後即可看到最新的關鍵字。</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Q：關鍵字一定要設嗎？</p>
                    <p>A：強烈建議設定。沒有關鍵字時，AI 仍可生成評論，但內容會較為通用，缺乏店家特色。設定越豐富，生成的評論越精準有力。</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Q：什麼樣的關鍵字效果最好？</p>
                    <p>A：具體描述店家特色的詞彙效果最佳。避免過於模糊如「不錯」、「好」，建議如「驗光師耐心解說」、「鏡框款式齊全」、「配鏡快速準確」。</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 評論生成與 QR Code */}
            <AccordionItem value="review-qr" className="border rounded-lg px-4">
              <AccordionTrigger className="text-base font-semibold">評論生成與 QR Code</AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                <h4 className="font-semibold text-foreground">■ 評論生成流程</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>顧客掃描店家 QR Code</li>
                  <li>進入評論頁面，選擇星級與感受關鍵字</li>
                  <li>AI 根據選擇自動生成評論文字</li>
                  <li>顧客可微調後，複製貼上至 Google 評論</li>
                </ol>

                <h4 className="font-semibold text-foreground mt-4">■ QR Code 下載</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>在店家儀表板最下方點擊「下載 QR Code」</li>
                  <li>支援下載 PNG 格式，可印製或貼在店內</li>
                </ul>

                <h4 className="font-semibold text-foreground mt-4">■ 評論系統網址</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>每家店有專屬網址：<code className="bg-muted px-1.5 py-0.5 rounded text-xs">https://[專案網址]/[店家編號]/generate-review</code></li>
                  <li>可複製此網址建立自訂短網址或放在社群媒體</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* 快速操作對照 */}
            <AccordionItem value="quick-ref" className="border rounded-lg px-4">
              <AccordionTrigger className="text-base font-semibold">快速操作對照表</AccordionTrigger>
              <AccordionContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2.5 px-3 font-semibold text-foreground">我想要...</th>
                        <th className="text-left py-2.5 px-3 font-semibold text-foreground">怎麼做</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      {[
                        ["設定感受關鍵字", "下滑找到「感受關鍵字管理」區塊"],
                        ["用 AI 建議關鍵字", "關鍵字管理 → 點擊「AI 智能建議」"],
                        ["下載 QR Code", "頁面最底部「下載 QR Code」"],
                        ["複製評論系統網址", "頁面中「評論系統網址」區塊 → 複製"],
                        ["查看評論生成頁", "點擊「生成評論」快速操作按鈕"],
                      ].map(([want, how], i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2.5 px-3 font-medium text-foreground">{want}</td>
                          <td className="py-2.5 px-3">{how}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default StoreGuide;
