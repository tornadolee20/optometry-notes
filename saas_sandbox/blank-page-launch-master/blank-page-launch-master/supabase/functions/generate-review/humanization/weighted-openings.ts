// Weighted opening selection for more natural variety

import { OpeningTemplate, OpeningType } from '../types.ts';

export interface WeightedOpening extends OpeningTemplate {
  weight: number;
}

// Weighted opening templates based on naturalness
export const WEIGHTED_OPENINGS: WeightedOpening[] = [
  // accidental - 30% (most natural)
  {
    type: 'accidental',
    opening: '某天經過{storeName}，剛好有需要就進去看看',
    weight: 0.3
  },
  {
    type: 'accidental', 
    opening: '路過{storeName}時臨時起意進去',
    weight: 0.3
  },
  
  // story - 25% (very natural)
  {
    type: 'story',
    opening: '朋友推薦來{storeName}，說這裡不錯',
    weight: 0.25
  },
  {
    type: 'story',
    opening: '之前就聽朋友提過{storeName}，終於有機會來試試',
    weight: 0.25
  },
  
  // friendRecommendation - 20% (natural)
  {
    type: 'friendRecommendation',
    opening: '朋友一直推薦{storeName}，今天終於來體驗了',
    weight: 0.2
  },
  
  // direct - 15% (less natural but still good)
  {
    type: 'direct',
    opening: '今天來{storeName}，整體感受很好',
    weight: 0.15
  },
  {
    type: 'direct',
    opening: '第一次到{storeName}',
    weight: 0.15
  },
  
  // Others - 10% total (occasional variety)
  {
    type: 'discovery',
    opening: '意外發現{storeName}這家店',
    weight: 0.05
  },
  {
    type: 'experience',
    opening: '這次在{storeName}的體驗讓我印象深刻',
    weight: 0.03
  },
  {
    type: 'comparison',
    opening: '比較了幾家後，最終選擇了{storeName}',
    weight: 0.02
  }
];

// Select opening with weighted probability
export function selectWeightedOpening(): WeightedOpening {
  const totalWeight = WEIGHTED_OPENINGS.reduce((sum, opening) => sum + opening.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const opening of WEIGHTED_OPENINGS) {
    random -= opening.weight;
    if (random <= 0) {
      return opening;
    }
  }
  
  // Fallback to most weighted option
  return WEIGHTED_OPENINGS[0];
}
