/**
 * 模擬測試個案資料庫
 * 用於開發測試與規則驗證
 */

import { RefractionData } from './analysis/refractionAnalysis';

export interface MockCaseData {
  age: number;
  gender: 'male' | 'female' | 'other';
  pd: number;
  ciss: number;
  stereo: number;
  npc: number;
  nra: number;
  pra: number;
  mem: number;
  aaOD: number;
  aaOS: number;
  flipper: number;
  dist_phoria: number;
  near_phoria: number;
  bi_break: number;
  bo_break: number;
  dist_bi_break: number;
  dist_bo_break: number;
  vergence_facility: number;
  refraction?: RefractionData;
}

export interface MockCase {
  id: string;
  name: string;
  description: string;
  expectedDiagnosis: 'NORMAL' | 'CI' | 'CE' | 'AI' | 'AE' | 'AIFI' | 'BX' | 'BE' | 'DE' | 'DI';
  expected_primary_diagnosis?: string; // 詳細預期診斷文字
  expected_priority?: 'Treat' | 'Monitor'; // 預期處置優先級
  data: MockCaseData;
}

export const MOCK_CASES: MockCase[] = [
  {
    id: 'normal_01',
    name: '正常 - 年輕成人（25歲）',
    description: '所有指標在正常範圍，無症狀',
    expectedDiagnosis: 'NORMAL',
    data: {
      age: 25, gender: 'male', pd: 63, ciss: 8, stereo: 40, npc: 5,
      nra: 2.5, pra: -2.5, mem: 0.5, aaOD: 12, aaOS: 12, flipper: 12,
      dist_phoria: 0, near_phoria: -2, bi_break: 14, bo_break: 20,
      dist_bi_break: 8, dist_bo_break: 18, vergence_facility: 15
    }
  },
  {
    id: 'normal_02',
    name: '正常雙眼視｜調節力略下降（42歲）',
    description: '調節力略下降，符合 40+ 常見變化，建議定期追蹤',
    expectedDiagnosis: 'NORMAL',
    expected_primary_diagnosis: '正常 BV + 早期 Presbyopia（觀察追蹤，非典型 CI）',
    expected_priority: 'Monitor',
    data: {
      age: 42, gender: 'female', pd: 60, ciss: 10, stereo: 40, npc: 6,
      nra: 2.0, pra: -3.0, mem: 0.5, aaOD: 5, aaOS: 5, flipper: 10,
      dist_phoria: 0, near_phoria: -3, bi_break: 12, bo_break: 18,
      dist_bi_break: 7, dist_bo_break: 16, vergence_facility: 12
    }
  },
  {
    id: 'ci_01',
    name: 'CI - 輕度（28歲）',
    description: 'NPC 略退、近距外斜、輕度症狀',
    expectedDiagnosis: 'CI',
    data: {
      age: 28, gender: 'male', pd: 64, ciss: 22, stereo: 40, npc: 8,
      nra: 2.0, pra: -2.0, mem: 0.75, aaOD: 10, aaOS: 10, flipper: 8,
      dist_phoria: -1, near_phoria: -7, bi_break: 10, bo_break: 14,
      dist_bi_break: 6, dist_bo_break: 16, vergence_facility: 8,
      refraction: {
        OD: { sphere: -3.00, cylinder: -0.75, axis: 180 },
        OS: { sphere: -3.25, cylinder: -0.50, axis: 175 },
        spectacleWearing: true,
        adaptation: 'good'
      }
    }
  },
  {
    id: 'ci_02',
    name: 'CI - 中度（32歲）',
    description: 'NPC 明顯退縮、BO 不足、中高症狀',
    expectedDiagnosis: 'CI',
    data: {
      age: 32, gender: 'female', pd: 62, ciss: 28, stereo: 60, npc: 10,
      nra: 1.5, pra: -1.5, mem: 1.0, aaOD: 8, aaOS: 8, flipper: 6,
      dist_phoria: -2, near_phoria: -9, bi_break: 8, bo_break: 12,
      dist_bi_break: 5, dist_bo_break: 14, vergence_facility: 6
    }
  },
  {
    id: 'ci_03',
    name: 'CI - 重度（24歲）',
    description: 'NPC 嚴重退縮、近距大外斜、高症狀',
    expectedDiagnosis: 'CI',
    data: {
      age: 24, gender: 'male', pd: 65, ciss: 35, stereo: 100, npc: 15,
      nra: 1.0, pra: -1.0, mem: 1.25, aaOD: 10, aaOS: 10, flipper: 4,
      dist_phoria: -2, near_phoria: -12, bi_break: 6, bo_break: 10,
      dist_bi_break: 4, dist_bo_break: 12, vergence_facility: 4
    }
  },
  {
    id: 'ce_01',
    name: 'CE - 中度（30歲）',
    description: '近距內斜、高 AC/A、BI 不足',
    expectedDiagnosis: 'CE',
    data: {
      age: 30, gender: 'female', pd: 61, ciss: 24, stereo: 40, npc: 4,
      nra: 1.0, pra: -4.0, mem: 0.25, aaOD: 10, aaOS: 10, flipper: 8,
      dist_phoria: 0, near_phoria: 6, bi_break: 6, bo_break: 22,
      dist_bi_break: 10, dist_bo_break: 20, vergence_facility: 10,
      refraction: {
        OD: { sphere: -8.00, cylinder: -1.50, axis: 180 },
        OS: { sphere: -8.50, cylinder: -1.25, axis: 175 },
        spectacleWearing: true,
        adaptation: 'good'
      }
    }
  },
  {
    id: 'bx_01',
    name: 'Basic Exo - 輕度（26歲）- 屈光參差',
    description: '遠近皆外斜、差異小、融像保留度尚可、屈光參差 3.0D',
    expectedDiagnosis: 'BX',
    data: {
      age: 26, gender: 'male', pd: 64, ciss: 18, stereo: 40, npc: 6,
      nra: 2.0, pra: -2.5, mem: 0.5, aaOD: 11, aaOS: 11, flipper: 10,
      dist_phoria: -3, near_phoria: -5, bi_break: 10, bo_break: 16,
      dist_bi_break: 6, dist_bo_break: 14, vergence_facility: 12,
      refraction: {
        OD: { sphere: -2.00, cylinder: 0, axis: 0 },
        OS: { sphere: -5.00, cylinder: 0, axis: 0 },
        spectacleWearing: true,
        adaptation: 'poor'
      }
    }
  },
  {
    id: 'bx_02',
    name: 'Basic Exo - 中度（35歲）',
    description: '遠近皆中度外斜、症狀較明顯',
    expectedDiagnosis: 'BX',
    data: {
      age: 35, gender: 'female', pd: 62, ciss: 23, stereo: 60, npc: 7,
      nra: 1.5, pra: -2.0, mem: 0.75, aaOD: 8, aaOS: 8, flipper: 8,
      dist_phoria: -4, near_phoria: -6, bi_break: 8, bo_break: 14,
      dist_bi_break: 5, dist_bo_break: 12, vergence_facility: 10
    }
  },
  {
    id: 'be_01',
    name: 'Basic Eso - 輕度（29歲）',
    description: '遠近皆內斜、差異小',
    expectedDiagnosis: 'BE',
    data: {
      age: 29, gender: 'male', pd: 60, ciss: 20, stereo: 40, npc: 5,
      nra: 1.5, pra: -3.0, mem: 0.5, aaOD: 10, aaOS: 10, flipper: 9,
      dist_phoria: 3, near_phoria: 5, bi_break: 8, bo_break: 20,
      dist_bi_break: 8, dist_bo_break: 18, vergence_facility: 11
    }
  },
  {
    id: 'ai_01',
    name: 'AI - 輕度（38歲）',
    description: '調節幅度低於預期、MEM 滯後',
    expectedDiagnosis: 'AI',
    data: {
      age: 38, gender: 'female', pd: 61, ciss: 22, stereo: 40, npc: 6,
      nra: 1.0, pra: -3.5, mem: 1.0, aaOD: 4, aaOS: 4, flipper: 6,
      dist_phoria: 0, near_phoria: -3, bi_break: 10, bo_break: 16,
      dist_bi_break: 7, dist_bo_break: 16, vergence_facility: 10
    }
  },
  {
    id: 'ai_02',
    name: 'AI - 中度（42歲）',
    description: '調節幅度明顯不足、flipper 低、症狀高',
    expectedDiagnosis: 'AI',
    data: {
      age: 42, gender: 'male', pd: 63, ciss: 26, stereo: 40, npc: 7,
      nra: 0.5, pra: -4.0, mem: 1.25, aaOD: 3, aaOS: 3, flipper: 4,
      dist_phoria: 0, near_phoria: -4, bi_break: 9, bo_break: 15,
      dist_bi_break: 6, dist_bo_break: 15, vergence_facility: 9
    }
  },
  {
    id: 'aifi_01',
    name: 'AIFI - 中度（27歲）',
    description: '調節 flipper 低、其他尚可',
    expectedDiagnosis: 'AIFI',
    data: {
      age: 27, gender: 'female', pd: 62, ciss: 19, stereo: 40, npc: 6,
      nra: 2.0, pra: -2.5, mem: 0.75, aaOD: 10, aaOS: 10, flipper: 5,
      dist_phoria: 0, near_phoria: -3, bi_break: 11, bo_break: 17,
      dist_bi_break: 7, dist_bo_break: 16, vergence_facility: 11
    }
  },
  {
    id: 'de_01',
    name: 'DE - 中度（22歲）',
    description: '遠距外斜明顯大於近距、高 AC/A',
    expectedDiagnosis: 'DE',
    data: {
      age: 22, gender: 'male', pd: 65, ciss: 20, stereo: 60, npc: 6,
      nra: 2.0, pra: -2.0, mem: 0.5, aaOD: 12, aaOS: 12, flipper: 10,
      dist_phoria: -8, near_phoria: -2, bi_break: 10, bo_break: 16,
      dist_bi_break: 4, dist_bo_break: 10, vergence_facility: 12
    }
  },
  {
    id: 'di_01',
    name: 'DI - 輕度（45歲）',
    description: '遠距內斜、低 AC/A',
    expectedDiagnosis: 'DI',
    data: {
      age: 45, gender: 'female', pd: 59, ciss: 18, stereo: 40, npc: 6,
      nra: 1.5, pra: -3.0, mem: 0.5, aaOD: 4, aaOS: 4, flipper: 8,
      dist_phoria: 4, near_phoria: 1, bi_break: 9, bo_break: 18,
      dist_bi_break: 6, dist_bo_break: 16, vergence_facility: 10
    }
  },
  {
    id: 'ae_01',
    name: 'AE - 輕度（20歲）',
    description: '調節過度、MEM 超前',
    expectedDiagnosis: 'AE',
    data: {
      age: 20, gender: 'male', pd: 63, ciss: 21, stereo: 40, npc: 5,
      nra: 3.5, pra: -1.0, mem: -0.25, aaOD: 14, aaOS: 14, flipper: 7,
      dist_phoria: 0, near_phoria: 2, bi_break: 10, bo_break: 18,
      dist_bi_break: 8, dist_bo_break: 18, vergence_facility: 11
    }
  },
  // ============ 黃金測試案例 (Golden Cases) ============
  {
    id: 'ci_gold_01',
    name: '【黃金】學童典型 CI（10歲）',
    description: 'Symptomatic CI in school-age child (VT recommended)',
    expectedDiagnosis: 'CI',
    expected_primary_diagnosis: 'Symptomatic CI in school-age child (VT recommended)',
    expected_priority: 'Treat',
    data: {
      age: 10, gender: 'male', pd: 56, ciss: 28, stereo: 80, npc: 11,
      nra: 2.25, pra: -3.0, mem: 0.50, aaOD: 14, aaOS: 14, flipper: 10,
      dist_phoria: 0, near_phoria: -9, bi_break: 12, bo_break: 12,
      dist_bi_break: 6, dist_bo_break: 16, vergence_facility: 6
    }
  },
  {
    id: 'ai_gold_01',
    name: '【黃金】年輕成人典型 AI（25歲）',
    description: 'Accommodative insufficiency in young adult (VT and/or near add)',
    expectedDiagnosis: 'AI',
    expected_primary_diagnosis: 'Accommodative insufficiency in young adult (VT and/or near add)',
    expected_priority: 'Treat',
    data: {
      age: 25, gender: 'female', pd: 62, ciss: 24, stereo: 40, npc: 5,
      nra: 1.25, pra: -1.5, mem: 0.75, aaOD: 7, aaOS: 6.5, flipper: 4,
      dist_phoria: 1, near_phoria: 0, bi_break: 12, bo_break: 18,
      dist_bi_break: 8, dist_bo_break: 16, vergence_facility: 12
    }
  },
  {
    id: 'bx_gold_01',
    name: '【黃金】典型 Basic Exo（20歲）',
    description: 'Basic exophoria with reduced PFV (VT recommended)',
    expectedDiagnosis: 'BX',
    expected_primary_diagnosis: 'Basic exophoria with reduced PFV (VT recommended)',
    expected_priority: 'Treat',
    data: {
      age: 20, gender: 'male', pd: 64, ciss: 20, stereo: 40, npc: 7,
      nra: 2.0, pra: -2.5, mem: 0.5, aaOD: 12, aaOS: 12, flipper: 10,
      dist_phoria: -6, near_phoria: -8, bi_break: 10, bo_break: 12,
      dist_bi_break: 5, dist_bo_break: 10, vergence_facility: 8
    }
  },
  {
    id: 'normal_high_myopia_01',
    name: '【黃金】高近視但 BV 正常（30歲）',
    description: 'High myopia with normal BV (ergonomic advice, monitor)',
    expectedDiagnosis: 'NORMAL',
    expected_primary_diagnosis: 'High myopia with normal BV (ergonomic advice, monitor)',
    expected_priority: 'Monitor',
    data: {
      age: 30, gender: 'female', pd: 62, ciss: 14, stereo: 40, npc: 5,
      nra: 2.25, pra: -2.75, mem: 0.5, aaOD: 10, aaOS: 10, flipper: 14,
      dist_phoria: -1, near_phoria: -2, bi_break: 14, bo_break: 20,
      dist_bi_break: 8, dist_bo_break: 18, vergence_facility: 14,
      refraction: {
        OD: { sphere: -8.00, cylinder: -0.75, axis: 180 },
        OS: { sphere: -8.25, cylinder: -0.50, axis: 175 },
        spectacleWearing: true,
        adaptation: 'good'
      }
    }
  },
  // ============ 進階臨床測試案例 (Advanced Clinical Cases) ============
  {
    id: 'digital-eye-strain-28m',
    name: '數位眼疲勞｜軟體工程師（28歲）',
    description: '每天電腦使用 >10 小時，下午易頭痛，工作距離過近（AA deficit < 2D，診斷為 CI）',
    expectedDiagnosis: 'CI',
    expected_primary_diagnosis: 'Convergence Insufficiency - 融像訓練 + 調節輔助（v2.0診斷標準）',
    expected_priority: 'Treat',
    data: {
      age: 28, gender: 'male', pd: 63, ciss: 38, stereo: 40, npc: 8,
      nra: 2.5, pra: -1.75, mem: 1.0, aaOD: 10, aaOS: 10, flipper: 6,
      dist_phoria: -1, near_phoria: -6, bi_break: 12, bo_break: 20,
      dist_bi_break: 10, dist_bo_break: 18, vergence_facility: 8,
      refraction: {
        OD: { sphere: -3.00, cylinder: -0.25, axis: 180 },
        OS: { sphere: -3.25, cylinder: -0.50, axis: 5 },
        spectacleWearing: true,
        adaptation: 'good'
      }
    }
  },
  {
    id: 'myopia-control-10f',
    name: '近視控制｜小四學生（10歲）',
    description: '父母雙方高度近視，近一年度數增加 -1.00D，已使用 Atropine 0.01%，調節反應遲滯',
    expectedDiagnosis: 'AI',
    expected_primary_diagnosis: '調節遲滯 (兒童 AI) + 近視控制需求 - 離焦設計鏡片 + Atropine + 增加戶外活動',
    expected_priority: 'Treat',
    data: {
      // 調整：AA 設定為明顯低於預期 (Hofstetter min for 10y = 12.5D, 設為 8D = deficit 4.5D)
      // MEM lag 高 (1.25D) + 症狀中等 (CISS 18) + 輕度外斜
      age: 10, gender: 'female', pd: 56, ciss: 18, stereo: 40, npc: 5,
      nra: 1.5, pra: -3.0, mem: 1.25, aaOD: 8, aaOS: 8, flipper: 8,
      dist_phoria: -2, near_phoria: -4, bi_break: 18, bo_break: 28,
      dist_bi_break: 14, dist_bo_break: 22, vergence_facility: 14,
      refraction: {
        OD: { sphere: -3.00, cylinder: -0.50, axis: 180 },
        OS: { sphere: -3.50, cylinder: -0.75, axis: 5 },
        spectacleWearing: true,
        adaptation: 'good'
      }
    }
  },
  {
    id: 'presbyopia-early-48f',
    name: '老花初期｜中年主管（48歲）',
    description: '近 6 個月開始看近模糊，需拿遠才能看清，長時間電腦工作，調節反應正常但僵化',
    expectedDiagnosis: 'AE',
    expected_primary_diagnosis: '老花 AE (調節僵化) - 調節放鬆訓練 + 抗疲勞鏡片 ADD +1.00',
    expected_priority: 'Treat',
    data: {
      // 老花 AE 模式：BCC ≤+0.75D (0.50) + PRA 強 (-2.25D) + Flipper 低 (4)
      // NRA 高 (2.75) 表示代償性過度用力
      age: 48, gender: 'female', pd: 62, ciss: 22, stereo: 60, npc: 7,
      nra: 2.75, pra: -2.25, mem: 0.50, aaOD: 3.5, aaOS: 3.5, flipper: 4,
      dist_phoria: 0, near_phoria: 2, bi_break: 15, bo_break: 22,
      dist_bi_break: 12, dist_bo_break: 18, vergence_facility: 10,
      refraction: {
        OD: { sphere: 0.50, cylinder: -0.25, axis: 90 },
        OS: { sphere: 0.25, cylinder: -0.25, axis: 85 },
        spectacleWearing: false,
        adaptation: 'good'
      }
    }
  },
  {
    id: 'high-aca-ce-32f',
    name: '高 AC/A｜內聚過強（32歲）',
    description: '兒童時期曾有內斜視，近距離工作 2-3 小時後頭痛，曾配戴稜鏡眼鏡',
    expectedDiagnosis: 'CE',
    expected_primary_diagnosis: 'Convergence Excess (高 AC/A) - 近用 ADD +0.75 + BI 融像訓練',
    expected_priority: 'Treat',
    data: {
      age: 32, gender: 'female', pd: 61, ciss: 28, stereo: 40, npc: 5,
      nra: 1.5, pra: -3.5, mem: 0.25, aaOD: 12, aaOS: 12, flipper: 12,
      dist_phoria: -2, near_phoria: 8, bi_break: 10, bo_break: 28,
      dist_bi_break: 14, dist_bo_break: 22, vergence_facility: 11,
      refraction: {
        OD: { sphere: -1.50, cylinder: 0, axis: 0 },
        OS: { sphere: -1.75, cylinder: 0, axis: 0 },
        spectacleWearing: true,
        adaptation: 'good'
      }
    }
  },
  {
    id: 'athlete-excellent-22m',
    name: '運動員｜羽球選手（22歲）',
    description: '職業羽球選手，視覺要求極高，每週訓練 >20 小時',
    expectedDiagnosis: 'NORMAL',
    expected_primary_diagnosis: '優秀視覺機能 - 維持現狀 + 每 6 個月追蹤',
    expected_priority: 'Monitor',
    data: {
      age: 22, gender: 'male', pd: 65, ciss: 6, stereo: 20, npc: 4,
      nra: 2.5, pra: -2.75, mem: 0.25, aaOD: 16, aaOS: 16, flipper: 16,
      dist_phoria: -1, near_phoria: -3, bi_break: 22, bo_break: 35,
      dist_bi_break: 20, dist_bo_break: 30, vergence_facility: 18,
      refraction: {
        OD: { sphere: -0.50, cylinder: 0, axis: 0 },
        OS: { sphere: -0.50, cylinder: 0, axis: 0 },
        spectacleWearing: false,
        adaptation: 'good'
      }
    }
  },
  {
    id: 'vertical-phoria-headache-30f',
    name: '垂直斜位｜頭痛案例（30歲）',
    description: '長期頭痛（額頭、太陽穴），下午易複視，閱讀易跳行，頭部向右傾斜',
    expectedDiagnosis: 'NORMAL',
    expected_primary_diagnosis: '垂直斜位 (右眼上斜 +2Δ) - 稜鏡處方試戴 2Δ BD OD + 追蹤',
    expected_priority: 'Treat',
    data: {
      age: 30, gender: 'female', pd: 60, ciss: 24, stereo: 50, npc: 6,
      nra: 2.25, pra: -2.25, mem: 0.5, aaOD: 11, aaOS: 11, flipper: 11,
      dist_phoria: -1, near_phoria: -3, bi_break: 16, bo_break: 25,
      dist_bi_break: 14, dist_bo_break: 20, vergence_facility: 12,
      refraction: {
        OD: { sphere: -1.00, cylinder: -0.25, axis: 180 },
        OS: { sphere: -1.25, cylinder: -0.50, axis: 5 },
        spectacleWearing: true,
        adaptation: 'good'
      }
    }
  },
  {
    id: 'ci-severe-24m',
    name: 'CI 重度｜年輕成人（24歲）',
    description: '長期閱讀困難，近距離工作 30 分鐘後複視，需閉單眼才能持續閱讀',
    expectedDiagnosis: 'CI',
    expected_primary_diagnosis: 'Convergence Insufficiency (重度) - 視覺訓練 BO 強化 + 近用稜鏡 BO 6-8Δ',
    expected_priority: 'Treat',
    data: {
      age: 24, gender: 'male', pd: 64, ciss: 42, stereo: 60, npc: 15,
      nra: 2.5, pra: -2.0, mem: 0.5, aaOD: 13, aaOS: 13, flipper: 9,
      dist_phoria: -4, near_phoria: -12, bi_break: 18, bo_break: 10,
      dist_bi_break: 14, dist_bo_break: 14, vergence_facility: 8,
      refraction: {
        OD: { sphere: -2.00, cylinder: 0, axis: 0 },
        OS: { sphere: -2.00, cylinder: 0, axis: 0 },
        spectacleWearing: true,
        adaptation: 'good'
      }
    }
  },
  {
    id: 'divergence-excess-16m',
    name: 'Divergence Excess｜高中生（16歲）',
    description: '遠距離視物易疲勞，陽光下睜不開眼（單眼抑制），遠方看黑板複視',
    expectedDiagnosis: 'DE',
    expected_primary_diagnosis: 'Divergence Excess - 遠用 BI 訓練，可能需手術評估（遠近斜位差 >6Δ）',
    expected_priority: 'Treat',
    data: {
      age: 16, gender: 'male', pd: 62, ciss: 24, stereo: 40, npc: 5,
      nra: 2.25, pra: -2.75, mem: 0.25, aaOD: 15, aaOS: 15, flipper: 14,
      dist_phoria: -10, near_phoria: -4, bi_break: 16, bo_break: 25,
      dist_bi_break: 10, dist_bo_break: 20, vergence_facility: 13,
      refraction: {
        OD: { sphere: -1.50, cylinder: -0.25, axis: 180 },
        OS: { sphere: -1.75, cylinder: -0.50, axis: 5 },
        spectacleWearing: true,
        adaptation: 'good'
      }
    }
  },
  {
    id: 'post-surgery-18f',
    name: '術後評估｜斜視手術 6 個月（18歲）',
    description: '6 個月前內斜視手術（雙眼內直肌後徙），術前立體視 >400"，正進行視覺訓練',
    expectedDiagnosis: 'NORMAL',
    expected_primary_diagnosis: '術後追蹤 - 立體視恢復中，持續融像訓練 + 每月追蹤',
    expected_priority: 'Monitor',
    data: {
      age: 18, gender: 'female', pd: 59, ciss: 18, stereo: 100, npc: 6,
      nra: 2.0, pra: -2.5, mem: 0.25, aaOD: 14, aaOS: 14, flipper: 12,
      dist_phoria: -1, near_phoria: -2, bi_break: 12, bo_break: 18,
      dist_bi_break: 10, dist_bo_break: 16, vergence_facility: 10,
      refraction: {
        OD: { sphere: -0.50, cylinder: 0, axis: 0 },
        OS: { sphere: -0.75, cylinder: 0, axis: 0 },
        spectacleWearing: false,
        adaptation: 'good'
      }
    }
  },
  {
    id: 'presbyopia-advanced-65m',
    name: '老花重度｜退休人員（65歲）',
    description: '已配戴老花眼鏡 15 年，近 2 年度數快速增加，BCC lag 明顯，真正調節喪失',
    expectedDiagnosis: 'AI',
    expected_primary_diagnosis: '老花 AI (真正調節喪失) - 漸進多焦點鏡片 ADD +2.50 或辦公型/閱讀型鏡片',
    expected_priority: 'Treat',
    data: {
      // 老花 AI 模式：BCC ≥+1.25D (1.50) + AA 嚴重不足 (<50% expected) + NRA 低 (1.25)
      // Hofstetter avg for 65y = 18.5 - 0.3*65 = -1.0 → 使用 min 0
      // AA = 0.75D 遠低於預期
      age: 65, gender: 'male', pd: 61, ciss: 20, stereo: 80, npc: 10,
      nra: 1.25, pra: -0.5, mem: 1.50, aaOD: 0.75, aaOS: 0.75, flipper: 2,
      dist_phoria: 0, near_phoria: 1, bi_break: 12, bo_break: 20,
      dist_bi_break: 10, dist_bo_break: 16, vergence_facility: 8,
      refraction: {
        OD: { sphere: 1.00, cylinder: -0.50, axis: 90 },
        OS: { sphere: 0.75, cylinder: -0.75, axis: 85 },
        spectacleWearing: true,
        adaptation: 'good'
      }
    }
  }
];
