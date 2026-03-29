import { BookOpen } from "lucide-react";
import { AdminPageWrapper, AdminPageHeader } from "@/components/admin/AdminPageWrapper";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const AdminManual = () => {
  return (
    <AdminPageWrapper>
      <AdminPageHeader
        title="操作手冊"
        description="完整系統使用說明，讓每一步都清楚無誤"
      >
        <div className="p-2.5 rounded-lg" style={{ backgroundColor: '#dcfce7' }}>
          <BookOpen className="h-5 w-5" style={{ color: '#15803d' }} />
        </div>
      </AdminPageHeader>

      <div className="bg-card rounded-xl border shadow-sm p-6 lg:p-8">
        <Accordion type="multiple" className="w-full space-y-2">
          {/* 第一章 */}
          <AccordionItem value="ch1" className="border rounded-lg px-4">
            <AccordionTrigger className="text-base font-semibold">第一章：系統總覽</AccordionTrigger>
            <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
              <p>本系統「Myownreviews」是一套 AI 驅動的顧客評論管理平台，協助商家快速生成真實、有溫度的 Google 評論。</p>
              <p className="font-medium text-foreground mt-4">系統由兩個區塊組成：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>後台管理（Admin）</strong>：供平台管理員管理所有店家、訂閱方案與數據</li>
                <li><strong>店家儀表板</strong>：供各店家自行設定關鍵字、生成評論、下載 QR Code</li>
              </ul>
              <p className="font-medium text-foreground mt-4">後台主選單說明：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>儀表板</strong>：總覽所有店家數量、活躍訂閱、流失率等核心指標</li>
                <li><strong>店家管理</strong>：新增、編輯、搜尋所有店家，管理訂閱狀態</li>
                <li><strong>數據報表</strong>：查看客戶獲取趨勢、行業分佈、關鍵字使用統計</li>
                <li><strong>系統管理</strong>：查閱活動日誌、系統設定、權限管理</li>
                <li><strong>操作手冊</strong>：本頁面</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* 第二章 */}
          <AccordionItem value="ch2" className="border rounded-lg px-4">
            <AccordionTrigger className="text-base font-semibold">第二章：店家管理</AccordionTrigger>
            <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
              <p className="text-xs text-muted-foreground">➜ 路徑：後台 → 店家管理</p>

              <h4 className="font-semibold text-foreground mt-4">■ 新增店家</h4>
              <ol className="list-decimal pl-5 space-y-1">
                <li>點擊右上角「+ 新增店家」</li>
                <li>填入店家名稱、Email、行業別、地址</li>
                <li>選擇訂閱方案（免費試用 / 月付 / 年付）</li>
                <li>點擊「確認新增」，系統自動發送邀請信</li>
              </ol>

              <h4 className="font-semibold text-foreground mt-4">■ 編輯店家資訊</h4>
              <ol className="list-decimal pl-5 space-y-1">
                <li>在店家列表中找到目標店家</li>
                <li>點擊「詳情」→ 進入店家管理頁</li>
                <li>點擊「編輯資料」，修改後儲存</li>
              </ol>

              <h4 className="font-semibold text-foreground mt-4">■ 管理訂閱狀態</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>每筆店家卡片顯示：訂閱狀態（活躍/已到期）、到期日、剩餘天數</li>
                <li>可贈送免費訂閱、延長到期日、或暫停帳號</li>
                <li>「已到期」店家標示紅色，需手動處理</li>
              </ul>

              <h4 className="font-semibold text-foreground mt-4">■ 搜尋與篩選</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>頂部搜尋欄可依店家名稱、Email 即時搜尋</li>
                <li>可依「所有狀態」、「所有行業」、「所有訂閱」篩選</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* 第三章 */}
          <AccordionItem value="ch3" className="border rounded-lg px-4">
            <AccordionTrigger className="text-base font-semibold">第三章：關鍵字設定（最重要！）</AccordionTrigger>
            <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
              <p className="text-xs text-muted-foreground">➜ 路徑：後台 → 店家管理 → 點擊某店家「詳情」→ 進入店家儀表板 → 下滑找到「感受關鍵字管理」</p>

              <h4 className="font-semibold text-foreground mt-4">■ 什麼是「感受關鍵字」？</h4>
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

          {/* 第四章 */}
          <AccordionItem value="ch4" className="border rounded-lg px-4">
            <AccordionTrigger className="text-base font-semibold">第四章：評論生成與 QR Code</AccordionTrigger>
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

          {/* 第五章 */}
          <AccordionItem value="ch5" className="border rounded-lg px-4">
            <AccordionTrigger className="text-base font-semibold">第五章：數據報表</AccordionTrigger>
            <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
              <p className="text-xs text-muted-foreground">➜ 路徑：後台 → 數據報表</p>
              <ul className="list-disc pl-5 space-y-1 mt-3">
                <li><strong>總覽</strong>：總店家數、新客戶、訂閱轉換率、今日關鍵字使用量</li>
                <li><strong>客戶獲取趨勢</strong>：折線圖顯示過去 30 天新店家與新訂閱數</li>
                <li><strong>行業分析</strong>：圓餅圖顯示各行業佔比</li>
                <li><strong>關鍵字分析</strong>：最熱門關鍵字排行</li>
                <li>右上角「導出」可下載報表 CSV</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* 第六章 */}
          <AccordionItem value="ch6" className="border rounded-lg px-4">
            <AccordionTrigger className="text-base font-semibold">第六章：系統管理</AccordionTrigger>
            <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
              <p className="text-xs text-muted-foreground">➜ 路徑：後台 → 系統管理</p>
              <p className="mt-3">三個子頁籤：</p>
              <ol className="list-decimal pl-5 space-y-2 mt-2">
                <li><strong>活動日誌</strong>：記錄所有管理員操作（贈送訂閱、延長訂閱、帳號變更等），可搜尋、匯出</li>
                <li><strong>系統設定</strong>：平台全域設定（AI 模型選擇、生成限制、通知設定）</li>
                <li><strong>權限管理</strong>：管理員帳號新增、刪除與角色設定</li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          {/* 附錄 */}
          <AccordionItem value="appendix" className="border rounded-lg px-4">
            <AccordionTrigger className="text-base font-semibold">附錄：常用快速操作對照表</AccordionTrigger>
            <AccordionContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2.5 px-3 font-semibold text-foreground">我想要...</th>
                      <th className="text-left py-2.5 px-3 font-semibold text-foreground">去哪裡操作</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    {[
                      ["新增一家店", "店家管理 → 右上角「+ 新增店家」"],
                      ["設定店家關鍵字", "店家管理 → 詳情 → 店家儀表板 → 感受關鍵字管理"],
                      ["下載店家 QR Code", "店家儀表板 → 頁面最底部「下載 QR Code」"],
                      ["延長店家訂閱", "店家管理 → 找到店家 → 點「...」→ 管理訂閱"],
                      ["查看最熱門關鍵字", "數據報表 → 關鍵字分頁"],
                      ["查閱操作記錄", "系統管理 → 活動日誌"],
                      ["贈送免費訂閱", "店家管理 → 找到店家 → 點「...」→ 贈送訂閱"],
                    ].map(([want, where], i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2.5 px-3 font-medium text-foreground">{want}</td>
                        <td className="py-2.5 px-3">{where}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminManual;
