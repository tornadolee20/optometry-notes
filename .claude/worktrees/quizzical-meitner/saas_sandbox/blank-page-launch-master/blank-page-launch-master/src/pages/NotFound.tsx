
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="text-xl text-gray-600 mb-8">
          抱歉，找不到您要的頁面
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回上一頁
          </Button>
          
          <Button
            onClick={() => navigate("/")}
            className="w-full"
          >
            <Home className="mr-2 h-4 w-4" />
            回到首頁
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
