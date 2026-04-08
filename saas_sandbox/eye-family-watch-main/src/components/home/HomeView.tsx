import { useState } from 'react';
import MemberCard from '@/components/home/MemberCard';
import { mockMembers } from '@/data/mockData';
import { Plus } from 'lucide-react';

interface HomeViewProps {
  onMemberTap: (memberId: string) => void;
  onAddVisit?: () => void;
}

const HomeView = ({ onMemberTap, onAddVisit }: HomeViewProps) => {
  const [members] = useState(mockMembers);

  return (
    <div className="min-h-screen pb-24">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg safe-top">
        <div className="flex items-center justify-between px-5 py-4">
          <h1 className="text-heading font-bold text-foreground">視力家家簿</h1>
          <button onClick={onAddVisit} className="touch-target flex items-center justify-center rounded-full bg-primary text-primary-foreground w-10 h-10 active:scale-95 transition-transform">
            <Plus size={22} />
          </button>
        </div>
      </div>

      {/* Member cards */}
      <div className="px-4 space-y-3">
        {members.map((member) => (
          <MemberCard
            key={member.profile.id}
            member={member}
            onTap={() => onMemberTap(member.profile.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeView;
