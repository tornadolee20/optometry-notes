/**
 * 病理篩查模組
 * Pathology Screening Module
 * 用於檢測需要轉診或進一步檢查的臨床警示
 */

// ============= 警示等級定義 =============
export type PathologyAlertLevel = 'CRITICAL' | 'WARNING' | 'INFO';

export interface PathologyAlert {
  id: string;
  level: PathologyAlertLevel;
  title: string;
  titleCN?: string;
  description: string;
  descriptionCN?: string;
  recommendation: string;
  recommendationCN?: string;
  category: 'neurological' | 'muscular' | 'systemic' | 'ocular' | 'refractive';
  requiresReferral: boolean;
  urgency: 'immediate' | 'urgent' | 'routine';
}

// ============= 篩查輸入參數 =============
export interface PathologyScreeningInput {
  // 症狀相關
  suddenOnsetDiplopia?: boolean;         // 突然發作的複視
  diplopiaDuration?: 'sudden' | 'gradual' | 'chronic';
  headacheWithDiplopia?: boolean;        // 複視伴隨頭痛
  
  // NPC 相關
  npcOD?: number;                        // 單眼 NPC 右眼 (如果分別測量)
  npcOS?: number;                        // 單眼 NPC 左眼
  npc?: number;                          // 雙眼 NPC
  
  // 視力相關
  suddenVisionLossOD?: boolean;          // 右眼突然視力下降
  suddenVisionLossOS?: boolean;          // 左眼突然視力下降
  vaOD?: number;                         // 右眼視力 (小數)
  vaOS?: number;                         // 左眼視力
  
  // 眼位相關
  vertPhoria?: number;                   // 垂直眼位
  newOnsetStrabismus?: boolean;          // 新發斜視
  variableDeviation?: boolean;           // 眼位偏斜量變化大
  
  // 瞳孔相關
  pupilSizeOD?: number;                  // 右眼瞳孔大小 (mm)
  pupilSizeOS?: number;                  // 左眼瞳孔大小
  pupilReactionAbnormal?: boolean;       // 瞳孔反應異常
  
  // 屈光相關
  sphereOD?: number;                     // 右眼球面度數
  sphereOS?: number;                     // 左眼球面度數
  cylinderOD?: number;                   // 右眼散光度數
  cylinderOS?: number;                   // 左眼散光度數
  
  // 病史相關
  diabetes?: boolean;                    // 糖尿病
  hypertension?: boolean;                // 高血壓
  thyroidDisease?: boolean;              // 甲狀腺疾病
  recentHeadTrauma?: boolean;            // 近期頭部外傷
  age?: number;                          // 年齡
}

// ============= 主要篩查函式 =============
/**
 * 執行病理篩查，返回所有相關警示
 */
