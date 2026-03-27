/**
 * 屈光狀態分析模組
 * 分析屈光參差、高度近視/遠視/散光，並評估對雙眼視功能的影響
 */

export interface RefractionData {
  OD: {
    sphere: number;
    cylinder: number;
    axis: number;
  };
  OS: {
    sphere: number;
    cylinder: number;
    axis: number;
  };
  spectacleWearing: boolean;
  adaptation: 'good' | 'poor' | 'new' | 'none';
}

export interface RefractionAnalysisResult {
  anisometropia: number;
  sphericalAnisometropia: number;
  highMyopia: boolean;
  highHyperopia: boolean;
  highAstigmatism: boolean;
  clinicalImpact: ClinicalImpact[];
  summary: {
    OD: string;
    OS: string;
  };
}

export interface ClinicalImpact {
  type: 'warning' | 'info';
  title: string;
  titleCN: string;
  message: string;
  messageCN: string;
  recommendation: string;
  recommendationCN: string;
}

/**
 * 格式化度數顯示
 * @example -3.00 -1.50 × 180°
 */
export function getRefractionSummary(eye: { sphere: number; cylinder: number; axis: number }): string {
  const sphSign = eye.sphere >= 0 ? '+' : '';
  const cylSign = eye.cylinder >= 0 ? '+' : '';
  
  if (eye.cylinder === 0) {
    return `${sphSign}${eye.sphere.toFixed(2)}`;
  }
  
  return `${sphSign}${eye.sphere.toFixed(2)} ${cylSign}${eye.cylinder.toFixed(2)} × ${eye.axis}°`;
}

/**
 * 計算球面等效度數 (Spherical Equivalent)
 */
function getSphericalEquivalent(sphere: number, cylinder: number): number {
  return sphere + cylinder / 2;
}

/**
 * 分析屈光狀態
 */
export function analyzeRefraction(refraction: RefractionData): RefractionAnalysisResult {
  const odSE = getSphericalEquivalent(refraction.OD.sphere, refraction.OD.cylinder);
  const osSE = getSphericalEquivalent(refraction.OS.sphere, refraction.OS.cylinder);
  
  // 計算屈光參差（使用球面等效度數）
  const anisometropia = Math.abs(odSE - osSE);
  
  // 計算純球面度數差異
  const sphericalAnisometropia = Math.abs(refraction.OD.sphere - refraction.OS.sphere);
  
  // 判斷高度屈光異常
  const highMyopia = odSE <= -6.0 || osSE <= -6.0;
  const highHyperopia = odSE >= 4.0 || osSE >= 4.0;
  const highAstigmatism = Math.abs(refraction.OD.cylinder) > 1.5 || Math.abs(refraction.OS.cylinder) > 1.5;
  
  // 取得臨床影響
  const clinicalImpact = getClinicalImpact(refraction, {
    anisometropia,
    highMyopia,
    highHyperopia,
    highAstigmatism,
  });
  
  return {
    anisometropia,
    sphericalAnisometropia,
    highMyopia,
    highHyperopia,
    highAstigmatism,
    clinicalImpact,
    summary: {
      OD: getRefractionSummary(refraction.OD),
      OS: getRefractionSummary(refraction.OS),
    },
  };
}

/**
 * 取得屈光狀態對雙眼視功能的臨床影響
 */
