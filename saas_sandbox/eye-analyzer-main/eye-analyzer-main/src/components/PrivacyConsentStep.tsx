import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Database, Lock, FileText, Users, Mail } from 'lucide-react';

interface PrivacyConsentStepProps {
  privacyAgreed: boolean;
  researchConsent: boolean;
  onPrivacyAgreedChange: (checked: boolean) => void;
  onResearchConsentChange: (checked: boolean) => void;
}

const CURRENT_PRIVACY_VERSION = 'v1.0';

const PrivacyConsentStep: React.FC<PrivacyConsentStepProps> = ({
  privacyAgreed,
  researchConsent,
  onPrivacyAgreedChange,
  onResearchConsentChange,
}) => {
  const { language } = useLanguage();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const t = (zhTW: string, zhCN: string) => language === 'zh-TW' ? zhTW : zhCN;

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t(
          '在使用本系統前，請詳細閱讀以下隱私政策條款：',
          '在使用本系统前，请详细阅读以下隐私政策条款：'
        )}
      </p>
      
      {/* Scrollable Privacy Policy Content */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-[350px] overflow-y-auto border rounded-lg p-4 bg-muted/30"
      >
        <div className="space-y-4">
          {language === 'zh-TW' ? (
            <>
              {/* Section 1 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-sm">一、資料所有權與角色說明</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  本系統僅提供檢查結果記錄、視覺化報告與分析服務，不參與任何醫療決策或銷售行為。驗光師對其顧客資料擁有完整的所有權與控制權，本系統不主張任何顧客個人資料的所有權。
                </p>
              </div>

              {/* Section 2 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-sm">二、我們保存與不保存的資料</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-2">系統後端僅保存「去識別化檢查資料」：</p>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 ml-2">
                  <li>驗光師自訂的顧客代碼</li>
                  <li>年齡或年齡區間</li>
                  <li>性別</li>
                  <li>檢查日期</li>
                  <li>視功能檢查數值</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2 mb-1">系統後端<span className="text-destructive font-bold">不</span>保存：</p>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 ml-2">
                  <li>顧客姓名、電話、身分證字號、地址</li>
                  <li>任何可直接識別個人的資訊</li>
                </ul>
              </div>

              {/* Section 3 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-sm">三、資料隔離與安全</h3>
                </div>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 ml-2">
                  <li>每位驗光師擁有獨立的帳號與資料空間</li>
                  <li>驗光師只能存取自己帳號底下的資料</li>
                  <li>透過 Row Level Security 確保資料隔離</li>
                </ul>
              </div>

              {/* Section 4 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-sm">四、備份與還原機制</h3>
                </div>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 ml-2">
                  <li>提供報告下載（PDF）與資料匯出功能</li>
                  <li>驗光師可定期下載備份</li>
                  <li>終止使用時可申請匯出或刪除資料</li>
                </ul>
              </div>

              {/* Section 5 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-sm">五、去識別化資料的研究使用</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  系統可能在完全去識別化、無法合理指向個人的前提下，對檢查數據進行彙整與統計分析，用於優化系統與學術研究。不會嘗試將資料重新對回特定個人或驗光師身分。
                </p>
              </div>

              {/* Section 6 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-sm">六、資料安全與隱私保護</h3>
                </div>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 ml-2">
                  <li>採取存取控管、加密傳輸、權限分級等措施</li>
                  <li>遵循「資料最小化」、「目的限定」、「透明說明」原則</li>
                </ul>
              </div>

              {/* Section 7 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-sm">七、聯絡方式</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  如對資料使用方式、隱私保護措施有任何疑問，歡迎透過系統提供之聯絡方式與我們聯繫。
                </p>
              </div>

              <div className="text-xs text-muted-foreground pt-2 border-t">
                <p>隱私政策版本：{CURRENT_PRIVACY_VERSION}</p>
                <p>最後更新日期：2025年1月</p>
              </div>
            </>
          ) : (
            <>
              {/* Simplified Chinese Version */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-sm">一、数据所有权与角色说明</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  本系统仅提供检查结果记录、可视化报告与分析服务，不参与任何医疗决策或销售行为。验光师对其客户数据拥有完整的所有权与控制权，本系统不主张任何客户个人数据的所有权。
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-sm">二、我们保存与不保存的数据</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-2">系统后端仅保存「去标识化检查数据」：</p>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 ml-2">
                  <li>验光师自定义的客户代码</li>
                  <li>年龄或年龄区间</li>
                  <li>性别</li>
                  <li>检查日期</li>
                  <li>视功能检查数值</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2 mb-1">系统后端<span className="text-destructive font-bold">不</span>保存：</p>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 ml-2">
                  <li>客户姓名、电话、身份证号、地址</li>
                  <li>任何可直接识别个人的信息</li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-sm">三、数据隔离与安全</h3>
                </div>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 ml-2">
                  <li>每位验光师拥有独立的账号与数据空间</li>
                  <li>验光师只能访问自己账号底下的数据</li>
                  <li>通过 Row Level Security 确保数据隔离</li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-sm">四、备份与还原机制</h3>
                </div>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 ml-2">
                  <li>提供报告下载（PDF）与数据导出功能</li>
                  <li>验光师可定期下载备份</li>
                  <li>终止使用时可申请导出或删除数据</li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-sm">五、去标识化数据的研究使用</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  系统可能在完全去标识化、无法合理指向个人的前提下，对检查数据进行汇整与统计分析，用于优化系统与学术研究。不会尝试将数据重新对回特定个人或验光师身份。
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-sm">六、数据安全与隐私保护</h3>
                </div>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 ml-2">
                  <li>采取访问控管、加密传输、权限分级等措施</li>
                  <li>遵循「数据最小化」、「目的限定」、「透明说明」原则</li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-sm">七、联系方式</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  如对数据使用方式、隐私保护措施有任何疑问，欢迎通过系统提供之联系方式与我们联系。
                </p>
              </div>

              <div className="text-xs text-muted-foreground pt-2 border-t">
                <p>隐私政策版本：{CURRENT_PRIVACY_VERSION}</p>
                <p>最后更新日期：2025年1月</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Scroll hint */}
      {!hasScrolledToBottom && (
        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
          ⚠️ {t('請捲動到底部閱讀完整內容後才能勾選同意', '请滚动到底部阅读完整内容后才能勾选同意')}
        </p>
      )}

      {/* Consent checkboxes */}
      <div className="space-y-3 pt-2">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="privacy-agreed"
            checked={privacyAgreed}
            onCheckedChange={(checked) => onPrivacyAgreedChange(checked === true)}
            disabled={!hasScrolledToBottom}
            className="mt-0.5"
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="privacy-agreed"
              className={`text-sm font-medium leading-snug cursor-pointer ${!hasScrolledToBottom ? 'text-muted-foreground' : ''}`}
            >
              {t('我已閱讀並同意上述隱私政策', '我已阅读并同意上述隐私政策')}
              <span className="text-destructive ml-1">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              {t('此為必要同意項目', '此为必要同意项目')}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="research-consent"
            checked={researchConsent}
            onCheckedChange={(checked) => onResearchConsentChange(checked === true)}
            disabled={!hasScrolledToBottom}
            className="mt-0.5"
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="research-consent"
              className={`text-sm font-medium leading-snug cursor-pointer ${!hasScrolledToBottom ? 'text-muted-foreground' : ''}`}
            >
              {t('同意將去識別化資料用於學術研究', '同意将去标识化数据用于学术研究')}
              <span className="text-muted-foreground ml-1">{t('（選填）', '（选填）')}</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              {t('此為選擇性同意，不影響系統使用', '此为选择性同意，不影响系统使用')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { PrivacyConsentStep, CURRENT_PRIVACY_VERSION };
