import { Link } from "react-router-dom";

export const FooterSection = () => (
  <footer aria-label="頁尾" className="bg-muted/50 text-foreground py-8 border-t">
    <div className="container mx-auto px-4 text-center space-y-4">
      <div className="flex items-center justify-center space-x-2">
        <img src="/lovable-uploads/40b8add3-b8f5-4e78-8a90-9987bc19b773.png" alt="Myownreviews" className="h-6 w-6" />
        <span className="text-lg font-bold">Myownreviews</span>
      </div>
      <p className="text-muted-foreground text-sm">華文小店家的數位轉型夥伴</p>
      <div className="flex justify-center space-x-4 text-sm text-muted-foreground">
        <a href="#" className="hover:text-primary">關於我們</a>
        <a href="#" className="hover:text-primary">聯繫客服</a>
      </div>
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>© 2026 自己的眼鏡有限公司</span>
        <span>｜</span>
        <Link to="/privacy-policy" className="hover:text-foreground transition-colors">隱私權政策</Link>
        <span>｜</span>
        <Link to="/terms-of-service" className="hover:text-foreground transition-colors">服務條款</Link>
      </div>
    </div>
  </footer>
);
