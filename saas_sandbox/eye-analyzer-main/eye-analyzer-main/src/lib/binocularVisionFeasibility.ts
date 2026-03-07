/**
 * Binocular Vision Feasibility Check
 * Based on international clinical standards (AOA, COO, COVD)
 * 
 * Key thresholds:
 * - ≥0.5: Full binocular vision testing possible
 * - 0.3-0.5: Limited testing (some unreliable)
 * - 0.1-0.3: Not recommended (most tests blocked)
 * - <0.1: Cannot perform any binocular vision tests
 */

export type FeasibilityLevel = 'full' | 'limited' | 'moderate' | 'severe';

export interface BinocularVisionFeasibilityResult {
  feasible: boolean;
  level: FeasibilityLevel;
  message: {
    'zh-TW': string;
    'zh-CN': string;
    en: string;
  };
  reason: {
    'zh-TW': string;
    'zh-CN': string;
    en: string;
  };
  recommendedTests: {
    'zh-TW': string[];
    'zh-CN': string[];
    en: string[];
  };
  unreliableTests?: {
    'zh-TW': string[];
    'zh-CN': string[];
    en: string[];
  };
  blockedTests?: {
    'zh-TW': string[];
    'zh-CN': string[];
    en: string[];
  };
  betterEyeVA: number;
  worseEyeVA: number;
}

// Convert VA string (e.g., "1.0", "0.5", "CF", "HM") to decimal
export const vaStringToDecimal = (vaString: string | null): number | null => {
  if (!vaString) return null;
  
  const normalized = vaString.trim().toUpperCase();
  
  // Special low vision notations
  const lowVisionMap: Record<string, number> = {
    'CF': 0.014,    // Counting Fingers ≈ 20/1400
    'HM': 0.005,    // Hand Motion ≈ 20/4000
    'LP': 0.001,    // Light Perception
    'NLP': 0,       // No Light Perception
  };
  
  if (lowVisionMap[normalized] !== undefined) {
    return lowVisionMap[normalized];
  }
  
  // Try to parse as decimal
  const parsed = parseFloat(normalized);
  if (!isNaN(parsed) && parsed >= 0 && parsed <= 2.0) {
    return parsed;
  }
  
  return null;
};

