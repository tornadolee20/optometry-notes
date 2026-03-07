
import { Check, MessageSquare } from "lucide-react";

export const QuickGuide = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 space-y-4 mt-4 border border-blue-100">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-blue-800">🧠 三步驟啟動您的內心分享</h3>
        <p className="text-sm text-blue-600">不只是評論，而是真實的經驗分享，幫助其他人做更好的選擇</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="bg-green-100 p-2 rounded-full">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-sm">💜 <strong>認知感受</strong>：您當時真正的感受和情緒</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <div className="bg-green-100 p-2 rounded-full">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-sm">✨ <strong>表達體驗</strong>：讓系統幫您組織成有價值的分享</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <div className="bg-green-100 p-2 rounded-full">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-sm">📝 <strong>個人化內容</strong>：獲得一段真實的文字</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <div className="bg-blue-100 p-2 rounded-full">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-sm">🌐 <strong>分享給世界</strong>：成為其他人的參考</span>
        </div>
      </div>
    </div>
  );
};
