import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageToggle } from '@/components/LanguageToggle';
import { 
  ArrowLeft, BarChart3, TrendingUp, Users, FileText, 
  Calendar, Activity, Loader2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

interface DashboardStats {
  totalRecords: number;
  totalOptometrists: number;
  recordsThisMonth: number;
  recordsThisYear: number;
  avgHealthScore: number;
  recordsByMonth: { month: string; count: number }[];
  genderDistribution: { name: string; value: number }[];
  ageDistribution: { range: string; count: number }[];
  diagnosisDistribution: { name: string; count: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = () => {
  const { language } = useLanguage();
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const t = (zhTW: string, zhCN: string) => language === 'zh-TW' ? zhTW : zhCN;

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all records for current user
      const { data: records, error } = await supabase
        .from('exam_records')
        .select('*');

      if (error) throw error;

      const now = new Date();
      const thisMonth = now.toISOString().substring(0, 7);
      const thisYear = now.getFullYear();

      // Calculate stats
      const recordsThisMonth = records?.filter(r => 
        r.exam_date.substring(0, 7) === thisMonth
      ).length || 0;

      const recordsThisYear = records?.filter(r => 
        parseInt(r.exam_date.substring(0, 4)) === thisYear
      ).length || 0;

      const healthScores = records?.filter(r => r.health_score !== null).map(r => r.health_score as number) || [];
      const avgHealthScore = healthScores.length > 0 
        ? Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length) 
        : 0;

      // Records by month (last 6 months)
      const monthCounts = new Map<string, number>();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toISOString().substring(0, 7);
        monthCounts.set(key, 0);
      }
      records?.forEach(r => {
        const month = r.exam_date.substring(0, 7);
        if (monthCounts.has(month)) {
          monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
        }
      });
      const recordsByMonth = Array.from(monthCounts.entries()).map(([month, count]) => ({
        month: month.substring(5), // Just MM
        count
      }));

      // Gender distribution (store raw counts, translate in render)
      const genderCounts = { male: 0, female: 0, other: 0 };
      records?.forEach(r => {
        genderCounts[r.gender as keyof typeof genderCounts]++;
      });

      // Age distribution
      const ageRanges = { '0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '65+': 0 };
      records?.forEach(r => {
        if (r.age <= 18) ageRanges['0-18']++;
        else if (r.age <= 35) ageRanges['19-35']++;
        else if (r.age <= 50) ageRanges['36-50']++;
        else if (r.age <= 65) ageRanges['51-65']++;
        else ageRanges['65+']++;
      });
      const ageDistribution = Object.entries(ageRanges).map(([range, count]) => ({
        range,
        count
      }));

      // Diagnosis distribution (top 5)
      const diagCounts = new Map<string, number>();
      records?.forEach(r => {
        if (r.diagnostic_classification) {
          const diag = r.diagnostic_classification;
          diagCounts.set(diag, (diagCounts.get(diag) || 0) + 1);
        }
      });
      const diagnosisDistribution = Array.from(diagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Build gender distribution with translated names
      const genderDistribution = [
        { name: 'male', value: genderCounts.male },
        { name: 'female', value: genderCounts.female },
        { name: 'other', value: genderCounts.other },
      ].filter(g => g.value > 0);

      setStats({
        totalRecords: records?.length || 0,
        totalOptometrists: 1,
        recordsThisMonth,
        recordsThisYear,
        avgHealthScore,
        recordsByMonth,
        genderDistribution,
        ageDistribution,
        diagnosisDistribution,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-card border-b border-border sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/analyzer')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h1 className="font-bold text-lg">{t('統計儀表板', '统计仪表板')}</h1>
          </div>
        </div>
        <LanguageToggle />
      </header>

      <main className="p-4 max-w-6xl mx-auto space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : stats && (
          <>
            {/* My Contribution Card */}
            <Card className="col-span-2 md:col-span-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  {t('我的檢測貢獻', '我的检测贡献')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{stats.totalRecords}</p>
                    <p className="text-xs text-muted-foreground">{t('累積檢測人次', '累积检测人次')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-500">{stats.recordsThisYear}</p>
                    <p className="text-xs text-muted-foreground">{t('今年檢測人次', '今年检测人次')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-500">{stats.recordsThisMonth}</p>
                    <p className="text-xs text-muted-foreground">{t('本月檢測人次', '本月检测人次')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="col-span-2 md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalRecords}</p>
                      <p className="text-xs text-muted-foreground">{t('總檢查數', '总检查数')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.recordsThisMonth}</p>
                      <p className="text-xs text-muted-foreground">{t('本月檢查', '本月检查')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Activity className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.avgHealthScore}</p>
                      <p className="text-xs text-muted-foreground">{t('平均健康分', '平均健康分')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {stats.recordsByMonth.length > 1 
                          ? (stats.recordsByMonth[stats.recordsByMonth.length - 1].count > 
                             stats.recordsByMonth[stats.recordsByMonth.length - 2].count ? '↑' : '↓')
                          : '-'}
                      </p>
                      <p className="text-xs text-muted-foreground">{t('趨勢', '趋势')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Monthly Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('月度檢查趨勢', '月度检查趋势')}</CardTitle>
                  <CardDescription>{t('近6個月檢查數量', '近6个月检查数量')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.recordsByMonth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Age Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('年齡分布', '年龄分布')}</CardTitle>
                  <CardDescription>{t('顧客年齡區間統計', '客户年龄区间统计')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.ageDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Gender Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('性別分布', '性别分布')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.genderDistribution.map(g => ({
                            ...g,
                            displayName: g.name === 'male' ? t('男', '男') : g.name === 'female' ? t('女', '女') : t('其他', '其他')
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ displayName, percent }) => `${displayName} ${(percent * 100).toFixed(0)}%`}
                        >
                          {stats.genderDistribution.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, name === 'male' ? t('男', '男') : name === 'female' ? t('女', '女') : t('其他', '其他')]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Diagnosis Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('診斷分類統計', '诊断分类统计')}</CardTitle>
                  <CardDescription>{t('前5大診斷類型', '前5大诊断类型')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.diagnosisDistribution.length > 0 ? (
                    <div className="space-y-3">
                      {stats.diagnosisDistribution.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{item.name}</p>
                          </div>
                          <p className="text-sm font-medium">{item.count}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      {t('尚無診斷資料', '暂无诊断数据')}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;