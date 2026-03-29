import { useState, useCallback } from "react";
import DemoInputCard from "@/components/demo-landing/DemoInputCard";
import DemoResultCard from "@/components/demo-landing/DemoResultCard";
import BenefitsSection from "@/components/demo-landing/BenefitsSection";
import TrialCtaSection from "@/components/demo-landing/TrialCtaSection";
import DemoLoginSection from "@/components/demo-landing/DemoLoginSection";
import ReviewImpactSection from "@/components/demo-landing/ReviewImpactSection";

// Industry-aware mock review snippets — placeholder until real AI is wired
const INDUSTRY_SNIPPETS: Record<string, string> = {
  // 醫療保健
  optical: "驗光的時候超仔細，每個步驟都會先解釋，不會像有些地方隨便量一下就叫你配。鏡片選擇也多，老闆還會根據你的用途推薦，不會硬推貴的",
  dental: "護理師很親切，會先跟你說接下來要做什麼，不會突然就開始弄。醫師技術也很好，洗牙的過程比我之前去的地方舒服很多",
  physiotherapy: "治療師很專業，會先評估你的狀況再安排療程，不會一來就亂拉一通。每次治療完都覺得有明顯改善",
  rehab_clinic: "復健的過程很有耐心，醫師會詳細解釋每個動作的目的。儀器也蠻新的，整體環境很乾淨",
  tcm_clinic: "醫師把脈很仔細，問診也不會趕趕的。針灸的時候會先跟你說會有什麼感覺，讓人比較放心",
  family_med: "醫師很細心，不會隨便開藥打發你。會把檢查結果解釋得很清楚，連家人的健康問題也一起關心",
  pediatric: "醫師對小朋友很有耐心，不會讓小孩害怕。護理師也會幫忙安撫情緒，看診過程比想像中順利很多",
  eye_clinic: "檢查很仔細，每個儀器都會先說明用途。醫師解釋病情很清楚，不會用一堆專業術語讓人聽不懂",
  obgyn: "醫師很溫柔，會先跟你溝通才開始檢查，整個過程不會不舒服。護理師也很貼心，讓人很安心",
  audiology: "聽力檢查做得很仔細，聽力師會耐心解釋每項結果。助聽器的試戴也不會強迫你馬上決定",
  speech_therapy: "治療師很有方法，會用遊戲的方式引導小朋友開口。每次上完課都有感覺到進步",
  psychotherapy: "治療師讓人感覺很安全，不會有被評斷的感覺。每次談話都能幫助我釐清一些糾結的想法",
  counseling: "諮商師很溫暖，會很認真聽你說話。環境也很隱密舒適，讓人可以放心地表達",
  occupational_therapy: "治療師會針對日常生活需求設計訓練，很實用。每次都能看到一點點進步，很有成就感",
  imaging_center: "檢查流程很順暢，不用等太久。技術師會先說明過程，報告出來也很快",
  medical_lab: "抽血的技術很好，幾乎不痛。報告出來的速度也蠻快的，櫃檯人員態度也很親切",
  psychiatry: "醫師很有耐心地聽完我的狀況，不會只開藥了事。回診時也會追蹤改善情形",
  dermatology: "醫師看得很仔細，不會隨便開個藥膏就打發你。治療方式也會解釋清楚，讓你知道為什麼這樣用",
  orthopedics: "醫師檢查得很仔細，X光片也會拿出來一起看。復健的建議很實用，恢復得比預期快",
  rehab_med: "醫師會根據你的狀況調整復健計畫，不是千篇一律。治療師也很專業，每次都有進步",

  // 美容健康
  hair_salon: "設計師很會聽客人想法，不會自己亂剪。洗頭也很舒服，整個過程很放鬆。最後造型出來的效果超滿意",
  barber_shop: "師傅手法俐落，不囉嗦。剪完很清爽，邊角修得很乾淨。價格也很實在",
  budget_haircut: "雖然是平價但完全不馬虎，剪完的層次感很好。速度快又不用等太久，CP 值超高",
  perm_color_salon: "設計師在燙染前會先評估髮質，不會硬做。過程中也會注意你的感受，成果超滿意",
  nail_studio: "美甲師很細心，會先跟你討論款式再開始做。手法很穩，做出來的效果跟圖片一樣漂亮",
  eyelash_studio: "美睫師很專業，會先確認你想要的濃密度。過程舒服到差點睡著，做完效果超自然",
  nail_lash_combo: "美甲跟美睫一次搞定，很方便。兩邊的技師都很專業，出來的效果都很滿意",
  beauty_spa: "環境超舒服，一進去就覺得很放鬆。美容師的手法很好，做完臉整個亮了一個色號",
  facial_studio: "美容師會先看膚質再決定用什麼產品，不會千篇一律。做完皮膚摸起來滑滑嫩嫩的",
  body_massage: "按摩師的力道剛剛好，會先問你哪裡比較緊。按完整個人輕鬆很多，睡眠品質也變好了",
  aroma_massage: "精油的味道超舒服，按摩師會根據你的狀況調配。整個過程像在度假一樣放鬆",
  korean_skin: "療程很有系統，每個步驟都會先說明。做完皮膚真的有差，朋友都問我是不是去做了什麼",
  problem_skin: "美容師很專業，會分析你的膚況再建議療程。不會一直推銷課程，讓人感覺很安心",
  med_beauty: "醫師諮詢很仔細，不會一直推銷。術後也會追蹤恢復狀況，效果很自然",
  laser_center: "醫師操作很穩，過程中都會跟你溝通感受。術後照顧說明也很清楚，恢復得蠻快的",
  injection_clinic: "醫師會先溝通你想要的效果，不會打太多。下針很快幾乎不痛，出來的效果很自然",
  tattoo_brow: "紋繡師會先根據你的臉型畫出眉型讓你確認。手法很輕，過程不太痛，效果超自然",
  tattoo_skin_combo: "可以一次做紋繡加保養，很方便。兩邊的技師都很專業，服務態度也很好",
  body_sculpt: "療程前會先做身體評估，不會亂推課程。做完有感覺到線條變緊實，效果比預期好",
  custom_196096_mmkcee0f: "師傅很有個人風格，剪之前會先了解你的日常造型習慣。每次剪完都覺得很有質感",

  // 汽車機車
  auto_service: "師傅檢查得很仔細，不會亂報修。維修過程也會拍照讓你看，價格透明不會亂加",
  motorcycle_shop: "老闆很實在，會先告訴你哪些需要修哪些還可以撐。不會像有些車行一直叫你換零件",
  tire_shop: "定位做得很精準，換完輪胎方向盤不會偏了。師傅也會建議你適合的胎款，不會硬推最貴的",
  car_detailing: "師傅做得很仔細，每個細節都不馬虎。鍍膜完車子亮到像新車一樣，效果維持得也很久",
  car_wash: "洗得很乾淨，連輪框跟門縫都有注意到。內裝也吸得很徹底，CP 值很高",
  used_car: "老闆很實在，車況說明得很清楚，不會隱瞞什麼。該有的保固也都有，買得很安心",

  // 寵物服務
  pet_hospital: "醫師很有耐心地幫毛孩檢查，不會因為牠緊張就草草了事。也會詳細解釋病況跟後續照顧方式，讓人很安心",
  pet_grooming: "美容師對毛孩很溫柔，不會硬拉硬拽。洗完澡剪完毛整個變超可愛，每次都很期待接牠回家",
  pet_hotel: "環境很乾淨，每天都會傳照片讓你看毛孩的狀況。工作人員也很有愛心，接回來的時候毛孩很開心",
  pet_store: "商品種類很齊全，店員也很懂寵物。會根據毛孩的品種跟年齡推薦適合的飼料跟用品",

  // 餐飲
  bento_shop: "菜色選擇多，每道菜都很入味。飯量也很足，吃完很飽。重點是老闆會記得熟客的口味",
  set_meal: "定食的份量很剛好，每道都有用心做。湯也是現熬的，整體吃起來很有家的感覺",
  cafe: "空間很舒服，適合一個人來坐一下午。咖啡水準穩定，甜點也不會太甜，整體氛圍很好",
  brunch: "餐點擺盤很漂亮，拍照超上相。口味也不錯，飲料可以選的種類也多。假日來吃心情超好",
  hotpot: "湯底很有層次，食材也很新鮮。肉片的厚度剛好，海鮮也沒有腥味。吃到最後湯還是很好喝",
  bbq_restaurant: "肉質很好，醃料入味但不會太鹹。排煙設備也做得不錯，吃完身上不會有很重的味道",
  bubble_tea: "茶味很香，甜度跟冰塊都可以調整。珍珠煮得 Q 彈有嚼勁，每次經過都忍不住買一杯",
  noodle_snack: "麵條很有彈性，湯頭是每天現熬的。小菜也很入味，難怪每次經過都在排隊",
  bakery: "麵包都是當天現做的，出爐時間一到香味超誘人。甜點也不會太膩，送禮自己吃都很適合",

  // 教育
  cram_school: "老師教得很有系統，會根據學生的程度調整進度。孩子上了之後成績真的有進步",
  after_school: "老師很有耐心，會盯功課也會教生活習慣。環境也很安全，接送也很方便",
  language_school: "老師都是外師，上課氣氛很活潑。不會只背單字，而是用對話的方式學，進步很快",
  art_class: "老師很會引導小朋友發揮創意，不會硬要大家畫一樣的。每次帶作品回家都讓人驚喜",
  cert_school: "老師的教材整理得很好，重點都有抓到。考前的模擬題也很有幫助，一次就考過了",
  online_learning: "課程內容很扎實，可以反覆看。老師講解也很清楚，遇到問題還可以線上問",

  // 宗教文化
  temple: "廟裡環境很莊嚴，工作人員都很親切，第一次來也不會覺得不知道怎麼拜。點燈的流程也說明得很清楚",

  // 休閒娛樂
  gym: "器材蠻齊全的，而且維護得不錯。教練也不會一直推銷課程，讓人運動起來很自在",
  yoga_pilates: "老師會注意每個人的動作是否正確，不會只顧著自己做。課後身體伸展開很舒服",
  board_game: "遊戲種類超多，店員也會教你怎麼玩。適合朋友聚會，一玩就停不下來",
  ktv: "音響設備很好，包廂空間也夠大。歌曲更新蠻快的，飲料跟餐點的選擇也多",
  cinema: "座椅很舒服，銀幕也夠大。音效很震撼，看電影的體驗很好。買票取票也很方便",
  kids_playground: "設施很乾淨也很安全，小朋友玩得超開心。工作人員也會注意小朋友的安全",
  escape_room: "關卡設計得很有創意，提示也給得剛好。工作人員態度很好，結束後還會幫忙拍照",

  // 零售
  grocery: "蔬菜水果都很新鮮，老闆會推薦當季的好貨。價格也很合理，比超市便宜很多",
  hypermarket: "東西種類齊全，動線也規劃得不錯。常常有特價活動，買日用品來這裡最划算",
  fashion_boutique: "店員很會搭配，不會強迫你買。衣服的質感都不錯，穿出去常被朋友問在哪買的",
  shoe_store: "款式選擇多，店員也很專業。會幫你量腳型推薦適合的鞋款，試穿也不會有壓力",
  electronics: "店員很懂產品，不會只推最貴的。會根據你的需求推薦適合的規格，售後服務也很好",
  bookstore: "書的種類很齊全，環境也很舒服。店員推薦的書都蠻好看的，每次來都會多帶幾本",
  pharmacy: "藥師很專業，會仔細說明用藥方式。商品擺放也很整齊，要找什麼都很方便",
  home_goods: "商品種類多，質感也都不錯。店員會根據你的需求推薦，每次來都會發現新東西",

  // 社團組織
  association: "活動辦得很用心，工作人員態度也很親切。加入之後認識了很多志同道合的朋友",
};

