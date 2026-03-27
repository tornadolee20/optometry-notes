import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ColorPalette = () => {
  const colors = [
    { name: "智慧綠", class: "bg-brand-sage", hex: "#6B8E6B" },
    { name: "淺智慧綠", class: "bg-brand-sage-light", hex: "#8FA98F" },
    { name: "深智慧綠", class: "bg-brand-sage-dark", hex: "#557755" },
    { name: "成功金", class: "bg-brand-gold", hex: "#D4AF37" },
    { name: "活力珊瑚", class: "bg-brand-coral", hex: "#FF6B6B" },
    { name: "科技靛藍", class: "bg-brand-indigo", hex: "#4F46E5" },
  ];

  const buttonVariants = [
    { variant: "default" as const, label: "主要按鈕" },
    { variant: "outline" as const, label: "輪廓按鈕" },
    { variant: "secondary" as const, label: "次要按鈕" },
    { variant: "ghost" as const, label: "幽靈按鈕" },
    { variant: "success" as const, label: "成功按鈕" },
    { variant: "warning" as const, label: "警告按鈕" },
  ];

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-brand-sage-dark mb-2">
          ✨ 自己的評論助手 品牌色彩系統
        </h1>
        <p className="text-gray-600 text-lg">
          世界級設計大師精心設計的專屬色彩方案
        </p>
      </div>

      {/* 色彩面板 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-brand-sage-dark">🎨 品牌色彩面板</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {colors.map((color) => (
              <div key={color.name} className="text-center">
                <div 
                  className={`${color.class} w-20 h-20 rounded-lg mx-auto mb-2 shadow-lg`}
                />
                <h3 className="font-semibold text-sm text-gray-800">{color.name}</h3>
                <p className="text-xs text-gray-500 font-mono">{color.hex}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 按鈕展示 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-brand-sage-dark">🔘 按鈕系統展示</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buttonVariants.map((btn) => (
              <div key={btn.variant} className="text-center space-y-2">
                <Button variant={btn.variant} size="lg" className="w-full">
                  {btn.label}
                </Button>
                <p className="text-xs text-gray-500">{btn.variant}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 實際應用展示 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-brand-sage-dark">🚀 實際應用預覽</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 導航欄預覽 */}
          <div className="bg-white rounded-lg border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-brand-sage rounded-lg"></div>
                <span className="font-bold text-brand-sage-dark">自己的評論助手</span>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm">功能</Button>
                <Button variant="ghost" size="sm">價格</Button>
                <Button variant="outline" size="sm">登入</Button>
                <Button size="sm">免費試用</Button>
              </div>
            </div>
          </div>

          {/* 卡片預覽 */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-brand-sage/20">
              <CardHeader>
                <CardTitle className="text-brand-sage-dark flex items-center gap-2">
                  <div className="w-6 h-6 bg-brand-sage rounded-full"></div>
                  智能評論邀請
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  引導滿意客戶主動留下真實好評，提升店家網路聲譽
                </p>
                <Button className="w-full">立即體驗</Button>
              </CardContent>
            </Card>

            <Card className="border-brand-gold/20">
              <CardHeader>
                <CardTitle className="text-brand-sage-dark flex items-center gap-2">
                  <div className="w-6 h-6 bg-brand-gold rounded-full"></div>
                  數據分析儀表板
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  即時追蹤評論效果，讓經營決策更精準
                </p>
                <Button variant="warning" className="w-full">查看分析</Button>
              </CardContent>
            </Card>
          </div>

          {/* 成功提示 */}
          <div className="bg-success/10 border border-success/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-success rounded-full"></div>
              <div>
                <h4 className="font-semibold text-success">邀請發送成功！</h4>
                <p className="text-success/80 text-sm">已經向滿意客戶發送評論邀請訊息</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ColorPalette;