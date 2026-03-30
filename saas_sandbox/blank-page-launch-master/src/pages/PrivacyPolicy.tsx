import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

const PrivacyPolicy = () => {
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
              <BreadcrumbPage>隱私權政策</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <article className="prose prose-sm sm:prose-base max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary">
          <h1>隱私權政策</h1>

          <p>
            <strong>自己的眼鏡有限公司</strong>（以下簡稱「本公司」）深知個人資料保護的重要性，並依據台灣《個人資料保護法》（個資法）及相關法規，制定本隱私權政策，說明本公司在您使用
            Myownreviews（網址：<a href="https://myownreviews.com" target="_blank" rel="noopener noreferrer">https://myownreviews.com</a>，以下簡稱「本服務」）時，如何蒐集、處理及利用您的個人資料。
          </p>

          <hr />

          <h2>一、資料蒐集的範圍</h2>
          <p>本服務依使用者身分不同，蒐集以下類型的個人資料：</p>

          <h3>（一）店家主（訂閱會員）</h3>
          <ul>
            <li>姓名、電子郵件信箱、聯絡電話</li>
            <li>公司 / 店家名稱、地址</li>
            <li>訂閱方案及付款紀錄（不直接儲存信用卡號，由第三方金流處理）</li>
            <li>帳號登入紀錄、系統操作紀錄</li>
          </ul>

          <h3>（二）顧客（使用評論生成工具者）</h3>
          <ul>
            <li>關鍵字選擇紀錄（您所選擇的感受關鍵字）</li>
            <li>IP 位址、裝置類型、瀏覽器資訊、使用時間戳記</li>
            <li>評論草稿生成紀錄（僅用於系統防濫用，不作為行銷用途）</li>
            <li>本服務不主動要求顧客提供姓名或電話；如顧客自願填寫，視為同意蒐集</li>
          </ul>

          <h3>（三）所有訪客</h3>
          <ul>
            <li>IP 位址、Cookie、瀏覽器類型、來源網址、頁面瀏覽紀錄</li>
          </ul>

          <hr />

          <h2>二、資料蒐集的目的</h2>
          <p>本公司依個資法規定之特定目的蒐集個人資料，目的類別包括：</p>
          <ul>
            <li><strong>040 行銷</strong>：提供服務相關通知、新功能介紹</li>
            <li><strong>090 消費者、客戶管理與服務</strong>：帳號管理、訂閱服務、客服回覆</li>
            <li><strong>148 網路購物及其他電子商務服務</strong>：訂閱付款處理</li>
            <li><strong>系統安全與防濫用</strong>：Rate Limit 管控、異常行為偵測</li>
          </ul>

          <hr />

          <h2>三、資料利用方式</h2>
          <p>本公司將在蒐集目的範圍內利用您的個人資料：</p>
          <ol>
            <li>提供、維護及改善本服務功能</li>
            <li>處理訂閱付款及發送交易通知</li>
            <li>發送服務相關公告（試用到期提醒、系統維護通知等）</li>
            <li>系統安全防護及防濫用偵測</li>
            <li>依法律規定或主管機關要求提供</li>
          </ol>
          <p>
            <strong>本公司不會將您的個人資料出售、出租或提供給第三方</strong>，但以下情況除外：
          </p>
          <ul>
            <li>依法律規定或司法、行政機關要求</li>
            <li>為保護本公司、使用者或第三方之生命、身體、自由或財產安全</li>
            <li>經您書面同意</li>
          </ul>

          <hr />

          <h2>四、資料保存期間</h2>
          <ul>
            <li>會員資料：自帳號建立起，至帳號刪除後 30 天止</li>
            <li>訂閱紀錄：依商業帳冊保存規定，保存 5 年</li>
            <li>顧客操作紀錄（IP、關鍵字選擇）：保存 180 天後自動刪除</li>
            <li>Cookie：依各 Cookie 類型設定，最長不超過 1 年</li>
          </ul>

          <hr />

          <h2>五、資料保護措施</h2>
          <p>本公司採取以下技術及管理措施保護您的個人資料：</p>
          <ul>
            <li>HTTPS 加密傳輸</li>
            <li>Supabase Row Level Security（RLS）存取控制</li>
            <li>資料庫防火牆及異常存取警示</li>
            <li>僅授權人員可接觸個人資料，並受保密義務約束</li>
            <li>定期進行安全性檢查</li>
          </ul>

          <hr />

          <h2>六、Cookie 政策</h2>
          <p>本服務使用 Cookie 及類似技術以：</p>
          <ul>
            <li>維持您的登入狀態（必要性 Cookie）</li>
            <li>記錄使用偏好設定</li>
            <li>分析服務使用狀況（分析性 Cookie）</li>
          </ul>
          <p>您可透過瀏覽器設定關閉 Cookie，但部分服務功能可能因此受限。</p>

          <hr />

          <h2>七、第三方服務</h2>
          <p>本服務使用以下第三方服務，其個資處理方式請參閱各服務之隱私政策：</p>
          <ul>
            <li><strong>Supabase</strong>：資料庫及後端服務</li>
            <li><strong>Zeabur</strong>：應用程式部署服務</li>
            <li><strong>Google</strong>：第三方登入（如啟用）</li>
          </ul>

          <hr />

          <h2>八、您的權利</h2>
          <p>依個資法第 3 條，您對本公司保有之個人資料享有以下權利：</p>
          <ol>
            <li>查詢或請求閱覽</li>
            <li>請求製給複製本</li>
            <li>請求補充或更正</li>
            <li>請求停止蒐集、處理或利用</li>
            <li>請求刪除</li>
          </ol>
          <p>如欲行使上述權利，請聯絡本公司：</p>
          <ul>
            <li><strong>電子郵件</strong>：<a href="mailto:tornadolee20@gmail.com">tornadolee20@gmail.com</a></li>
            <li><strong>網站</strong>：<a href="https://myownreviews.com" target="_blank" rel="noopener noreferrer">https://myownreviews.com</a></li>
          </ul>
          <p>本公司將於收到請求後 15 個工作日內回覆。</p>

          <hr />

          <h2>九、未成年人保護</h2>
          <p>本服務不針對未滿 18 歲之未成年人提供服務。若發現誤蒐集未成年人之個人資料，本公司將立即刪除。</p>

          <hr />

          <h2>十、政策修訂</h2>
          <p>
            本公司保留修訂本隱私權政策之權利。重大變更時，將於網站首頁公告或以電子郵件通知。繼續使用本服務，視為同意修訂後之政策。
          </p>
          <p><strong>最後更新日期：2026 年 3 月 29 日</strong></p>

          <hr />

          <p>
            如有任何疑問，請聯絡：<a href="mailto:tornadolee20@gmail.com">tornadolee20@gmail.com</a>
          </p>
        </article>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
