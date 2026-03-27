// Clinical tooltips with detailed explanations for newbie optometrists
// 臨床項目說明工具提示 - 新手驗光師友善功能

export interface ClinicalTooltipData {
  nameZhTW: string;
  nameZhCN: string;
  nameEn: string;
  abbreviation?: string;
  ranges: {
    level: 'excellent' | 'normal' | 'warning' | 'abnormal';
    labelZhTW: string;
    labelZhCN: string;
    labelEn: string;
    condition: string; // e.g., "≤15", ">60"
    color: 'green' | 'yellow' | 'red' | 'blue';
  }[];
  descriptionZhTW: string;
  descriptionZhCN: string;
  descriptionEn: string;
  unitZhTW?: string;
  unitZhCN?: string;
  unitEn?: string;
  // Validation function
  validate?: (value: number, age?: number) => ValidationResult;
}

export interface ValidationResult {
  level: 'normal' | 'warning' | 'abnormal';
  messageZhTW: string;
  messageZhCN: string;
  messageEn: string;
}

export const clinicalTooltips: Record<string, ClinicalTooltipData> = {
  ciss: {
    nameZhTW: '集合不足症狀問卷',
    nameZhCN: '集合不足症状问卷',
    nameEn: 'Convergence Insufficiency Symptom Survey',
    abbreviation: 'CISS',
    ranges: [
      { level: 'normal', labelZhTW: '正常', labelZhCN: '正常', labelEn: 'Normal', condition: '≤15', color: 'green' },
      { level: 'warning', labelZhTW: '可疑', labelZhCN: '可疑', labelEn: 'Borderline', condition: '16-21', color: 'yellow' },
      { level: 'abnormal', labelZhTW: '異常', labelZhCN: '异常', labelEn: 'Abnormal', condition: '≥22', color: 'red' }
    ],
    descriptionZhTW: '評估視覺疲勞相關症狀的嚴重程度，分數越高表示症狀越明顯。',
    descriptionZhCN: '评估视觉疲劳相关症状的严重程度，分数越高表示症状越明显。',
    descriptionEn: 'Evaluates severity of visual fatigue symptoms. Higher scores indicate more pronounced symptoms.',
    validate: (value: number, age?: number) => {
      const threshold = age && age < 18 ? 16 : 21;
      if (value <= 15) {
        return {
          level: 'normal',
          messageZhTW: '症狀正常',
          messageZhCN: '症状正常',
          messageEn: 'Symptoms within normal range'
        };
      }
      if (value <= threshold) {
        return {
          level: 'warning',
          messageZhTW: '症狀可疑，需進一步評估',
          messageZhCN: '症状可疑，需进一步评估',
          messageEn: 'Borderline symptoms, further evaluation recommended'
        };
      }
      return {
        level: 'abnormal',
        messageZhTW: '症狀明顯，可能有集合不足問題',
        messageZhCN: '症状明显，可能有集合不足问题',
        messageEn: 'Significant symptoms, possible convergence insufficiency'
      };
    }
  },

  stereo: {
    nameZhTW: '立體視覺',
    nameZhCN: '立体视觉',
    nameEn: 'Stereopsis / Depth Perception',
    ranges: [
      { level: 'excellent', labelZhTW: '優秀', labelZhCN: '优秀', labelEn: 'Excellent', condition: '≤40"', color: 'green' },
      { level: 'normal', labelZhTW: '正常', labelZhCN: '正常', labelEn: 'Normal', condition: '41-60"', color: 'green' },
      { level: 'warning', labelZhTW: '可疑', labelZhCN: '可疑', labelEn: 'Borderline', condition: '61-100"', color: 'yellow' },
      { level: 'abnormal', labelZhTW: '異常', labelZhCN: '异常', labelEn: 'Abnormal', condition: '>100"', color: 'red' }
    ],
    descriptionZhTW: '評估雙眼整合深度感知的能力，數值越小代表立體視覺越精細。',
    descriptionZhCN: '评估双眼整合深度感知的能力，数值越小代表立体视觉越精细。',
    descriptionEn: 'Evaluates binocular depth perception. Lower values indicate finer stereopsis.',
    unitZhTW: '秒弧（arcsec）',
    unitZhCN: '秒弧（arcsec）',
    unitEn: 'arcseconds',
    validate: (value: number) => {
      if (value <= 60) {
        return {
          level: 'normal',
          messageZhTW: '立體視覺正常',
          messageZhCN: '立体视觉正常',
          messageEn: 'Stereopsis within normal range'
        };
      }
      if (value <= 100) {
        return {
          level: 'warning',
          messageZhTW: '立體視覺稍弱，建議追蹤觀察',
          messageZhCN: '立体视觉稍弱，建议追踪观察',
          messageEn: 'Slightly reduced stereopsis, follow-up recommended'
        };
      }
      return {
        level: 'abnormal',
        messageZhTW: '立體視覺異常，可能影響深度感知（正常≤60"）',
        messageZhCN: '立体视觉异常，可能影响深度感知（正常≤60"）',
        messageEn: 'Abnormal stereopsis, may affect depth perception (normal ≤60")'
      };
    }
  },

  npc: {
    nameZhTW: '近點集合距離',
    nameZhCN: '近点集合距离',
    nameEn: 'Near Point of Convergence',
    abbreviation: 'NPC',
    ranges: [
      { level: 'normal', labelZhTW: '正常', labelZhCN: '正常', labelEn: 'Normal', condition: '≤7 cm', color: 'green' },
      { level: 'warning', labelZhTW: '可疑', labelZhCN: '可疑', labelEn: 'Borderline', condition: '8-10 cm', color: 'yellow' },
      { level: 'abnormal', labelZhTW: '異常', labelZhCN: '异常', labelEn: 'Abnormal', condition: '>10 cm', color: 'red' }
    ],
    descriptionZhTW: '測量雙眼能夠維持單一視覺的最近距離，超過 10 cm 可能有集合不足問題。',
    descriptionZhCN: '测量双眼能够维持单一视觉的最近距离，超过 10 cm 可能有集合不足问题。',
    descriptionEn: 'Measures closest distance where eyes can maintain single vision. >10 cm may indicate convergence insufficiency.',
    validate: (value: number) => {
      if (value <= 7) {
        return {
          level: 'normal',
          messageZhTW: 'NPC 正常',
          messageZhCN: 'NPC 正常',
          messageEn: 'NPC within normal range'
        };
      }
      if (value <= 10) {
        return {
          level: 'warning',
          messageZhTW: 'NPC 稍遠，需進一步評估',
          messageZhCN: 'NPC 稍远，需进一步评估',
          messageEn: 'NPC slightly receded, further evaluation needed'
        };
      }
      return {
        level: 'abnormal',
        messageZhTW: 'NPC 過遠，可能有集合不足問題（正常≤7 cm）',
        messageZhCN: 'NPC 过远，可能有集合不足问题（正常≤7 cm）',
        messageEn: 'NPC receded, possible convergence insufficiency (normal ≤7 cm)'
      };
    }
  },

  vf: {
    nameZhTW: '融像靈活度',
    nameZhCN: '融像灵活度',
    nameEn: 'Vergence Facility',
    abbreviation: 'VF',
    ranges: [
      { level: 'normal', labelZhTW: '正常', labelZhCN: '正常', labelEn: 'Normal', condition: '≥15 cpm', color: 'green' },
      { level: 'warning', labelZhTW: '可疑', labelZhCN: '可疑', labelEn: 'Borderline', condition: '10-14 cpm', color: 'yellow' },
      { level: 'abnormal', labelZhTW: '異常', labelZhCN: '异常', labelEn: 'Abnormal', condition: '<10 cpm', color: 'red' }
    ],
    descriptionZhTW: '評估眼睛在 BI/BO 稜鏡間切換的速度，單位：每分鐘循環次數（cycles per minute）。',
    descriptionZhCN: '评估眼睛在 BI/BO 棱镜间切换的速度，单位：每分钟循环次数（cycles per minute）。',
    descriptionEn: 'Evaluates speed of switching between BI/BO prisms. Unit: cycles per minute (cpm).',
    validate: (value: number) => {
      if (value >= 15) {
        return {
          level: 'normal',
          messageZhTW: '融像靈活度正常',
          messageZhCN: '融像灵活度正常',
          messageEn: 'Vergence facility within normal range'
        };
      }
      if (value >= 10) {
        return {
          level: 'warning',
          messageZhTW: '融像靈活度稍低',
          messageZhCN: '融像灵活度稍低',
          messageEn: 'Vergence facility slightly reduced'
        };
      }
      return {
        level: 'abnormal',
        messageZhTW: '融像靈活度不足（正常≥15 cpm）',
        messageZhCN: '融像灵活度不足（正常≥15 cpm）',
        messageEn: 'Vergence facility deficient (normal ≥15 cpm)'
      };
    }
  },

  bcc: {
    nameZhTW: '雙眼交叉柱鏡',
    nameZhCN: '双眼交叉柱镜',
    nameEn: 'Binocular Cross Cylinder',
    abbreviation: 'BCC',
    ranges: [
      { level: 'normal', labelZhTW: '正常', labelZhCN: '正常', labelEn: 'Normal', condition: '+0.25 ~ +0.75', color: 'green' },
      { level: 'warning', labelZhTW: 'Lag 偏高', labelZhCN: 'Lag 偏高', labelEn: 'High Lag', condition: '+1.00 ~ +1.50', color: 'yellow' },
      { level: 'abnormal', labelZhTW: '高 Lag', labelZhCN: '高 Lag', labelEn: 'Very High Lag', condition: '>+1.50', color: 'red' }
    ],
    descriptionZhTW: '評估調節反應的準確性。Lag 過高表示調節不足，Lead（負值）表示調節過度。',
    descriptionZhCN: '评估调节反应的准确性。Lag 过高表示调节不足，Lead（负值）表示调节过度。',
    descriptionEn: 'Evaluates accommodative response accuracy. High Lag indicates insufficiency; Lead (negative) indicates excess.',
    validate: (value: number, age?: number) => {
      // Relaxed standards for age >= 40
      if (age !== undefined && age >= 40) {
        if (value <= 1.5) {
          return {
            level: 'normal',
            messageZhTW: '調節反應正常（老花眼標準）',
            messageZhCN: '调节反应正常（老花眼标准）',
            messageEn: 'Accommodative response normal (presbyopia standard)'
          };
        }
        return {
          level: 'warning',
          messageZhTW: '調節滯後偏高',
          messageZhCN: '调节滞后偏高',
          messageEn: 'Accommodative lag elevated'
        };
      }
      
      if (value >= 0.25 && value <= 0.75) {
        return {
          level: 'normal',
          messageZhTW: '調節反應正常',
          messageZhCN: '调节反应正常',
          messageEn: 'Accommodative response normal'
        };
      }
      if (value < -0.25) {
        return {
          level: 'abnormal',
          messageZhTW: '調節過度（Lead），可能有調節痙攣',
          messageZhCN: '调节过度（Lead），可能有调节痉挛',
          messageEn: 'Accommodative excess (Lead), possible spasm'
        };
      }
      if (value > 1.0) {
        return {
          level: 'abnormal',
          messageZhTW: '調節滯後（Lag）過高，調節不足',
          messageZhCN: '调节滞后（Lag）过高，调节不足',
          messageEn: 'High accommodative lag, insufficiency'
        };
      }
      return {
        level: 'warning',
        messageZhTW: '調節反應在邊界值',
        messageZhCN: '调节反应在边界值',
        messageEn: 'Accommodative response borderline'
      };
    }
  },

  nra: {
    nameZhTW: '負相對調節',
    nameZhCN: '负相对调节',
    nameEn: 'Negative Relative Accommodation',
    abbreviation: 'NRA',
    ranges: [
      { level: 'normal', labelZhTW: '正常', labelZhCN: '正常', labelEn: 'Normal', condition: '+1.50 ~ +2.50', color: 'green' },
      { level: 'abnormal', labelZhTW: '異常', labelZhCN: '异常', labelEn: 'Abnormal', condition: '<+1.00 或 >+3.00', color: 'red' }
    ],
    descriptionZhTW: '評估調節放鬆的能力，數值偏低可能表示調節過度。',
    descriptionZhCN: '评估调节放松的能力，数值偏低可能表示调节过度。',
    descriptionEn: 'Evaluates ability to relax accommodation. Low values may indicate accommodative excess.',
    validate: (value: number) => {
      if (value >= 1.5 && value <= 2.5) {
        return {
          level: 'normal',
          messageZhTW: 'NRA 正常',
          messageZhCN: 'NRA 正常',
          messageEn: 'NRA within normal range'
        };
      }
      if (value < 1.0) {
        return {
          level: 'abnormal',
          messageZhTW: 'NRA 過低，可能有調節過度問題（正常 +1.50 ~ +2.50）',
          messageZhCN: 'NRA 过低，可能有调节过度问题（正常 +1.50 ~ +2.50）',
          messageEn: 'NRA low, possible accommodative excess (normal +1.50 ~ +2.50)'
        };
      }
      return {
        level: 'warning',
        messageZhTW: 'NRA 在邊界值',
        messageZhCN: 'NRA 在边界值',
        messageEn: 'NRA borderline'
      };
    }
  },

  pra: {
    nameZhTW: '正相對調節',
    nameZhCN: '正相对调节',
    nameEn: 'Positive Relative Accommodation',
    abbreviation: 'PRA',
    ranges: [
      { level: 'normal', labelZhTW: '正常', labelZhCN: '正常', labelEn: 'Normal', condition: '-1.50 ~ -3.50', color: 'green' },
      { level: 'warning', labelZhTW: '稍低', labelZhCN: '稍低', labelEn: 'Slightly Low', condition: '-1.00 ~ -1.49', color: 'yellow' },
      { level: 'abnormal', labelZhTW: '異常', labelZhCN: '异常', labelEn: 'Abnormal', condition: '>-1.00', color: 'red' }
    ],
    descriptionZhTW: '評估調節增強的能力，數值偏低可能表示調節不足。',
    descriptionZhCN: '评估调节增强的能力，数值偏低可能表示调节不足。',
    descriptionEn: 'Evaluates ability to stimulate accommodation. Low values may indicate accommodative insufficiency.',
    validate: (value: number) => {
      const absValue = Math.abs(value);
      if (absValue >= 1.5 && absValue <= 3.5) {
        return {
          level: 'normal',
          messageZhTW: 'PRA 正常',
          messageZhCN: 'PRA 正常',
          messageEn: 'PRA within normal range'
        };
      }
      if (absValue >= 1.0 && absValue < 1.5) {
        return {
          level: 'warning',
          messageZhTW: 'PRA 調節儲備稍低',
          messageZhCN: 'PRA 调节储备稍低',
          messageEn: 'PRA slightly reduced'
        };
      }
      if (absValue < 1.0) {
        return {
          level: 'abnormal',
          messageZhTW: 'PRA 調節儲備不足（正常 -1.50 ~ -3.50）',
          messageZhCN: 'PRA 调节储备不足（正常 -1.50 ~ -3.50）',
          messageEn: 'PRA reserve insufficient (normal -1.50 ~ -3.50)'
        };
      }
      return {
        level: 'warning',
        messageZhTW: 'PRA 超出預期範圍',
        messageZhCN: 'PRA 超出预期范围',
        messageEn: 'PRA outside expected range'
      };
    }
  },

  aa: {
    nameZhTW: '調節幅度',
    nameZhCN: '调节幅度',
    nameEn: 'Amplitude of Accommodation',
    abbreviation: 'AA',
    ranges: [
      { level: 'normal', labelZhTW: '預期值', labelZhCN: '预期值', labelEn: 'Expected', condition: '15 - (年齡 ÷ 4)', color: 'blue' }
    ],
    descriptionZhTW: '眼睛最大調節能力，會隨年齡遞減。低於預期值可能有調節不足問題。',
    descriptionZhCN: '眼睛最大调节能力，会随年龄递减。低于预期值可能有调节不足问题。',
    descriptionEn: 'Maximum accommodative ability, decreases with age. Values below expected may indicate insufficiency.',
    validate: (value: number, age?: number) => {
      if (!age) {
        return {
          level: 'normal',
          messageZhTW: '需要年齡資訊進行評估',
          messageZhCN: '需要年龄信息进行评估',
          messageEn: 'Age required for evaluation'
        };
      }
      const expected = Math.max(0, 18.5 - 0.3 * age);
      const minExpected = expected * 0.7; // 70% of expected
      
      if (value >= expected) {
        return {
          level: 'normal',
          messageZhTW: `AA 正常（預期 ≥${expected.toFixed(1)}D）`,
          messageZhCN: `AA 正常（预期 ≥${expected.toFixed(1)}D）`,
          messageEn: `AA normal (expected ≥${expected.toFixed(1)}D)`
        };
      }
      if (value >= minExpected) {
        return {
          level: 'warning',
          messageZhTW: `AA 稍低於預期值 ${expected.toFixed(1)}D`,
          messageZhCN: `AA 稍低于预期值 ${expected.toFixed(1)}D`,
          messageEn: `AA slightly below expected ${expected.toFixed(1)}D`
        };
      }
      return {
        level: 'abnormal',
        messageZhTW: `AA 明顯低於預期（Hofstetter: ${expected.toFixed(1)}D），可能有調節不足`,
        messageZhCN: `AA 明显低于预期（Hofstetter: ${expected.toFixed(1)}D），可能有调节不足`,
        messageEn: `AA significantly below expected (Hofstetter: ${expected.toFixed(1)}D), possible insufficiency`
      };
    }
  },

  flipper: {
    nameZhTW: '調節靈活度',
    nameZhCN: '调节灵活度',
    nameEn: 'Accommodative Flipper Test',
    abbreviation: 'Flipper',
    ranges: [
      { level: 'normal', labelZhTW: '正常', labelZhCN: '正常', labelEn: 'Normal', condition: '≥11 cpm', color: 'green' },
      { level: 'warning', labelZhTW: '可疑', labelZhCN: '可疑', labelEn: 'Borderline', condition: '8-10 cpm', color: 'yellow' },
      { level: 'abnormal', labelZhTW: '異常', labelZhCN: '异常', labelEn: 'Abnormal', condition: '<8 cpm', color: 'red' }
    ],
    descriptionZhTW: '評估調節在 +2.00/-2.00 鏡片間切換的速度，單位：每分鐘循環次數。',
    descriptionZhCN: '评估调节在 +2.00/-2.00 镜片间切换的速度，单位：每分钟循环次数。',
    descriptionEn: 'Evaluates speed of switching between +2.00/-2.00 lenses. Unit: cycles per minute (cpm).',
    validate: (value: number) => {
      if (value >= 11) {
        return {
          level: 'normal',
          messageZhTW: '調節靈活度正常',
          messageZhCN: '调节灵活度正常',
          messageEn: 'Accommodative facility normal'
        };
      }
      if (value >= 8) {
        return {
          level: 'warning',
          messageZhTW: '調節靈活度稍低',
          messageZhCN: '调节灵活度稍低',
          messageEn: 'Accommodative facility slightly reduced'
        };
      }
      return {
        level: 'abnormal',
        messageZhTW: '調節靈活度不足（正常≥11 cpm）',
        messageZhCN: '调节灵活度不足（正常≥11 cpm）',
        messageEn: 'Accommodative facility deficient (normal ≥11 cpm)'
      };
    }
  },

  workingDistance: {
    nameZhTW: '工作距離',
    nameZhCN: '工作距离',
    nameEn: 'Working Distance',
    ranges: [
      { level: 'normal', labelZhTW: '建議', labelZhCN: '建议', labelEn: 'Recommended', condition: '≥40 cm', color: 'green' },
      { level: 'warning', labelZhTW: '注意', labelZhCN: '注意', labelEn: 'Caution', condition: '33-39 cm', color: 'yellow' },
      { level: 'abnormal', labelZhTW: '過近', labelZhCN: '过近', labelEn: 'Too Close', condition: '<33 cm', color: 'red' }
    ],
    descriptionZhTW: '顧客日常看近物（手機、書本）的距離，太近會增加視覺疲勞風險。',
    descriptionZhCN: '顾客日常看近物（手机、书本）的距离，太近会增加视觉疲劳风险。',
    descriptionEn: 'Daily near work distance (phone, books). Too close increases visual fatigue risk.',
    validate: (value: number) => {
      if (value >= 40) {
        return {
          level: 'normal',
          messageZhTW: '工作距離適當',
          messageZhCN: '工作距离适当',
          messageEn: 'Working distance appropriate'
        };
      }
      if (value >= 33) {
        return {
          level: 'warning',
          messageZhTW: '工作距離稍近，建議調整至 40 cm 以上',
          messageZhCN: '工作距离稍近，建议调整至 40 cm 以上',
          messageEn: 'Working distance slightly close, recommend ≥40 cm'
        };
      }
      return {
        level: 'abnormal',
        messageZhTW: '工作距離過近（建議≥40 cm），容易造成視覺疲勞',
        messageZhCN: '工作距离过近（建议≥40 cm），容易造成视觉疲劳',
        messageEn: 'Working distance too close (recommend ≥40 cm), may cause visual fatigue'
      };
    }
  }
};

// Helper function to get tooltip data by key
export const getClinicalTooltipData = (key: string): ClinicalTooltipData | null => {
  return clinicalTooltips[key] || null;
};

// Helper function to validate a value
export const validateClinicalValue = (
  key: string, 
  value: number, 
  age?: number
): ValidationResult | null => {
  const tooltip = clinicalTooltips[key];
  if (!tooltip?.validate) return null;
  return tooltip.validate(value, age);
};
