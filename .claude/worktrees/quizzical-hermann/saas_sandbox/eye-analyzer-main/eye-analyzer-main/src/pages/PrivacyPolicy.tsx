import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ArrowLeft, Shield, Database, Lock, FileText, Users, Mail } from 'lucide-react';

const PrivacyPolicy = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const t = (zhTW: string, zhCN: string) => language === 'zh-TW' ? zhTW : zhCN;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-card border-b border-border sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="font-bold text-lg">{t('資料與隱私說明', '数据与隐私说明')}</h1>
          </div>
        </div>
        <LanguageToggle />
      </header>

      <main className="p-4 max-w-3xl mx-auto space-y-6 pb-12">
        {language === 'zh-TW' ? (
          <>
            {/* Section 1 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">一、資料所有權與角色說明</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  本系統僅提供檢查結果記錄、視覺化報告與分析服務，不參與任何醫療決策或銷售行為。驗光師對其顧客資料擁有完整的所有權與控制權，本系統不主張任何顧客個人資料的所有權。
                </p>
              </CardContent>
            </Card>

            {/* Section 2 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">二、我們保存與不保存的資料</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">系統後端僅保存「去識別化檢查資料」：</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                      <li>驗光師自訂的顧客代碼</li>
                      <li>年齡或年齡區間</li>
                      <li>性別</li>
                      <li>檢查日期</li>
                      <li>視功能檢查數值（NPC、調節、融像儲備、雙眼協調等）</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">系統後端<span className="text-destructive font-bold">不</span>保存：</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                      <li>顧客姓名</li>
                      <li>電話</li>
                      <li>身分證字號</li>
                      <li>地址</li>
                      <li>任何可直接識別個人的資訊</li>
                    </ul>
                  </div>
                  
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    這些個人識別資訊如有需要，僅由驗光師於本地端（電腦、紙本、診所系統）保存，<strong>不會上傳至本系統伺服器</strong>。
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 3 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">三、資料隔離與安全</h2>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>每位驗光師在系統中擁有獨立的帳號與資料空間</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>驗光師只能存取自己帳號底下的去識別化檢查資料，無法瀏覽其他驗光師的資料</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>系統透過資料庫層級的權限控管（Row Level Security）與帳號驗證機制，確保不同驗光師之間的資料嚴格隔離</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 4 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">四、備份與還原機制</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">驗光師端備份：</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                      <li>系統提供報告下載（PDF）與完整資料匯出（CSV/Excel）功能</li>
                      <li>驗光師可定期下載備份，並在本地端妥善保存</li>
                      <li>備份檔案可包含驗光師自行補充的顧客姓名與電話資訊</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">系統端備份：</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                      <li>本系統會對去識別化資料進行例行備份，用於災難復原與系統還原</li>
                      <li>驗光師可使用「匯入備份」功能，將之前下載的備份檔案還原到帳號中</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">終止使用：</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                      <li>驗光師如終止使用本服務，可提出申請匯出其對應之全部去識別化檢查資料</li>
                      <li>可要求本系統於合理期間內（例如：30 天）刪除伺服器端對應資料（法令另有保存義務者除外）</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 5 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">五、去識別化資料的研究使用</h2>
                </div>
                
                <p className="text-muted-foreground mb-4">
                  系統可能在<strong>完全去識別化、無法合理指向個人的前提下</strong>，對多位驗光師的檢查數據進行彙整與統計分析，用於：
                </p>
                
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2 mb-4">
                  <li>優化檢查流程與報告演算法</li>
                  <li>生成統計圖表與教育素材，用於視覺保健相關之衛教與專業分享</li>
                  <li>進行學術性或品質改善相關之研究與發表</li>
                </ul>
                
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">使用原則：</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                    <li>不會嘗試將資料重新對回特定個人或特定驗光師的身分</li>
                    <li>不會將個別驗光師的原始資料提供給第三方作為直接行銷用途</li>
                    <li>研究使用的資料已經過彙整與統計處理，僅保留必要欄位</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Section 6 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">六、資料安全與隱私保護</h2>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>本系統採取包含存取控管、加密傳輸、權限分級等措施，降低未經授權存取去識別化資料的風險</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>針對健康相關資料之二次利用，我們遵循「資料最小化」、「目的限定」、「透明說明」等原則</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>本說明內容會隨法規與專業指引更新</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 7 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">七、聯絡方式</h2>
                </div>
                <p className="text-muted-foreground">
                  如驗光師對於資料使用方式、隱私保護措施或研究相關合作有任何疑問，歡迎透過系統提供之聯絡方式與我們聯繫，以取得進一步說明。
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          /* Simplified Chinese Version */
          <>
            {/* Section 1 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">一、数据所有权与角色说明</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  本系统仅提供检查结果记录、可视化报告与分析服务，不参与任何医疗决策或销售行为。验光师对其客户数据拥有完整的所有权与控制权，本系统不主张任何客户个人数据的所有权。
                </p>
              </CardContent>
            </Card>

            {/* Section 2 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">二、我们保存与不保存的数据</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">系统后端仅保存「去标识化检查数据」：</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                      <li>验光师自定义的客户代码</li>
                      <li>年龄或年龄区间</li>
                      <li>性别</li>
                      <li>检查日期</li>
                      <li>视功能检查数值（NPC、调节、融像储备、双眼协调等）</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">系统后端<span className="text-destructive font-bold">不</span>保存：</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                      <li>客户姓名</li>
                      <li>电话</li>
                      <li>身份证号</li>
                      <li>地址</li>
                      <li>任何可直接识别个人的信息</li>
                    </ul>
                  </div>
                  
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    这些个人识别信息如有需要，仅由验光师于本地端（电脑、纸本、诊所系统）保存，<strong>不会上传至本系统服务器</strong>。
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 3 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">三、数据隔离与安全</h2>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>每位验光师在系统中拥有独立的账号与数据空间</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>验光师只能访问自己账号底下的去标识化检查数据，无法浏览其他验光师的数据</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>系统通过数据库层级的权限控管（Row Level Security）与账号验证机制，确保不同验光师之间的数据严格隔离</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 4 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">四、备份与还原机制</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">验光师端备份：</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                      <li>系统提供报告下载（PDF）与完整数据导出（CSV/Excel）功能</li>
                      <li>验光师可定期下载备份，并在本地端妥善保存</li>
                      <li>备份文件可包含验光师自行补充的客户姓名与电话信息</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">系统端备份：</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                      <li>本系统会对去标识化数据进行例行备份，用于灾难恢复与系统还原</li>
                      <li>验光师可使用「导入备份」功能，将之前下载的备份文件还原到账号中</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">终止使用：</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                      <li>验光师如终止使用本服务，可提出申请导出其对应之全部去标识化检查数据</li>
                      <li>可要求本系统于合理期间内（例如：30 天）删除服务器端对应数据（法令另有保存义务者除外）</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 5 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">五、去标识化数据的研究使用</h2>
                </div>
                
                <p className="text-muted-foreground mb-4">
                  系统可能在<strong>完全去标识化、无法合理指向个人的前提下</strong>，对多位验光师的检查数据进行汇整与统计分析，用于：
                </p>
                
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2 mb-4">
                  <li>优化检查流程与报告算法</li>
                  <li>生成统计图表与教育素材，用于视觉保健相关之卫教与专业分享</li>
                  <li>进行学术性或品质改善相关之研究与发表</li>
                </ul>
                
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">使用原则：</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                    <li>不会尝试将数据重新对回特定个人或特定验光师的身份</li>
                    <li>不会将个别验光师的原始数据提供给第三方作为直接营销用途</li>
                    <li>研究使用的数据已经过汇整与统计处理，仅保留必要字段</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Section 6 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">六、数据安全与隐私保护</h2>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>本系统采取包含访问控管、加密传输、权限分级等措施，降低未经授权访问去标识化数据的风险</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>针对健康相关数据之二次利用，我们遵循「数据最小化」、「目的限定」、「透明说明」等原则</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>本说明内容会随法规与专业指引更新</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 7 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">七、联系方式</h2>
                </div>
                <p className="text-muted-foreground">
                  如验光师对于数据使用方式、隐私保护措施或研究相关合作有任何疑问，欢迎通过系统提供之联系方式与我们联系，以取得进一步说明。
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default PrivacyPolicy;