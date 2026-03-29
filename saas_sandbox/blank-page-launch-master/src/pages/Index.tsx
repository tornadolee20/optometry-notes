
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, LogIn, ShieldCheck } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  
  const formatTodayDate = () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    return `${month}月${day}日`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md mx-auto"
      >
        <img 
          src="/lovable-uploads/40b8add3-b8f5-4e78-8a90-9987bc19b773.png" 
          alt="Myownreviews Logo" 
          className="h-16 w-auto mx-auto mb-4"
        />
        <h1 className="text-4xl font-bold mb-2 text-primary">Myownreviews</h1>
        <p className="text-muted-foreground mb-2">配出顧客最真實的聲音</p>
        <p className="text-sm text-muted-foreground/70 mb-6">更新於 {formatTodayDate()}</p>
        
        <div className="space-y-4">
          <Button asChild className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 gap-2">
            <a href="https://lin.ee/XDA6Acp">
              直接與我聊聊
            </a>
          </Button>

          <Button
            onClick={() => navigate("/register")}
            className="w-full text-lg py-6 bg-primary hover:bg-primary/90 transition-all duration-300 gap-2"
          >
            <UserPlus className="w-5 h-5" />
            店家註冊
          </Button>
          
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="w-full text-lg py-6 border-2 hover:bg-accent transition-all duration-300 gap-2"
          >
            <LogIn className="w-5 h-5" />
            店家登入
          </Button>

          <Button
            onClick={() => navigate("/admin")}
            variant="ghost"
            className="w-full text-lg py-6 hover:bg-accent transition-all duration-300 gap-2"
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
