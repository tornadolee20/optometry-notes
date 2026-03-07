const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-sage-light/20 via-white to-brand-sage/10">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-4 border-brand-sage/30 border-t-brand-sage rounded-full animate-spin" />
      <p className="text-brand-sage-dark text-sm">載入中...</p>
    </div>
  </div>
);

export default LoadingSpinner;