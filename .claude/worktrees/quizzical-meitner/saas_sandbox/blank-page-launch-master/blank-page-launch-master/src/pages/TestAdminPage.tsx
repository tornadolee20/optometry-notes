// 簡單的測試管理頁面 - 用來測試登入是否成功

const TestAdminPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-600 mb-6">
          🎉 管理員登入成功！
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold">測試頁面</h2>
          <p className="text-gray-600">
            如果你看到這個頁面，表示管理員認證系統運作正常！
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-800">✅ 成功項目：</h3>
            <ul className="mt-2 space-y-1 text-sm text-green-700">
              <li>• Supabase 認證成功</li>
              <li>• 管理員權限驗證通過</li>
              <li>• 路由保護機制運作正常</li>
              <li>• 頁面渲染成功</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800">🔗 可用的管理功能：</h3>
            <ul className="mt-2 space-y-1 text-sm text-blue-700">
              <li>• <a href="/admin/dashboard" className="underline">主儀表板</a></li>
              <li>• <a href="/admin/stores" className="underline">店家管理</a></li>
              <li>• <a href="/admin/analytics" className="underline">數據分析</a></li>
              <li>• <a href="/admin/logs" className="underline">活動日誌</a></li>
              <li>• <a href="/admin/settings" className="underline">系統設定</a></li>
            </ul>
          </div>

          <button 
            onClick={() => window.location.href = '/admin/dashboard'}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            前往完整管理後台
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestAdminPage;