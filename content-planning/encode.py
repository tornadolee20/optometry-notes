import base64

html_code = """<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CISS V-15 雙眼視覺症狀量表</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap');
        body { 
            font-family: 'Noto Sans TC', sans-serif; 
            background-color: #f8fafc; 
            color: #1e293b;
            line-height: 1.6;
        }
        .option-btn.active { 
            background-color: #2563eb !important; 
            color: white !important; 
            border-color: #2563eb !important; 
            transform: scale(1.02);
            box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.2);
        }
        .fade-in { animation: fadeIn 0.6s ease-out forwards; }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .sticky-score {
            box-shadow: 0 -10px 25px -5px rgba(0, 0, 0, 0.05);
        }
    </style>
</head>
<body class="py-8 px-4 md:py-16">
    <div class="max-w-3xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 fade-in">
        
        <!-- Header Section -->
        <div class="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-10 text-white text-center">
            <h1 class="text-3xl md:text-4xl font-black mb-3 tracking-tight">CISS V-15</h1>
            <p class="text-xl font-bold mb-2">雙眼視覺症狀量表</p>
            <div class="h-1 w-16 bg-blue-400 mx-auto rounded-full opacity-50 mb-4"></div>
            <p class="text-blue-100 opacity-80 text-sm italic">Convergence Insufficiency Symptom Survey</p>
        </div>

        <!-- Instructions Panel -->
        <div class="p-8 bg-blue-50/50 border-b border-blue-100">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div class="bg-white p-5 rounded-2xl shadow-sm border border-blue-100">
                    <div class="flex items-center mb-3">
                        <span class="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded mr-2 uppercase">Staff</span>
                        <span class="font-bold text-blue-900 text-xs">臨床人員指示</span>
                    </div>
                    <p class="text-slate-600 italic leading-relaxed">請逐題照題目念給受測者聽。若受測者回答「有」，請進一步詢問頻率選項。請勿舉例說明。</p>
                </div>
                <div class="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100">
                    <div class="flex items-center mb-3">
                        <span class="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded mr-2 uppercase">Subject</span>
                        <span class="font-bold text-indigo-900 text-xs">受測者指示</span>
                    </div>
                    <p class="text-slate-600 leading-relaxed">以下問題關於您閱讀或近距離工作時的感受。請判斷是否有此症狀並告知發生頻率。</p>
                </div>
            </div>
        </div>

        <!-- Questionnaire Container -->
        <div id="quiz-container" class="p-8 md:p-12 space-y-12">
            <div class="text-center py-20 text-slate-400">
                <svg class="animate-spin h-8 w-8 mx-auto mb-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p class="font-medium">測驗模組載入中...</p>
            </div>
        </div>

        <!-- Live Score Display -->
        <div class="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-100 p-5 flex justify-between items-center sticky-score z-10">
            <div class="flex items-center space-x-4">
                <div class="bg-blue-50 p-3 rounded-xl">
                    <span class="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-0.5">SCORE</span>
                    <div class="flex items-baseline leading-none">
                        <span id="total-score" class="text-3xl font-black text-blue-600 mr-1">0</span>
                        <span class="text-slate-400 text-xs font-bold">/ 60</span>
                    </div>
                </div>
            </div>
            <div id="progress-container" class="text-right">
                <div id="progress-text" class="text-slate-500 text-xs font-bold mb-1">完成度 0 / 15</div>
                <div class="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div id="progress-bar" class="h-full bg-blue-600 transition-all duration-300" style="width: 0%"></div>
                </div>
            </div>
        </div>

        <!-- Final Analysis Section -->
        <div id="analysis-section" class="hidden p-10 bg-slate-900 text-white fade-in">
            <h3 class="text-2xl font-black mb-6 flex items-center tracking-tight">
                <span class="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-blue-500/30 text-lg">!</span>
                專業分析結果報告
            </h3>
            <div id="result-box" class="p-8 rounded-[2rem] bg-slate-800 border border-slate-700 relative overflow-hidden">
                <div id="result-badge" class="absolute top-4 right-6 text-[10px] font-black py-1 px-3 rounded-full uppercase tracking-tighter">Result</div>
                <div id="result-title" class="text-2xl font-black mb-4 pr-12">計算中...</div>
                <div id="result-desc" class="text-slate-300 text-lg leading-relaxed">請完成所有題目以查看臨床建議。</div>
            </div>
        </div>

        <!-- Professional Disclaimer Section -->
        <div class="p-8 md:p-12 bg-slate-50 border-t border-slate-100">
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h5 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                    <span class="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                    使用說明與聲明
                </h5>
                <div class="text-sm text-slate-600 space-y-4 leading-relaxed">
                    <p class="font-medium text-slate-800">【CISS 問卷使用說明】</p>
                    <p>
                        本問卷根據 Convergence Insufficiency Symptom Survey (CISS V-15) 原始英文版自行翻譯為繁體中文，僅供臨床溝通與家長自我檢視參考，<span class="text-blue-600 font-bold">非官方授權版本，不作為正式診斷依據。</span>
                    </p>
                    <div class="pt-4 border-t border-slate-100">
                        <p class="text-[10px] text-slate-400 font-bold uppercase mb-1">References:</p>
                        <p class="text-[11px] text-slate-500 italic">
                            Rouse M, et al. (2004). Validity and reliability of the CISS. Optom Vis Sci. PMID: 15545807
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="p-6 text-center text-[10px] text-slate-400 bg-white border-t border-slate-50">
            &copy; 2026 社團法人新北市驗光師公會 專業翻譯提供
        </div>
    </div>

    <script>
        window.onload = function() {
            const questions = [
                "閱讀或做近距離工作時，眼睛會感到疲累嗎？",
                "閱讀或做近距離工作時，眼睛會感到不舒服嗎？",
                "閱讀或做近距離工作時，會頭痛嗎？",
                "閱讀或做近距離工作時，會想睡覺嗎？",
                "閱讀或做近距離工作時，會失去專注力嗎？",
                "閱讀或做近距離工作時，會記不住剛剛讀過的內容嗎？",
                "閱讀或做近距離工作時，會看到雙重影像嗎？",
                "閱讀或做近距離工作時，會看到文字在移動、跳動、游動或漂浮嗎？",
                "您會覺得自己讀書讀得很慢嗎？",
                "閱讀或做近距離工作時，眼睛會感到疼痛嗎？",
                "閱讀或做近距離工作時，眼睛會感到痠澀嗎？",
                "閱讀或做近距離工作時，眼睛周圍會有「被拉扯」的感覺嗎？",
                "閱讀或做近距離工作時，會注意到文字變模糊或忽清忽糊嗎？",
                "閱讀時，會跳行或找不到剛才讀到哪裡嗎？",
                "閱讀時，會需要重複讀同一行嗎？"
            ];

            const options = ["從不", "偶爾", "有時候", "蠻常有", "總是"];
            const answers = new Array(15).fill(null);
            const container = document.getElementById('quiz-container');

            // Render Questions
            container.innerHTML = ''; 
            questions.forEach((q, qIndex) => {
                const qDiv = document.createElement('div');
                qDiv.className = 'fade-in';
                qDiv.innerHTML = `<div class="mb-2"><p class="text-slate-800 font-bold mb-6 flex items-start text-xl leading-tight"><span class="bg-blue-600 text-white rounded-xl w-10 h-10 flex items-center justify-center text-sm mr-5 shrink-0 mt-0.5 shadow-md shadow-blue-200 font-black">${qIndex + 1}</span>${q}</p><div class="grid grid-cols-2 sm:grid-cols-5 gap-3 pl-0 md:pl-14">${options.map((opt, oIndex) => `<button onclick="selectOption(${qIndex}, ${oIndex})" id="btn-${qIndex}-${oIndex}" class="option-btn bg-white border-2 border-slate-100 py-4 px-2 text-xs md:text-sm rounded-2xl text-slate-500 font-bold hover:border-blue-200 hover:bg-blue-50 transition-all duration-300"><div class="text-[9px] opacity-40 mb-1 uppercase tracking-tighter">${oIndex} PT</div>${opt}</button>`).join('')}</div></div>`;
                container.appendChild(qDiv);
            });

            window.selectOption = function(qIdx, val) {
                for (let i = 0; i < 5; i++) {
                    document.getElementById(`btn-${qIdx}-${i}`).classList.remove('active');
                }
                document.getElementById(`btn-${qIdx}-${val}`).classList.add('active');
                answers[qIdx] = val;
                updateUI();
            };

            function updateUI() {
                const score = answers.reduce((a, b) => (a !== null && b !== null) ? a + b : a, 0);
                const answeredCount = answers.filter(a => a !== null).length;
                
                document.getElementById('total-score').innerText = score;
                document.getElementById('progress-text').innerText = `完成度 ${answeredCount} / 15`;
                document.getElementById('progress-bar').style.width = `${(answeredCount / 15) * 100}%`;

                if (answeredCount === 15) {
                    const analysisSection = document.getElementById('analysis-section');
                    analysisSection.classList.remove('hidden');
                    analysisSection.scrollIntoView({ behavior: 'smooth' });
                    
                    const resultTitle = document.getElementById('result-title');
                    const resultDesc = document.getElementById('result-desc');
                    const resultBox = document.getElementById('result-box');
                    const resultBadge = document.getElementById('result-badge');

                    if (score <= 15) {
                        resultTitle.innerText = "症狀輕微，定期追蹤";
                        resultTitle.className = "text-2xl font-black mb-4 text-green-400";
                        resultDesc.innerText = "目前得分顯示您的視覺疲勞狀況處於健康範圍。建議維持良好的閱讀與用眼姿勢，每 20-30 分鐘讓眼睛遠眺休息，並維持年度視力健康檢查。";
                        resultBox.className = "p-8 rounded-[2rem] bg-green-950/20 border border-green-500/30";
                        resultBadge.className = "absolute top-4 right-6 text-[10px] font-black py-1 px-3 rounded-full bg-green-500 text-white uppercase tracking-tighter";
                        resultBadge.innerText = "Low Risk";
                    } else if (score <= 21) {
                        resultTitle.innerText = "有明顯症狀，建議功能檢查";
                        resultTitle.className = "text-2xl font-black mb-4 text-orange-400";
                        resultDesc.innerText = "得分顯示您可能有中度的雙眼視覺失調風險。這些症狀可能會影響您的專注力與閱讀效率。建議儘早預約專業視光師進行「雙眼視覺功能篩查」，確認是否有隱斜位或調節力不足。";
                        resultBox.className = "p-8 rounded-[2rem] bg-orange-950/20 border border-orange-500/30";
                        resultBadge.className = "absolute top-4 right-6 text-[10px] font-black py-1 px-3 rounded-full bg-orange-500 text-white uppercase tracking-tighter";
                        resultBadge.innerText = "Moderate Risk";
                    } else {
                        resultTitle.innerText = "症狀顯著，強烈建議專業評估";
                        resultTitle.className = "text-2xl font-black mb-4 text-red-400";
                        resultDesc.innerText = "您的分數已顯著高於臨床常態值。這代表視覺壓力極可能正影響您的日常生活、學習或工作表現。強烈建議立即尋求視光師進行「完整的雙眼視覺評估與調節功能測量」，找出精確的視覺訓練或光學矯正方案。";
                        resultBox.className = "p-8 rounded-[2rem] bg-red-950/20 border border-red-500/30";
                        resultBadge.className = "absolute top-4 right-6 text-[10px] font-black py-1 px-3 rounded-full bg-red-500 text-white uppercase tracking-tighter";
                        resultBadge.innerText = "High Risk";
                    }
                }
            }
        };
    </script>
</body>
</html>"""

encoded = base64.b64encode(html_code.encode('utf-8')).decode('utf-8')
print(encoded)
