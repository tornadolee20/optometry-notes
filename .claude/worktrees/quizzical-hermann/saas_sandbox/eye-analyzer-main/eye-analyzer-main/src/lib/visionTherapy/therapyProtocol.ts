// Vision Therapy Protocol Types and Data

export interface TherapyExercise {
  name: string;
  nameEn?: string;
  frequency: string;
  duration: string;
  target: string;
  progression: string;
  description: string;
  videoUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TherapyPhase {
  phaseName: string;
  weeks: string;
  goals: string[];
  exercises: TherapyExercise[];
  reEvaluationWeek: number;
  expectedOutcomes: string[];
}

export interface VisionTherapyProtocol {
  pattern: 'CI' | 'CE' | 'BX' | 'BE' | 'DI' | 'DE' | 'NORMAL';
  totalWeeks: number;
  phases: TherapyPhase[];
  homeTherapyNotes: string[];
}

// CI (Convergence Insufficiency) Protocol - Complete 12-week program
export const ciTherapyProtocol: VisionTherapyProtocol = {
  pattern: 'CI',
  totalWeeks: 12,
  phases: [
    {
      phaseName: '第一階段：基礎聚合訓練',
      weeks: 'Week 1-4',
      goals: [
        'NPC 改善至 10cm 以內',
        '建立基本聚合意識',
        'BO 融像範圍提升 5Δ'
      ],
      exercises: [
        {
          name: '鉛筆推進訓練',
          nameEn: 'Pencil Push-ups',
          frequency: '每日 3 次',
          duration: '每次 5 分鐘',
          target: 'NPC < 10cm',
          progression: '每週將目標距離縮短 1cm',
          description: '將鉛筆舉於眼前 40cm，緩慢移近至鼻尖，保持清晰單一影像。當出現複視時停止，記錄距離後重複練習。',
          difficulty: 'easy'
        },
        {
          name: 'Brock 繩訓練',
          nameEn: 'Brock String',
          frequency: '每日 2 次',
          duration: '每次 10 分鐘',
          target: '三顆珠子清晰對焦',
          progression: '第 2 週增加珠子數量，第 3 週縮短珠距',
          description: '使用 3 顆不同顏色珠子的 Brock 繩，練習注視不同距離的珠子，觀察 X 形交叉點，訓練雙眼協調。',
          difficulty: 'easy'
        },
        {
          name: '融像擴大練習',
          nameEn: 'Vergence Range Expansion',
          frequency: '每日 2 次',
          duration: '每次 5 分鐘',
          target: 'BO Break +5Δ',
          progression: '每週增加 1-2Δ 稜鏡量',
          description: '使用漸進式稜鏡或融像訓練卡，練習基底朝外（BO）的融像範圍，逐步擴大聚合能力。',
          difficulty: 'medium'
        }
      ],
      reEvaluationWeek: 4,
      expectedOutcomes: [
        'NPC ≤ 10cm（休息狀態）',
        '患者能感知聚合動作',
        'CISS 分數下降 5-10 分'
      ]
    },
    {
      phaseName: '第二階段：動態聚合訓練',
      weeks: 'Week 5-8',
      goals: [
        'NPC 改善至 8cm 以內',
        '快速聚合/散開切換能力',
        'BO 融像範圍達 15Δ'
      ],
      exercises: [
        {
          name: '跳躍式聚合訓練',
          nameEn: 'Jump Convergence',
          frequency: '每日 3 次',
          duration: '每次 5 分鐘',
          target: '每秒完成 1 次遠近切換',
          progression: '每週增加切換速度，減少目標間距',
          description: '快速在遠（3m）近（40cm）目標間切換注視，訓練聚合系統的反應速度和彈性。',
          difficulty: 'medium'
        },
        {
          name: 'Hart 圖表訓練',
          nameEn: 'Hart Chart',
          frequency: '每日 2 次',
          duration: '每次 10 分鐘',
          target: '1 分鐘完成 20 次切換',
          progression: '縮小字體大小，增加閱讀速度要求',
          description: '使用遠近兩張 Hart 圖表，交替閱讀字母，訓練調節與聚合的協調性。',
          difficulty: 'medium'
        },
        {
          name: '立體視訓練',
          nameEn: 'Stereogram Training',
          frequency: '每週 3 次',
          duration: '每次 15 分鐘',
          target: '感知 40" 立體視',
          progression: '從明顯差異開始，逐步挑戰細微差異',
          description: '使用隨機點立體圖或 Quoits 訓練卡，練習感知立體深度，強化雙眼融像。',
          difficulty: 'hard'
        },
        {
          name: '電腦視覺訓練',
          nameEn: 'Computer-Based Vergence Training',
          frequency: '每週 2 次',
          duration: '每次 20 分鐘',
          target: '完成中級難度關卡',
          progression: '根據軟體評估自動調整難度',
          description: '使用專業視覺訓練軟體（如 HTS、Vivid Vision），進行互動式聚合訓練遊戲。',
          videoUrl: 'https://example.com/computer-training',
          difficulty: 'medium'
        }
      ],
      reEvaluationWeek: 8,
      expectedOutcomes: [
        'NPC ≤ 8cm',
        'BO Break ≥ 15Δ，Recovery ≥ 10Δ',
        'CISS 分數 < 20',
        '快速遠近切換無延遲'
      ]
    },
    {
      phaseName: '第三階段：功能整合與耐力',
      weeks: 'Week 9-12',
      goals: [
        'NPC 維持在 6cm 以內',
        '閱讀耐力達 30 分鐘以上',
        'CISS 分數 < 16（輕度以下）'
      ],
      exercises: [
        {
          name: '孔徑尺訓練',
          nameEn: 'Aperture Rule',
          frequency: '每日 2 次',
          duration: '每次 10 分鐘',
          target: '最小孔徑清晰融像',
          progression: '逐步縮小孔徑直徑',
          description: '使用孔徑尺進行精細融像訓練，挑戰極限聚合與散開能力，建立穩固的融像儲備。',
          difficulty: 'hard'
        },
        {
          name: '實境閱讀訓練',
          nameEn: 'Real-World Reading Training',
          frequency: '每日 1 次',
          duration: '30 分鐘持續閱讀',
          target: '無症狀閱讀 30 分鐘',
          progression: '逐週增加 5 分鐘，最終達 45 分鐘',
          description: '進行實際閱讀活動（書籍、平板），訓練持久的近距離用眼耐力，模擬日常學習/工作情境。',
          difficulty: 'medium'
        },
        {
          name: '生活情境整合',
          nameEn: 'Real-Life Integration',
          frequency: '每日執行',
          duration: '融入日常活動',
          target: '日常活動無視覺疲勞',
          progression: '記錄症狀日記，逐步減少',
          description: '將訓練技巧應用於日常活動：閱讀、使用電腦、看手機，有意識地保持正確用眼姿勢和休息習慣。',
          difficulty: 'easy'
        },
        {
          name: '維持訓練計畫',
          nameEn: 'Maintenance Protocol',
          frequency: '每週 3 次',
          duration: '每次 15 分鐘',
          target: '維持治療成果',
          progression: '療程結束後持續 3 個月',
          description: '完成主要療程後的維持計畫：每週進行 Brock 繩和 Pencil Push-ups，防止復發。',
          difficulty: 'easy'
        }
      ],
      reEvaluationWeek: 12,
      expectedOutcomes: [
        'NPC ≤ 6cm 並穩定維持',
        'CISS 分數 < 16',
        '閱讀 30 分鐘無症狀',
        'Sheard\'s Criterion 達標'
      ]
    }
  ],
  homeTherapyNotes: [
    '每次訓練前確保環境光線充足，避免在昏暗環境中練習',
    '若訓練過程中出現頭痛或噁心，請立即停止並休息',
    '建議使用計時器追蹤訓練時間，確保足夠的練習量',
    '記錄每日訓練情況和症狀變化，回診時提供給驗光師參考',
    '訓練期間應減少長時間使用 3C 產品，每 20 分鐘休息 20 秒看遠處',
    '保持規律作息和充足睡眠，有助於視覺系統恢復'
  ]
};

// CE (Convergence Excess) Protocol
export const ceTherapyProtocol: VisionTherapyProtocol = {
  pattern: 'CE',
  totalWeeks: 10,
  phases: [
    {
      phaseName: '第一階段：放鬆調節與散開訓練',
      weeks: 'Week 1-5',
      goals: [
        '近距 Esophoria 減少 4Δ',
        '提升調節放鬆能力',
        'BI 融像範圍提升'
      ],
      exercises: [
        {
          name: '負鏡閱讀訓練',
          nameEn: 'Minus Lens Reading',
          frequency: '每日 2 次',
          duration: '每次 10 分鐘',
          target: '適應 -1.00D 負鏡閱讀',
          progression: '從 -0.50D 開始，每 2 週增加 -0.25D',
          description: '配戴負球面鏡片閱讀，減少調節需求，訓練調節放鬆。開始時可能感覺模糊，逐步適應。',
          difficulty: 'medium'
        },
        {
          name: 'BI 稜鏡閱讀訓練',
          nameEn: 'BI Prism Reading',
          frequency: '每日 2 次',
          duration: '每次 10 分鐘',
          target: 'BI Break ≥ 12Δ',
          progression: '從 2Δ BI 開始，每週增加 1-2Δ',
          description: '配戴基底朝內稜鏡閱讀，訓練散開（負聚合）能力，擴大 BI 融像儲備。',
          difficulty: 'medium'
        },
        {
          name: 'Brock 繩散開訓練',
          nameEn: 'Brock String Divergence',
          frequency: '每日 2 次',
          duration: '每次 8 分鐘',
          target: '穩定的散開性融像',
          progression: '增加繩長，挑戰更遠距離的融像',
          description: '使用 Brock 繩練習散開性融像，專注於將 X 交叉點推向更遠處。',
          difficulty: 'easy'
        }
      ],
      reEvaluationWeek: 5,
      expectedOutcomes: [
        '近距 Esophoria < 6Δ',
        '調節靈活度改善',
        'BI Break ≥ 10Δ'
      ]
    },
    {
      phaseName: '第二階段：調節靈活度與整合',
      weeks: 'Week 6-10',
      goals: [
        'CISS 分數 < 16',
        '調節翻轉器 ±2.00D 通過',
        '近距視力穩定'
      ],
      exercises: [
        {
          name: '調節翻轉器訓練',
          nameEn: 'Accommodative Flippers',
          frequency: '每日 3 次',
          duration: '每次 5 分鐘',
          target: '每分鐘 12 次翻轉',
          progression: '從 ±0.50D 開始，逐步增加到 ±2.00D',
          description: '使用雙面調節翻轉器，快速切換正負鏡片，訓練調節系統的靈活度和反應速度。',
          difficulty: 'medium'
        },
        {
          name: '遠近交替注視',
          nameEn: 'Near-Far Alternation',
          frequency: '每日 3 次',
          duration: '每次 5 分鐘',
          target: '快速切換無模糊延遲',
          progression: '縮短遠近目標距離差',
          description: '在遠距（3m）與近距（40cm）目標間快速切換注視，同時融合調節和聚合訓練。',
          difficulty: 'easy'
        },
        {
          name: '放鬆技巧訓練',
          nameEn: 'Relaxation Techniques',
          frequency: '每日執行',
          duration: '融入日常',
          target: '養成定時休息習慣',
          progression: '建立 20-20-20 習慣',
          description: '學習眼部放鬆技巧：掌心熱敷、遠眺休息、20-20-20 法則（每 20 分鐘看 20 英尺外 20 秒）。',
          difficulty: 'easy'
        }
      ],
      reEvaluationWeek: 10,
      expectedOutcomes: [
        'CISS 分數 < 16',
        '調節翻轉器 ±2.00D 每分鐘 ≥ 10 次',
        '近距工作 30 分鐘無症狀'
      ]
    }
  ],
  homeTherapyNotes: [
    '負鏡閱讀初期可能感覺模糊，這是正常現象，逐步適應',
    '避免長時間近距離工作，每 30 分鐘休息 5 分鐘',
    '閱讀時保持適當距離（35-40cm），避免過近',
    '訓練後若感覺眼睛疲勞，可進行遠眺放鬆',
    '記錄症狀日記，追蹤進步情況'
  ]
};

// BX (Basic Exophoria) / DE (Divergence Excess) Protocol
export const bxTherapyProtocol: VisionTherapyProtocol = {
  pattern: 'BX',
  totalWeeks: 10,
  phases: [
    {
      phaseName: '第一階段：BO 融像強化',
      weeks: 'Week 1-5',
      goals: [
        'BO 融像範圍提升',
        '遠近距 Exophoria 差距減少',
        '建立聚合意識'
      ],
      exercises: [
        {
          name: '融像範圍擴大練習',
          nameEn: 'Vergence Range Expansion',
          frequency: '每日 2 次',
          duration: '每次 10 分鐘',
          target: 'BO Break 增加 8Δ',
          progression: '每週增加 1-2Δ 訓練量',
          description: '使用融像訓練卡或稜鏡 bar，練習基底朝外融像，逐步擴大聚合儲備範圍。',
          difficulty: 'medium'
        },
        {
          name: '正負鏡片訓練',
          nameEn: 'Plus/Minus Lens Training',
          frequency: '每日 2 次',
          duration: '每次 8 分鐘',
          target: '調節與聚合協調',
          progression: '增加鏡片度數挑戰',
          description: '交替使用正負鏡片閱讀，訓練調節與聚合系統的靈活配合。',
          difficulty: 'medium'
        },
        {
          name: 'Brock 繩聚合訓練',
          nameEn: 'Brock String Convergence',
          frequency: '每日 2 次',
          duration: '每次 10 分鐘',
          target: '穩定的聚合性融像',
          progression: '縮短最近珠子距離',
          description: '使用 Brock 繩練習聚合性融像，專注於將 X 交叉點移近。',
          difficulty: 'easy'
        }
      ],
      reEvaluationWeek: 5,
      expectedOutcomes: [
        'BO Break 增加 5Δ 以上',
        '融像穩定性改善',
        '遠近距平衡改善'
      ]
    },
    {
      phaseName: '第二階段：功能補償達標',
      weeks: 'Week 6-10',
      goals: [
        'Sheard\'s Criterion 達標',
        '日常視覺功能正常',
        '維持訓練成果'
      ],
      exercises: [
        {
          name: '跳躍式聚合訓練',
          nameEn: 'Jump Convergence',
          frequency: '每日 2 次',
          duration: '每次 8 分鐘',
          target: '快速聚合反應',
          progression: '增加切換頻率',
          description: '快速在遠近目標間切換注視，訓練聚合系統的反應速度。',
          difficulty: 'medium'
        },
        {
          name: '立體視強化訓練',
          nameEn: 'Stereopsis Enhancement',
          frequency: '每週 3 次',
          duration: '每次 15 分鐘',
          target: '精細立體視感知',
          progression: '挑戰更細微的深度差異',
          description: '使用立體視訓練工具，強化雙眼融像和深度感知能力。',
          difficulty: 'hard'
        }
      ],
      reEvaluationWeek: 10,
      expectedOutcomes: [
        'BO ≥ 2 倍 Exophoria',
        '遠近距 Exophoria 差距 < 4Δ',
        '日常活動無症狀'
      ]
    }
  ],
  homeTherapyNotes: [
    '訓練重點在於提升聚合能力，練習時應感受到眼睛向內用力的感覺',
    '若訓練中出現複視，代表已達融像極限，記錄後休息再繼續',
    '配合適當的用眼衛生習慣，避免過度疲勞',
    '回診時報告訓練進度和任何困難'
  ]
};

// BE (Basic Esophoria) / DI (Divergence Insufficiency) Protocol
export const beTherapyProtocol: VisionTherapyProtocol = {
  pattern: 'BE',
  totalWeeks: 10,
  phases: [
    {
      phaseName: '第一階段：BI 融像與散開訓練',
      weeks: 'Week 1-5',
      goals: [
        'BI 融像範圍提升',
        '散開能力改善',
        '減少 Esophoria'
      ],
      exercises: [
        {
          name: '散開性融像練習',
          nameEn: 'Divergence Vergence Training',
          frequency: '每日 2 次',
          duration: '每次 10 分鐘',
          target: 'BI Break 增加 6Δ',
          progression: '每週增加 1Δ 訓練量',
          description: '使用基底朝內稜鏡或融像卡，練習散開性融像，擴大 BI 融像儲備。',
          difficulty: 'medium'
        },
        {
          name: '放鬆性融像練習',
          nameEn: 'Relaxation Vergence',
          frequency: '每日 2 次',
          duration: '每次 8 分鐘',
          target: '穩定的散開控制',
          progression: '增加維持時間',
          description: '練習有意識地放鬆聚合，讓眼睛自然向外散開，建立散開意識。',
          difficulty: 'easy'
        },
        {
          name: '負鏡片閱讀',
          nameEn: 'Minus Lens Reading',
          frequency: '每日 1 次',
          duration: '每次 15 分鐘',
          target: '調節放鬆能力',
          progression: '逐步增加負鏡度數',
          description: '配戴適當負鏡片閱讀，減少調節驅動的聚合需求。',
          difficulty: 'medium'
        }
      ],
      reEvaluationWeek: 5,
      expectedOutcomes: [
        'BI Break 增加 4Δ 以上',
        '散開控制改善',
        'Esophoria 減少'
      ]
    },
    {
      phaseName: '第二階段：整合與維持',
      weeks: 'Week 6-10',
      goals: [
        '視覺舒適度提升',
        '日常功能正常',
        '建立維持訓練習慣'
      ],
      exercises: [
        {
          name: '遠近交替訓練',
          nameEn: 'Distance-Near Alternation',
          frequency: '每日 2 次',
          duration: '每次 8 分鐘',
          target: '平順的遠近切換',
          progression: '增加切換頻率',
          description: '在遠距和近距目標間交替注視，整合調節和聚合系統。',
          difficulty: 'easy'
        },
        {
          name: '日常情境練習',
          nameEn: 'Real-Life Practice',
          frequency: '每日執行',
          duration: '融入日常',
          target: '無症狀日常活動',
          progression: '記錄並減少症狀發生',
          description: '將訓練技巧應用於日常活動，有意識地控制眼位和放鬆。',
          difficulty: 'easy'
        }
      ],
      reEvaluationWeek: 10,
      expectedOutcomes: [
        'BI 融像達 Percival Zone',
        '日常活動舒適',
        '症狀明顯減少'
      ]
    }
  ],
  homeTherapyNotes: [
    '散開訓練重點在於「放鬆」而非「用力」',
    '若感覺眼睛緊繃，先進行放鬆再繼續訓練',
    '遠眺是很好的自然散開練習，建議每小時進行一次',
    '訓練過程中保持正常呼吸，避免憋氣'
  ]
};

// Default/Normal Protocol (for maintenance or borderline cases)
export const defaultTherapyProtocol: VisionTherapyProtocol = {
  pattern: 'NORMAL',
  totalWeeks: 6,
  phases: [
    {
      phaseName: '視覺保健訓練',
      weeks: 'Week 1-6',
      goals: [
        '維持視覺功能',
        '預防視覺疲勞',
        '建立良好用眼習慣'
      ],
      exercises: [
        {
          name: '眼部運動',
          nameEn: 'Eye Exercises',
          frequency: '每日 2 次',
          duration: '每次 5 分鐘',
          target: '眼肌靈活度維持',
          progression: '持續練習即可',
          description: '上下左右轉動眼球、畫圓等基本眼部運動，維持眼外肌靈活度。',
          difficulty: 'easy'
        },
        {
          name: '遠近交替注視',
          nameEn: 'Near-Far Focus',
          frequency: '每日 3 次',
          duration: '每次 3 分鐘',
          target: '調節靈活度維持',
          progression: '持續練習即可',
          description: '交替注視遠近目標，維持調節系統靈活度。',
          difficulty: 'easy'
        },
        {
          name: '20-20-20 法則',
          nameEn: '20-20-20 Rule',
          frequency: '每 20 分鐘',
          duration: '20 秒',
          target: '預防視覺疲勞',
          progression: '養成習慣',
          description: '每使用螢幕 20 分鐘，看 20 英尺（6 米）外的目標 20 秒。',
          difficulty: 'easy'
        }
      ],
      reEvaluationWeek: 6,
      expectedOutcomes: [
        '視覺舒適度維持',
        '無視覺疲勞症狀',
        '良好用眼習慣建立'
      ]
    }
  ],
  homeTherapyNotes: [
    '維持規律作息和充足睡眠',
    '控制 3C 使用時間',
    '保持適當閱讀距離',
    '定期進行眼科檢查'
  ]
};

// Helper function to get protocol by pattern
export function getTherapyProtocol(pattern: string): VisionTherapyProtocol {
  switch (pattern) {
    case 'CI':
      return ciTherapyProtocol;
    case 'CE':
      return ceTherapyProtocol;
    case 'BX':
    case 'DE':
      return bxTherapyProtocol;
    case 'BE':
    case 'DI':
      return beTherapyProtocol;
    default:
      return defaultTherapyProtocol;
  }
}

// Helper function to get pattern display name
export function getPatternDisplayName(pattern: string): string {
  const names: Record<string, string> = {
    'CI': '輻輳不足 (Convergence Insufficiency)',
    'CE': '輻輳過度 (Convergence Excess)',
    'BX': '基本型外斜視 (Basic Exophoria)',
    'BE': '基本型內斜視 (Basic Esophoria)',
    'DI': '散開不足 (Divergence Insufficiency)',
    'DE': '散開過度 (Divergence Excess)',
    'NORMAL': '視覺保健'
  };
  return names[pattern] || '視覺訓練';
}
