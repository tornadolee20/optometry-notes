/**
 * OEP 圖表雙 Tab 組件
 * 
 * Tab 1: OEP 診斷圖（數據導向）- 給驗光師看壓力測試軌跡
 * Tab 2: ZCSBV 功能圖（結果導向）- 給客戶看視覺體能區
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, Target } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { OEPDiagnosticChart } from './OEPDiagnosticChart';
import { ZCSBVFunctionalChart } from './ZCSBVFunctionalChart';
import { cn } from '@/lib/utils';

interface OEPChartTabsProps {
  // 遠方數據
  distPhoria: number;
  distBiBlur?: number;
  distBiBreak: number;
  distBiRecovery?: number;
  distBoBlur?: number;
  distBoBreak: number;
  distBoRecovery?: number;
  // 近方數據
  nearPhoria: number;
  nearBiBlur?: number;
  nearBiBreak: number;
  nearBiRecovery?: number;
  nearBoBlur?: number;
  nearBoBreak: number;
  nearBoRecovery?: number;
  // 參數
  pd: number;
  age: number;
  /** 實測調節幅度（取雙眼較低值），用於圖表天花板 */
  aa?: number;
  className?: string;
}

export const OEPChartTabs: React.FC<OEPChartTabsProps> = ({
  distPhoria,
  distBiBlur,
  distBiBreak,
  distBiRecovery,
  distBoBlur,
  distBoBreak,
  distBoRecovery,
  nearPhoria,
  nearBiBlur,
  nearBiBreak,
  nearBiRecovery,
  nearBoBlur,
  nearBoBreak,
  nearBoRecovery,
  pd,
  age,
  aa,
  className,
}) => {
  const { language } = useLanguage();
  const isEN = language === 'en';
  const isCN = language === 'zh-CN';

  const t = (tw: string, cn: string, en: string) =>
    isEN ? en : isCN ? cn : tw;

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart2 className="h-5 w-5 text-primary" />
          {t('OEP 雙眼視覺分析', 'OEP 双眼视觉分析', 'OEP Binocular Vision Analysis')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="diagnostic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="diagnostic" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              {t('診斷圖', '诊断图', 'Diagnostic')}
            </TabsTrigger>
            <TabsTrigger value="functional" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              {t('功能圖', '功能图', 'Functional')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diagnostic" className="mt-0">
            <div className="text-xs text-muted-foreground mb-2 text-center">
              {t(
                '臨床數據導向：顯示需求線、測試點與 AC/A 傳動線',
                '临床数据导向：显示需求线、测试点与 AC/A 传动线',
                'Data-Oriented: Shows demand line, test points & AC/A transmission line'
              )}
            </div>
            <OEPDiagnosticChart
              distPhoria={distPhoria}
              distBiBlur={distBiBlur}
              distBiBreak={distBiBreak}
              distBiRecovery={distBiRecovery}
              distBoBlur={distBoBlur}
              distBoBreak={distBoBreak}
              distBoRecovery={distBoRecovery}
              nearPhoria={nearPhoria}
              nearBiBlur={nearBiBlur}
              nearBiBreak={nearBiBreak}
              nearBiRecovery={nearBiRecovery}
              nearBoBlur={nearBoBlur}
              nearBoBreak={nearBoBreak}
              nearBoRecovery={nearBoRecovery}
              pd={pd}
              aa={aa}
              age={age}
            />
          </TabsContent>

          <TabsContent value="functional" className="mt-0">
            <div className="text-xs text-muted-foreground mb-2 text-center">
              {t(
                '結果導向：顯示視覺體能區與需求線是否相容',
                '结果导向：显示视觉体能区与需求线是否相容',
                'Result-Oriented: Shows if visual performance zone contains demand line'
              )}
            </div>
            <ZCSBVFunctionalChart
              distBiBlur={distBiBlur}
              distBiBreak={distBiBreak}
              distBoBlur={distBoBlur}
              distBoBreak={distBoBreak}
              nearBiBlur={nearBiBlur}
              nearBiBreak={nearBiBreak}
              nearBoBlur={nearBoBlur}
              nearBoBreak={nearBoBreak}
              distPhoria={distPhoria}
              nearPhoria={nearPhoria}
              pd={pd}
              age={age}
              aa={aa}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OEPChartTabs;
