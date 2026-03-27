
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, LogIn, ShieldCheck } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  
  // Format today's date in Chinese/Japanese style (month + day + 日)
  const formatTodayDate = () => {
    const today = new Date();
    const month = today.getMonth() + 1; // JavaScript months are 0-indexed
    const day = today.getDate();
    return `${month}月${day}日`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md mx-auto"
      >
        <h1 className="text-4xl font-bold mb-2 text-brand-sage-dark">自己的評論</h1>
        <p className="text-gray-600 mb-2">配出顧客最真實的聲音</p>
        <p className="text-sm text-gray-500 mb-6">更新於 {formatTodayDate()}</p>
        
        <div className="space-y-4">
          <Button asChild className="w-full text-lg py-6 bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 gap-2">
            <a href="https://lin.ee/XDA6Acp">
              直接與我聊聊
            </a>
          </Button>

          <Button
            onClick={() => navigate("/register")}
            className="w-full text-lg py-6 bg-black hover:bg-gray-800 transition-all duration-300 gap-2"
          >
            <UserPlus className="w-5 h-5" />
            店家註冊
          </Button>
          
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="w-full text-lg py-6 border-2 hover:bg-gray-50 transition-all duration-300 gap-2"
          >
            <LogIn className="w-5 h-5" />
            店家登入
          </Button>

          <Button
            onClick={() => navigate("/admin")}
            variant="ghost"
            className="w-full text-lg py-6 hover:bg-gray-100 transition-all duration-300 gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            管理員登入
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
