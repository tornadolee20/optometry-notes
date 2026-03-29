import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle, 
  X,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type AlertType = 'error' | 'success' | 'warning' | 'info';

interface EnhancedAlertProps {
  type: AlertType;
  title?: string;
  message: string;
  isVisible?: boolean;
  onClose?: () => void;
  onRetry?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  showCloseButton?: boolean;
  persistent?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
  className?: string;
}

const alertConfig = {
  error: {
    icon: AlertCircle,
    bgClass: 'bg-status-error-bg',
    borderClass: 'border-status-error-border',
    leftBorderClass: 'border-l-status-error-fg',
    iconClass: 'text-status-error-fg',
    titleClass: 'text-status-error-fg',
    messageClass: 'text-status-error-fg/80',
  },
  success: {
    icon: CheckCircle,
    bgClass: 'bg-status-success-bg',
    borderClass: 'border-status-success-border',
    leftBorderClass: 'border-l-status-success-fg',
    iconClass: 'text-status-success-fg',
    titleClass: 'text-status-success-fg',
    messageClass: 'text-status-success-fg/80',
  },
  warning: {
    icon: AlertTriangle,
    bgClass: 'bg-status-warning-bg',
    borderClass: 'border-status-warning-border',
    leftBorderClass: 'border-l-status-warning-fg',
    iconClass: 'text-status-warning-fg',
    titleClass: 'text-status-warning-fg',
    messageClass: 'text-status-warning-fg/80',
  },
  info: {
    icon: Info,
    bgClass: 'bg-status-info-bg',
    borderClass: 'border-status-info-border',
    leftBorderClass: 'border-l-status-info-fg',
    iconClass: 'text-status-info-fg',
    titleClass: 'text-status-info-fg',
    messageClass: 'text-status-info-fg/80',
  },
};

export const EnhancedAlert: React.FC<EnhancedAlertProps> = ({
  type,
  title,
  message,
  isVisible = true,
  onClose,
  onRetry,
  onAction,
  actionLabel,
  showCloseButton = true,
  persistent = false,
  autoClose = false,
  autoCloseDelay = 5000,
  className,
}) => {
  const config = alertConfig[type];
  const Icon = config.icon;
  
  React.useEffect(() => {
    if (autoClose && !persistent && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, persistent, onClose, autoCloseDelay]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ 
            duration: 0.3, 
            ease: "easeOut",
            type: "spring",
            stiffness: 300,
            damping: 30 
          }}
          className={cn("relative overflow-hidden", className)}
          data-status={type}
        >
          <Alert 
            className={cn(
              "shadow-lg border-l-4",
              config.bgClass,
              config.borderClass,
              config.leftBorderClass,
            )}
          >
            <div className="flex items-start gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
                className="flex-shrink-0"
              >
                <Icon className={cn("h-5 w-5", config.iconClass)} />
              </motion.div>
              
              <div className="flex-1 min-w-0">
                {title && (
                  <motion.h4 
                    className={cn("font-semibold mb-1", config.titleClass)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    {title}
                  </motion.h4>
                )}
                
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <AlertDescription className={cn("leading-relaxed", config.messageClass)}>
                    {message}
                  </AlertDescription>
                </motion.div>

                {(onRetry || onAction) && (
                  <motion.div 
                    className="flex gap-2 mt-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {onRetry && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={onRetry}
                        className="h-8 px-3 text-xs"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        重試
                      </Button>
                    )}
                    
                    {onAction && actionLabel && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={onAction}
                        className="h-8 px-3 text-xs"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {actionLabel}
                      </Button>
                    )}
                  </motion.div>
                )}
              </div>

              {showCloseButton && onClose && (
                <motion.button
                  onClick={onClose}
                  className={cn(
                    "flex-shrink-0 p-1 rounded-full hover:bg-foreground/10 transition-colors",
                    config.iconClass
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <X className="h-4 w-4" />
                </motion.button>
              )}
            </div>

            {autoClose && !persistent && (
              <motion.div 
                className="absolute bottom-0 left-0 h-1 bg-current opacity-30"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: autoCloseDelay / 1000, ease: "linear" }}
              />
            )}
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const ErrorAlert: React.FC<Omit<EnhancedAlertProps, 'type'>> = (props) => (
  <EnhancedAlert type="error" {...props} />
);

export const SuccessAlert: React.FC<Omit<EnhancedAlertProps, 'type'>> = (props) => (
  <EnhancedAlert type="success" {...props} />
);

export const WarningAlert: React.FC<Omit<EnhancedAlertProps, 'type'>> = (props) => (
  <EnhancedAlert type="warning" {...props} />
);

export const InfoAlert: React.FC<Omit<EnhancedAlertProps, 'type'>> = (props) => (
  <EnhancedAlert type="info" {...props} />
);

interface ToastAlertProps extends EnhancedAlertProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastAlert: React.FC<ToastAlertProps> = ({ 
  position = 'top-right', 
  ...props 
}) => {
  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
    'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50',
  };

  return (
    <div className={positionClasses[position]}>
      <EnhancedAlert 
        {...props} 
        className={cn("max-w-md shadow-2xl", props.className)}
        autoClose={props.autoClose ?? true}
      />
    </div>
  );
};