export function getClinicalImpact(
  refraction: RefractionData,
  analysis: {
    anisometropia: number;
    highMyopia: boolean;
    highHyperopia: boolean;
    highAstigmatism: boolean;
  }
): ClinicalImpact[] {
  const impacts: ClinicalImpact[] = [];
  
  // 高度近視警示
  if (analysis.highMyopia) {
    impacts.push({
      type: 'info',
      title: '高度近視',
      titleCN: '高度近视',
      message: '高度近視（≤-6.00D）可能增加調節性聚合過度（CE）的風險',
      messageCN: '高度近视（≤-6.00D）可能增加调节性聚合过度（CE）的风险',
      recommendation: '建議評估 AC/A ratio，並注意近距離工作時的調節負擔',
      recommendationCN: '建议评估 AC/A ratio，并注意近距离工作时的调节负担',
    });
  }
  
  // 高度遠視警示
  if (analysis.highHyperopia) {
    const isUncorrected = !refraction.spectacleWearing;
    impacts.push({
      type: 'warning',
      title: '高度遠視',
      titleCN: '高度远视',
      message: isUncorrected 
        ? '未矯正的高度遠視（≥+4.00D）會增加調節負擔，可能影響雙眼視功能評估準確性'
        : '高度遠視（≥+4.00D）患者調節負擔較大',
      messageCN: isUncorrected
        ? '未矫正的高度远视（≥+4.00D）会增加调节负担，可能影响双眼视功能评估准确性'
        : '高度远视（≥+4.00D）患者调节负担较大',
      recommendation: isUncorrected
        ? '建議先完全矯正遠視後再進行雙眼視功能評估'
        : '確認處方度數適當，並評估調節功能',
      recommendationCN: isUncorrected
        ? '建议先完全矫正远视后再进行双眼视功能评估'
        : '确认处方度数适当，并评估调节功能',
    });
  }
  
  // 高度散光警示
  if (analysis.highAstigmatism) {
    impacts.push({
      type: 'info',
      title: '高度散光',
      titleCN: '高度散光',
      message: '高度散光（>1.50D）可能影響視覺品質與立體視覺表現',
      messageCN: '高度散光（>1.50D）可能影响视觉品质与立体视觉表现',
      recommendation: '評估散光矯正是否完整，並確認立體視評估結果',
      recommendationCN: '评估散光矫正是否完整，并确认立体视评估结果',
    });
  }
  
  // 屈光參差警示
  if (analysis.anisometropia >= 1.0) {
    const severity = analysis.anisometropia >= 2.0 ? 'warning' : 'info';
    const isSignificant = analysis.anisometropia >= 2.0;
    
    impacts.push({
      type: severity,
      title: `屈光參差：${analysis.anisometropia.toFixed(2)}D`,
      titleCN: `屈光参差：${analysis.anisometropia.toFixed(2)}D`,
      message: isSignificant
        ? '兩眼度數差距較大（>2.0D），可能造成視覺不平衡，顯著影響融像能力'
        : '兩眼度數有差異（1.0-2.0D），可能輕微影響雙眼視覺',
      messageCN: isSignificant
        ? '两眼度数差距较大（>2.0D），可能造成视觉不平衡，显著影响融像能力'
        : '两眼度数有差异（1.0-2.0D），可能轻微影响双眼视觉',
      recommendation: isSignificant
        ? '建議優先處理屈光參差（配鏡或隱形眼鏡），再進行雙眼視訓練'
        : '考慮影像大小差異對融像的影響',
      recommendationCN: isSignificant
        ? '建议优先处理屈光参差（配镜或隐形眼镜），再进行双眼视训练'
        : '考虑影像大小差异对融像的影响',
    });
  }
  
  // 適應狀態警示
  if (refraction.spectacleWearing && refraction.adaptation === 'poor') {
    impacts.push({
      type: 'warning',
      title: '眼鏡適應不良',
      titleCN: '眼镜适应不良',
      message: '患者反映目前眼鏡配戴適應不良，可能影響檢查結果',
      messageCN: '患者反映目前眼镜配戴适应不良，可能影响检查结果',
      recommendation: '確認處方正確性，考慮重新驗光或調整處方',
      recommendationCN: '确认处方正确性，考虑重新验光或调整处方',
    });
  }
  
  if (refraction.spectacleWearing && refraction.adaptation === 'new') {
    impacts.push({
      type: 'info',
      title: '新配眼鏡',
      titleCN: '新配眼镜',
      message: '眼鏡配戴不滿一個月，仍在適應期',
      messageCN: '眼镜配戴不满一个月，仍在适应期',
      recommendation: '建議 2-4 週後再評估，確認完全適應後再進行訓練',
      recommendationCN: '建议 2-4 周后再评估，确认完全适应后再进行训练',
    });
  }
  
  return impacts;
}

/**
 * 取得屈光參差對診斷的影響建議
 */
export function getRefractionRecommendations(
  refraction: RefractionData,
  pattern: string
): { title: string; titleCN: string; description: string; descriptionCN: string; priority: 'high' | 'medium' | 'low' }[] {
  const analysis = analyzeRefraction(refraction);
  const recommendations: { title: string; titleCN: string; description: string; descriptionCN: string; priority: 'high' | 'medium' | 'low' }[] = [];
  
  // 高度近視 + CE
  if (analysis.highMyopia && pattern === 'CE') {
    recommendations.push({
      title: '高度近視與聚合過度',
      titleCN: '高度近视与聚合过度',
      description: '高度近視患者調節需求較低，聚合過度可能更顯著。建議評估近距離工作習慣與姿勢',
      descriptionCN: '高度近视患者调节需求较低，聚合过度可能更显著。建议评估近距离工作习惯与姿势',
      priority: 'medium',
    });
  }
  
  // 高度遠視 + CI
  if (analysis.highHyperopia && pattern === 'CI') {
    recommendations.push({
      title: '遠視未矯正影響',
      titleCN: '远视未矫正影响',
      description: '遠視可能導致過度使用調節，進而影響聚合功能。建議先完全矯正遠視後再評估 CI 狀況',
      descriptionCN: '远视可能导致过度使用调节，进而影响聚合功能。建议先完全矫正远视后再评估 CI 状况',
      priority: 'high',
    });
  }
  
  // 屈光參差影響所有 Pattern
  if (analysis.anisometropia > 2.0) {
    recommendations.push({
      title: '屈光參差處理優先',
      titleCN: '屈光参差处理优先',
      description: '建議先處理屈光參差（配鏡或隱形眼鏡平衡兩眼影像），再進行雙眼視訓練效果會更好',
      descriptionCN: '建议先处理屈光参差（配镜或隐形眼镜平衡两眼影像），再进行双眼视训练效果会更好',
      priority: 'high',
    });
  }
  
  // 高度散光影響
  if (analysis.highAstigmatism) {
    recommendations.push({
      title: '散光矯正確認',
      titleCN: '散光矫正确认',
      description: '確認散光是否完全矯正，未矯正或矯正不當的散光可能影響立體視與融像能力',
      descriptionCN: '确认散光是否完全矫正，未矫正或矫正不当的散光可能影响立体视与融像能力',
      priority: 'medium',
    });
  }
  
  return recommendations;
}

/**
 * 取得適應狀態的顯示文字
 */
export function getAdaptationLabel(adaptation: RefractionData['adaptation'], isCN: boolean): string {
  const labels = {
    good: { tw: '適應良好', cn: '适应良好' },
    poor: { tw: '適應不良', cn: '适应不良' },
    new: { tw: '新配（<1個月）', cn: '新配（<1个月）' },
    none: { tw: '未配戴', cn: '未配戴' },
  };
  return isCN ? labels[adaptation].cn : labels[adaptation].tw;
}
