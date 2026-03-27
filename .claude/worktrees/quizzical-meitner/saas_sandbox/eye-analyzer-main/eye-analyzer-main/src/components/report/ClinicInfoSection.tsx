import { MapPin, Phone, MessageSquare, Building2, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth, OptometristProfile } from '@/contexts/AuthContext';
import { ReportCard } from './ReportCard';

interface ClinicInfoSectionProps {
  profile?: OptometristProfile | null;
}

export const ClinicInfoSection = ({ profile: propProfile }: ClinicInfoSectionProps) => {
  const { language } = useLanguage();
  const { profile: authProfile } = useAuth();
  
  // Use passed profile or fall back to auth context
  const profile = propProfile ?? authProfile;

  const title = language === 'en' ? 'Optometry Clinic Information' : language === 'zh-CN' ? '验光所资讯' : '驗光所資訊';

  if (!profile) {
    return null;
  }

  const hasLineId = profile.clinic_line_id && language === 'zh-TW';
  const hasWechatId = profile.clinic_wechat_id && language === 'zh-CN';
  const hasContact = hasLineId || hasWechatId || profile.clinic_phone;

  return (
    <ReportCard 
      icon={Building2}
      title={title}
      collapsible 
      defaultOpen={false}
    >
      <div className="flex flex-col gap-4">
        {/* Clinic Name */}
        <div>
          <h4 className="font-bold text-base text-foreground">{profile.clinic_name}</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'en' ? 'Optometrist' : language === 'zh-CN' ? '验光师' : '驗光師'}：{profile.optometrist_name}
            {profile.optometrist_license_number && (
              <span className="ml-2 text-xs">（{profile.optometrist_license_number}）</span>
            )}
          </p>
        </div>
        
        {/* Address */}
        <div className="text-sm text-muted-foreground flex items-start gap-1.5">
          <MapPin size={14} className="text-primary flex-shrink-0 mt-0.5" />
          <span>{profile.clinic_address}</span>
        </div>
        
        {/* Email if available */}
        {profile.clinic_email && (
          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Mail size={14} className="text-primary flex-shrink-0" />
            <span>{profile.clinic_email}</span>
          </div>
        )}
        
        {/* Contact Buttons */}
        {hasContact && (
          <div className="flex gap-2 print:hidden">
            {/* LINE Button (Taiwan) */}
            {hasLineId && (
              <a 
                href={`https://line.me/ti/p/${profile.clinic_line_id}`}
                target="_blank" 
                rel="noreferrer" 
                className="flex-1 bg-[#00C300] text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm touch-feedback no-underline min-h-touch"
              >
                <MessageSquare size={18} /> LINE 預約
              </a>
            )}
            
            {/* WeChat (China) */}
            {hasWechatId && (
              <div className="flex-1 bg-[#07C160] text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm">
                <MessageSquare size={18} /> 微信：{profile.clinic_wechat_id}
              </div>
            )}
            
            {/* Phone Button */}
            {profile.clinic_phone && (
              <a 
                href={`tel:${profile.clinic_phone.replace(/[^0-9+]/g, '')}`}
                className="flex-1 bg-secondary text-foreground px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm touch-feedback no-underline min-h-touch"
              >
                <Phone size={18} /> {language === 'en' ? 'Call to Book' : language === 'zh-CN' ? '电话预约' : '電話預約'}
              </a>
            )}
          </div>
        )}
        
        {/* Print-only contact info */}
        <div className="hidden print:block text-sm text-muted-foreground space-y-1">
          {profile.clinic_phone && (
            <p className="flex items-center gap-1.5">
              <Phone size={14} className="text-primary" />
              {profile.clinic_phone}
            </p>
          )}
          {hasLineId && (
            <p className="flex items-center gap-1.5">
              <MessageSquare size={14} className="text-primary" />
              LINE: {profile.clinic_line_id}
            </p>
          )}
          {hasWechatId && (
            <p className="flex items-center gap-1.5">
              <MessageSquare size={14} className="text-primary" />
              微信: {profile.clinic_wechat_id}
            </p>
          )}
        </div>
      </div>
    </ReportCard>
  );
};