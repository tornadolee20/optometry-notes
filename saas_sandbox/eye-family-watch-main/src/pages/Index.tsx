import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import BottomTabBar from '@/components/layout/BottomTabBar';
import HomeView from '@/components/home/HomeView';
import TrendsView from '@/components/trends/TrendsView';
import SettingsView from '@/components/settings/SettingsView';
import MemberDetailView from '@/components/member/MemberDetailView';
import AddVisitWizard from '@/components/records/AddVisitWizard';
import CISSQuestionnaire from '@/components/ciss/CISSQuestionnaire';
import InstallPrompt from '@/components/pwa/InstallPrompt';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [showCISS, setShowCISS] = useState<string | null>(null);

  const handleTabChange = (tab: string) => {
    if (tab === 'add') {
      setShowAddVisit(true);
      return;
    }
    setActiveTab(tab);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView onMemberTap={(id) => setSelectedMemberId(id)} onAddVisit={() => setShowAddVisit(true)} />;
      case 'trends':
        return <TrendsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeView onMemberTap={(id) => setSelectedMemberId(id)} onAddVisit={() => setShowAddVisit(true)} />;
    }
  };

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-background relative overflow-hidden">
      {renderTab()}
      <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />

      <AnimatePresence>
        {selectedMemberId && (
          <MemberDetailView
            key="member-detail"
            memberId={selectedMemberId}
            onBack={() => setSelectedMemberId(null)}
            onStartCISS={(id) => setShowCISS(id)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddVisit && (
          <AddVisitWizard
            key="add-visit"
            onBack={() => setShowAddVisit(false)}
            onComplete={() => setShowAddVisit(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCISS && (
          <CISSQuestionnaire
            key="ciss"
            profileId={showCISS}
            onBack={() => setShowCISS(null)}
            onComplete={() => setShowCISS(null)}
          />
        )}
      </AnimatePresence>

      <InstallPrompt />
    </div>
  );
};

export default Index;
