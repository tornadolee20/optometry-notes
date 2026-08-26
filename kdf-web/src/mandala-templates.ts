export interface MandalaDimensionTemplate {
  id: string;
  label: string;
  description: string;
  related_node_ids: string[];
  sub_questions: string[];
}

export interface MandalaTemplate {
  template_id: string;
  name: string;
  domain: string;
  eligible_root_ids: string[];
  dimensions: MandalaDimensionTemplate[];
}

export const mandalaTemplates: MandalaTemplate[] = [{
  template_id: "myopia-peripheral-defocus-v0.1",
  name: "周邊離焦研究曼陀羅",
  domain: "myopia-control-optometry",
  eligible_root_ids: ["KDF-001"],
  dimensions: [
    { id: "optics", label: "光學機制", description: "鏡片設計如何改變離軸成像與視網膜刺激。", related_node_ids: ["KDF-001-A"], sub_questions: ["不同 lenslet／離焦幾何如何改變離軸成像？", "眼睛轉動與頭部轉動會如何改變實際光路？", "中央清晰區與周邊區交界是否形成可感知變化？", "低對比或低照度會放大哪些光學限制？", "視網膜周邊離焦分布是否因屈光型態而異？", "基線 RPR 與鏡片光學作用可能如何交互？", "不同產品設計能否被視為同一機制？", "現有量測能否連結光學機制與日常感受？"] },
    { id: "quality", label: "視覺品質", description: "中央、離軸、對比與主觀品質的證據。", related_node_ids: ["KDF-001-B", "KDF-001-B-001", "EVC-KDF-001-B-001", "MKC-KDF-001-B-001"], sub_questions: ["中央視力正常時，哪些離軸品質仍可能下降？", "中周邊視力變化在兒童身上有多一致？", "低對比表現與高對比視力是否分離？", "低照度情境會不會出現不同結果？", "眩光、模糊或影像跳動目前如何量測？", "快速轉移視線時的瞬時品質是否被研究？", "主觀適應與客觀視覺品質是否同步？", "不同鏡片設計的視覺品質能否直接比較？"] },
    { id: "function", label: "視覺功能", description: "閱讀、搜尋、雙眼與動態任務表現。", related_node_ids: ["KDF-001-C", "KDF-001-B-001", "EVC-KDF-001-B-001"], sub_questions: ["閱讀速度與錯誤率是否受影響？", "視覺搜尋效率是否因離軸設計改變？", "立體視與深度判斷是否有可測差異？", "視野敏感度是否足以代表動態功能？", "調節與雙眼協調是否受到設計影響？", "快速頭眼協調任務應如何評估？", "走動中的視覺功能與靜態測試差多少？", "哪些測試最接近日常功能而非實驗室表現？"] },
    { id: "life", label: "真實生活", description: "樓梯、運動、戶外、夜間與依從性。", related_node_ids: ["KDF-001-D", "DQ-KDF-001-001", "DQ-KDF-001-002", "FOC-KDF-001-B-001", "PRC-KDF-001-B-001", "ULC-KDF-001-B-001"], sub_questions: ["走樓梯時的不適是否與離軸視覺有關？", "跑步或球類活動會暴露哪些功能差異？", "戶外活動中的視線切換是否需要獨立評估？", "夜間與低照度生活情境有哪些未解問題？", "課堂與閱讀任務是否反映同一種適應？", "不適是否影響配戴時間與治療依從性？", "症狀隨時間改善的軌跡有多大個體差異？", "兒童、家長與專業人員的回報如何交叉驗證？"] },
    { id: "adaptation", label: "神經適應", description: "時間歷程、知覺學習與策略改變。", related_node_ids: ["KDF-001-E", "DQ-KDF-001-001", "MKC-KDF-001-B-001"], sub_questions: ["適應通常在什麼時間尺度發生？", "測驗熟悉與真正神經適應如何區分？", "中央與周邊影像衝突是否會逐漸降低？", "配戴者是否改變頭眼移動策略？", "年齡會不會改變適應速度？", "持續不適者是否代表不同適應路徑？", "實驗室適應能否轉移到真實生活任務？", "哪些縱向量測能辨識個人適應軌跡？"] },
    { id: "individual", label: "個體差異", description: "基線特徵、反應者分層與設計匹配。", related_node_ids: ["KDF-001-F", "KDF-001-F-001"], sub_questions: ["基線 RPR 能否預測長期眼軸反應？", "基線視覺功能能否預測適應困難？", "近視進展速度是否改變治療反應？", "年齡與屈光狀態是否形成不同亞群？", "日常活動型態會不會影響適應與效果？", "鏡片設計與個人視覺特徵如何匹配？", "非反應者應如何被定義與重複驗證？", "哪些分層因素目前只有訊號、尚無正式證據？"] },
    { id: "tradeoff", label: "效果與代價", description: "眼軸控制效益與視覺、依從性代價。", related_node_ids: ["KDF-001-G", "KDF-001-B-001", "EVC-KDF-001-B-001", "MKC-KDF-001-B-001"], sub_questions: ["眼軸控制效果與視覺品質代價如何同時呈現？", "短期不適是否會降低長期配戴效益？", "客觀效果與主觀負擔如何共同決策？", "不同鏡片設計的 benefit–burden 是否不同？", "何種不適程度應觸發重新評估？", "長期有效是否足以抵銷持續功能困擾？", "替代近視管理方案應如何納入比較？", "兒童與家長如何理解不確定性與取捨？"] },
    { id: "blindspots", label: "研究盲區", description: "現有證據沒有回答、難以外推或尚待驗證之處。", related_node_ids: ["KDF-001-H", "DQ-KDF-001-001", "DQ-KDF-001-002"], sub_questions: ["實驗室視覺測試能否外推到真實生活？", "哪些日常 outcomes 長期缺席於研究？", "小樣本與產品差異限制了哪些結論？", "兒童長期視覺適應資料還缺少什麼？", "不同設計是否被不當合併推論？", "現場回饋要如何驗證後才能進研究？", "需要哪些共通量測才能跨研究比較？", "什麼結果會推翻目前最合理的解釋？"] },
  ],
}];

export function findMandalaTemplate(rootId: string) {
  return mandalaTemplates.find((template) => template.eligible_root_ids.includes(rootId));
}