export const checkBinocularVisionFeasibility = (
  bcvaOD: string | null,
  bcvaOS: string | null
): BinocularVisionFeasibilityResult | null => {
  const odDecimal = vaStringToDecimal(bcvaOD);
  const osDecimal = vaStringToDecimal(bcvaOS);
  
  // If no BCVA data, return null (no warning needed)
  if (odDecimal === null && osDecimal === null) {
    return null;
  }
  
  // Use available eye(s)
  const betterEye = Math.max(odDecimal ?? 0, osDecimal ?? 0);
  const worseEye = Math.min(odDecimal ?? betterEye, osDecimal ?? betterEye);
  
  // Severe: <0.1 - Cannot perform any tests
  if (betterEye < 0.1) {
    return {
      feasible: false,
      level: 'severe',
      betterEyeVA: betterEye,
      worseEyeVA: worseEye,
      message: {
        'zh-TW': '⛔ 無法進行雙眼視檢測',
        'zh-CN': '⛔ 无法进行双眼视检测',
        en: '⛔ Cannot perform binocular vision testing'
      },
      reason: {
        'zh-TW': '視力過低（<0.1），建議轉介低視力專科或眼科',
        'zh-CN': '视力过低（<0.1），建议转介低视力专科或眼科',
        en: 'Visual acuity too low (<0.1). Refer to low vision specialist or ophthalmology.'
      },
      recommendedTests: {
        'zh-TW': ['緊急轉介眼科', '低視力復健評估', '排除眼疾病變'],
        'zh-CN': ['紧急转介眼科', '低视力康复评估', '排除眼疾病变'],
        en: ['Urgent ophthalmology referral', 'Low vision rehabilitation assessment', 'Rule out ocular pathology']
      },
      blockedTests: {
        'zh-TW': ['全部雙眼視測試'],
        'zh-CN': ['全部双眼视测试'],
        en: ['All binocular vision tests']
      }
    };
  }
  
  // Moderate: 0.1-0.3 - Not recommended
  if (betterEye < 0.3) {
    return {
      feasible: false,
      level: 'moderate',
      betterEyeVA: betterEye,
      worseEyeVA: worseEye,
      message: {
        'zh-TW': '⚠️ 不建議進行標準雙眼視檢測',
        'zh-CN': '⚠️ 不建议进行标准双眼视检测',
        en: '⚠️ Standard binocular vision testing not recommended'
      },
      reason: {
        'zh-TW': `最佳矯正視力 ${betterEye.toFixed(1)} (<0.3)，測試結果可靠性低`,
        'zh-CN': `最佳矫正视力 ${betterEye.toFixed(1)} (<0.3)，测试结果可靠性低`,
        en: `BCVA ${betterEye.toFixed(1)} (<0.3). Test results unreliable.`
      },
      recommendedTests: {
        'zh-TW': ['基礎屈光檢查', '眼底檢查（排除病變）', '轉介眼科/低視力專科'],
        'zh-CN': ['基础屈光检查', '眼底检查（排除病变）', '转介眼科/低视力专科'],
        en: ['Basic refraction', 'Fundus exam (rule out pathology)', 'Refer to ophthalmology/low vision']
      },
      blockedTests: {
        'zh-TW': ['Worth 4-dot', '立體視測試', 'BI/BO融像儲備', 'NRA/PRA', 'Flipper調節靈活度'],
        'zh-CN': ['Worth 4-dot', '立体视测试', 'BI/BO融像储备', 'NRA/PRA', 'Flipper调节灵活度'],
        en: ['Worth 4-dot', 'Stereopsis tests', 'BI/BO vergence ranges', 'NRA/PRA', 'Flipper facility']
      }
    };
  }
  
  // Limited: 0.3-0.5 - Partial testing possible
  if (betterEye < 0.5) {
    return {
      feasible: true,
      level: 'limited',
      betterEyeVA: betterEye,
      worseEyeVA: worseEye,
      message: {
        'zh-TW': '⚠️ 可進行部分雙眼視檢測（受限）',
        'zh-CN': '⚠️ 可进行部分双眼视检测（受限）',
        en: '⚠️ Partial binocular vision testing possible (limited)'
      },
      reason: {
        'zh-TW': `視力 ${betterEye.toFixed(1)} (0.3-0.5)，部分測試可能不可靠`,
        'zh-CN': `视力 ${betterEye.toFixed(1)} (0.3-0.5)，部分测试可能不可靠`,
        en: `VA ${betterEye.toFixed(1)} (0.3-0.5). Some tests may be unreliable.`
      },
      recommendedTests: {
        'zh-TW': ['遠近斜位測試（使用大視標）', 'NPC 測試', '粗略 BI/BO 測試'],
        'zh-CN': ['远近斜位测试（使用大视标）', 'NPC 测试', '粗略 BI/BO 测试'],
        en: ['Distance/near phoria (large targets)', 'NPC test', 'Gross BI/BO testing']
      },
      unreliableTests: {
        'zh-TW': ['立體視測試（結果僅供參考）', 'NRA/PRA（可能不準確）'],
        'zh-CN': ['立体视测试（结果仅供参考）', 'NRA/PRA（可能不准确）'],
        en: ['Stereopsis (results for reference only)', 'NRA/PRA (may be inaccurate)']
      },
      blockedTests: {
        'zh-TW': ['Flipper調節靈活度（<0.5不建議）'],
        'zh-CN': ['Flipper调节灵活度（<0.5不建议）'],
        en: ['Flipper facility (not recommended <0.5)']
      }
    };
  }
  
  // Full: ≥0.5 - All tests possible
  return {
    feasible: true,
    level: 'full',
    betterEyeVA: betterEye,
    worseEyeVA: worseEye,
    message: {
      'zh-TW': '✓ 可進行完整雙眼視檢測',
      'zh-CN': '✓ 可进行完整双眼视检测',
      en: '✓ Full binocular vision testing possible'
    },
    reason: {
      'zh-TW': '視力良好，適合標準雙眼視評估',
      'zh-CN': '视力良好，适合标准双眼视评估',
      en: 'Good visual acuity. Suitable for standard binocular vision assessment.'
    },
    recommendedTests: {
      'zh-TW': ['全部雙眼視測試'],
      'zh-CN': ['全部双眼视测试'],
      en: ['All binocular vision tests']
    }
  };
};
