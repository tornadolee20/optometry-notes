
import { motion } from "framer-motion";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Sparkles, Store, Star } from "lucide-react";

export const Loading = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航骨架 */}
      <div className="bg-white border-b p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <LoadingSkeleton className="h-6 w-16" />
          <LoadingSkeleton className="h-6 w-24" />
          <LoadingSkeleton className="h-6 w-16" />
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* 店家頭部骨架 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <div className="flex items-center space-x-4">
            <LoadingSkeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <LoadingSkeleton className="h-6 w-3/4" />
              <LoadingSkeleton className="h-4 w-1/2" />
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-gray-200" />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 主要內容骨架 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm p-6 space-y-6"
        >
          {/* 標題區域 */}
          <div className="text-center space-y-2">
            <LoadingSkeleton className="h-7 w-48 mx-auto" />
            <div className="bg-gray-50 rounded-lg p-3">
              <LoadingSkeleton className="h-4 w-32 mx-auto mb-1" />
              <LoadingSkeleton className="h-4 w-40 mx-auto" />
            </div>
          </div>

          {/* 載入指示 */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500"></div>
              <Sparkles className="absolute inset-2 h-8 w-8 text-blue-500 animate-pulse" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-gray-600 font-medium">正在準備您的專屬關鍵字</p>
              <p className="text-sm text-gray-500">根據店家特色智能生成中...</p>
            </div>
          </div>

          {/* 關鍵字網格骨架 */}
          <div className="space-y-3">
            <LoadingSkeleton className="h-6 w-32" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...Array(8)].map((_, i) => (
                <LoadingSkeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          </div>

          {/* 進度條 */}
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div 
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "70%" }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center">預計還需要 3-5 秒</p>
          </div>

          {/* 按鈕骨架 */}
          <LoadingSkeleton className="h-16 w-full rounded-xl" />
        </motion.div>

        {/* 引導提示骨架 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4"
        >
          <div className="flex items-start space-x-3">
            <Store className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <LoadingSkeleton className="h-4 w-24" />
              <LoadingSkeleton className="h-3 w-full" />
              <LoadingSkeleton className="h-3 w-3/4" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