const CLOSING_LINES = [
  "整體來說蠻滿意的，之後有需要會再回來。",
  "覺得這次體驗很好，已經想好下次要帶家人一起來。",
  "會推薦給身邊有需要的朋友。",
  "下次有需要一定會再來，也會介紹朋友過來。",
  "難怪朋友一直推薦，果然沒讓人失望。",
];

function parseInput(input: string): { storeName: string; userHighlight: string } {
  const cleaned = input.replace(/\+/g, "、");
  const parts = cleaned.split(/[、，,]/).map((s) => s.trim()).filter(Boolean);
  const storeName = parts[0] || cleaned.trim().slice(0, 10);
  const userHighlight = parts.length > 1 ? parts.slice(1).join("、") : "";
  return { storeName, userHighlight };
}

function generateMockReview(input: string, industryId: string | null): string {
  const { storeName, userHighlight } = parseInput(input);

  const snippet =
    (industryId && INDUSTRY_SNIPPETS[industryId]) ||
    "每個細節都有注意到，服務流程很順暢，也不會讓人有壓力";

  const closing = CLOSING_LINES[Math.floor(Math.random() * CLOSING_LINES.length)];

  const sentences = [
    `第一次來${storeName}，本來只是路過想說進來看看，沒想到整體體驗比預期好很多。`,
    userHighlight ? `最有印象的是：${userHighlight}。` : "",
    `${snippet}。`,
    closing,
  ].filter(Boolean);

  return sentences.join("");
}

