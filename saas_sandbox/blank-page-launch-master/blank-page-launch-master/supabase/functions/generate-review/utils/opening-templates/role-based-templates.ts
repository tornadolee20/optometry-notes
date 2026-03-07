import { OpeningTemplate } from '../../types.ts';

export const ROLE_BASED_TEMPLATES: OpeningTemplate[] = [
  {
    type: 'experience',
    opening: '帶家人來{area}的{storeName}，大家都很滿意。'
  },
  {
    type: 'story',
    opening: '工作關係常經過{area}，今天終於有時間來{storeName}看看。'
  },
  {
    type: 'experience',
    opening: '退休後比較有時間，朋友推薦{area}的{storeName}。'
  },
  {
    type: 'story',
    opening: '學生時期就在{area}，知道{storeName}很久了，這次終於來體驗。'
  }
];