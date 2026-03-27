import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const StoreSetup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "建立店家資料 - 自己的評論";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "首次登入請建立店家資料，以使用評論生成與分析功能");
    }
  }, []);

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>建立店家資料</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              您已成功登入，但尚未建立店家資料。請先建立店家，以便使用系統功能。
            </p>
            <div className="flex gap-3">
              <Button onClick={() => navigate("/")}>返回首頁</Button>
              <Button variant="outline" onClick={() => navigate("/pricing")}>查看方案</Button>
              <Button variant="secondary" onClick={() => navigate("/store/create")}>立即建立店家</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StoreSetup;
