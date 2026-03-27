import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Check, X, Menu, X as CloseIcon, Info, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getLandingTranslation } from '@/lib/translations/landingTranslations';
import { Language } from '@/lib/translations';
import { cn } from '@/lib/utils';
import myownvisionLogo from '@/assets/myownvision-logo.png';

import type { Easing, Variants } from 'framer-motion';

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as Easing } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 }
  }
};

// Animated Section wrapper
interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const AnimatedSection = ({ children, className = "", id }: AnimatedSectionProps) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.section>
  );
};

// Language Toggle Component - Option B: Bigger buttons on mobile
const LanguageToggle = ({ className }: { className?: string }) => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className={cn("inline-flex items-center bg-secondary/50 rounded-lg p-0.5 border border-border text-sm", className)}>
      <button
        onClick={() => setLanguage('zh-TW')}
        className={cn(
          "px-3 py-1.5 min-h-[44px] md:min-h-0 rounded-md transition-all duration-200 font-bold text-sm flex items-center justify-center",
          language === 'zh-TW'
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        )}
      >
        繁
      </button>
      <button
        onClick={() => setLanguage('zh-CN')}
        className={cn(
          "px-3 py-1.5 min-h-[44px] md:min-h-0 rounded-md transition-all duration-200 font-bold text-sm flex items-center justify-center",
          language === 'zh-CN'
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        )}
      >
        简
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          "px-3 py-1.5 min-h-[44px] md:min-h-0 rounded-md transition-all duration-200 font-bold text-sm flex items-center justify-center",
          language === 'en'
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        )}
      >
        EN
      </button>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const t = getLandingTranslation(language);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle subscribe button click - navigate based on auth state
  const handleSubscribeClick = () => {
    if (authLoading) return;
    if (user) {
      navigate('/subscription');
    } else {
      navigate('/auth');
    }
  };

  // Update document title based on language
  useEffect(() => {
    document.title = t.pageTitle;
  }, [t.pageTitle]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/95 backdrop-blur-md border-b border-border" : "bg-transparent"
      )}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Logo */}
            <button onClick={() => navigate('/')} className="flex flex-col">
              <span className="font-bold text-lg tracking-tight">{t.brandName}</span>
            </button>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#story" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.navStory}</a>
              <a href="#changes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.navChanges}</a>
              <a href="#independent" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.navIndependent}</a>
              <a href="#fit" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.navFit}</a>
              <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.navAbout}</a>
              <a href="#report" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.navReport}</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.navPricing}</a>
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-4">
              <LanguageToggle />
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>{t.navLogin}</Button>
              <Button size="sm" onClick={() => navigate('/auth/register')}>{t.navStartNow}</Button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 md:hidden">
              <LanguageToggle />
              <button
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <CloseIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-border">
            <div className="px-4 py-4 space-y-3">
              <a href="#story" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-muted-foreground hover:text-foreground">{t.navStory}</a>
              <a href="#changes" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-muted-foreground hover:text-foreground">{t.navChanges}</a>
              <a href="#independent" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-muted-foreground hover:text-foreground">{t.navIndependent}</a>
              <a href="#fit" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-muted-foreground hover:text-foreground">{t.navFit}</a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-muted-foreground hover:text-foreground">{t.navAbout}</a>
              <a href="#report" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-muted-foreground hover:text-foreground">{t.navReport}</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-muted-foreground hover:text-foreground">{t.navPricing}</a>
              <div className="flex flex-col gap-2 pt-3 border-t border-border">
                <Button variant="outline" onClick={() => navigate('/auth')}>{t.navLogin}</Button>
                <Button onClick={() => navigate('/auth/register')}>{t.navStartNow}</Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Mobile First */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Brand Block with Logo */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 lg:mb-14"
          >
            <img 
              src={myownvisionLogo} 
              alt="MYOWNVISION Logo" 
              className="w-48 sm:w-56 lg:w-72 h-auto mx-auto mb-4"
            />
            <p className="text-sm sm:text-base text-muted-foreground mb-1">
              {t.brandSubtitle}
            </p>
            <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
              {t.brandTagline}
            </p>
          </motion.div>

          {/* Product Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-sm text-slate-600 dark:text-slate-400 mb-8 lg:mb-10"
          >
            {t.productDescription}
          </motion.p>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-6"
          >
            {t.heroHeadline}
          </motion.h2>

          {/* Subheadline - Now shorter */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 lg:mb-10 max-w-2xl mx-auto"
          >
            {t.heroSubheadline}
          </motion.p>

          {/* CTAs with subtext */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-2">
              <Button 
                size="lg"
                onClick={() => navigate('/auth/register')}
                className="h-11 sm:h-12 px-6 text-base"
              >
                {t.heroCta}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => {
                  const storySection = document.getElementById('story');
                  storySection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="h-11 sm:h-12 px-6 text-base"
              >
                {t.heroSecondaryCta}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {t.heroCtaSubtext}
            </p>
            <p className="text-xs text-muted-foreground/80 mt-3 max-w-md leading-relaxed">
              {t.heroTrialNote}
            </p>
          </motion.div>
        </div>

        {/* Hero Visual Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="max-w-6xl mx-auto mt-12 lg:mt-16 px-4 sm:px-6"
        >
          <div className="w-full lg:max-w-[500px] lg:mx-auto h-[250px] sm:h-[300px] lg:h-[400px] bg-muted/50 rounded-lg flex items-center justify-center border border-border">
            <p className="text-muted-foreground text-sm sm:text-base">{t.heroPlaceholder}</p>
          </div>
        </motion.div>
      </section>

      {/* Story Section - Orange for pain/anxiety emotion */}
      <AnimatedSection id="story" className="py-16 lg:py-20 px-4 sm:px-6 bg-orange-50 dark:bg-orange-950/20">
        <div className="max-w-3xl mx-auto">
          <motion.h3 variants={fadeInUp} className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 text-center">
            {t.storyTitle}
          </motion.h3>
          
          {/* Story Intro - moved from hero */}
          <motion.p variants={fadeInUp} className="text-base sm:text-lg text-foreground leading-relaxed mb-8 text-center font-medium">
            {t.storyIntro}
          </motion.p>
          
          <div className="space-y-5 mb-10">
            {t.storyContent.map((paragraph, index) => (
              <motion.p
                key={index}
                variants={fadeInUp}
                className="text-base sm:text-lg text-muted-foreground leading-relaxed"
              >
                {paragraph}
                {/* Add last mile explanation after the third paragraph */}
                {index === 2 && (
                  <span className="text-sm text-muted-foreground/70 ml-1">
                    {t.lastMileExplanation}
                  </span>
                )}
              </motion.p>
            ))}
          </div>

          {/* Story Bullets - Vertical on mobile, 3-column grid on desktop with macaron colors */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
            {t.storyBullets.map((bullet, index) => {
              const bulletColors = ['text-pink-500', 'text-teal-500', 'text-purple-500'];
              const bgColors = ['bg-pink-100 dark:bg-pink-900/30', 'bg-teal-100 dark:bg-teal-900/30', 'bg-purple-100 dark:bg-purple-900/30'];
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                >
                  <Card className="p-4 lg:p-5 bg-background border-border h-full">
                    <div className="flex items-start gap-3">
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", bgColors[index])}>
                        <Check className={cn("w-4 h-4", bulletColors[index])} />
                      </div>
                      <p className="text-sm sm:text-base leading-relaxed">{bullet}</p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* Changes Section - Green for growth/hope emotion */}
      <AnimatedSection id="changes" className="py-16 lg:py-20 px-4 sm:px-6 bg-green-50 dark:bg-green-950/20">
        <div className="max-w-3xl mx-auto">
          <motion.h3 variants={fadeInUp} className="text-xl sm:text-2xl lg:text-3xl font-bold mb-8 text-center">
            {t.changesTitle}
          </motion.h3>
          
          <div className="space-y-4">
            {t.changesList.map((change, index) => {
              const cardColors = [
                { bg: 'bg-slate-50 dark:bg-slate-900/40', circle: 'bg-blue-500' },
                { bg: 'bg-slate-50 dark:bg-slate-900/40', circle: 'bg-blue-600' },
                { bg: 'bg-slate-50 dark:bg-slate-900/40', circle: 'bg-blue-700' },
              ];
              const colors = cardColors[index] || cardColors[0];
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className={cn("flex items-start gap-4 p-4 sm:p-5 rounded-xl", colors.bg)}
                >
                  <div className={cn("w-8 h-8 rounded-full text-white flex items-center justify-center flex-shrink-0 text-sm font-bold", colors.circle)}>
                    {index + 1}
                  </div>
                  <p className="text-base sm:text-lg pt-1">{change}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* Independent Section - Blue for trust/professional emotion */}
      <AnimatedSection id="independent" className="py-16 lg:py-20 px-4 sm:px-6 bg-blue-50 dark:bg-blue-950/20">
        <div className="max-w-3xl mx-auto">
          <motion.h3 variants={fadeInUp} className="text-xl sm:text-2xl lg:text-3xl font-bold mb-8 text-center">
            {t.independentTitle}
          </motion.h3>
          
          <div className="space-y-5 mb-8">
            {t.independentIntro.map((paragraph, index) => (
              <motion.p
                key={index}
                variants={fadeInUp}
                className="text-base sm:text-lg text-muted-foreground leading-relaxed"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          <motion.div variants={fadeInUp} className="bg-background border border-border rounded-xl p-5 sm:p-6 mb-8">
            {t.independentStance.map((paragraph, index) => (
              <p
                key={index}
                className={cn(
                  "text-base sm:text-lg",
                  index === 0 ? "font-semibold mb-2" : "text-muted-foreground"
                )}
              >
                {paragraph}
              </p>
            ))}
          </motion.div>

          <div className="space-y-3">
            {t.independentBullets.map((bullet, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="flex items-start gap-3"
              >
                <Check className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-base sm:text-lg text-muted-foreground">{bullet}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Fit Section - Purple for choice/decision emotion */}
      <AnimatedSection id="fit" className="py-16 lg:py-20 px-4 sm:px-6 bg-purple-50 dark:bg-purple-950/20">
        <div className="max-w-4xl mx-auto">
          <motion.h3 variants={fadeInUp} className="text-xl sm:text-2xl lg:text-3xl font-bold mb-10 text-center">
            {t.fitTitle}
          </motion.h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Good fit */}
            <motion.div variants={fadeInUp}>
              <Card className="p-5 sm:p-6 h-full bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  {t.fitGoodTitle}
                </h4>
                <ul className="space-y-3">
                  {t.fitGoodList.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                      <span className="text-sm sm:text-base text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>

            {/* Not good fit */}
            <motion.div variants={fadeInUp}>
              <Card className="p-5 sm:p-6 h-full bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-red-700 dark:text-red-400">
                  <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                  {t.fitNotGoodTitle}
                </h4>
                <ul className="space-y-3">
                  {t.fitNotGoodList.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <X className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                      <span className="text-sm sm:text-base text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* About Developer Section - Warm teal for personal connection */}
      <AnimatedSection id="about" className="py-16 lg:py-20 px-4 sm:px-6 bg-teal-50 dark:bg-teal-950/20">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeInUp} className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
              <User className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center">
              {t.aboutDevTitle}
            </h3>
          </motion.div>
          
          <div className="space-y-5">
            {t.aboutDevContent.map((paragraph, index) => (
              <motion.p
                key={index}
                variants={fadeInUp}
                className="text-base sm:text-lg text-muted-foreground leading-relaxed"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Report Demo Section - Cyan for clarity/visualization */}
      <AnimatedSection id="report" className="py-16 lg:py-20 px-4 sm:px-6 bg-cyan-50 dark:bg-cyan-950/20">
        <div className="max-w-4xl mx-auto">
          <motion.h3 variants={fadeInUp} className="text-xl sm:text-2xl lg:text-3xl font-bold mb-8 text-center">
            {t.reportDemoTitle}
          </motion.h3>
          
          <motion.p variants={fadeInUp} className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
            {t.reportDemoIntro}
          </motion.p>

          <div className="space-y-3 mb-8">
            {t.reportDemoList.map((item, index) => {
              const colors = [
                { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
                { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-500', dot: 'bg-yellow-500' },
                { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
              ];
              const color = colors[index];
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className={cn("flex items-start gap-3 p-4 rounded-lg", color.bg)}
                >
                  <div className={cn("w-4 h-4 rounded-full flex-shrink-0 mt-1", color.dot)} />
                  <p className={cn("text-base sm:text-lg font-medium", color.text)}>{item}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.p variants={fadeInUp} className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-10">
            {t.reportDemoOutro}
          </motion.p>

          {/* Report Demo Placeholder */}
          <motion.div variants={fadeInUp} className="relative">
            <div className="w-full h-[300px] sm:h-[400px] bg-muted/50 rounded-lg flex items-center justify-center border border-border">
              <p className="text-muted-foreground text-sm sm:text-base">{t.heroPlaceholder}</p>
            </div>
            <p className="text-xs text-muted-foreground/70 text-center mt-3">
              {t.reportDemoPlaceholder}
            </p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Pricing Section - Amber for action/opportunity emotion */}
      <AnimatedSection id="pricing" className="py-16 lg:py-20 px-4 sm:px-6 bg-amber-50 dark:bg-amber-950/20">
        <div className="max-w-4xl mx-auto">
          <motion.h3 variants={fadeInUp} className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 text-center">
            {t.pricingTitle}
          </motion.h3>
          
          <motion.p variants={fadeInUp} className="text-base sm:text-lg text-muted-foreground mb-10 text-center max-w-2xl mx-auto">
            {t.pricingDescription}
          </motion.p>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Monthly Plan */}
            <motion.div variants={fadeInUp}>
              <Card className="p-5 sm:p-6 h-full bg-background border-border relative flex flex-col">
                {/* Monthly Label */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    {t.pricingMonthlyLabel}
                  </span>
                </div>
                <h4 className="font-semibold text-lg mb-3">{t.pricingMonthlyTitle}</h4>
                <p className="text-sm text-muted-foreground line-through mb-1">{t.pricingMonthlyOriginal}</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary mb-4">{t.pricingMonthlyPrice}</p>
                <div className="space-y-2 flex-1">
                  {t.pricingMonthlyDesc.map((desc, index) => (
                    <p key={index} className="text-sm text-muted-foreground">{desc}</p>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={handleSubscribeClick}
                >
                  {t.pricingMonthlyBtn}
                </Button>
              </Card>
            </motion.div>

            {/* Yearly Plan */}
            <motion.div variants={fadeInUp}>
              <Card className="p-5 sm:p-6 h-full bg-background border-2 border-primary relative overflow-hidden flex flex-col">
                {/* Best Value + Optometrist's Choice Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-1 items-end">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground">
                    {t.pricingYearlyBadge}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400">
                    {t.pricingYearlyLabel}
                  </span>
                </div>
                <h4 className="font-semibold text-lg mb-3">{t.pricingYearlyTitle}</h4>
                <p className="text-sm text-muted-foreground line-through mb-1">{t.pricingYearlyOriginal}</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary mb-1">{t.pricingYearlyPrice}</p>
                <p className="text-xs text-muted-foreground mb-4">{t.pricingYearlySubtext}</p>
                <div className="space-y-2 flex-1">
                  {t.pricingYearlyDesc.map((desc, index) => (
                    <p key={index} className="text-sm text-muted-foreground">{desc}</p>
                  ))}
                </div>
                <Button 
                  className="w-full mt-4"
                  onClick={handleSubscribeClick}
                >
                  {t.pricingYearlyBtn}
                </Button>
              </Card>
            </motion.div>
          </div>

          {/* Trial Info */}
          <motion.div variants={fadeInUp} className="bg-background border border-border rounded-xl p-5 sm:p-6 mb-8 text-center">
            <p className="font-semibold text-base mb-2">{t.pricingTrialTitle}</p>
            <p className="text-sm text-muted-foreground">{t.pricingTrialDesc}</p>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-col items-center">
            <Button 
              size="lg"
              onClick={() => navigate('/auth/register')}
              className="h-11 sm:h-12 px-8 text-base"
            >
              {t.pricingCta}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <p className="text-xs text-muted-foreground/80 mt-3 max-w-md text-center leading-relaxed">
              {t.heroTrialNote}
            </p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Testimonials Section - Hidden */}
      {/* 
      <AnimatedSection id="testimonials" className="py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.h3 variants={fadeInUp} className="text-xl sm:text-2xl lg:text-3xl font-bold mb-8 text-center">
            {t.testimonialsTitle}
          </motion.h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {t.testimonialPlaceholders.map((placeholder, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="p-5 sm:p-6 bg-secondary/30 border-border h-full">
                  <p className="text-muted-foreground italic">{placeholder}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>
      */}

      {/* Disclaimer - Styled as info card */}
      <section className="py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {t.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 lg:py-8 px-4 sm:px-6 bg-gray-50 dark:bg-gray-900/50 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold">{t.brandName}</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t.footerCopyright}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground/70">
              {t.footerBy}
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border md:hidden z-40">
        <Button 
          className="w-full h-11"
          onClick={() => navigate('/auth/register')}
        >
          {t.heroCta}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>

      {/* Bottom padding for mobile sticky CTA */}
      <div className="h-20 md:hidden" />
    </div>
  );
};

export default LandingPage;
