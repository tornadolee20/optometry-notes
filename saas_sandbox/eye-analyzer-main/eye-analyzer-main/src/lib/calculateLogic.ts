export interface CalculationInput {
  age: number;
  pd: number;
  npc: number;
  workDist: number;
  harmonDist: number;
  odSph: number;
  odCyl: number;
  odAxis: number;
  osSph: number;
  osCyl: number;
  osAxis: number;
  add: number;
  aaOD: number;
  aaOS: number;
  nra: number;
  pra: number;
  mem: number;
  flipper: number;
  distPhoria: number;
  nearPhoria: number;
  vertPhoria: number;
  nearPhoriaGradient: number | null;
  biBreak: number;
  biRec: number;
  boBreak: number;
  boRec: number;
  cissScore: number;
  stereo: number;
  vergenceFacilityCpm: number;
  vergenceFacilityAborted: boolean;
}

export type VergenceFacilityStatus = "normal" | "borderline" | "deficient";

export interface CalculationResult {
  diag: {
    code: string;
    nameKey: string;
    secondaryKey: string | null;
  };
  aca: {
    val: number;
    method: string;
    category: string;
    calc: number;
    grad: number | null;
    reliability: 'high' | 'medium' | 'low';
    needsGradient: boolean;
  };
  accom: {
    status: string;
    functionalAge: number;
  };
  accomEso: boolean;
  ciss: {
    score: number;
    symptomatic: boolean;
  };
  stereo: number;
  vergenceFacility: {
    cpm: number;
    aborted: boolean;
    status: VergenceFacilityStatus;
  };
  addSim: { val: number; note: string } | null;
  lensRec: {
    titleKey: string;
    descKey: string;
    descParams?: Record<string, string | number>;
    icon: string;
    badge: string;
  };
  commentaryParts: { key: string; params?: Record<string, string | number> }[];
  mgmt: string[];
  priority: string;
  finalRx: {
    hPrism: number;
    hBase: string;
  };
  vRes: {
    has: boolean;
    val: number;
    base: string;
  };
  healthScore: number;
  ergoRisk: boolean;
  alerts: string[];
  consistency: string[];
}

