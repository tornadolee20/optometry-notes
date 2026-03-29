
import { OpeningTemplate } from '../../types.ts';

// 發現型開場白模板 - 朋友推薦、偶然發現、研究比較
export const DISCOVERY_TEMPLATES: OpeningTemplate[] = [
  // 朋友推薦 - 更生活化
  {
    type: 'friendRecommendation',
    opening: '朋友一直跟我推薦{area}這家{store}，終於有機會來試試了。'
  },
  {
    type: 'friendRecommendation',
    opening: '同事說{area}的{store}很不錯，親自來過後覺得真的值得推薦。'
  },
  {
    type: 'friendRecommendation',
    opening: '聽朋友說{area}有家{store}還蠻有名的，今天特地過來看看。'
  },
  
  // 偶然發現型
  {
    type: 'accidental',
    opening: '路過{area}無意間發現這家{store}，想說進去瞧瞧。'
  },
  {
    type: 'accidental',
    opening: '本來要去別的地方，結果看到{area}這家{store}就順便進來了。'
  },
  {
    type: 'accidental',
    opening: '在{area}逛街時發現{store}這家店，好奇心驅使下就進去了。'
  },
  
  // 比較研究型
  {
    type: 'research',
    opening: '比較了幾家店，最後選擇{area}的{store}，實際體驗證明選擇是對的。'
  },
  {
    type: 'research',
    opening: '做了不少功課才決定來{area}這家{store}，果然沒有踩雷。'
  },
  {
    type: 'research',
    opening: '網路評價不錯所以來{area}的{store}試試，確實名不虛傳。'
  },
  
  // 觀察型
  {
    type: 'observation',
    opening: '經過{area}好幾次都看到{store}生意不錯，今天終於進來體驗了。'
  },
  {
    type: 'observation',
    opening: '注意{area}這家{store}很久了，實際來過後覺得值得一試。'
  }
];
