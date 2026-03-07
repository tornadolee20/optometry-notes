import { CalculationResult } from './calculateLogic';
import { TranslationKey } from './translations';

export interface SimplifiedManagementItem {
  textKey: TranslationKey;
  fallbackText?: string;
}

/**
 * 將精確處方建議轉換為客戶友善的白話文
 * 用於簡易模式，隱藏精確數值
 */
export function getSimplifiedManagement(mgmt: string[], result: CalculationResult): SimplifiedManagementItem[] {
  const simplified: SimplifiedManagementItem[] = [];
  const addedKeys = new Set<TranslationKey>();

  for (const m of mgmt) {
    // 稜鏡相關 - 轉為專業摘要，關鍵字前置
    if (m.includes('稜鏡') || m.includes('Prism') || m.includes('Δ')) {
      if (m.includes('BI') || m.includes('Base In')) {
        if (!addedKeys.has('prismBI')) {
          simplified.push({ textKey: 'prismBI' });
          addedKeys.add('prismBI');
        }
      } else if (m.includes('BO') || m.includes('Base Out')) {
        if (!addedKeys.has('prismBO')) {
          simplified.push({ textKey: 'prismBO' });
          addedKeys.add('prismBO');
        }
      } else {
        if (!addedKeys.has('prismGeneral')) {
          simplified.push({ textKey: 'prismGeneral' });
          addedKeys.add('prismGeneral');
        }
      }
      continue;
    }

    // ADD 相關 - 專業摘要
    if (m.includes('ADD') || m.includes('加入度') || /\+\d+\.\d+\s*D/.test(m)) {
      if (!addedKeys.has('opticsAntiFatigue')) {
        simplified.push({ textKey: 'opticsAntiFatigue' });
        addedKeys.add('opticsAntiFatigue');
      }
      continue;
    }

    // VT 訓練相關 - 專業摘要
    if (m.includes('訓練') || m.includes('VT') || m.includes('Training')) {
      if (!addedKeys.has('vtTraining')) {
        simplified.push({ textKey: 'vtTraining' });
        addedKeys.add('vtTraining');
      }
      continue;
    }

    // 其他建議 - 直接保留（通常是比較通用的建議）
    // 移除數字和單位
    const cleaned = m
      .replace(/\d+\.?\d*\s*Δ/g, '')
      .replace(/\d+\.?\d*\s*D/g, '')
      .replace(/[+-]?\d+\.?\d*/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (cleaned.length > 5) {
      // For non-standard items, use fallback text
      simplified.push({ textKey: 'vtTraining', fallbackText: cleaned });
    }
  }

  return simplified.slice(0, 3);
}
