import { ChevronRight, User, Bell, CreditCard, Shield, Heart } from 'lucide-react';
import { useState } from 'react';

const SettingsView = () => {
  const [dataContribution, setDataContribution] = useState(false);

  const menuSections = [
    {
      title: '帳號',
      items: [
        { icon: User, label: '帳號資訊', desc: 'user@example.com' },
        { icon: User, label: '家庭成員管理', desc: '3 位成員' },
      ],
    },
    {
      title: '通知',
      items: [
        { icon: Bell, label: '提醒設定', desc: '回診提醒' },
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg safe-top">
        <div className="px-5 py-4">
          <h1 className="text-heading font-bold text-foreground">設定</h1>
        </div>
      </div>

      <div className="px-4 py-2 space-y-6">
        {/* Menu sections */}
        {menuSections.map(section => (
          <div key={section.title}>
            <h3 className="text-label font-semibold text-muted-foreground mb-2 px-1">{section.title}</h3>
            <div className="bg-card rounded-lg shadow-card overflow-hidden">
              {section.items.map((item, i) => (
                <button
                  key={item.label}
                  className={`w-full flex items-center justify-between p-4 text-left touch-target active:bg-muted/50 transition-colors ${
                    i > 0 ? 'border-t border-border' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className="text-muted-foreground" />
                    <div>
                      <div className="text-body font-medium text-card-foreground">{item.label}</div>
                      <div className="text-[13px] text-muted-foreground">{item.desc}</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Subscription */}
        <div>
          <h3 className="text-label font-semibold text-muted-foreground mb-2 px-1">訂閱方案</h3>
          <div className="bg-card rounded-lg shadow-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={20} className="text-primary" />
              <span className="text-body font-medium text-card-foreground">目前：免費版（1位成員）</span>
            </div>
            <div className="bg-accent rounded-lg p-4">
              <div className="text-subtitle font-bold text-accent-foreground mb-1">🌟 家庭方案</div>
              <div className="text-body text-accent-foreground mb-3">
                月繳 NT$99 / 年繳 NT$799
              </div>
              <ul className="space-y-1.5 text-label text-accent-foreground mb-4">
                <li>• 無限家庭成員</li>
                <li>• 度數趨勢圖表</li>
                <li>• PDF 就診報告匯出</li>
                <li>• 用藥視力風險提醒</li>
                <li>• 智慧回診提醒</li>
              </ul>
              <button className="w-full py-3 rounded-md bg-primary text-primary-foreground font-semibold text-body touch-target active:scale-[0.98] transition-transform">
                升級家庭方案
              </button>
            </div>
          </div>
        </div>

        {/* Data contribution */}
        <div>
          <h3 className="text-label font-semibold text-muted-foreground mb-2 px-1">資料貢獻</h3>
          <div className="bg-card rounded-lg shadow-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Heart size={20} className="text-primary" />
                <span className="text-body font-medium text-card-foreground">匿名資料貢獻</span>
              </div>
              <button
                onClick={() => setDataContribution(!dataContribution)}
                className={`relative w-12 h-7 rounded-full transition-colors ${dataContribution ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`absolute top-0.5 w-6 h-6 bg-card rounded-full shadow transition-transform ${
                  dataContribution ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              我願意貢獻匿名資料支持台灣視力研究。您的資料移除所有個人識別後，用於台灣兒童視力健康研究。
            </p>
            {dataContribution && (
              <div className="mt-3 p-3 bg-accent rounded-md">
                <p className="text-[12px] text-accent-foreground font-medium mb-1">分享的匿名資料包括：</p>
                <ul className="text-[12px] text-accent-foreground space-y-0.5">
                  <li>• 年齡範圍、性別</li>
                  <li>• 度數變化趨勢</li>
                  <li>• 近視控制方式</li>
                  <li>• CISS 問卷分數</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* App info */}
        <div className="text-center py-4">
          <p className="text-[13px] text-muted-foreground">視力家家簿 v1.0.0</p>
          <p className="text-[12px] text-muted-foreground mt-1">© 2026 Family Vision Passport</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
