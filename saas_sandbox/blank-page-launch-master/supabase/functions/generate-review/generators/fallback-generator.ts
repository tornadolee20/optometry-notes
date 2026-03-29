import { CustomerType } from '../types.ts';

export function generateFallbackReview(
  opening: string,
  area: string,
  storeName: string,
  keywords: string[],
  customerType: CustomerType
): string {
  console.log('使用備用方案生成評論，關鍵字數量:', keywords.length);
  
  // 確保關鍵字數量在3-6個範圍內
  const validKeywords = keywords.slice(0, 6);
  if (validKeywords.length < 3) {
    console.warn('關鍵字不足3個，使用預設關鍵字補足');
    const defaultKeywords = ['服務', '環境', '價格', '態度', '專業', '品質'];
    while (validKeywords.length < 3) {
      validKeywords.push(defaultKeywords[validKeywords.length]);
    }
  }

  // 根據關鍵字數量選擇適合的模板
  const buildTemplate = (kw: string[]) => {
    const templates = [];
    
    // 3個關鍵字的模板
    if (kw.length >= 3) {
      templates.push(
        `${opening.replace('{storeName}', storeName)}

這次來${storeName}的體驗真的很棒！${kw[0]}讓人印象深刻，${kw[1]}也很符合期待，整體的${kw[2]}更是沒話說。

在${area}地區能找到這樣優質的店家真的很幸運。推薦給所有需要的朋友！`,

        `朋友推薦來${area}的${storeName}，實際體驗後真的沒讓我失望！

店裡的${kw[0]}很到位，${kw[1]}也處理得很好，特別是${kw[2]}真的很讚。整個過程都很順利愉快。

下次還會再來，也會推薦給其他朋友！`
      );
    }

    // 4個關鍵字的模板
    if (kw.length >= 4) {
      templates.push(
        `${opening.replace('{storeName}', storeName)}

這次的體驗真的很不錯！${kw[0]}很專業，${kw[1]}也很舒適，${kw[2]}更是讓人滿意，店員的${kw[3]}也很親切。

整個過程都很順利，${area}地區能有這樣的店家真的很棒。如果朋友需要相關服務，我一定會推薦${storeName}！`,

        `在${area}發現這家${storeName}真是意外收穫！

${kw[0]}給人很好的第一印象，${kw[1]}也很讓人放心，${kw[2]}處理得很仔細，${kw[3]}更是超出預期。

整體來說非常滿意，推薦給所有需要的朋友！`
      );
    }

    // 5個關鍵字的模板
    if (kw.length >= 5) {
      templates.push(
        `${opening.replace('{storeName}', storeName)}

來${storeName}的體驗真的很棒！從${kw[0]}到${kw[1]}都很專業，${kw[2]}也很合理，${kw[3]}讓人印象深刻，${kw[4]}更是加分不少。

在${area}地區找到這樣全方位優質的店家真的不容易。強烈推薦給大家！`,

        `朋友一直推薦這家${area}的${storeName}，親自體驗後真的名不虛傳！

${kw[0]}很到位，${kw[1]}處理得很仔細，${kw[2]}也很透明，${kw[3]}讓人安心，特別是${kw[4]}真的很用心。

下次有需要一定會再來，也會推薦給更多朋友！`
      );
    }

    // 6個關鍵字的模板
    if (kw.length >= 6) {
      templates.push(
        `${opening.replace('{storeName}', storeName)}

這次在${storeName}的完整體驗真的讓我很滿意！${kw[0]}很專業，${kw[1]}很舒適，${kw[2]}很合理，${kw[3]}很親切，${kw[4]}很仔細，${kw[5]}更是讓人印象深刻。

從各個方面來看都很優秀，在${area}地區算是很難得的優質店家。強烈推薦給所有朋友！`,

        `經過朋友介紹來到${area}的${storeName}，真的是一次很棒的體驗！

無論是${kw[0]}、${kw[1]}、${kw[2]}，還是${kw[3]}、${kw[4]}、${kw[5]}，每個環節都處理得很好，讓人感受到店家的用心。

這樣全方位的優質服務在${area}真的不多見，一定會再次光顧並推薦給更多人！`
      );
    }

    return templates;
  };
  
  const templates = buildTemplate(validKeywords);
  
  // 隨機選擇一個模板
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  console.log('生成的評論長度:', randomTemplate.length, '使用關鍵字數量:', validKeywords.length);
  
  return randomTemplate;
}