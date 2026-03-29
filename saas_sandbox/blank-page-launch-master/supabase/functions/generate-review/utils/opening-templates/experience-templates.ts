import { OpeningTemplate } from '../../types.ts';

export const EXPERIENCE_TEMPLATES: OpeningTemplate[] = [
  {
    type: 'experience',
    opening: '這次在{area}的{storeName}有了很棒的體驗。'
  },
  {
    type: 'story',
    opening: '某天和朋友經過{area}時看到{storeName}，就決定進去試試。'
  },
  {
    type: 'experience',
    opening: '帶家人來{area}體驗{storeName}的服務，整體感覺很不錯。'
  },
  {
    type: 'story',
    opening: '之前就聽說{area}的{storeName}不錯，這次終於有機會來試試了。'
  }
];