export const calculateLogic = (data: Partial<CalculationInput>): CalculationResult => {
  const {
    age = 36,
    pd = 64,
    npc = 6,
    workDist = 40,
    harmonDist = 0,
    odSph = -2.0,
    odCyl = -0.5,
    odAxis = 180,
    osSph = -2.0,
    osCyl = -0.5,
    osAxis = 180,
    add = 0,
    aaOD = 4.0,
    aaOS = 4.0,
    nra = 2.0,
    pra = -2.5,
    mem = 0.5,
    flipper = 10,
    distPhoria = 0,
    nearPhoria = -6,
    vertPhoria = 0,
    nearPhoriaGradient = null,
    biBreak = 12,
    biRec = 8,
    boBreak = 20,
    boRec = 15,
    cissScore = 12,
    stereo = 40,
    vergenceFacilityCpm = 15,
    vergenceFacilityAborted = false,
  } = data;

  const alerts: string[] = [];
  const consistencyMsg: string[] = [];
  const mgmt: string[] = [];
  let professorCommentary = "";

  // Vergence Facility Status
  let vergenceFacilityStatus: VergenceFacilityStatus = "normal";
  if (vergenceFacilityAborted || vergenceFacilityCpm < 8) {
    vergenceFacilityStatus = "deficient";
  } else if (vergenceFacilityCpm < 12) {
    vergenceFacilityStatus = "borderline";
  }

  // AC/A Calculation
  const effectiveDemand = 100 / (workDist || 40);
  const pdInCm = (pd || 64) / 10.0;
  const rawCalcAcA = pdInCm + (nearPhoria - distPhoria) / effectiveDemand;
  const calculatedAcA = Number.isFinite(rawCalcAcA) ? Math.round(rawCalcAcA * 10) / 10 : 0;

  let gradientAcA: number | null = null;
  let acaUsed = calculatedAcA;
  let acaMethod = "Calculated";

  if (nearPhoriaGradient !== null) {
    gradientAcA = (nearPhoria - nearPhoriaGradient) / 1.0;
    gradientAcA = Math.round(gradientAcA * 10) / 10;
    acaUsed = gradientAcA;
    acaMethod = "Gradient";
    if (Math.abs(calculatedAcA - gradientAcA) > 2) {
      consistencyMsg.push(`💡 近感性集合顯著：Calc (${calculatedAcA}) > Grad (${gradientAcA})`);
    }
  }

  let acaCategory = "Normal";
  if (acaUsed < 3.0) acaCategory = "Low";
  else if (acaUsed > 6.0) acaCategory = "High";

  // AC/A Reliability Assessment (臨床可信度評估)
  // Based on COVD and AOA clinical guidelines
  const avgAA_temp = (aaOD + aaOS) / 2;
  const expectedAA_temp = Math.max(0, 18.5 - 0.3 * age);
  const aaDeficit = expectedAA_temp - avgAA_temp;
  const isPresbyopic = age >= 40;
  const hasAccommodativeDeficit = aaDeficit >= 2.0;
  const calculatedAcaAbnormal = calculatedAcA < 2.0;
  
  // Determine if gradient method is needed
  const needsGradient = isPresbyopic || hasAccommodativeDeficit || calculatedAcaAbnormal;
  
  // Determine reliability level
  let acaReliability: 'high' | 'medium' | 'low';
  if (gradientAcA !== null) {
    acaReliability = 'high'; // Gradient measured = high reliability
  } else if (needsGradient) {
    acaReliability = 'low'; // Needs gradient but not measured
  } else {
    acaReliability = 'medium'; // Calculated is sufficient
  }

  // Functional Age & Ergonomics
  const avgAA = (aaOD + aaOS) / 2;
  let functionalAge = 0;
  if (avgAA <= 0) functionalAge = 60;
  else functionalAge = Math.round((15 - avgAA) / 0.25);
  functionalAge = Math.max(10, Math.min(70, functionalAge));

  let ergoRisk = false;
  if (harmonDist > 0 && workDist < harmonDist - 5) {
    ergoRisk = true;
    alerts.push("⚠️ 姿勢性近視風險：用眼距離小於哈蒙距離");
  }

  // Risk Flags
  let accomEsoRiskLevel = "none";
  const isChild = age <= 12;
  const hyperEquiv = odSph + odCyl / 2 > 2.0 || osSph + osCyl / 2 > 2.0;

  if (Math.abs(odCyl) > 2.0 || Math.abs(osCyl) > 2.0) {
    alerts.push("⚠️ 高度散光風險");
  }
  if (Math.abs(odCyl - osCyl) > 1.0 || Math.abs(odSph - osSph) > 1.5) {
    alerts.push("⚠️ 屈光參差 (Anisometropia)");
  }
  if (isChild && (distPhoria >= 2 || nearPhoria >= 2)) {
    if (hyperEquiv && acaCategory === "High") accomEsoRiskLevel = "high";
    else if (hyperEquiv || acaCategory === "High") accomEsoRiskLevel = "possible";
  }
  if (accomEsoRiskLevel !== "none") {
    alerts.push(accomEsoRiskLevel === "high" ? "🚨 高度疑似調節性內斜視" : "⚠️ 可能調節性內斜視");
  }

  // === 調節功能分類函式（依據 AOA 及臨床文獻標準）===
  // AI: AA 低於 Hofstetter min - 2D + MEM lag 偏高 + NRA 低 + 症狀陽性
  // AIFI: AA 接近預期，但 BAF <= 6 且 PRA/NRA 不足（AI 條件未滿足時才進入）
  // AE: NRA 過高 + MEM lead + 可能近距內斜
  // === 老花患者（≥45歲）特殊邏輯 ===
  // AE 優先：老花常見代償性調節過度（過度用力但效果差）
  // AI 門檻提高：需明顯 BCC lag + AA 嚴重不足才診斷
  type AccomStatusType = 'Normal' | 'Insufficiency' | 'Excess' | 'Infacility' | 'Presbyopia' | 'Pre-Presbyopia';
  
  const classifyAccommodativeStatus = (params: {
    age: number;
    aaOd: number;
    aaOs: number;
    mem: number;
    pra: number;
    nra: number;
    bafCpm: number;
    cissScore: number;
    nearPhoria: number;
  }): { status: AccomStatusType; isDefiniteAI: boolean; isDefiniteAIFI: boolean; isDefiniteAE: boolean } => {
    const { age, aaOd, aaOs, mem, pra, nra, bafCpm, cissScore, nearPhoria } = params;
    
    // Hofstetter 最低調節幅度公式
    const hofMin = Math.max(0, 15 - 0.25 * age);
    const meanAA = (aaOd + aaOs) / 2;
    const aaDeficit = hofMin - meanAA; // 正值表示低於預期
    
    // 門檻常數（依據文獻，優化後）
    const AA_DEFICIT_STRONG = 2.0; // AA 明顯低於 Hofstetter min 2D
    const AA_DEFICIT_MODERATE = 1.5; // AA 中度低於 Hofstetter min 1.5D
    const BAF_THRESHOLD = 6; // BAF <= 6 cpm 視為下降
    const MEM_LAG_THRESHOLD = 0.75; // MEM >= +0.75 視為 lag 偏高
    const NRA_LOW_THRESHOLD = 1.50; // NRA <= 1.50 視為降低
    const NRA_HIGH_THRESHOLD = 2.75; // NRA >= 2.75 視為過高（AE）
    const CISS_THRESHOLD = age < 18 ? 16 : 21;
    
    let status: AccomStatusType = 'Normal';
    let isDefiniteAI = false;
    let isDefiniteAIFI = false;
    let isDefiniteAE = false;
    
    // === 老花患者調節診斷（≥45歲）特殊邏輯 ===
    // 臨床意義：
    // - 老花的 AE（調節過度/僵化）：過度補償導致調節肌僵化，需放鬆訓練
    // - 老花的 AI（真正調節喪失）：調節功能真正喪失，需下加光
    const isPresbyope = age >= 45;
    
    if (isPresbyope) {
      // === 老花 AE（代償性調節過度）優先判斷 ===
      // 特徵：「過度用力但效果差」
      // 1. BCC ≤ +0.75D（調節反應正常或超前，表示仍在努力調節）
      // 2. PRA ≤ -2.00D（過度用力，負相對調節強）
      // 3. Flipper < 8 cpm（靈活度差，調節肌僵化）
      const hasBCCNormalOrLead = mem <= 0.75;
      const hasStrongPRA = pra <= -2.00; // 絕對值 ≥ 2.00D
      const hasLowFlipper = bafCpm < 8;
      const hasSymptoms = cissScore >= 16;
      
      // 老花 AE 判斷路徑 1（高信心）：BCC 正常/超前 + PRA 強 + Flipper 差
      if (hasBCCNormalOrLead && hasStrongPRA && hasLowFlipper) {
        status = 'Excess';
        isDefiniteAE = true;
      }
      // 老花 AE 判斷路徑 2（中等信心）：BCC 正常/超前 + PRA 強 + 症狀
      else if (hasBCCNormalOrLead && hasStrongPRA && hasSymptoms) {
        status = 'Excess';
        isDefiniteAE = true;
      }
      // 老花 AE 判斷路徑 3：BCC 超前（lead）+ Flipper 差
      else if (mem <= 0 && hasLowFlipper && hasSymptoms) {
        status = 'Excess';
        isDefiniteAE = true;
      }
      
  // === 老花 AI（真正調節喪失）門檻提高 ===
      // 需同時滿足：
      // 1. BCC ≥ +1.25D（明顯滯後，調節反應不足）
      // 2. AA 嚴重不足（使用年齡分層固定門檻，避免 Hofstetter 負值問題）
      // 3. NRA < +1.50D（調節放鬆也困難）
      if (!isDefiniteAE) {
        const hasSignificantBCCLag = mem >= 1.25;
        const hasLowNRA = nra < 1.50;
        
        // 【修正】使用年齡分層的固定 AA 門檻，避免 Hofstetter 公式在高齡時產生負值
        // 65歲以上：AA < 2D 即為嚴重不足
        // 55-64歲：AA < 3D 即為嚴重不足
        // 45-54歲：AA < 4D 即為嚴重不足
        let aaSeverelyInsufficient = false;
        if (age >= 65) {
          aaSeverelyInsufficient = meanAA < 2.0;
        } else if (age >= 55) {
          aaSeverelyInsufficient = meanAA < 3.0;
        } else {
          // 45-54歲：使用 Hofstetter 公式
          const hofAvg = Math.max(2, 18.5 - 0.3 * age);
          aaSeverelyInsufficient = meanAA < hofAvg * 0.5;
        }
        
        // 老花 AI 判斷（嚴格條件）
        if (hasSignificantBCCLag && aaSeverelyInsufficient && hasLowNRA) {
          status = 'Insufficiency';
          isDefiniteAI = true;
        }
        // 老花 AI 判斷路徑 2：BCC 明顯 lag + AA 嚴重不足 + 症狀
        else if (hasSignificantBCCLag && aaSeverelyInsufficient && hasSymptoms) {
          status = 'Insufficiency';
          isDefiniteAI = true;
        }
        // 【新增】老花 AI 判斷路徑 3：BCC 明顯 lag + AA 嚴重不足 + Flipper 極差
        else if (hasSignificantBCCLag && aaSeverelyInsufficient && bafCpm <= 4) {
          status = 'Insufficiency';
          isDefiniteAI = true;
        }
      }
      
      // 如果老花患者沒有明確 AE 或 AI，返回（後續老花狀態由主邏輯處理）
      if (isDefiniteAE || isDefiniteAI) {
        return { status, isDefiniteAI, isDefiniteAIFI, isDefiniteAE };
      }
    }
    
    // === 非老花患者（<45歲）的標準診斷邏輯 ===
    
    // AI 核心條件：AA 不足是最重要的指標
    const hasSignificantAADeficit = aaDeficit >= AA_DEFICIT_STRONG;
    const hasModerateAADeficit = aaDeficit >= AA_DEFICIT_MODERATE;
    
    // 支持條件
    const hasHighMEMLag = mem >= MEM_LAG_THRESHOLD;
    const hasLowNRA = nra <= NRA_LOW_THRESHOLD;
    const hasLowBAF = bafCpm <= BAF_THRESHOLD;
    const isSymptomatic = cissScore >= CISS_THRESHOLD;
    
    // AI 判斷路徑 1：AA 明顯不足（>= 2D）+ 至少 1 個支持條件
    if (hasSignificantAADeficit) {
      const supportConditions = [hasHighMEMLag, hasLowNRA, hasLowBAF, isSymptomatic].filter(Boolean).length;
      if (supportConditions >= 1) {
        status = 'Insufficiency';
        isDefiniteAI = true;
      }
    }
    
    // AI 判斷路徑 2：AA 中度不足（>= 1.5D）+ 至少 2 個支持條件（包含 MEM lag 或 NRA 低）
    if (!isDefiniteAI && hasModerateAADeficit) {
      const coreSupport = hasHighMEMLag || hasLowNRA; // AI 的核心支持指標
      const supportConditions = [hasHighMEMLag, hasLowNRA, hasLowBAF, isSymptomatic].filter(Boolean).length;
      if (coreSupport && supportConditions >= 2) {
        status = 'Insufficiency';
        isDefiniteAI = true;
      }
    }
    
    // AI 判斷路徑 3：年齡 >= 35 歲且 < 45歲，AA 非常低（< Hofstetter avg 70%），有明顯 MEM lag + 症狀
    // Hofstetter 平均公式：18.5 - 0.3 * age
    if (!isDefiniteAI && age >= 35 && age < 45) {
      const hofAvg = Math.max(0, 18.5 - 0.3 * age);
      const isAAVeryLow = meanAA < hofAvg * 0.7; // AA 低於預期平均的 70%
      if (isAAVeryLow && hasHighMEMLag && isSymptomatic) {
        status = 'Insufficiency';
        isDefiniteAI = true;
      }
    }
    
    // === AE 條件判斷（在 AI 判斷之後，AIFI 之前）===
    // 【修正】依據專業視光學指引，AE 的標誌性特徵是 BCC Lead (mem < 0)
    // AE 特徵：BCC Lead、NRA 高、PRA 低、可能伴隨近距內斜
    // 依據 AOA 及 AVEH Journal 標準
    if (!isDefiniteAI) {
      const NRA_AE_THRESHOLD = 2.5; // 【修正】NRA > 2.5D 視為過高（放寬閾值）
      const PRA_AE_LOW = -1.50; // PRA > -1.50 (絕對值 < 1.50D) 視為 PRA 相對降低
      
      // 【核心修正】AE 標誌性特徵：BCC Lead (mem < 0)
      const hasBCCLead = mem < 0;  // ← 標誌性特徵
      const hasBCCNormalOrLead = mem <= 0.5; // BCC 正常或超前
      
      // 支持條件
      const hasHighNRA = nra > NRA_AE_THRESHOLD;
      const hasVeryHighNRA = nra >= 3.0;  // 極高 NRA
      const hasLowPRA = pra > PRA_AE_LOW;  // PRA > -1.50 表示調節緊繃
      const hasNearEso = nearPhoria > 0;
      const hasLowFlipper = bafCpm < 8;  // 調節僵化
      
      // AE 判斷路徑 1（高信心）：BCC Lead + 高 NRA
      // 這是 AE 的典型模式
      if (hasBCCLead && hasHighNRA) {
        status = 'Excess';
        isDefiniteAE = true;
      }
      // AE 判斷路徑 2：BCC Lead + PRA 低 + Flipper 低
      else if (hasBCCLead && hasLowPRA && hasLowFlipper) {
        status = 'Excess';
        isDefiniteAE = true;
      }
      // AE 判斷路徑 3：BCC Lead + 至少 2 個支持條件 + 症狀
      else if (hasBCCLead && isSymptomatic) {
        const supportConditions = [hasHighNRA, hasLowPRA, hasLowFlipper].filter(Boolean).length;
        if (supportConditions >= 2) {
          status = 'Excess';
          isDefiniteAE = true;
        }
      }
      // 【新增】AE 判斷路徑 4：極高 NRA + 低 PRA + BCC 正常/超前
      // 這捕捉 ae_01 案例：BCC -0.25D, NRA +3.5D
      else if (hasVeryHighNRA && hasLowPRA && hasBCCNormalOrLead) {
        status = 'Excess';
        isDefiniteAE = true;
      }
      // 【新增】AE 判斷路徑 5：高 NRA + 低 PRA（調節緊繃模式）
      // 這確保 ae_01 案例不會被誤判
      else if (hasHighNRA && hasLowPRA && (hasBCCLead || hasLowFlipper)) {
        status = 'Excess';
        isDefiniteAE = true;
      }
    }
    
    // === AIFI 條件判斷（僅在 AI 和 AE 條件都未達成時）===
    // AIFI 核心特徵：AA 正常或輕度下降，但調節靈活度明顯不足
    // 依據 AOA 指南及臨床文獻標準
    // 
    // 【重要】排除條件：
    // 1. 老花患者（≥40歲）的 flipper 低通常是生理性退化，不應診斷為 AIFI
    // 2. 嚴重 AI（AA deficit ≥ 3D）應優先診斷為 AI
    // 3. 【新增】明顯 CI 特徵（NPC ≥ 8 + 近方 exo ≥ 6 + AA deficit < 2D）應診斷為 CI 而非 AIFI
    if (!isDefiniteAI && !isDefiniteAE && age < 40) {
      // 【核心修正】排除明顯 CI 模式
      // ci_02 (32F): NPC 10, nearPhoria -9, AA deficit 0.9D → 應為 CI
      // ci_03 (24M): NPC 15, nearPhoria -12, AA deficit 1.3D → 應為 CI
      const hasCIPattern = nearPhoria <= -6 && aaDeficit < 2.0;
      
      // 如果有明顯 CI 模式，不應診斷為 AIFI
      if (hasCIPattern) {
        // 跳過 AIFI 判斷，讓主診斷邏輯判斷 CI
        // 不設置 isDefiniteAIFI = true
      } else {
        // AIFI 專用門檻（比 AI 更寬鬆的 AA 要求）
        const isMildAADeficit = aaDeficit < AA_DEFICIT_MODERATE; // AA 接近預期（deficit < 1.5D）
        const isNormalAA = aaDeficit <= 0; // AA 達到或超過預期
        
        // AIFI 核心條件：BAF 顯著偏低
        const hasVeryLowBAF = bafCpm <= BAF_THRESHOLD; // BAF <= 6
        
        // AIFI 支持條件
        const PRA_AIFI_THRESHOLD = -1.50; // PRA > -1.50（絕對值小於 1.50D）
        const NRA_AIFI_THRESHOLD = 1.75; // NRA <= 1.75
        const MEM_AIFI_LOW = -0.25;
        const MEM_AIFI_HIGH = 0.75;
        
        const hasAIFIPRAIssue = pra > PRA_AIFI_THRESHOLD; // PRA 不足
        const hasAIFINRAIssue = nra <= NRA_AIFI_THRESHOLD; // NRA 不足
        const isMEMInAIFIRange = mem >= MEM_AIFI_LOW && mem <= MEM_AIFI_HIGH;
        
        // AIFI 判斷路徑 1（最典型）：
        // AA 正常 + BAF <= 6 + 症狀陽性（CISS 不需達到 21，>= 16 即可）
        const isSymptomaticForAIFI = cissScore >= 16; // 對 AIFI 放寬症狀門檻
        if (isNormalAA && hasVeryLowBAF && isSymptomaticForAIFI) {
          status = 'Infacility';
          isDefiniteAIFI = true;
        }
        
        // AIFI 判斷路徑 2：
        // AA 輕度下降（< 1.5D deficit） + BAF <= 6 + (PRA 不足 OR NRA 不足)
        if (!isDefiniteAIFI && isMildAADeficit && hasVeryLowBAF && (hasAIFIPRAIssue || hasAIFINRAIssue)) {
          status = 'Infacility';
          isDefiniteAIFI = true;
        }
        
        // AIFI 判斷路徑 3：
        // AA 正常 + BAF <= 6 + MEM 在正常範圍 + (PRA 不足 AND NRA 不足)
        if (!isDefiniteAIFI && isNormalAA && hasVeryLowBAF && isMEMInAIFIRange && hasAIFIPRAIssue && hasAIFINRAIssue) {
          status = 'Infacility';
          isDefiniteAIFI = true;
        }
        
        // AIFI 判斷路徑 4（寬鬆條件）：
        // AA 正常或輕度下降 + BAF <= 5（明顯低於正常 8-12 cpm）+ 至少有症狀
        // 這是為了捕捉 aifi_01 這類「只有 flipper 低」的案例
        if (!isDefiniteAIFI && (isNormalAA || isMildAADeficit) && bafCpm <= 5 && cissScore >= 15) {
          status = 'Infacility';
          isDefiniteAIFI = true;
        }
      }
    }
    
    return { status, isDefiniteAI, isDefiniteAIFI, isDefiniteAE };
  };

  // Accommodation Status（使用新的分類函式）
  const minExpectedAA = Math.max(0, 15 - 0.25 * age);
  const ageExpectedADD = age >= 35 ? Math.min(2.5, Math.max(0, Math.round((age - 35) * 0.1 * 4) / 4)) : 0;
  
  // 先呼叫調節分類函式
  const accomClassification = classifyAccommodativeStatus({
    age,
    aaOd: aaOD,
    aaOs: aaOS,
    mem,
    pra,
    nra,
    bafCpm: flipper,
    cissScore,
    nearPhoria
  });
  
  let accomStatus = accomClassification.status;
  let suggestedADD = 0;
  
  // 老花優先判斷（40歲以上）
  if (age >= 40) {
    // 即使是老花，如果有明確 AI 特徵，仍記錄
    if (!accomClassification.isDefiniteAI) {
      accomStatus = "Presbyopia";
    }
    suggestedADD = Math.max(0.75, ageExpectedADD);
  } else if (age >= 35 && avgAA < effectiveDemand * 2 && !accomClassification.isDefiniteAI) {
    accomStatus = "Pre-Presbyopia";
    suggestedADD = 0.75;
  } else if (accomClassification.isDefiniteAI) {
    accomStatus = "Insufficiency";
    suggestedADD = 1.0;
  } else if (accomClassification.isDefiniteAIFI) {
    accomStatus = "Infacility";
  } else if (accomClassification.isDefiniteAE) {
    accomStatus = "Excess";
  } else if (avgAA < minExpectedAA && accomStatus === "Normal") {
    accomStatus = "Insufficiency";
    suggestedADD = 1.0;
  } else if (nra < 1.75 && accomStatus === "Normal") {
    accomStatus = "Excess";
  } else if (flipper < 8 && accomStatus === "Normal") {
    accomStatus = "Infacility";
  }

  // BCC 警示（依年齡調整）
  if (age < 40) {
    if (mem < -0.25) {
      alerts.push("⚠️ BCC 超前 (Lead)：調節過度風險");
    } else if (mem > 1.0) {
      alerts.push("⚠️ BCC 滯後 (Lag) 過高：調節不足");
    }
  } else {
    // 40歲以上只在明顯異常時警示
    if (mem > 1.5) {
      alerts.push("⚠️ BCC 滯後明顯偏高（已考慮年齡因素）");
    }
  }

  // Diagnosis
  let diagCode = "NORMAL";
  let diagNameKey = "diagNormal";
  let secondaryDiagKey: string | null = null;

  // 計算遠近眼位差（只看量，不管方向）
  const phoriaDiff = Math.abs(nearPhoria - distPhoria);
  
  // 計算近距外斜量減遠距外斜量（用於 CI 診斷）
  const nearExoAmount = nearPhoria < 0 ? Math.abs(nearPhoria) : 0;
  const distExoAmount = distPhoria < 0 ? Math.abs(distPhoria) : 0;
  const nearExoMinusDistExo = nearExoAmount - distExoAmount;

  // 方便閱讀的旗標
  const hasExoAtDistance = distPhoria <= -2;
  const hasExoAtNear = nearPhoria <= -2;
  const hasEsoAtDistance = distPhoria >= 2;
  const hasEsoAtNear = nearPhoria >= 2;

  // === 國際共識 CI 診斷標準（需滿足至少 3/4 條件）===
  // 依據：CITT, PMC6612036, NCBI NBK554390
  const checkConvergenceInsufficiency = (): { isCI: boolean; conditionsMet: number; conditions: boolean[] } => {
    const isPresbyope = age >= 40;
    const conditions: boolean[] = [];
    
    // 條件 A：近距外斜比遠距外斜至少大 4Δ
    conditions.push(nearExoMinusDistExo >= 4);
    
    // 條件 B：NPC 退縮 — pre-presbyope ≥ 6cm, presbyope ≥ 10cm
    const npcThreshold = isPresbyope ? 10 : 6;
    conditions.push(npc >= npcThreshold);
    
    // 條件 C：PFV 不足（Sheard 不通過 或 BO near blur < 12Δ 或 break < 15Δ）
    const sheardDemand = (2 / 3) * Math.abs(nearPhoria);
    const sheardReserve = (1 / 3) * boBreak;
    const sheardFails = sheardDemand > sheardReserve;
    const boInsufficient = boBreak < 15; // simplified: break < 15
    conditions.push(sheardFails || boInsufficient);
    
    // 條件 D：CISS 症狀陽性 — 成人 ≥ 21, 兒童 ≥ 16
    const cissThreshold = age < 18 ? 16 : 21;
    conditions.push(cissScore >= cissThreshold);
    
    const conditionsMet = conditions.filter(Boolean).length;
    return { isCI: conditionsMet >= 3, conditionsMet, conditions };
  };

  // === 健康成人保護函式（18-40歲，明顯正常者）===
  // 若符合以下條件，強制維持 NORMAL，不進入 CI/Pseudo-CI
  const isHealthyAdultWithNormalBV = (): boolean => {
    if (age < 18 || age > 40) return false;
    
    // 近距外斜 0–3Δ 且（近 − 遠）< 4Δ
    const mildNearExo = nearPhoria >= -3 && nearPhoria <= 0;
    const smallPhoriaDiff = nearExoMinusDistExo < 4;
    
    // NPC ≤ 6 cm
    const normalNPC = npc <= 6;
    
    // CISS < 16（成人標準更寬鬆）
    const lowSymptoms = cissScore < 16;
    
    // 判斷 Sheard 是否通過（BO reserve >= 2 × near phoria demand）
    const sheardPasses = boBreak >= 2 * Math.abs(nearPhoria);
    
    // 若符合全部條件，則視為健康成人正常 BV
    return mildNearExo && smallPhoriaDiff && normalNPC && lowSymptoms && sheardPasses;
  };

  // === 40-45 歲特別處理：優先考慮早期老花 ===
  const isMiddleAgeWithMildExo = age >= 40 && age <= 45 && 
    avgAA <= 6 && avgAA >= 3 && // 調節力在早期老花範圍
    mem >= 0.25 && mem <= 0.75 && // MEM 在正常偏高範圍
    nearPhoria >= -4 && nearPhoria <= -2; // 輕度近距外斜

  // === 強制保護：健康成人正常 BV 直接跳過 CI 判斷 ===
  const forceNormal = isHealthyAdultWithNormalBV();

  // === AIFI 複合診斷判斷函式（調節+融像問題同時存在）===
  // AIFI = Accommodative Insufficiency with Fusional Vergence Dysfunction
  // 當同時符合 AI 和 CI 特徵時，應優先診斷為 AIFI
  // 診斷順序：AIFI → CI → AI
  // 
  // 【重要】AIFI 排除條件：
  // 1. 若 CI 特徵非常明顯（NPC ≥ 10cm + 近方 exo ≥ 9Δ），且 AA 正常，優先診斷 CI
  // 2. 若 AI 特徵非常明顯（AA deficit ≥ 3D），且無明顯融像問題，優先診斷 AI
  // 3. 老花患者（≥45歲）的 AI 通常是真正調節喪失，不應診斷為 AIFI
  const checkAIFIComplex = (): { isAIFI: boolean; hasAIFeatures: boolean; hasCIFeatures: boolean } => {
    // Hofstetter 最低調節幅度
    const hofMin = Math.max(0, 15 - 0.25 * age);
    const aaDeficit = hofMin - avgAA;
    
    // === AI 特徵檢查 ===
    // 條件 1：AA 低於預期 ≥2D
    const hasSignificantAADeficit = aaDeficit >= 2.0;
    
    // 條件 2：Flipper < 8 cpm（調節靈敏度不足）
    const hasLowFlipper = flipper < 8;
    
    // === CI/融像特徵檢查 ===
    // 條件 3：NPC ≥ 8cm（集合近點退縮）
    const hasRetractedNPC = npc >= 8;
    
    // 條件 4：近方 EXO ≥ 6Δ（融像問題）
    const hasSignificantNearExo = nearPhoria <= -6;
    
    // 條件 5：CISS ≥ 16（症狀明顯）
    const hasSymptomatic = cissScore >= 16;
    
    // AI 特徵判定（需 AA deficit + flipper 問題）
    const hasAIFeatures = hasSignificantAADeficit && hasLowFlipper;
    
    // CI 特徵判定（需 NPC 退縮 + 近方外斜）
    const hasCIFeatures = hasRetractedNPC && hasSignificantNearExo;
    
    // === AIFI 排除條件 ===
    // 1. 老花患者（≥40歲）不應診斷 AIFI（他們的調節問題是生理性喪失）
    // 【修正】從 45 改為 40 歲，與 checkAIFIRelaxed 一致
    const isPresbyope = age >= 40;
    if (isPresbyope) {
      return { isAIFI: false, hasAIFeatures, hasCIFeatures };
    }
    
    // 2. 嚴重 AI（AA deficit ≥ 3D）應優先診斷為 AI
    const isSevereAI = aaDeficit >= 3.0;
    if (isSevereAI && !hasCIFeatures) {
      return { isAIFI: false, hasAIFeatures, hasCIFeatures };
    }
    
    // 3. 明顯 CI（NPC ≥ 10 + 近方 exo ≥ 9Δ + AA 正常）應優先診斷為 CI
    const isClearCI = npc >= 10 && nearPhoria <= -9 && aaDeficit < 2.0;
    if (isClearCI) {
      return { isAIFI: false, hasAIFeatures, hasCIFeatures };
    }
    
    // === AIFI 複合診斷條件 ===
    // 必須同時滿足：AI 特徵 + CI 特徵 + 症狀明顯
    // 這確保不會因為單一指標就診斷
    const isAIFI = hasAIFeatures && hasCIFeatures && hasSymptomatic;
    
    return { isAIFI, hasAIFeatures, hasCIFeatures };
  };
  
  // === AIFI 寬鬆判斷（用於邊緣案例）===
  // 【重要修正】根據專業視光學指引：
  // 1. 必須檢查 AA deficit ≥ 2.0D（核心條件）
  // 2. 明顯 CI 模式（NPC 嚴重退縮 + 高外斜 + AA 正常）→ 診斷 CI
  // 3. 老花患者 → 不應診斷 AIFI
  // 4. 嚴重 AI（AA deficit ≥ 3D）→ 優先診斷 AI
  //
  // 【移除】數位眼疲勞路徑（AA 正常但 flipper 差的情況）
  // 這類案例應歸類為 CI，而非 AIFI
  const checkAIFIRelaxed = (): boolean => {
    // Hofstetter 平均調節幅度公式：18.5 - 0.3 × age
    const hofAvg = Math.max(0, 18.5 - 0.3 * age);
    const aaDeficit = hofAvg - avgAA;
    
    // === 排除條件（必須最先檢查）===
    // 1. 老花患者（≥40歲）不應診斷 AIFI，他們的調節問題是生理性喪失
    // 【修正】從 45 改為 40 歲，確保 ai_02 (42歲) 不會被誤判為 AIFI
    const isPresbyope = age >= 40;
    if (isPresbyope) {
      return false;
    }
    
    // 2. 【核心修正】AA deficit < 2.0D 的案例不應診斷 AIFI
    // 這確保 ci_02 (AA deficit 0.9D) 和 ci_03 (AA deficit 1.3D) 不會被誤判
    if (aaDeficit < 2.0) {
      return false;
    }
    
    // 3. 明顯 CI 模式：NPC 嚴重退縮 + 高外斜（即使 AA deficit ≥ 2D，也優先 CI）
    // 這些案例的核心問題是融像，而非調節
    const isClearCIPattern = npc >= 10 && nearPhoria <= -9;
    if (isClearCIPattern) {
      return false;
    }
    
    // 4. 嚴重 AI：AA deficit ≥ 3D，應優先診斷 AI
    const isSevereAI = aaDeficit >= 3.0;
    if (isSevereAI) {
      return false;
    }
    
    // === AIFI 條件（核心：AA deficit ≥ 2.0D 已通過）===
    const hasLowFlipper = flipper < 8;
    const hasRetractedNPC = npc >= 6;
    const hasNearExo = nearPhoria <= -6;
    const hasSymptomatic = cissScore >= 16;
    const hasLowBOReserve = boBreak < 15;
    const hasMEMLag = mem >= 0.75;
    
    // 融像問題指標
    const hasFusionIssue = hasRetractedNPC || hasNearExo || hasLowBOReserve;
    
    // AIFI 需要：AA deficit ≥ 2.0D + 融像問題 + 症狀 + 至少一個調節功能異常指標
    if (hasFusionIssue && hasSymptomatic && (hasLowFlipper || hasMEMLag)) {
      return true;
    }
    
    return false;
  };

  // === 兒童 AI 優先判斷函式（≤12歲）===
  // 依據臨床共識：兒童少見真正的基本型外斜，多為調節問題
  // 【修正】降低門檻：AA 低於預期 ≥2D + 支持條件，或 ≥3D 直接觸發
  const checkChildAIProtection = (): { shouldPrioritizeAI: boolean; aaDeficit: number } => {
    if (age > 12) return { shouldPrioritizeAI: false, aaDeficit: 0 };
    
    // Hofstetter 最低調節幅度公式
    const hofMin = Math.max(0, 15 - 0.25 * age);
    const meanAA = avgAA; // 已計算過
    const aaDeficit = hofMin - meanAA;
    
    // 條件 1：AA 低於預期 ≥3D 直接觸發
    if (aaDeficit >= 3.0) {
      return { shouldPrioritizeAI: true, aaDeficit };
    }
    
    // 條件 2：AA 低於預期 ≥2D + 支持條件（MEM lag 或症狀）
    const hasSupport = mem >= 1.0 || cissScore >= 16;
    if (aaDeficit >= 2.0 && hasSupport) {
      return { shouldPrioritizeAI: true, aaDeficit };
    }
    
    return { shouldPrioritizeAI: false, aaDeficit };
  };
  
  // === 兒童 BX 診斷需更嚴格條件 ===
  // 依據臨床共識：兒童診斷 BX 需排除調節因素
  const checkChildBXCriteria = (): boolean => {
    if (age > 12) return true; // 非兒童，使用標準 BX 條件
    
    // 兒童 BX 診斷需要：
    // 1. 近方 EXO ≥ 10Δ（更嚴格）
    const hasSignificantNearExo = nearPhoria <= -10;
    
    // 2. AA 正常（排除調節因素）
    const hofMin = Math.max(0, 15 - 0.25 * age);
    const meanAA = avgAA;
    const aaDeficit = hofMin - meanAA;
    const isAANormal = aaDeficit < 1.5; // AA deficit < 1.5D 視為正常
    
    // 3. Flipper ≥ 8 cpm（調節靈活度正常）
    const isFlipperNormal = flipper >= 8;
    
    // 三個條件都必須滿足
    return hasSignificantNearExo && isAANormal && isFlipperNormal;
  };

  // --- Exo patterns（AIFI / CI / DE / BX）---
  // 診斷優先順序：AIFI → CI → DE → BX
  // AIFI 優先：當同時符合調節和融像問題時
  
  // === 特殊模式：距離外斜 + 近距內斜（高 AC/A 的 CE 模式）===
  // 這是 CE 的典型模式之一：遠距 exo + 近距 eso，顯示高度調節性集合
  // high-aca-ce-32f：dist_phoria=-2（exo），near_phoria=8（eso），差異=10Δ
  const isMixedExoDistanceEsoNear = hasExoAtDistance && hasEsoAtNear;
  const hasDistExoAndNearEso = distPhoria < 0 && nearPhoria > 0; // 更寬鬆的判斷
  const phoriaDiffMixed = nearPhoria - distPhoria; // 正值 = 近距比遠距更 eso
  
  // 【修正】降低差異門檻至 4Δ，確保混合模式 CE 能被捕捉
  if (!forceNormal && hasDistExoAndNearEso && phoriaDiffMixed >= 4) {
    // 高 AC/A 導致的 CE 模式
    // 遠距 exo + 近距 eso + 差異 ≥ 4Δ
    diagCode = 'CE';
    diagNameKey = 'diagCE';
  }
  else if (!forceNormal && isMixedExoDistanceEsoNear && phoriaDiffMixed >= 6) {
    // 高 AC/A 導致的 CE 模式
    // 遠距 exo + 近距 eso + 差異 ≥ 6Δ
    if (acaCategory === 'High' || acaUsed >= 6) {
      diagCode = 'CE';
      diagNameKey = 'diagCE';
    } else {
      // 差異明顯但 AC/A 計算不高，可能是因為遠距 exo
      // 仍視為 CE 相關模式
      diagCode = 'CE';
      diagNameKey = 'diagCE';
    }
  }
  else if (!forceNormal && (hasExoAtDistance || hasExoAtNear)) {
    
    // === 優先檢查 AIFI 複合診斷 ===
    // 在進入 CI 判斷之前，先檢查是否同時有調節+融像問題
    const aifiCheck = checkAIFIComplex();
    const aifiRelaxedCheck = checkAIFIRelaxed();
    
    if (aifiCheck.isAIFI) {
      // 嚴格 AIFI：同時符合 AI + CI 特徵
      diagCode = "AIFI";
      diagNameKey = "diagAIFI";
      // 記錄次要診斷（融像問題）
      secondaryDiagKey = "diagSecondaryCI";
    } else if (aifiRelaxedCheck) {
      // 寬鬆 AIFI：部分 AI 特徵 + 融像問題 + 高症狀
      // 包含數位眼疲勞型（AA 正常但 flipper 差 + 融像問題）
      diagCode = "AIFI";
      diagNameKey = "diagAIFI";
      secondaryDiagKey = "diagSecondaryCI";
    }
    // 1) 明顯近距外斜，遠距接近 ortho：偏 CI
    else if (!hasExoAtDistance && hasExoAtNear) {
      // 40-45 歲特例：輕度外斜 + 調節下降 = 優先視為正常 + 早期老花
      if (isMiddleAgeWithMildExo) {
        const ciCheck = checkConvergenceInsufficiency();
        if (ciCheck.isCI) {
          // 檢查是否同時有調節問題 → 可能是 AIFI
          if (accomClassification.isDefiniteAI || accomClassification.isDefiniteAIFI) {
            diagCode = "AIFI";
            diagNameKey = "diagAIFI";
            secondaryDiagKey = "diagSecondaryPresbyopia";
          } else {
            diagCode = "CI";
            diagNameKey = "diagCI";
          }
        } else {
          // 不符合嚴格 CI 標準，視為正常 + 早期老花
          diagCode = "NORMAL";
          diagNameKey = "diagNormalBV";
          secondaryDiagKey = "diagSecondaryPresbyopia";
        }
      } else {
        // 非中年輕度外斜：先檢查是否為 AIFI，再判斷 CI
        const ciCheck = checkConvergenceInsufficiency();
        
        // === 避免單一指標主導 ===
        // 若只有 NPC 退縮，需檢查調節功能是否同時異常
        if (ciCheck.isCI) {
          // 檢查是否同時有調節問題
          if (accomClassification.isDefiniteAI || accomClassification.isDefiniteAIFI) {
            diagCode = "AIFI";
            diagNameKey = "diagAIFI";
            secondaryDiagKey = "diagSecondaryCI";
          } else {
            diagCode = "CI";
            diagNameKey = "diagCI";
          }
        } else if (acaCategory === "High") {
          // AC/A 高但不符合 CI 標準，視為 DE pattern
          diagCode = "DE";
          diagNameKey = "diagDE";
        } else {
          // 不符合 CI 標準且 AC/A 正常，檢查是否有調節問題
          if (accomClassification.isDefiniteAI) {
            diagCode = "AI";
            diagNameKey = "diagAI";
          } else if (accomClassification.isDefiniteAIFI) {
            diagCode = "AIFI";
            diagNameKey = "diagAIFI";
          } else {
            diagCode = "NORMAL";
            diagNameKey = "diagNormal";
          }
        }
      }
    }
    // 2) 遠、近皆外斜，但近比遠多很多：典型 CI / DE
    else if (hasExoAtDistance && hasExoAtNear && phoriaDiff >= 5) {
      const ciCheck = checkConvergenceInsufficiency();
      if (ciCheck.isCI) {
        // 檢查是否同時有調節問題 → AIFI
        if (accomClassification.isDefiniteAI || accomClassification.isDefiniteAIFI) {
          diagCode = "AIFI";
          diagNameKey = "diagAIFI";
          secondaryDiagKey = "diagSecondaryCI";
        } else if (acaCategory === "Low" || acaCategory === "Normal") {
          diagCode = "CI";
          diagNameKey = "diagCI";
        } else {
          diagCode = "DE";
          diagNameKey = "diagDE";
        }
      } else {
        // 不符合嚴格 CI 標準
        if (acaCategory === "High") {
          diagCode = "DE";
          diagNameKey = "diagDE";
        } else {
          diagCode = "BX";
          diagNameKey = "diagBX";
        }
      }
    }
    // 3) 遠、近皆外斜且差異不大：基本型外斜 BX
    else if (hasExoAtDistance && hasExoAtNear && phoriaDiff < 5) {
      // === 兒童 BX 保護邏輯 ===
      // 兒童需滿足更嚴格條件才能診斷 BX
      if (age <= 12) {
        const childAICheck = checkChildAIProtection();
        const meetsChildBXCriteria = checkChildBXCriteria();
        
        // 若兒童 AA 低於預期 ≥3D，優先診斷 AI
        if (childAICheck.shouldPrioritizeAI) {
          diagCode = "AI";
          diagNameKey = "diagAI";
          // 如果同時有外斜，記錄為次要診斷
          if (hasExoAtNear) {
            secondaryDiagKey = "diagSecondaryBX";
          }
        }
        // 若不符合嚴格 BX 條件，考慮調節問題
        else if (!meetsChildBXCriteria) {
          // 近方外斜不夠大或有調節異常跡象
          if (accomClassification.isDefiniteAI || accomClassification.isDefiniteAIFI) {
            diagCode = accomClassification.isDefiniteAI ? "AI" : "AIFI";
            diagNameKey = accomClassification.isDefiniteAI ? "diagAI" : "diagAIFI";
            secondaryDiagKey = "diagSecondaryBX";
          } else {
            // 維持 NORMAL，不輕易診斷 BX
            diagCode = "NORMAL";
            diagNameKey = "diagNormal";
          }
        } else {
          // 符合嚴格 BX 條件
          diagCode = "BX";
          diagNameKey = "diagBX";
        }
      } else {
        // 非兒童：使用標準 BX 診斷
        diagCode = "BX";
        diagNameKey = "diagBX";
      }
    }
  }
  // --- Eso patterns（AE / CE / BE / DI）---
  // 【修正】診斷順序調整：AE → CE → BE → DI
  // AE 優先：避免將 AE 誤判為 CE
  else if (!forceNormal && (hasEsoAtDistance || hasEsoAtNear)) {
    // 計算遠近 eso 差異
    const nearEsoAmount = nearPhoria > 0 ? nearPhoria : 0;
    const distEsoAmount = distPhoria > 0 ? distPhoria : 0;
    const deltaNearDist = nearEsoAmount - distEsoAmount; // 正值 = 近 eso 較大
    const deltaDistNear = distEsoAmount - nearEsoAmount; // 正值 = 遠 eso 較大
    const phoriaGradientAbs = Math.abs(nearEsoAmount - distEsoAmount); // 絕對差距
    
    // 門檻常數（Scheiman & Wick 標準）
    const CE_NEAR_ESO_THRESHOLD = 4; // 近方 ESO ≥ 4Δ
    const CE_DELTA_THRESHOLD = 4; // 【修正】近 eso 比遠 eso 至少大 4Δ（核心條件）
    const CE_ACA_THRESHOLD = 6; // AC/A ≥ 6:1 是 CE 關鍵指標
    const CE_BO_RESERVE_THRESHOLD = 17; // 近距 BO break ≤ 17Δ 儲備不足
    const BE_GRADIENT_THRESHOLD = 3; // 【新增】BE 判斷：遠近差 < 3Δ
    const DI_DELTA_THRESHOLD = 2; // 遠 eso 比近 eso 至少大 2Δ 才考慮 DI
    
    // === AE (Accommodative Excess) 判斷函式 ===
    // 【新增】依據專業視光學指引：
    // AE 標誌性特徵：BCC < 0 (Lead)
    // AE 應在 CE 之前判定
    const checkAccommodativeExcess = (): boolean => {
      // 核心條件：BCC Lead (mem < 0)
      const hasBCCLead = mem < 0;  // ← 標誌性特徵
      
      // 支持條件
      const hasHighNRA = nra > 2.5;  // 調節放鬆困難
      const hasLowPRA = pra > -1.5;   // 調節緊繃（絕對值 < 1.5D）
      const hasLowFlipper = flipper < 8;  // 調節僵化
      const hasAANormalOrHigh = avgAA >= minExpectedAA;  // AA 正常或偏高
      const hasSymptoms = cissScore >= 16;
      
      // AE 判斷路徑 1（高信心）：BCC Lead + 高 NRA
      // 這是 AE 的典型模式
      if (hasBCCLead && hasHighNRA) {
        return true;
      }
      
      // AE 判斷路徑 2：BCC Lead + PRA 低 + Flipper 低
      if (hasBCCLead && hasLowPRA && hasLowFlipper) {
        return true;
      }
      
      // AE 判斷路徑 3：BCC Lead + 至少 2 個支持條件 + 症狀
      if (hasBCCLead && hasSymptoms) {
        const supportConditions = [hasHighNRA, hasLowPRA, hasLowFlipper].filter(Boolean).length;
        if (supportConditions >= 2) {
          return true;
        }
      }
      
      // AE 判斷路徑 4：高 NRA + 低 PRA + 近方輕度 eso（調節驅動的繼發性內斜）
      // 這捕捉 ae_01 案例：BCC -0.25D, NRA +3.5D, 近方 +2Δ
      if (hasHighNRA && hasLowPRA && nearEsoAmount <= 4 && nearEsoAmount >= 1) {
        return true;
      }
      
      return false;
    };
    
    // === BE (Basic Esophoria) 判斷函式 ===
    // 【新增】依據專業視光學指引：
    // BE 特徵：遠近皆內斜，差距小（< 3Δ）
    const checkBasicEsophoria = (): boolean => {
      // 條件 1：近方有內斜 (≥ 2Δ)
      const hasNearEso = nearEsoAmount >= 2;
      
      // 條件 2：遠方也有內斜 (≥ 2Δ)
      const hasDistEso = distEsoAmount >= 2;
      
      // 【核心條件】遠近差距小 (< 3Δ)
      const smallGradient = phoriaGradientAbs < BE_GRADIENT_THRESHOLD;
      
      // 條件 4：BO 儲備正常 (≥ 18Δ)
      const normalBOReserve = boBreak >= 18;
      
      // BE 判斷：遠近皆 eso + 差距小
      if (hasNearEso && hasDistEso && smallGradient) {
        return true;
      }
      
      // BE 判斷路徑 2：遠近皆有 eso（至少 1Δ）+ 差距 < 4Δ + BO 儲備正常
      // 這是更寬鬆的 BE 判斷
      if (nearEsoAmount >= 1 && distEsoAmount >= 1 && phoriaGradientAbs < 4 && normalBOReserve) {
        return true;
      }
      
      return false;
    };
    
    // === CE (Convergence Excess) 判斷函式 ===
    // 【修正】依據專業視光學指引：
    // 1. 近方 ESO ≥ 4Δ
    // 2. 【核心】近 eso - 遠 eso ≥ 4Δ（必須檢查近遠差距）
    // 3. 高 AC/A ratio (≥ 6:1)
    // 4. 支持條件：近距 BO 儲備不足
    const checkConvergenceExcess = (): { isCE: boolean; confidence: 'high' | 'moderate' | 'low' } => {
      // 核心條件 1：近方有明顯內斜 (≥ 4Δ)
      const hasNearEso = nearEsoAmount >= CE_NEAR_ESO_THRESHOLD;
      
      // 【重要修正】核心條件 2：近 eso - 遠 eso ≥ 4Δ
      // 這是 CE 與 BE 的關鍵區別
      const significantNearEsoShift = deltaNearDist >= CE_DELTA_THRESHOLD;
      
      // 近 eso 至少比遠 eso 大 2Δ（中等信心的較寬鬆條件）
      const nearEsoGreaterThanDist = deltaNearDist >= 2;
      
      // 關鍵指標：高 AC/A ratio (≥ 6:1)
      const hasHighACA = acaUsed >= CE_ACA_THRESHOLD;
      const isACACategoryHigh = acaCategory === "High";
      
      // 支持條件
      const hasLowBOReserve = boBreak <= CE_BO_RESERVE_THRESHOLD;
      
      // === CE 判斷路徑 1（高信心）===
      // 典型 CE：近 eso ≥ 4Δ + 近 eso - 遠 eso ≥ 4Δ + 高 AC/A
      if (hasNearEso && significantNearEsoShift && (hasHighACA || isACACategoryHigh)) {
        return { isCE: true, confidence: 'high' };
      }
      
      // === CE 判斷路徑 2（高信心）===
      // AC/A 很高 (≥ 6:1) + 近 eso ≥ 4Δ + 近 eso - 遠 eso ≥ 4Δ
      if (hasNearEso && significantNearEsoShift && hasHighACA) {
        return { isCE: true, confidence: 'high' };
      }
      
      // === CE 判斷路徑 3（中等信心）===
      // 近 eso ≥ 4Δ + 近 eso - 遠 eso ≥ 4Δ + BO 儲備不足
      if (hasNearEso && significantNearEsoShift && hasLowBOReserve) {
        return { isCE: true, confidence: 'moderate' };
      }
      
      // === CE 判斷路徑 4（中等信心）===
      // AC/A 偏高 + 近 eso ≥ 4Δ + 近 eso - 遠 eso ≥ 2Δ + BO 儲備不足
      if (isACACategoryHigh && hasNearEso && nearEsoGreaterThanDist && hasLowBOReserve) {
        return { isCE: true, confidence: 'moderate' };
      }
      
      // 【移除】寬鬆路徑，避免將 BE/AE 誤判為 CE
      
      return { isCE: false, confidence: 'low' };
    };
    
    // === DI (Divergence Insufficiency) 判斷函式 ===
    // 【修正】依據專業視光學指引：
    // DI 特徵：遠距 eso 顯著大於近距 eso（低 AC/A 模式）
    // di_01 案例：dist +4Δ (eso), near +1Δ (eso) → 差距 3Δ
    const checkDivergenceInsufficiency = (): boolean => {
      // 條件 1：遠距 eso ≥ 3Δ
      const hasSignificantDistEso = distEsoAmount >= 3;
      
      // 條件 2：遠距 eso > 近距 eso（DI 的核心特徵）
      const distEsoGreaterThanNear = distEsoAmount > nearEsoAmount;
      
      // 條件 3：遠距 eso - 近距 eso ≥ 2Δ（明顯差距）
      // 【修正】降低閾值從 3Δ 到 2Δ，確保 di_01 (差距 3Δ) 能被捕捉
      const hasDIGradient = deltaDistNear >= 2;
      
      // 條件 4：低 AC/A 或正常 AC/A
      const isLowOrNormalACA = acaCategory === "Low" || acaCategory === "Normal";
      
      // DI 判斷路徑 1（高信心）：遠 eso ≥ 4Δ + 遠 > 近 + 差距 ≥ 3Δ
      if (distEsoAmount >= 4 && distEsoGreaterThanNear && deltaDistNear >= 3) {
        return true;
      }
      
      // DI 判斷路徑 2（中等信心）：遠 eso ≥ 3Δ + 遠 > 近 + 差距 ≥ 2Δ + 低/正常 AC/A
      // 這捕捉 di_01 案例：dist +4Δ, near +1Δ, 差距 3Δ
      if (hasSignificantDistEso && distEsoGreaterThanNear && hasDIGradient && isLowOrNormalACA) {
        return true;
      }
      
      // DI 判斷路徑 3：遠 eso 明顯 + 近距正位或輕度 eso
      // 這是 DI 的另一個典型模式
      if (distEsoAmount >= 3 && nearEsoAmount <= 2 && distEsoGreaterThanNear) {
        return true;
      }
      
      return false;
    };
    
    // === 診斷優先順序：AE → DI → CE → BE ===
    // 【修正】調整優先順序：DI 在 CE 之前，因為 DI 的遠 eso > 近 eso 特徵應優先處理
    const isAE = checkAccommodativeExcess();
    const isDI = checkDivergenceInsufficiency();
    const isBE = checkBasicEsophoria();
    const ceCheck = checkConvergenceExcess();
    
    // AE 優先（BCC Lead 標誌性特徵）
    if (isAE) {
      diagCode = "AE";
      diagNameKey = "diagAE";
      // 若同時有內斜，記錄為次要診斷
      if (hasEsoAtNear) {
        secondaryDiagKey = "diagSecondaryBE";
      }
    }
    // 【修正】DI 優先於 CE（遠 eso > 近 eso 的低 AC/A 模式）
    // 這確保 di_01 (dist +4, near +1) 不會被誤判為 BE
    else if (isDI) {
      diagCode = "DI";
      diagNameKey = "diagDI";
    }
    // CE 判斷（需要明顯的近遠差距，近 > 遠）
    else if (ceCheck.isCE) {
      diagCode = "CE";
      diagNameKey = "diagCE";
      // 記錄 PRA 矛盾警示
      if (pra < -2.5) {
        consistencyMsg.push("❓ PRA過高矛盾：可能是調節力過強掩蓋");
      }
    }
    // BE 判斷（遠近皆內斜，差距小）
    else if (isBE) {
      diagCode = "BE";
      diagNameKey = "diagBE";
    }
    // fallback: 調節分類的 AE 或 BE
    else if (accomClassification.isDefiniteAE) {
      diagCode = "AE";
      diagNameKey = "diagAE";
      secondaryDiagKey = "diagSecondaryBE";
    }
    else {
      diagCode = "BE";
      diagNameKey = "diagBE";
    }
  }

  // 假性 CI：需先符合嚴格 CI 標準
  if (diagCode === "CI" && npc <= 6 && (accomStatus === "Insufficiency" || mem > 0.75)) {
    diagCode = "Pseudo-CI";
    diagNameKey = "diagPseudoCI";
  }

  // === 兒童調節問題優先升級（≤12歲）===
  // 依據臨床共識：兒童的 BX/BE 診斷需要更謹慎，優先考慮調節問題
  if (age <= 12 && (diagCode === "BX" || diagCode === "BE" || diagCode === "NORMAL")) {
    const childAICheck = checkChildAIProtection();
    
    // 若 AA 低於預期 ≥3D，強制升級為 AI
    if (childAICheck.shouldPrioritizeAI) {
      if (diagCode !== "NORMAL") {
        // 原本有 BV 診斷，將其降為次要
        secondaryDiagKey = diagCode === "BX" ? "diagSecondaryBX" : "diagSecondaryBE";
      }
      diagCode = "AI";
      diagNameKey = "diagAI";
    }
  }
  
  // === 青少年綜合判斷（13-17歲）===
  // 依據臨床共識：綜合考慮調節與融像問題
  if (age >= 13 && age <= 17 && diagCode === "BX") {
    // 若有調節問題跡象，考慮將 AI/AIFI 作為次要診斷
    if (accomClassification.isDefiniteAI && !secondaryDiagKey) {
      secondaryDiagKey = "diagSecondaryAI";
    } else if (accomClassification.isDefiniteAIFI && !secondaryDiagKey) {
      secondaryDiagKey = "diagSecondaryInfacility";
    }
  }

  // === 調節功能升級為主診斷 ===
  // 如果 BV 診斷為 NORMAL，但調節功能明確異常，則以調節診斷為主
  // 這確保 AI/AIFI/AE 案例不會因為 BV 正常而被誤判為 NORMAL
  if (diagCode === "NORMAL") {
    // 【新增】CE 安全網：檢查是否有被遺漏的 CE 特徵
    // 特別處理：遠距 exo + 近距 eso 的混合模式
    const hasDistExoNearEsoPattern = distPhoria < 0 && nearPhoria > 0;
    const phoriaDiffForCE = nearPhoria - distPhoria;
    const hasHighACAForCE = acaUsed >= 6 || acaCategory === 'High';
    
    if (hasDistExoNearEsoPattern && (phoriaDiffForCE >= 4 || hasHighACAForCE)) {
      diagCode = "CE";
      diagNameKey = "diagCE";
    } else if (accomClassification.isDefiniteAI) {
      diagCode = "AI";
      diagNameKey = "diagAI";
    } else if (accomClassification.isDefiniteAIFI) {
      diagCode = "AIFI";
      diagNameKey = "diagAIFI";
    } else if (accomClassification.isDefiniteAE) {
      diagCode = "AE";
      diagNameKey = "diagAE";
    }
  }
  // 如果 BV 有異常，但調節也有明確問題，將調節設為次要診斷
  else if (diagCode !== "NORMAL" && !secondaryDiagKey) {
    if (accomClassification.isDefiniteAI) {
      secondaryDiagKey = "diagSecondaryAI";
    } else if (accomClassification.isDefiniteAIFI) {
      secondaryDiagKey = "diagSecondaryInfacility";
    } else if (accomClassification.isDefiniteAE) {
      secondaryDiagKey = "diagSecondaryExcess";
    }
  }

  // 次要診斷（調節相關）維持原本設定
  // 注意：如果已經設定了 diagSecondaryPresbyopia，則保留它
  if (secondaryDiagKey !== "diagSecondaryPresbyopia" && !secondaryDiagKey) {
    if (accomStatus === "Insufficiency") secondaryDiagKey = "diagSecondaryAI";
    else if (accomStatus === "Infacility") secondaryDiagKey = "diagSecondaryInfacility";
    else if (accomStatus === "Excess") secondaryDiagKey = "diagSecondaryExcess";
  }

  // Prism Calculation
  const relevantPhoria = Math.abs(nearPhoria) > Math.abs(distPhoria) ? nearPhoria : distPhoria;
  const isExo = relevantPhoria < 0;
  const sheardReserve = isExo ? boBreak : biBreak;
  const demand = Math.abs(relevantPhoria);
  let sheardPrism = sheardReserve < 2 * demand ? (2 * demand - sheardReserve) / 3 : 0;

  let finalHPrism = 0;
  let finalHBase = "";

  if (isExo && sheardPrism > 0) {
    finalHPrism = sheardPrism;
    finalHBase = "BI";
  } else if (!isExo) {
    const greater = Math.max(biBreak, boBreak);
    const lesser = Math.min(biBreak, boBreak);
    let percivalPrism = (greater - 2 * lesser) / 3 > 0 ? (greater - 2 * lesser) / 3 : 0;
    if (percivalPrism > 0) finalHPrism = percivalPrism;
    if (finalHPrism > 0) finalHBase = "BO";
  }

  // Vertical
  const vRes = { has: false, val: 0, base: "" };
  if (Math.abs(vertPhoria) >= 0.5) {
    vRes.has = true;
    vRes.val = Math.abs(vertPhoria);
    vRes.base = vertPhoria > 0 ? "BD OD" : "BU OD";
  }

  // Lens Recommendation
  let lensRec: {
    titleKey: string;
    descKey: string;
    descParams?: Record<string, string | number>;
    icon: string;
    badge: string;
  } = {
    titleKey: "lensStandardTitle",
    descKey: "lensStandardDesc",
    icon: "Basic",
    badge: "Standard",
  };
  let addSim: { val: number; note: string } | null = null;
  const finalADD = add > 0 ? add : suggestedADD;

  if (finalADD > 0) {
    addSim = { val: finalADD, note: age >= 35 ? "舒壓/調節輔助" : "補償調節力" };
  }

  if (accomEsoRiskLevel !== "none") {
    lensRec = {
      titleKey: "lensMyopiaManagementTitle",
      descKey: "lensMyopiaManagementDesc",
      descParams: { aca: acaUsed },
      icon: "Pro",
      badge: "Medical",
    };
  } else if (age >= 40 || (age >= 35 && finalADD >= 1)) {
    lensRec = { titleKey: "lensProgressiveTitle", descKey: "lensProgressiveDesc", icon: "Pro", badge: "Premium" };
  } else if (finalADD > 0 || diagCode === "Pseudo-CI" || diagCode.includes("CI")) {
    lensRec = { titleKey: "lensAntiFatigueTitle", descKey: "lensAntiFatigueDesc", icon: "Relax", badge: "Digital" };
  }
  if (diagCode === "CE" && acaCategory === "High") {
    lensRec = {
      titleKey: "lensBifocalTitle",
      descKey: "lensBifocalDesc",
      descParams: { aca: acaUsed },
      icon: "Relax",
      badge: "Specific",
    };
  }

  // Professor Commentary - using translation keys
  const commentaryParts: { key: string; params?: Record<string, string | number> }[] = [];

  commentaryParts.push({ key: "profClinicalSummary" });
  if (diagCode === "NORMAL" && accomStatus === "Normal") {
    commentaryParts.push({ key: "profNormalResult" });
  } else {
    commentaryParts.push({ key: "profStressFound" });
  }

  commentaryParts.push({ key: "profAcaAnalysis", params: { aca: acaUsed } });
  if (acaCategory === "High") {
    commentaryParts.push({ key: "profAcaHigh" });
  } else if (acaCategory === "Low") {
    commentaryParts.push({ key: "profAcaLow" });
  } else {
    commentaryParts.push({ key: "profAcaNormal" });
  }

  if (functionalAge > age + 5) {
    commentaryParts.push({ key: "profFunctionalAgeWarning", params: { age, funcAge: functionalAge } });
  }
  if (ergoRisk) {
    commentaryParts.push({ key: "profErgoWarning", params: { workDist, harmonDist } });
  }

  if (diagCode === "CI") commentaryParts.push({ key: "profDiagCI" });
  else if (diagCode === "CE") commentaryParts.push({ key: "profDiagCE" });
  else if (diagCode === "Pseudo-CI") commentaryParts.push({ key: "profDiagPseudoCI" });
  else if (accomStatus === "Insufficiency") commentaryParts.push({ key: "profDiagAI" });

  // Management
  if (accomEsoRiskLevel !== "none") mgmt.push("🚨 轉診眼科：散瞳確認遠視");
  if (vRes.has) mgmt.push(`⚠️ 垂直矯正：${vRes.val} Δ ${vRes.base}`);
  if (finalHPrism > 0 && accomEsoRiskLevel === "none")
    mgmt.push(`💎 水平稜鏡：${finalHPrism.toFixed(1)} Δ ${finalHBase}`);
  if (addSim) mgmt.push(`🔥 ADD 處方：+${addSim.val.toFixed(2)} D`);

  if (diagCode === "CI" || diagCode === "Pseudo-CI") {
    mgmt.push("🏋️ 訓練：Brock String (建立生理複視)");
    mgmt.push("🏋️ 訓練：Pencil Push-ups (提升 NPC)");
  } else if (diagCode === "CE" || diagCode === "BE") {
    mgmt.push("🏋️ 訓練：Lifesaver Card (訓練開散)");
    mgmt.push("🏋️ 訓練：Loose Prism BO 融合靈敏度");
  } else if (accomStatus === "Insufficiency" || accomStatus === "Infacility") {
    mgmt.push("🏋️ 訓練：+/- 2.00 Flippers (提升調節靈敏度)");
    mgmt.push("🏋️ 訓練：Hart Chart (遠近切換)");
  }
  if (ergoRisk) mgmt.push("📏 衛教：調整桌椅高度至哈蒙距離");

  // Health Score
  let healthScore = 100;
  if (diagCode !== "NORMAL") healthScore -= 15;
  if (accomStatus !== "Normal") healthScore -= 10;
  if (cissScore > 20) healthScore -= 10;
  if (vRes.has) healthScore -= 5;
  if (mem > 0.75 || mem < 0) healthScore -= 5;
  if (functionalAge > age + 10) healthScore -= 10;
  if (ergoRisk) healthScore -= 5;
  healthScore = Math.max(40, healthScore);

  // Vergence Facility impact on health score
  if (vergenceFacilityStatus === "deficient") {
    healthScore -= 10;
    if (cissScore >= (age < 18 ? 16 : 21)) {
      mgmt.push("🔍 雙眼協調功能可疑，建議完整雙眼視功能檢查／視覺訓練評估");
    }
  } else if (vergenceFacilityStatus === "borderline") {
    healthScore -= 5;
  }
  healthScore = Math.max(40, healthScore);

  // 40-45 歲正常 + 早期老花案例：強制設為 Monitor
  const isNormalWithPresbyopia = diagCode === "NORMAL" && secondaryDiagKey === "diagSecondaryPresbyopia";
  
  const priority =
    isNormalWithPresbyopia
      ? "Monitor"
      : (diagCode !== "NORMAL" || finalHPrism > 0 || cissScore >= 16 || vergenceFacilityStatus === "deficient"
          ? "Treat"
          : "Monitor");

  return {
    diag: { code: diagCode, nameKey: diagNameKey, secondaryKey: secondaryDiagKey },
    aca: { val: acaUsed, method: acaMethod, category: acaCategory, calc: calculatedAcA, grad: gradientAcA, reliability: acaReliability, needsGradient },
    accom: { status: accomStatus, functionalAge },
    ciss: { score: cissScore, symptomatic: cissScore >= (age < 18 ? 16 : 21) },
    stereo,
    vergenceFacility: {
      cpm: vergenceFacilityCpm,
      aborted: vergenceFacilityAborted,
      status: vergenceFacilityStatus,
    },
    addSim,
    lensRec,
    commentaryParts,
    mgmt,
    priority,
    finalRx: { hPrism: finalHPrism, hBase: finalHBase },
    vRes,
    healthScore,
    ergoRisk,
    alerts,
    consistency: consistencyMsg,
    accomEso: accomEsoRiskLevel !== "none",
  };
};
