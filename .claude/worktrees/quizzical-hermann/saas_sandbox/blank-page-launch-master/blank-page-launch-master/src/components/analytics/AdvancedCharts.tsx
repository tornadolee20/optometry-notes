import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  Line,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, Target, Zap } from 'lucide-react';

// 🎨 Hans Rosling 風格的動態數據可視化組件

interface DataPoint {
  [key: string]: any;
}

// 🔥 智能熱力圖組件
export const IntelligentHeatmap = ({ title }: { title: string }) => {
  

  return (
    <Card className="border-0 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 168 }).map((_, index) => {
            const hour = index % 24;
            const day = Math.floor(index / 24);
            const intensity = Math.random() * 100;
            
            return (
              <motion.div
                key={index}
                className={`h-4 w-4 rounded-sm cursor-pointer ${ 
                  intensity > 75 ? 'bg-red-500' :
                  intensity > 50 ? 'bg-orange-400' :
                  intensity > 25 ? 'bg-yellow-300' :
                  'bg-green-200'
                }`}
                whileHover={{ scale: 1.2 }}
                onHoverStart={() => {/* hover effect */}}
                title={`${['週日','週一','週二','週三','週四','週五','週六'][day]} ${hour}:00 - 活躍度: ${intensity.toFixed(1)}%`}
              />
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
          <span>低活躍度</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-200 rounded"></div>
            <div className="w-3 h-3 bg-yellow-300 rounded"></div>
            <div className="w-3 h-3 bg-orange-400 rounded"></div>
            <div className="w-3 h-3 bg-red-500 rounded"></div>
          </div>
          <span>高活躍度</span>
        </div>
      </CardContent>
    </Card>
  );
};

// 🎯 預測性分析圖表
export const PredictiveChart = ({ data, title, confidence = true }: { 
  data: DataPoint[], 
  title: string,
  confidence?: boolean 
}) => {
  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Zap className="w-5 h-5 text-blue-500" />
          {title}
          <Badge className="bg-blue-100 text-blue-800 text-xs">AI 預測</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            
            {/* 實際數據 */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
              name="實際數據"
            />
            
            {/* 預測數據 */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              name="AI 預測"
            />
            
            {/* 信心區間 */}
            {confidence && (
              <Area
                type="monotone"
                dataKey="confidenceUpper"
                stroke="none"
                fill="rgba(59, 130, 246, 0.1)"
                name="預測區間"
              />
            )}
            
            {/* 趨勢線 */}
            <ReferenceLine 
              segment={[
                { x: data[0]?.date, y: data[0]?.actual },
                { x: data[data.length - 1]?.date, y: data[data.length - 1]?.predicted }
              ]}
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="8 8"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// 🎪 多維度雷達圖
export const MultiDimensionalRadar = ({ data, title }: { data: DataPoint[], title: string }) => {
  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Target className="w-5 h-5 text-purple-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#64748b' }}
            />
            <Radar
              name="您的表現"
              dataKey="yourScore"
              stroke="#10b981"
              fill="rgba(16, 185, 129, 0.2)"
              strokeWidth={2}
            />
            <Radar
              name="行業平均"
              dataKey="industryAverage"
              stroke="#ef4444"
              fill="rgba(239, 68, 68, 0.1)"
              strokeWidth={2}
            />
            <Radar
              name="頂尖競爭者"
              dataKey="topCompetitor"
              stroke="#3b82f6"
              fill="rgba(59, 130, 246, 0.1)"
              strokeWidth={2}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>

        {/* 性能分析總結 */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {data.map((item, index) => (
            <div key={index} className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="font-semibold text-slate-800">{item.subject}</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                {item.yourScore > item.industryAverage ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  item.yourScore > item.industryAverage ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.yourScore > item.industryAverage ? '領先' : '落後'} 
                  {Math.abs(item.yourScore - item.industryAverage).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// 📊 相關性矩陣圖
export const CorrelationMatrix = ({ title }: { title: string }) => {
  const metrics = ['評分', '評論量', '回應時間', '客戶滿意度', '重複購買率'];
  
  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <AlertCircle className="w-5 h-5 text-indigo-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-1">
          {/* 標題行 */}
          <div></div>
          {metrics.map((metric, index) => (
            <div key={index} className="text-xs font-medium text-center p-2 text-slate-600">
              {metric}
            </div>
          ))}
          
          {/* 數據矩陣 */}
          {metrics.map((rowMetric, rowIndex) => (
            <React.Fragment key={rowIndex}>
              <div className="text-xs font-medium p-2 text-slate-600">{rowMetric}</div>
              {metrics.map((colMetric, colIndex) => {
                const correlation = rowIndex === colIndex ? 1 : 
                  (Math.random() - 0.5) * 2; // 模擬相關性數據
                
                return (
                  <motion.div
                    key={colIndex}
                    className={`h-12 flex items-center justify-center text-xs font-semibold rounded cursor-pointer ${
                      correlation > 0.7 ? 'bg-green-500 text-white' :
                      correlation > 0.3 ? 'bg-green-200 text-green-800' :
                      correlation > -0.3 ? 'bg-gray-100 text-gray-600' :
                      correlation > -0.7 ? 'bg-red-200 text-red-800' :
                      'bg-red-500 text-white'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    title={`${rowMetric} vs ${colMetric}: ${correlation.toFixed(2)}`}
                  >
                    {correlation.toFixed(2)}
                  </motion.div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        
        {/* 圖例 */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>強負相關</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 rounded border"></div>
            <span>無相關</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>強正相關</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// 🚀 動態氣泡圖 (Hans Rosling 風格)
export const DynamicBubbleChart = ({ data, title }: { data: DataPoint[], title: string }) => {
  const [timeSlider, setTimeSlider] = useState(0);
  
  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Zap className="w-5 h-5 text-orange-500" />
          {title}
          <Badge className="bg-orange-100 text-orange-800 text-xs">動態分析</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              type="number" 
              dataKey="satisfaction" 
              name="客戶滿意度"
              domain={[0, 100]}
              stroke="#64748b"
            />
            <YAxis 
              type="number" 
              dataKey="revenue" 
              name="收入"
              domain={[0, 'dataMax']}
              stroke="#64748b"
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
            />
            
            <Scatter name="店家表現" data={data} fill="#8884d8">
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={
                    entry.satisfaction > 80 ? '#10b981' :
                    entry.satisfaction > 60 ? '#f59e0b' :
                    '#ef4444'
                  } 
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        
        {/* 時間滑桿控制 */}
        <div className="mt-4 px-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">時間軸:</span>
            <input
              type="range"
              min="0"
              max="11"
              value={timeSlider}
              onChange={(e) => setTimeSlider(Number(e.target.value))}
              className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm font-medium text-slate-800">
              2024年{timeSlider + 1}月
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};