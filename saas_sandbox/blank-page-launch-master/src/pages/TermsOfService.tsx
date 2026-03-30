import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">首頁</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>服務條款</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <article className="prose prose-sm sm:prose-base max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary">
          <h1>服務條款</h1>

          <p>
            歡迎使用 Myownreviews（<a href="https://myownreviews.com" target="_blank" rel="noopener noreferrer">https://myownreviews.com</a>）。本服務由<strong>自己的眼鏡有限公司</strong>（以下簡稱「本公司」）提供。請於使用前詳細閱讀以下服務條款（以下簡稱「本條款」）。使用本服務即表示您同意本條款之全部內容。
          </p>

          <hr />

          <h2>一、服務說明</h2>
          <p>
            Myownreviews 是一套 AI 評論輔助生成工具，協助店家蒐集顧客真實消費感受，並生成評論草稿供顧客參考後自行發佈至 Google Maps 等評論平台。
          </p>
          <p>本服務分為兩類使用者：</p>
          <ul>
            <li><strong>店家主（訂閱會員）</strong>：訂閱本服務以取得評論生成工具及管理後台</li>
            <li><strong>顧客</strong>：透過店家提供之 QR Code 或連結使用評論生成工具</li>
          </ul>

          <hr />

          <h2>二、帳號與訂閱</h2>
          <ul>
            <li>申請帳號時，您須提供真實、正確、完整之資訊，並維持資訊之最新狀態。</li>
            <li>您有責任妥善保管帳號密碼，因帳號遭第三方使用所造成之損失，本公司不承擔責任。</li>
            <li>訂閱方案依本公司公告之定價收費，付款完成後即生效。</li>
            <li>試用期間屆滿後，如未完成付款，相關功能將依方案設定逐步限制。</li>
            <li>本公司保留修改定價及方案內容之權利，並於生效前 30 日公告。</li>
          </ul>

          <hr />

          <h2>三、AI 工具使用條款</h2>

          <h3>3.1 工具性質</h3>
          <p>
            本平台提供 AI 文字生成輔助工具。AI 所生成之評論草稿僅供參考，不代表本公司之立場，本公司亦不保證其內容之準確性、完整性或適切性。
          </p>

          <h3>3.2 使用者審閱義務</h3>
          <p>
            使用者在將任何 AI 生成內容發佈至 Google Maps 或其他評論平台前，有責任自行審閱、修改，並確認內容符合其真實消費或服務體驗。
          </p>

          <h3>3.3 真實體驗聲明</h3>
          <p>
            使用者使用本工具，即聲明其所發布之評論係基於真實消費或服務體驗。本公司對使用者發布不真實評論之行為不承擔任何法律責任。
          </p>

          <h3>3.4 AI 風險告知</h3>
          <p>
            AI 生成內容可能存在不準確、不完整、與使用者意圖不符或產生幻覺輸出之情況。最終發佈決定及相關責任由使用者自行承擔。
          </p>

          <h3>3.5 第三方平台合規義務</h3>
          <p>
            使用者有責任確保其在 Google Maps 等第三方平台發布評論之行為，符合該等平台之服務條款及適用法規（包含但不限於 Google Maps 使用者自建內容政策）。本公司不對使用者違反第三方平台政策之行為負責，亦不承擔因此產生之任何損失或處分。
          </p>

          <hr />

          <h2>四、店家主（訂閱客戶）的責任</h2>
          <ul>
            <li><strong>顧客告知義務</strong>：若店家主將評論生成工具提供予顧客使用（包含透過 QR Code 入口），店家主有責任確保顧客已充分了解 AI 工具的使用情況，並取得顧客之同意。</li>
            <li><strong>禁止行為</strong>：店家主不得使用本平台從事任何形式的評論造假、大量灌評、操弄評分，或違反 Google Maps 評論政策、台灣公平交易法及消費者保護法之行為。</li>
            <li><strong>違規責任</strong>：若因店家主之使用行為導致其 Google 商家頁面受到移除評論、降評或停權等處分，本公司不承擔任何責任。</li>
            <li><strong>資料安全</strong>：店家主不得將帳號分享予未授權人員，亦不得將本服務用於未經本公司授權之目的。</li>
          </ul>

          <hr />

          <h2>五、智慧財產權</h2>
          <ul>
            <li>本服務之軟體、介面設計、品牌標識及相關內容，其智慧財產權歸本公司所有。</li>
            <li>使用者不得重製、修改、散布、販售或以任何方式利用本服務之內容，但法律明文允許者除外。</li>
            <li>使用者透過本服務生成之評論草稿，其著作權歸使用者所有；使用者授權本公司在提供服務所必要之範圍內使用。</li>
          </ul>

          <hr />

          <h2>六、免責聲明</h2>
          <ul>
            <li>本服務以「現狀」提供，本公司不擔保服務不中斷、無錯誤或完全符合使用者之需求。</li>
            <li>因天災、駭客攻擊、第三方服務中斷等不可抗力因素造成之損失，本公司不承擔責任。</li>
            <li>本公司對使用者因使用或無法使用本服務所造成之直接或間接損失，在法律允許之最大範圍內免除責任。</li>
          </ul>

          <hr />

          <h2>七、服務中止與終止</h2>
          <ul>
            <li>本公司保留因維護、升級或任何理由暫停或終止服務之權利，並盡合理努力提前通知。</li>
            <li>若使用者違反本條款，本公司得立即暫停或終止其帳號，不另行通知，且不退還已收取之費用。</li>
            <li>使用者得隨時申請刪除帳號，刪除後資料處理依本公司<Link to="/privacy-policy" className="text-primary underline underline-offset-2">隱私權政策</Link>辦理。</li>
          </ul>

          <hr />

          <h2>八、準據法與管轄</h2>
          <p>
            本條款之解釋及適用，以台灣法律為準據法。因本條款所生之爭議，雙方同意以台灣台北地方法院為第一審管轄法院。
          </p>

          <hr />

          <h2>九、條款修訂</h2>
          <p>
            本公司保留修訂本條款之權利。重大變更時，將於網站公告或以電子郵件通知。繼續使用本服務，視為同意修訂後之條款。
          </p>
          <p><strong>最後更新日期：2026 年 3 月 29 日</strong></p>

          <hr />

          <p>
            如有任何疑問，請聯絡：<a href="mailto:tornadolee20@gmail.com">tornadolee20@gmail.com</a>
          </p>
          <p className="text-sm">
            自己的眼鏡有限公司｜<a href="https://myownreviews.com" target="_blank" rel="noopener noreferrer">https://myownreviews.com</a>
          </p>
        </article>
      </div>
    </div>
  );
};

export default TermsOfService;
