import { OpeningTemplate } from '../../types.ts';

export const SPECIAL_TEMPLATES: OpeningTemplate[] = [
  {
    type: 'seasonal',
    opening: '今天天氣不錯，來{area}的{storeName}走走。'
  },
  {
    type: 'seasonal',
    opening: '季節變換，正好需要到{area}的{storeName}。'
  },
  {
    type: 'special',
    opening: '特地從遠處來{area}的{storeName}，沒讓我失望。'
  },
  {
    type: 'special',
    opening: '聽說{area}的{storeName}很有名，特地來體驗看看。'
  }
];