const DemoLandingPage = () => {
  const [review, setReview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(async (input: string, industryId: string | null, _industryLabel: string | null) => {
    setIsGenerating(true);
    setReview(null);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1800 + Math.random() * 1200));

    const result = generateMockReview(input, industryId);
    setReview(result);
    setIsGenerating(false);

    // Scroll to result
    setTimeout(() => {
      document.getElementById("demo-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-8 sm:py-12 space-y-10">
        {/* Section 1: Hero + Demo Input */}
        <section className="space-y-6">
          <div className="space-y-3 text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight tracking-tight">
              讓顧客幫你寫出
              <br />
              <span className="text-primary">「看了就想來」</span>
              <br />
              的 Google 評論
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-sm mx-auto">
              輸入你的店名＋服務，30 秒看到系統幫你整理出一篇「真實、好懂、會說服新客」的評論草稿。
            </p>
          </div>

          <DemoInputCard onGenerate={handleGenerate} isGenerating={isGenerating} />
        </section>

        {/* Section 2: Demo Result */}
        <div id="demo-result">
          <DemoResultCard review={review} />
        </div>

        {/* Section 3: Review Impact */}
        <ReviewImpactSection />

        {/* Section 4: Benefits */}
        <BenefitsSection />

        {/* Section 4: CTA */}
        <TrialCtaSection />

        {/* Section 5: Member Login */}
        <DemoLoginSection />

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          © {new Date().getFullYear()} Myownreviews — 讓好評自己來
        </p>
      </div>
    </div>
  );
};

export default DemoLandingPage;
