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
      <p className="text-xs text-muted-foreground/80">&copy; 2024 Myownreviews. 版權所有.</p>
    </div>
  </footer>
);
