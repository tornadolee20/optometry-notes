import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const StoreManual = () => {
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
              <h1 className="text-xl font-bold text-brand-sage-dark">店家操作手冊</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">店家操作手冊</h2>
          <p className="text-muted-foreground mt-1">從開通帳號到讓顧客幫你留下好評——完整圖文教學</p>
        </div>

        <div className="bg-background rounded-xl border shadow-sm p-6 lg:p-8">
          <Accordion type="multiple" defaultValue={["ch1"]} className="w-full space-y-2">

            {/* 第一章：開通帳號與第一次登入 */}
            <AccordionItem value="ch1" className="border rounded-lg px-4">
              <AccordionTrigger className="text-base font-semibold">第一章：開通帳號與第一次登入</AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>恭喜你成為「Myownreviews」的店家用戶！以下是從收到邀請到正式開始使用的完整流程：</p>

                <h4 className="font-semibold text-foreground mt-4">■ 收到邀請信</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>平台管理員幫你建立帳號後，你會在 Email 信箱收到一封「帳號開通通知」</li>
                  <li>信件內會有一組「登入連結」，點擊後可直接進入系統</li>
                  <li>如果沒收到信，記得檢查垃圾郵件匣，或聯繫管理員重新發送</li>
                </ol>

                <h4 className="font-semibold text-foreground mt-4">■ 設定密碼</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>第一次點擊連結後，系統會請你設定自己的登入密碼</li>
                  <li>密碼建議至少 8 個字元，包含英文與數字</li>
                  <li>設定完成後就能用 Email + 密碼登入</li>
                </ol>

                <h4 className="font-semibold text-foreground mt-4">■ 第一次登入</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>前往登入頁面，輸入你的 Email 與密碼</li>
                  <li>登入後會進入你的「店家儀表板」——這就是你的管理中心</li>
                  <li>第一次登入時，系統會引導你完成初次設定（選產業、載入關鍵字），跟著走就好！</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            {/* 第二章：初次設定 */}
            <AccordionItem value="ch2" className="border rounded-lg px-4">
              <AccordionTrigger className="text-base font-semibold">第二章：初次設定——選產業、一鍵載入關鍵字</AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>新手最怕的就是「不知道關鍵字要打什麼」。別擔心，系統已經幫你準備好了！</p>

                <h4 className="font-semibold text-foreground mt-4">■ 選擇你的產業別</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>在店家資訊設定中，選擇你所屬的產業（例如：眼鏡行、美髮業、餐飲業...）</li>
                  <li>系統支援多種產業分類，找到最貼近你的那一個</li>
                  <li>如果找不到完全吻合的，選最接近的就好，後續還可以自行調整關鍵字</li>
                </ol>

                <h4 className="font-semibold text-foreground mt-4">■ 一鍵載入 48 個預設關鍵字</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>選好產業後，系統會自動顯示「一鍵套用產業關鍵字」按鈕</li>
                  <li>點下去，<strong>48 個該產業最常用的感受關鍵字</strong>就會自動載入</li>
                  <li>不用從零開始想，馬上就能讓顧客掃 QR Code 開始留評論</li>
                </ol>

                <h4 className="font-semibold text-foreground mt-4">■ 什麼時候可以開始用？</h4>
                <p>載入關鍵字後，你的評論系統就已經可以運作了。顧客掃 QR Code 就能看到這些關鍵字，選完後 AI 會自動生成評論。簡單來說：<strong>選產業 → 點一鍵套用 → 開始收評論</strong>，三步搞定。</p>
              </AccordionContent>
            </AccordionItem>

            {/* 第三章：感受關鍵字管理 */}
            <AccordionItem value="ch3" className="border rounded-lg px-4">
              <AccordionTrigger className="text-base font-semibold">第三章：感受關鍵字管理（最重要！）</AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                <p className="text-xs text-muted-foreground">➜ 路徑：店家儀表板 → 下滑找到「感受關鍵字管理」</p>

                <h4 className="font-semibold text-foreground mt-4">■ 什麼是「感受關鍵字」？</h4>
                <p>感受關鍵字就是你預先設定好的「顧客可能的真實感受」。當顧客掃 QR Code 準備留評論時，這些關鍵字會出現在畫面上讓他們快速勾選。AI 會根據顧客選的關鍵字，生成一段有溫度、像真人寫的 Google 評論。</p>

                <h4 className="font-semibold text-foreground mt-4">■ 關鍵字設定規則</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>每家店最多可設定 <strong>48 個</strong>關鍵字</li>
                  <li>每個關鍵字建議 <strong>3～7 個字</strong>，簡短有力（例如：「服務親切」、「環境舒適乾淨」）</li>
                  <li>關鍵字會依分類顯示（整體印象、服務、環境等），方便顧客找到想選的</li>
                  <li>最常被顧客點選的關鍵字會標示「最常用」標籤</li>
                </ul>

                <h4 className="font-semibold text-foreground mt-4">■ 怎麼新增關鍵字？</h4>

                <p className="font-medium text-foreground mt-3">方式一：手動輸入</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>在輸入框打上你想要的關鍵字（3～7 字）</li>
                  <li>按 Enter 或點「新增」</li>
                  <li>系統確認字數 OK 後就加入列表了</li>
                </ol>

                <p className="font-medium text-foreground mt-3">方式二：AI 智能建議</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>點「AI 智能建議」按鈕</li>
                  <li>系統會依照你的產業，推薦 8 個適合的關鍵字</li>
                  <li>喜歡哪個就點哪個，一鍵加入</li>
                </ol>

                <h4 className="font-semibold text-foreground mt-4">■ 怎麼刪除或搜尋？</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>刪除</strong>：點關鍵字右邊的「✕」即可刪除，刪了馬上生效</li>
                  <li><strong>搜尋</strong>：用搜尋框輸入文字，即時篩選你已設定的關鍵字</li>
                  <li><strong>分類切換</strong>：可以依「全部 / 整體印象 / 服務 / 環境...」分類查看</li>
                </ul>

                {/* 密技小框 */}
                <div className="mt-6 rounded-xl border-2 border-amber-300 bg-amber-50 p-5 not-prose">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <h4 className="text-base font-bold text-amber-900">進階技巧｜專屬關鍵字密技</h4>
                  </div>

                  <div className="space-y-3 text-sm text-amber-900/80">
                    <p>
                      系統會依你選的產業，自動載入一組 <strong className="text-amber-900">48 個預設關鍵字</strong>，讓你不用從零開始就能馬上使用。這些預設關鍵字涵蓋了該產業最常見的顧客感受，非常好用。
                    </p>

                    <p>
                      但這裡有一個很多人不知道的重點：<strong className="text-amber-900">預設關鍵字只是骨架，真正有威力的，是你自己多加上去的那幾個「專屬關鍵字」。</strong>
                    </p>

                    <p>
                      舉個例子——如果你是眼鏡行，預設關鍵字已經涵蓋「驗光專業」、「鏡框選擇多」這類通用描述。但你可以再加上像 <strong className="text-amber-900">「兒童近視控制門診」、「功能性驗光」、「視覺訓練評估」</strong> 這種只有你的店才有的服務項目。
                    </p>

                    <div className="bg-amber-100/60 rounded-lg p-3 border border-amber-200">
                      <p className="font-semibold text-amber-900 mb-1">🎯 為什麼這很重要？</p>
                      <p>
                        如果只用預設關鍵字，AI 生成的評論頂多跟同產業其他店家差不多——看起來「不差」，但不特別。加上你獨有的關鍵字後，AI 生出來的 Google 評論會<strong>更貼近你的店家特色</strong>，讀起來像熟客在真心分享，而不是罐頭文。
                      </p>
                    </div>

                    <div className="bg-amber-100/60 rounded-lg p-3 border border-amber-200">
                      <p className="font-semibold text-amber-900 mb-1">💡 具體建議</p>
                      <p>
                        先用系統給你的 48 個預設關鍵字當骨架，再另外加上 <strong>5～10 個只屬於你店的專屬關鍵字</strong>（獨特服務、招牌項目、別人沒有的特色）。你會發現評論的真實感和記憶點會<strong>明顯提升</strong>。
                      </p>
                    </div>
                  </div>
                </div>

                <h4 className="font-semibold text-foreground mt-6">■ 常見問題</h4>
                <div className="space-y-3 mt-2">
                  <div>
                    <p className="font-medium text-foreground">Q：關鍵字改了之後多久生效？</p>
                    <p>A：立即生效。顧客掃 QR Code 就能看到最新版本。</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Q：不設關鍵字可以嗎？</p>
                    <p>A：可以，但強烈不建議。沒有關鍵字時 AI 仍能生成評論，但內容會很通用，缺乏你的店家特色。設定越豐富，評論越精準。</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Q：換產業的話，關鍵字會怎樣？</p>
                    <p>A：在店家資訊中更換產業後，可以重新一鍵套用新產業的 48 個預設關鍵字。原本的關鍵字會被替換，建議先確認好再操作。</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 第四章：QR Code 與話術 */}
            <AccordionItem value="ch4" className="border rounded-lg px-4">
              <AccordionTrigger className="text-base font-semibold">第四章：下載 QR Code 與顧客操作建議</AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                <h4 className="font-semibold text-foreground">■ 下載你的專屬 QR Code</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>在店家儀表板最下方，找到「下載 QR Code」按鈕</li>
                  <li>點擊下載，會得到一張 PNG 圖片</li>
                  <li>建議印出來放在櫃檯、結帳區、或做成桌上立牌</li>
                </ol>

                <h4 className="font-semibold text-foreground mt-4">■ 你的專屬評論網址</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>每家店都有一個專屬網址：<code className="bg-muted px-1.5 py-0.5 rounded text-xs">https://[網址]/[店家編號]/generate-review</code></li>
                  <li>這個網址也可以直接傳給客人，或放在 LINE、IG 的個人簡介裡</li>
                </ul>

                <h4 className="font-semibold text-foreground mt-4">■ 建議話術——怎麼跟顧客開口？</h4>
                <p>很多店家不好意思請客人留評論，這裡提供幾個自然不尷尬的說法：</p>

                <div className="bg-muted/50 rounded-lg p-4 mt-2 space-y-3">
                  <div>
                    <p className="font-medium text-foreground">🗣️ 結帳時</p>
                    <p>「我們最近有個新功能，掃一下這個 QR Code，系統會幫你把感受寫成評論，不用自己打字喔，30 秒就搞定！」</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">🗣️ 服務完成時</p>
                    <p>「如果今天的服務你覺得不錯，歡迎掃一下這裡幫我們留個 Google 評論，對我們幫助很大！」</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">🗣️ LINE 或社群</p>
                    <p>「感謝你今天的光臨 🙏 如果方便的話，點這個連結花 30 秒幫我們留個評論，我們會非常感謝！[附上連結]」</p>
                  </div>
                </div>

                <h4 className="font-semibold text-foreground mt-4">■ 小提醒</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>不要強迫顧客留評論，自然邀請即可</li>
                  <li>顧客選完關鍵字後，AI 會自動生成文字，顧客只需要複製貼上</li>
                  <li>生成的評論會引導顧客前往你的 Google 商家頁面貼上</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* 第五章：簡單看懂數據 */}
            <AccordionItem value="ch5" className="border rounded-lg px-4">
              <AccordionTrigger className="text-base font-semibold">第五章：看懂你的關鍵字數據</AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>系統會自動追蹤每個關鍵字被顧客點選的次數，幫你了解顧客最在意什麼。</p>

                <h4 className="font-semibold text-foreground mt-4">■ 哪裡看數據？</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>在「感受關鍵字管理」區塊，每個關鍵字旁邊會顯示被點擊的次數</li>
                  <li>標示「最常用」的關鍵字，代表顧客特別有感</li>
                  <li>也可以進入「數據分析」頁面看更完整的統計</li>
                </ul>

                <h4 className="font-semibold text-foreground mt-4">■ 數據能幫你做什麼？</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>找到你的強項</strong>：點擊率最高的關鍵字，就是顧客最認同你的地方</li>
                  <li><strong>發現冷門詞</strong>：很少被點的關鍵字，可以考慮替換成更貼切的描述</li>
                  <li><strong>優化行銷</strong>：顧客最愛的關鍵字，也可以拿來當你的行銷文案靈感</li>
                </ul>

                <h4 className="font-semibold text-foreground mt-4">■ 實用建議</h4>
                <p>建議每 2～4 週回來看一下關鍵字數據，把很少被點的詞換掉，加上新的描述。持續優化，你的 Google 評論品質會越來越好。</p>
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
                        <th className="text-left py-2.5 px-3 font-semibold text-foreground">怎麼做</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      {[
                        ["修改店家資訊", "儀表板 → 點「編輯」修改名稱、地址、產業等"],
                        ["一鍵載入產業關鍵字", "設定好產業別 → 點「一鍵套用產業關鍵字」"],
                        ["手動加關鍵字", "關鍵字管理 → 輸入文字 → 按 Enter"],
                        ["用 AI 建議關鍵字", "關鍵字管理 → 點「AI 智能建議」"],
                        ["刪除某個關鍵字", "關鍵字管理 → 找到該詞 → 點「✕」"],
                        ["下載 QR Code", "儀表板最底部 → 點「下載 QR Code」"],
                        ["複製評論系統網址", "儀表板 → 評論系統網址區塊 → 複製"],
                        ["查看哪些關鍵字最受歡迎", "關鍵字管理 → 看「最常用」標籤"],
                        ["切換產業別", "店家資訊 → 修改產業 → 重新套用關鍵字"],
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
            {/* Google 合規說明 */}
            <AccordionItem value="compliance" className="border rounded-lg px-4">
              <AccordionTrigger className="text-base font-semibold">📋 Google 評論合規說明</AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-foreground mb-0">
                    請僅邀請有實際體驗的顧客留下評論，並避免以贈品、折扣或任何利益交換評論。請不要要求顧客只能留下好評，讓評論真實反映顧客的使用感受。
                  </p>
                </div>

                <h4 className="font-semibold text-foreground mt-4">Google 對評論的核心要求</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>來自真實的到店或使用體驗，不得捏造或轉述未發生的情節</li>
                  <li>不得以金錢、折扣、免費商品或服務等「利益交換」方式換取評論</li>
                  <li>不得透過多帳號、大量重複評論或技術手段操弄評分</li>
                  <li>不得只允許好評、阻擋負評，或強迫消費者在店內當場評分</li>
                </ul>

                <h4 className="font-semibold text-foreground mt-4">✅ 可以這樣做</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>邀請「有實際到店或使用服務」的顧客，分享他們的真實感受</li>
                  <li>使用本系統降低顧客寫評論的門檻，讓不擅長寫作的顧客也能表達體驗</li>
                </ul>

                <h4 className="font-semibold text-foreground mt-4">❌ 不可以這樣做</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>不可以用「贈品、折扣、免費服務」作為寫評論或修改／刪除評論的交換條件</li>
                  <li>不可以要求顧客「一定要給 5 星」或指定評論內容</li>
                  <li>不可以只邀請滿意的顧客寫評論，而刻意忽略有意見或不滿的顧客</li>
                  <li>不建議強迫顧客在店內當場完成評分，可請顧客回家後再依實際感受自由選擇是否留言</li>
                </ul>

                <h4 className="font-semibold text-foreground mt-4">本系統的合規設計</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>顧客需先選擇 3–6 個符合自身感受的關鍵字，再由 AI 協助完成文字</li>
                  <li>評論字數動態調整並加入隨機緩衝，避免固定模板</li>
                  <li>內建內容安全檢查：自動過濾仇恨言論、人身攻擊、個資、威脅及違規用語</li>
                  <li>AI 指令明確禁止仇恨／歧視／交換利益／刷評暗示</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default StoreManual;