export function screenForPathology(input: PathologyScreeningInput): PathologyAlert[] {
  const alerts: PathologyAlert[] = [];
  
  // 1. 突然發作複視 - 最高優先級
  if (input.suddenOnsetDiplopia || input.diplopiaDuration === 'sudden') {
    alerts.push({
      id: 'sudden_diplopia',
      level: 'CRITICAL',
      title: '🚨 Sudden Onset Diplopia',
      titleCN: '🚨 突然發作的複視',
      description: 'Sudden onset diplopia may indicate serious neurological conditions including cranial nerve palsy, intracranial lesions, or vascular events.',
      descriptionCN: '突然發作的複視可能表示嚴重的神經學病變，包括顱神經麻痺、顱內病變或血管事件。',
      recommendation: 'URGENT referral to ophthalmologist/neurologist required. Rule out CN III, IV, VI palsy. Consider neuroimaging.',
      recommendationCN: '需緊急轉診眼科/神經科。排除第 III、IV、VI 顱神經麻痺。考慮神經影像學檢查。',
      category: 'neurological',
      requiresReferral: true,
      urgency: 'immediate',
    });
  }
  
  // 2. 複視伴隨頭痛 - 高優先級
  if (input.headacheWithDiplopia) {
    alerts.push({
      id: 'diplopia_headache',
      level: 'CRITICAL',
      title: '🚨 Diplopia with Headache',
      titleCN: '🚨 複視伴隨頭痛',
      description: 'Diplopia accompanied by headache may indicate intracranial pathology or giant cell arteritis.',
      descriptionCN: '複視伴隨頭痛可能表示顱內病變或巨細胞動脈炎。',
      recommendation: 'Emergency referral. Consider ESR/CRP if patient >50 years. Neuroimaging may be indicated.',
      recommendationCN: '緊急轉診。若患者大於 50 歲，考慮檢測 ESR/CRP。可能需要神經影像學檢查。',
      category: 'neurological',
      requiresReferral: true,
      urgency: 'immediate',
    });
  }
  
  // 3. NPC 左右不對稱
  if (input.npcOD !== undefined && input.npcOS !== undefined) {
    const npcDiff = Math.abs(input.npcOD - input.npcOS);
    if (npcDiff > 5) {
      alerts.push({
        id: 'npc_asymmetry',
        level: 'WARNING',
        title: '⚠️ NPC Asymmetry',
        titleCN: '⚠️ NPC 左右不對稱',
        description: `NPC difference between eyes: ${npcDiff} cm. This may indicate extraocular muscle dysfunction or nerve palsy.`,
        descriptionCN: `兩眼 NPC 差異：${npcDiff} cm。可能表示眼外肌功能異常或神經麻痺。`,
        recommendation: 'Evaluate extraocular muscle function. Consider motility testing and cover test at different positions.',
        recommendationCN: '評估眼外肌功能。考慮進行眼球運動檢查及不同注視位置的遮蓋測試。',
        category: 'muscular',
        requiresReferral: npcDiff > 8,
        urgency: 'urgent',
      });
    }
  }
  
  // 4. 單眼視力突然下降
  if (input.suddenVisionLossOD || input.suddenVisionLossOS) {
    const affectedEye = input.suddenVisionLossOD && input.suddenVisionLossOS 
      ? 'both eyes' 
      : (input.suddenVisionLossOD ? 'right eye' : 'left eye');
    const affectedEyeCN = input.suddenVisionLossOD && input.suddenVisionLossOS 
      ? '雙眼' 
      : (input.suddenVisionLossOD ? '右眼' : '左眼');
    
    alerts.push({
      id: 'sudden_vision_loss',
      level: 'CRITICAL',
      title: '🚨 Sudden Vision Loss',
      titleCN: '🚨 單眼視力突然下降',
      description: `Sudden vision loss in ${affectedEye}. May indicate retinal detachment, vascular occlusion, or optic neuropathy.`,
      descriptionCN: `${affectedEyeCN}視力突然下降。可能表示視網膜剝離、血管阻塞或視神經病變。`,
      recommendation: 'Immediate referral to ophthalmology. Dilated fundus examination required.',
      recommendationCN: '立即轉診眼科。需進行散瞳眼底檢查。',
      category: 'ocular',
      requiresReferral: true,
      urgency: 'immediate',
    });
  }
  
  // 5. 瞳孔不等大
  if (input.pupilSizeOD !== undefined && input.pupilSizeOS !== undefined) {
    const pupilDiff = Math.abs(input.pupilSizeOD - input.pupilSizeOS);
    if (pupilDiff >= 1) {
      alerts.push({
        id: 'anisocoria',
        level: pupilDiff >= 2 ? 'CRITICAL' : 'WARNING',
        title: pupilDiff >= 2 ? '🚨 Significant Anisocoria' : '⚠️ Anisocoria',
        titleCN: pupilDiff >= 2 ? '🚨 顯著瞳孔不等大' : '⚠️ 瞳孔不等大',
        description: `Pupil size difference: ${pupilDiff.toFixed(1)} mm. May indicate CN III involvement or pharmacological effect.`,
        descriptionCN: `瞳孔大小差異：${pupilDiff.toFixed(1)} mm。可能表示第三顱神經受累或藥物影響。`,
        recommendation: 'Evaluate pupil reactions. Check for ptosis. Consider neurological referral if recent onset.',
        recommendationCN: '評估瞳孔反應。檢查是否有眼瞼下垂。若為新發，考慮神經科轉診。',
        category: 'neurological',
        requiresReferral: pupilDiff >= 2 || input.pupilReactionAbnormal === true,
        urgency: pupilDiff >= 2 ? 'immediate' : 'urgent',
      });
    }
  }
  
  // 6. 新發斜視
  if (input.newOnsetStrabismus) {
    alerts.push({
      id: 'new_strabismus',
      level: 'WARNING',
      title: '⚠️ New Onset Strabismus',
      titleCN: '⚠️ 新發斜視',
      description: 'Recent onset strabismus in an adult may indicate neurological or muscular pathology.',
      descriptionCN: '成人新發斜視可能表示神經或肌肉病變。',
      recommendation: 'Complete orthoptic evaluation. Consider thyroid function tests, neuroimaging if appropriate.',
      recommendationCN: '完整斜視檢查評估。考慮甲狀腺功能檢查，適當時進行神經影像學檢查。',
      category: 'muscular',
      requiresReferral: true,
      urgency: 'urgent',
    });
  }
  
  // 7. 眼位偏斜量變化大
  if (input.variableDeviation) {
    alerts.push({
      id: 'variable_deviation',
      level: 'WARNING',
      title: '⚠️ Variable Deviation',
      titleCN: '⚠️ 眼位偏斜量變化大',
      description: 'Variable deviation may indicate myasthenia gravis or decompensating phoria.',
      descriptionCN: '眼位偏斜量變化可能表示重症肌無力或失代償隱斜視。',
      recommendation: 'Consider fatigue testing. May need Tensilon test or anti-AChR antibody test.',
      recommendationCN: '考慮疲勞測試。可能需要 Tensilon 測試或抗乙醯膽鹼受體抗體檢測。',
      category: 'muscular',
      requiresReferral: true,
      urgency: 'routine',
    });
  }
  
  // 8. 高度垂直眼位
  if (input.vertPhoria !== undefined && Math.abs(input.vertPhoria) >= 2) {
    alerts.push({
      id: 'vertical_phoria',
      level: Math.abs(input.vertPhoria) >= 4 ? 'WARNING' : 'INFO',
      title: Math.abs(input.vertPhoria) >= 4 ? '⚠️ Significant Vertical Phoria' : 'ℹ️ Vertical Phoria',
      titleCN: Math.abs(input.vertPhoria) >= 4 ? '⚠️ 顯著垂直眼位偏斜' : 'ℹ️ 垂直眼位偏斜',
      description: `Vertical phoria: ${input.vertPhoria}Δ. Rule out superior oblique palsy or thyroid eye disease.`,
      descriptionCN: `垂直眼位：${input.vertPhoria}Δ。需排除上斜肌麻痺或甲狀腺眼病。`,
      recommendation: 'Evaluate with Parks 3-step test. Consider thyroid evaluation if bilateral.',
      recommendationCN: '使用 Parks 三步測試評估。若為雙側，考慮甲狀腺評估。',
      category: 'muscular',
      requiresReferral: Math.abs(input.vertPhoria) >= 4,
      urgency: 'routine',
    });
  }
  
  // 9. 高度近視
  if (input.sphereOD !== undefined && input.sphereOD <= -6) {
    alerts.push({
      id: 'high_myopia_od',
      level: 'INFO',
      title: 'ℹ️ High Myopia (OD)',
      titleCN: 'ℹ️ 高度近視 (右眼)',
      description: `OD sphere: ${input.sphereOD}D. High myopia increases risk of retinal complications.`,
      descriptionCN: `右眼球面度數：${input.sphereOD}D。高度近視增加視網膜併發症風險。`,
      recommendation: 'Recommend periodic dilated fundus examination. Educate on symptoms of retinal detachment.',
      recommendationCN: '建議定期散瞳眼底檢查。衛教視網膜剝離症狀。',
      category: 'refractive',
      requiresReferral: false,
      urgency: 'routine',
    });
  }
  
  if (input.sphereOS !== undefined && input.sphereOS <= -6) {
    alerts.push({
      id: 'high_myopia_os',
      level: 'INFO',
      title: 'ℹ️ High Myopia (OS)',
      titleCN: 'ℹ️ 高度近視 (左眼)',
      description: `OS sphere: ${input.sphereOS}D. High myopia increases risk of retinal complications.`,
      descriptionCN: `左眼球面度數：${input.sphereOS}D。高度近視增加視網膜併發症風險。`,
      recommendation: 'Recommend periodic dilated fundus examination. Educate on symptoms of retinal detachment.',
      recommendationCN: '建議定期散瞳眼底檢查。衛教視網膜剝離症狀。',
      category: 'refractive',
      requiresReferral: false,
      urgency: 'routine',
    });
  }
  
  // 10. 屈光參差
  const anisometropia = calculateAnisometropia(input);
  if (anisometropia >= 2) {
    alerts.push({
      id: 'anisometropia',
      level: anisometropia >= 3 ? 'WARNING' : 'INFO',
      title: anisometropia >= 3 ? '⚠️ Significant Anisometropia' : 'ℹ️ Anisometropia',
      titleCN: anisometropia >= 3 ? '⚠️ 顯著屈光參差' : 'ℹ️ 屈光參差',
      description: `Anisometropia: ${anisometropia.toFixed(2)}D. May cause aniseikonia and affect binocular vision.`,
      descriptionCN: `屈光參差：${anisometropia.toFixed(2)}D。可能造成像不等症並影響雙眼視覺。`,
      recommendation: 'Consider contact lenses or refractive surgery for better binocular balance. Evaluate fusion.',
      recommendationCN: '考慮隱形眼鏡或屈光手術以獲得更好的雙眼平衡。評估融像功能。',
      category: 'refractive',
      requiresReferral: false,
      urgency: 'routine',
    });
  }
  
  // 11. 糖尿病患者
  if (input.diabetes) {
    alerts.push({
      id: 'diabetes_risk',
      level: 'INFO',
      title: 'ℹ️ Diabetes History',
      titleCN: 'ℹ️ 糖尿病病史',
      description: 'Patient has diabetes. Increased risk of diabetic retinopathy and cranial nerve palsy.',
      descriptionCN: '患者有糖尿病。視網膜病變和顱神經麻痺風險增加。',
      recommendation: 'Ensure regular dilated fundus examination. Any new diplopia requires urgent evaluation.',
      recommendationCN: '確保定期進行散瞳眼底檢查。任何新發複視需要緊急評估。',
      category: 'systemic',
      requiresReferral: false,
      urgency: 'routine',
    });
  }
  
  // 12. 甲狀腺疾病
  if (input.thyroidDisease) {
    alerts.push({
      id: 'thyroid_risk',
      level: 'INFO',
      title: 'ℹ️ Thyroid Disease History',
      titleCN: 'ℹ️ 甲狀腺疾病病史',
      description: 'Patient has thyroid disease. Consider thyroid eye disease in binocular vision anomalies.',
      descriptionCN: '患者有甲狀腺疾病。雙眼視覺異常需考慮甲狀腺眼病。',
      recommendation: 'Evaluate for proptosis, lid retraction, restrictive strabismus. May need imaging.',
      recommendationCN: '評估是否有眼球突出、眼瞼退縮、限制性斜視。可能需要影像學檢查。',
      category: 'systemic',
      requiresReferral: input.newOnsetStrabismus === true,
      urgency: 'routine',
    });
  }
  
  // 13. 近期頭部外傷
  if (input.recentHeadTrauma) {
    alerts.push({
      id: 'head_trauma',
      level: 'WARNING',
      title: '⚠️ Recent Head Trauma',
      titleCN: '⚠️ 近期頭部外傷',
      description: 'Recent head trauma may cause cranial nerve palsy or convergence insufficiency.',
      descriptionCN: '近期頭部外傷可能造成顱神經麻痺或集合不足。',
      recommendation: 'Complete neurological and ocular evaluation. May need imaging to rule out orbital fracture.',
      recommendationCN: '完整神經和眼科評估。可能需要影像學檢查排除眼眶骨折。',
      category: 'neurological',
      requiresReferral: true,
      urgency: 'urgent',
    });
  }
  
  // 按優先級排序（CRITICAL > WARNING > INFO）
  return alerts.sort((a, b) => {
    const levelOrder = { CRITICAL: 0, WARNING: 1, INFO: 2 };
    return levelOrder[a.level] - levelOrder[b.level];
  });
}

