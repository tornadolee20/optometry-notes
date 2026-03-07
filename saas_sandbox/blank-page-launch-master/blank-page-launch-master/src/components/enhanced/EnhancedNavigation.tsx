import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollSpy } from "@/hooks/useScrollSpy";

interface NavigationProps {
  className?: string;
}

export const EnhancedNavigation = ({ className = "" }: NavigationProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeSection = useScrollSpy({ 
    sectionIds: ['hero', 'pain-points', 'how-it-works', 'founder-story', 'features', 'pricing', 'testimonials'],
    offset: 120 
  });

  const navItems = [
    { href: "#pain-points", label: "店家之痛" },
    { href: "#how-it-works", label: "運作方式" },
    { href: "#founder-story", label: "我的故事" },
    { href: "#features", label: "系統特色" },
    { href: "#pricing", label: "價格方案" },
    { href: "#testimonials", label: "客戶見證" },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className={`fixed top-0 w-full nav-blur border-b border-border/50 z-50 ${className}`}>
      <div className="section-container">
        <div className="flex justify-between items-center h-16">
           <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
             <img 
               src="/lovable-uploads/40b8add3-b8f5-4e78-8a90-9987bc19b773.png" 
               alt="Myownreviews" 
               className="h-8 w-8"
             />
             <span className="text-xl font-bold text-primary">Myownreviews</span>
          </motion.div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={`text-sm font-medium transition-all duration-300 relative ${
                  activeSection === item.href.substring(1) 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-primary'
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                {item.label}
                {activeSection === item.href.substring(1) && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                    layoutId="activeNav"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
            <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
              登入
            </Link>
            <Link to="/register">
              <Button size="sm" className="brand-shadow hover:shadow-button">
                免費試用
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              aria-label="開啟選單"
              className="relative"
            >
              <motion.div
                animate={{ rotate: mobileMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.div>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden border-t border-border/50 nav-blur"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-4 space-y-4">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`block w-full text-left py-2 text-sm font-medium transition-colors ${
                    activeSection === item.href.substring(1) 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {item.label}
                </motion.button>
              ))}
              <Link 
                to="/login" 
                className="block py-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium" 
                onClick={() => setMobileMenuOpen(false)}
              >
                登入
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full brand-shadow">
                  免費試用
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};