import { useState, useMemo } from 'react';
import { mockMembers, mockVisits, mockOptometryRecords, mockOphthalmologyRecords, getAge, getRoleBadge } from '@/data/mockData';
import { estimateAxialLength } from '@/lib/axialLength';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TrendsView = () => {
  const [selectedMember, setSelectedMember] = useState(mockMembers[0].profile.id);

  const member = mockMembers.find(m => m.profile.id === selectedMember);

  // Build sphere trend from ophthalmology (cycloplegic) + optometry (manifest) records
  const trendData = useMemo(() => {
    const memberVisits = mockVisits
      .filter(v => v.profile_id === selectedMember)
      .sort((a, b) => new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime());

    return memberVisits
      .map(visit => {
        let R: number | undefined, L: number | undefined;
        if (visit.clinic_type === 'ophthalmology') {
          const rec = mockOphthalmologyRecords.find(r => r.clinic_visit_id === visit.id);
          if (rec) { R = rec.cycloplegic_R_sphere; L = rec.cycloplegic_L_sphere; }
        } else {
          const rec = mockOptometryRecords.find(r => r.clinic_visit_id === visit.id);
          if (rec) { R = rec.manifest_R_sphere; L = rec.manifest_L_sphere; }
        }
        if (R == null && L == null) return null;
        return { date: visit.visit_date.slice(0, 7), R, L };
      })
      .filter(Boolean) as { date: string; R?: number; L?: number }[];
  }, [selectedMember]);

  // Estimated axial length trend from optometry records with keratometry
  const alTrendData = useMemo(() => {
    if (!member) return [];
    const memberOptVisits = mockVisits
      .filter(v => v.profile_id === selectedMember && v.clinic_type === 'optometry')
      .sort((a, b) => new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime());

    return memberOptVisits
      .map(visit => {
        const rec = mockOptometryRecords.find(r => r.clinic_visit_id === visit.id);
        if (!rec) return null;
        const canR = rec.k1_R != null && rec.k2_R != null && rec.manifest_R_sphere != null && rec.manifest_R_cylinder != null;
        const canL = rec.k1_L != null && rec.k2_L != null && rec.manifest_L_sphere != null && rec.manifest_L_cylinder != null;
        if (!canR && !canL) return null;
        return {
          date: visit.visit_date.slice(0, 7),
          R: canR ? Number(estimateAxialLength(rec.k1_R!, rec.k2_R!, rec.manifest_R_sphere!, rec.manifest_R_cylinder!, member.profile.birth_date).toFixed(2)) : undefined,
          L: canL ? Number(estimateAxialLength(rec.k1_L!, rec.k2_L!, rec.manifest_L_sphere!, rec.manifest_L_cylinder!, member.profile.birth_date).toFixed(2)) : undefined,
        };
      })
      .filter(Boolean) as { date: string; R?: number; L?: number }[];
  }, [selectedMember, member]);

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg safe-top">
        <div className="px-5 py-4">
          <h1 className="text-heading font-bold text-foreground">趨勢</h1>
        </div>
        {/* Member selector */}
        <div className="flex gap-2 px-5 pb-3 overflow-x-auto no-scrollbar">
          {mockMembers.map(m => {
            const badge = getRoleBadge(m.profile.role);
            const isActive = selectedMember === m.profile.id;
            return (
              <button
                key={m.profile.id}
                onClick={() => setSelectedMember(m.profile.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-label font-medium transition-colors touch-target ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-card-foreground shadow-card'
                }`}
              >
                {badge.icon} {m.profile.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Sphere trend */}
        <div className="bg-card rounded-lg shadow-card p-4">
          <h3 className="text-subtitle font-semibold text-card-foreground mb-4">度數趨勢</h3>
          {trendData.length >= 1 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 20%, 90%)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(200, 10%, 50%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(200, 10%, 50%)" domain={['auto', 'auto']} reversed label={{ value: '← 加深', position: 'insideTopLeft', style: { fontSize: 11, fill: 'hsl(200,10%,50%)' } }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="R" name="右眼" stroke="hsl(174, 82%, 24%)" strokeWidth={2} dot={{ r: 4 }} connectNulls />
                <Line type="monotone" dataKey="L" name="左眼" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ r: 4 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-label text-muted-foreground">尚無度數紀錄</p>
          )}
        </div>

        {/* Estimated Axial Length trend */}
        <div className="bg-card rounded-lg shadow-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-subtitle font-semibold text-card-foreground">估算眼軸趨勢</h3>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">△ 估算值</span>
          </div>
          <p className="text-[12px] text-muted-foreground mb-4">依角膜弧度與屈光度推算（Queirós 2022）</p>
          {alTrendData.length >= 1 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={alTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 20%, 90%)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(200, 10%, 50%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(200, 10%, 50%)" domain={['dataMin - 0.5', 'dataMax + 0.5']} unit="mm" />
                <Tooltip formatter={(value: number) => [`${value} mm`, '']} />
                <Legend />
                <Line type="monotone" dataKey="R" name="右眼" stroke="hsl(174, 82%, 24%)" strokeWidth={2} dot={{ r: 4 }} connectNulls />
                <Line type="monotone" dataKey="L" name="左眼" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ r: 4 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-label text-muted-foreground">尚無含角膜弧度的驗光紀錄</p>
          )}
        </div>

        {/* CISS trend */}
        <div className="bg-card rounded-lg shadow-card p-4">
          <h3 className="text-subtitle font-semibold text-card-foreground mb-2">CISS 分數趨勢</h3>
          <p className="text-label text-muted-foreground">需要兩次以上問卷紀錄才能顯示趨勢</p>
        </div>
      </div>
    </div>
  );
};

export default TrendsView;
