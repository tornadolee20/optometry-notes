
import { useNavigate } from "react-router-dom";

export const StoreNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h2 className="text-xl font-bold mb-4">找不到店家資訊</h2>
        <p className="text-gray-600 mb-4">
          無法找到對應的店家，請確認以下幾點：
        </p>
        <ul className="text-sm text-gray-500 mb-6 text-left space-y-2">
          <li>• 店家編號是否正確</li>
          <li>• 店家是否有有效的訂閱</li>
          <li>• 連結是否完整（例如：/00011/generate-review）</li>
        </ul>
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            返回首頁
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            重新載入
          </button>
        </div>
      </div>
    </div>
  );
};
