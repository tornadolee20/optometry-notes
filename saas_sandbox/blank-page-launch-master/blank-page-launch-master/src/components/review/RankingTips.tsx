
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const RankingTips = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl text-center">提高評論</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-[#FFFCF5] p-4 md:p-6 rounded-lg space-y-3">
          <p className="font-medium text-base md:text-lg">提升您在地搜尋排名！</p>
          <ul className="text-sm md:text-base space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              豐富您的資訊
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              豐富的評論記錄
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              提供地點相片
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              更新營業資訊
            </li>
          </ul>
          <p className="text-xs md:text-sm text-gray-500 mt-3 flex items-center gap-2">
            <span className="text-amber-500">⚠️</span>
            上傳照片和發表可能會受限於您的 Google 地址驗證狀況！
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