// ============= 輔助函式 =============

/**
 * 計算屈光參差量（等效球面）
 */
function calculateAnisometropia(input: PathologyScreeningInput): number {
  if (
    input.sphereOD === undefined || 
    input.sphereOS === undefined
  ) {
    return 0;
  }
  
  const cylOD = input.cylinderOD ?? 0;
  const cylOS = input.cylinderOS ?? 0;
  
  const seOD = input.sphereOD + cylOD / 2;
  const seOS = input.sphereOS + cylOS / 2;
  
  return Math.abs(seOD - seOS);
}

/**
 * 檢查是否有任何 CRITICAL 警示
 */
export function hasCriticalAlerts(alerts: PathologyAlert[]): boolean {
  return alerts.some(alert => alert.level === 'CRITICAL');
}

/**
 * 檢查是否需要轉診
 */
export function requiresReferral(alerts: PathologyAlert[]): boolean {
  return alerts.some(alert => alert.requiresReferral);
}

/**
 * 取得最高優先級的警示
 */
export function getMostUrgentAlert(alerts: PathologyAlert[]): PathologyAlert | null {
  if (alerts.length === 0) return null;
  return alerts[0]; // 已經按優先級排序
}

/**
 * 按類別分組警示
 */
export function groupAlertsByCategory(alerts: PathologyAlert[]): Record<string, PathologyAlert[]> {
  return alerts.reduce((acc, alert) => {
    if (!acc[alert.category]) {
      acc[alert.category] = [];
    }
    acc[alert.category].push(alert);
    return acc;
  }, {} as Record<string, PathologyAlert[]>);
}

/**
 * 取得警示等級的顏色類名
 */
export function getAlertLevelColor(level: PathologyAlertLevel): string {
  switch (level) {
    case 'CRITICAL':
      return 'bg-red-600 text-white border-red-700';
    case 'WARNING':
      return 'bg-amber-500 text-white border-amber-600';
    case 'INFO':
      return 'bg-blue-500 text-white border-blue-600';
    default:
      return 'bg-gray-500 text-white border-gray-600';
  }
}

/**
 * 取得警示等級的背景色類名（用於卡片）
 */
export function getAlertLevelBgClass(level: PathologyAlertLevel): string {
  switch (level) {
    case 'CRITICAL':
      return 'bg-destructive/10 border-destructive/30';
    case 'WARNING':
      return 'bg-amber-500/10 border-amber-500/30';
    case 'INFO':
      return 'bg-blue-500/10 border-blue-500/30';
    default:
      return 'bg-muted border-border';
  }
}
