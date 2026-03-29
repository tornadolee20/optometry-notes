
import { OpeningTemplate } from '../../types.ts';

// 基本開場白模板 - 直接體驗、簡單直述
export const BASIC_TEMPLATES: OpeningTemplate[] = [
  // 直接體驗型 - 更自然
  {
    type: 'direct',
    opening: '來{area}這家{store}體驗了一下，整體感覺還不錯欸。'
  },
  {
    type: 'direct',
    opening: '在{area}找到這家{store}，進去看看果然沒讓我失望。'
  },
  {
    type: 'direct',
    opening: '第一次來{area}的{store}，服務品質蠻讓人印象深刻的。'
  },
  
  // 簡單直述型
  {
    type: 'simple',
    opening: '來{area}的{store}服務了，整個過程很順利。'
  },
  {
    type: 'simple',
    opening: '這次選擇{area}這家{store}，體驗還算不錯。'
  },
  {
    type: 'simple',
    opening: '{area}的{store}給我的印象蠻好的，值得推薦。'
  }
];
