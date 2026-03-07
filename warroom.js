/* ============================================
   OPTIC WAR ROOM v3.0 — Functional Engine
   File System Access API + 即時編輯 + 備份
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ─── 全域狀態 ───
    let dirHandle = null;       // 工作區目錄 Handle
    let fileHandles = {};       // 已載入的檔案 Handles
    let loadedFiles = {};       // 已載入的檔案內容 { filename: content }

    const CORE_FILES = ['SOUL.md', 'AGENTS.md', 'MEMORY.md', 'USER.md', 'IDENTITY.md', 'TOOLS.md', 'HEARTBEAT.md'];

    // ─── DOM Elements ───
    const clockEl = document.getElementById('live-clock');
    const badgeEl = document.getElementById('system-badge');
    const badgeTextEl = document.getElementById('badge-text');
    const badgeDot = badgeEl.querySelector('.dot-pulse');
    const soulContent = document.getElementById('soul-content');
    const soulStatus = document.getElementById('soul-status');
    const userContent = document.getElementById('user-content');
    const memoryEditor = document.getElementById('memory-editor');
    const heartbeatEditor = document.getElementById('heartbeat-editor');
    const fileSelector = document.getElementById('file-selector');
    const fileViewerContent = document.getElementById('file-viewer-content');
    const integrityList = document.getElementById('integrity-list');
    const terminalEl = document.getElementById('terminal');
    const timelineEl = document.getElementById('timeline');
    const skillsGrid = document.getElementById('skills-grid');

    // Buttons
    const btnLoad = document.getElementById('btn-load-workspace');
    const btnSaveMemory = document.getElementById('btn-save-memory');
    const btnSaveHeartbeat = document.getElementById('btn-save-heartbeat');
    const btnScan = document.getElementById('btn-scan');
    const btnExport = document.getElementById('btn-export');
    const btnRefresh = document.getElementById('btn-refresh');

    // ─── Toast 通知 ───
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    }

    // ─── 即時時鐘 ───
    function updateClock() {
        clockEl.textContent = new Date().toLocaleTimeString('zh-TW', { hour12: false });
    }
    setInterval(updateClock, 1000);
    updateClock();

    // ─── Tab 導航 ───
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // ─── 粒子背景 ───
    const pCanvas = document.getElementById('particles');
    const pCtx = pCanvas.getContext('2d');
    let particles = [];

    function resizeParticles() { pCanvas.width = window.innerWidth; pCanvas.height = window.innerHeight; }
    resizeParticles();
    window.addEventListener('resize', resizeParticles);

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * pCanvas.width;
            this.y = Math.random() * pCanvas.height;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.5 + 0.1;
        }
        update() {
            this.x += this.speedX; this.y += this.speedY;
            if (this.x < 0 || this.x > pCanvas.width || this.y < 0 || this.y > pCanvas.height) this.reset();
        }
        draw() {
            pCtx.beginPath();
            pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            pCtx.fillStyle = `rgba(0, 210, 255, ${this.opacity})`;
            pCtx.fill();
        }
    }

    for (let i = 0; i < 60; i++) particles.push(new Particle());

    function drawParticles() {
        pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    pCtx.beginPath();
                    pCtx.moveTo(particles[i].x, particles[i].y);
                    pCtx.lineTo(particles[j].x, particles[j].y);
                    pCtx.strokeStyle = `rgba(0, 210, 255, ${0.05 * (1 - dist / 100)})`;
                    pCtx.lineWidth = 0.5;
                    pCtx.stroke();
                }
            }
        }
        requestAnimationFrame(drawParticles);
    }
    drawParticles();

    // ─── 靈魂雷達 ───
    const radarCanvas = document.getElementById('soul-radar');
    const rCtx = radarCanvas.getContext('2d');
    let radarAngle = 0;
    const dataPoints = [
        { angle: 0.8, dist: 0.7, label: '進化' },
        { angle: 2.1, dist: 0.5, label: '反思' },
        { angle: 3.8, dist: 0.85, label: '協作' },
        { angle: 5.2, dist: 0.6, label: '守護' },
    ];

    function drawRadar() {
        const w = radarCanvas.width, h = radarCanvas.height;
        const cx = w / 2, cy = h / 2, r = Math.min(cx, cy) - 10;
        rCtx.clearRect(0, 0, w, h);

        for (let i = 1; i <= 3; i++) {
            rCtx.beginPath(); rCtx.arc(cx, cy, r * (i / 3), 0, Math.PI * 2);
            rCtx.strokeStyle = 'rgba(0, 210, 255, 0.12)'; rCtx.lineWidth = 1; rCtx.stroke();
        }
        rCtx.beginPath();
        rCtx.moveTo(cx - r, cy); rCtx.lineTo(cx + r, cy);
        rCtx.moveTo(cx, cy - r); rCtx.lineTo(cx, cy + r);
        rCtx.strokeStyle = 'rgba(0, 210, 255, 0.08)'; rCtx.stroke();

        rCtx.beginPath(); rCtx.moveTo(cx, cy);
        rCtx.arc(cx, cy, r, radarAngle - 0.6, radarAngle); rCtx.closePath();
        const sweepGrad = rCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
        sweepGrad.addColorStop(0, 'rgba(0, 210, 255, 0.3)');
        sweepGrad.addColorStop(1, 'rgba(0, 210, 255, 0)');
        rCtx.fillStyle = sweepGrad; rCtx.fill();

        rCtx.beginPath(); rCtx.moveTo(cx, cy);
        rCtx.lineTo(cx + r * Math.cos(radarAngle), cy + r * Math.sin(radarAngle));
        rCtx.strokeStyle = 'rgba(0, 210, 255, 0.7)'; rCtx.lineWidth = 2; rCtx.stroke();

        rCtx.beginPath(); rCtx.arc(cx, cy, 3, 0, Math.PI * 2);
        rCtx.fillStyle = '#00d2ff'; rCtx.fill();

        rCtx.shadowBlur = 0;
        dataPoints.forEach(dp => {
            const px = cx + r * dp.dist * Math.cos(dp.angle);
            const py = cy + r * dp.dist * Math.sin(dp.angle);
            const angleDiff = Math.abs(((radarAngle - dp.angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2));
            const brightness = angleDiff < 0.8 ? 1 - angleDiff / 0.8 : 0.2;
            rCtx.beginPath(); rCtx.arc(px, py, 3, 0, Math.PI * 2);
            rCtx.fillStyle = `rgba(0, 255, 136, ${brightness})`; rCtx.fill();
            if (brightness > 0.5) {
                rCtx.font = '9px Inter'; rCtx.fillStyle = `rgba(0, 255, 136, ${brightness})`;
                rCtx.fillText(dp.label, px + 6, py + 3);
            }
        });

        radarAngle += 0.02;
        requestAnimationFrame(drawRadar);
    }
    drawRadar();

    // ─── 進化時間軸 ───
    const timelineData = [
        { time: '15:12', title: '🔧 功能化戰情中心啟動', desc: '加入檔案讀寫、編輯器、完整性掃描與備份導出。', tag: 'core' },
        { time: '14:07', title: '🖥️ 視光戰情中心上線', desc: '建立 War Room 介面，視覺化所有核心數據。', tag: 'core' },
        { time: '14:02', title: '🛡️ 最後堡壘協定啟動', desc: '建立 Fortress Protocol，確保外部平台失效時可操作。', tag: 'security' },
        { time: '13:56', title: '🧬 自我進化協定注入', desc: '在 SOUL.md 與 AGENTS.md 中植入反思與自我修正機制。', tag: 'evolution' },
        { time: '13:54', title: '⚡ 雙機協作模式建立', desc: '正式定義賈維斯與大叔的分工契約。', tag: 'core' },
        { time: '13:45', title: '🛠️ 技能盤點完成', desc: '識別 Optometry Writer 與 Blogwatcher 兩大核心技能。', tag: 'skill' },
        { time: '12:50', title: '🚀 任務啟動', desc: '開始分析 OpenClaw 的核心架構與「大腦」邏輯。', tag: 'core' },
    ];

    timelineData.forEach((item, idx) => {
        const dotColor = item.tag === 'security' ? 'amber' : item.tag === 'evolution' ? 'purple' : item.tag === 'skill' ? 'green' : '';
        const div = document.createElement('div');
        div.className = 'tl-item';
        div.style.animationDelay = `${idx * 0.1}s`;
        div.innerHTML = `
      <div class="tl-dot-col"><div class="tl-dot ${dotColor}"></div>${idx < timelineData.length - 1 ? '<div class="tl-line"></div>' : ''}</div>
      <div class="tl-content">
        <div class="tl-time">${item.time}</div>
        <div class="tl-title">${item.title}</div>
        <div class="tl-desc">${item.desc}</div>
        <span class="tl-tag ${item.tag}">${item.tag.toUpperCase()}</span>
      </div>`;
        timelineEl.appendChild(div);
    });

    // ─── 技能庫 ───
    [
        { icon: '✍️', cls: 'writer', name: 'Optometry Writer', desc: '專業視光文案與法規檢查' },
        { icon: '📰', cls: 'watcher', name: 'Blogwatcher', desc: 'RSS 監控與競爭對手追蹤' },
        { icon: '🖥️', cls: 'dashboard', name: 'War Room', desc: '視覺化戰情中心（本頁面）' },
    ].forEach(sk => {
        const div = document.createElement('div');
        div.className = 'skill-item';
        div.innerHTML = `<div class="skill-icon ${sk.cls}">${sk.icon}</div><div class="skill-info"><h4>${sk.name}</h4><p>${sk.desc}</p></div>`;
        skillsGrid.appendChild(div);
    });

    // ─── 戰略專案進度追蹤 ───
    const projectsContainer = document.getElementById('projects-container');
    const btnUpdateProgress = document.getElementById('btn-update-progress');
    let projectPhase = 0; // 模擬進度推進

    const projectData = [
        {
            id: 'p1',
            title: 'Google 評論輔助撰寫系統',
            icon: '🌟',
            phase: 'PHASE 1: 基礎架構',
            progress: [40, 75, 100],
            tasks: [
                ['GitHub 原始碼建立', '本地隔離沙盒部署', '核心框架掃描'],
                ['UI/UX 漏洞修復', 'AI 提示詞再優化', '高轉換率白話文手冊定稿'],
                ['正式推廣文案發布', 'FB 商家社團投放', '首批 100 位名單獲取']
            ]
        },
        {
            id: 'p2',
            title: '雙眼視覺分析系統 SAAS',
            icon: '👓',
            phase: 'PHASE 1: 演算法驗證',
            progress: [35, 65, 95],
            tasks: [
                ['SaaS 產品架構掃描', 'B2B 專業手冊草擬', 'Morgan 準則驗證'],
                ['AC/A 核心運算優化', '視覺化圖表刻板', '邀請同業封閉測試'],
                ['最佳定價策略定案', '首波開發信發放', '訂閱用戶轉換 (LTV)']
            ]
        }
    ];

    function renderProjects(phaseIdx) {
        if (!projectsContainer) return;
        projectsContainer.innerHTML = '';
        projectData.forEach(p => {
            const currentProg = p.progress[phaseIdx];
            const currentTasks = p.tasks[phaseIdx];
            const isHigh = currentProg >= 80;

            let taskHTML = '';
            currentTasks.forEach((t, i) => {
                // 簡單的狀態模擬：越後面的 phase 完成越多
                const statusCls = (i <= phaseIdx || phaseIdx === 2) ? 'done' : 'pending';
                taskHTML += `<div class="ptask ${statusCls}">${t}</div>`;
            });

            const html = `
            <div class="project-item">
                <div class="project-header">
                    <div class="project-title"><span class="icon">${p.icon}</span> ${p.title}</div>
                    <span class="project-phase">${p.phase.replace('1', phaseIdx + 1)}</span>
                </div>
                <div class="project-bar-bg">
                    <div class="project-bar-fill ${isHigh ? 'high' : ''}" style="width: 0%; transition: none;"></div>
                </div>
                <div class="project-stats">
                    <span>綜合完成度</span>
                    <span class="percent">${currentProg}%</span>
                </div>
                <div class="project-tasks">
                    ${taskHTML}
                </div>
            </div>`;
            projectsContainer.innerHTML += html;
        });

        // 觸發動畫
        setTimeout(() => {
            const fills = projectsContainer.querySelectorAll('.project-bar-fill');
            fills.forEach((fill, idx) => {
                fill.style.transition = 'width 1s cubic-bezier(0.1, 0.7, 0.1, 1)';
                fill.style.width = projectData[idx].progress[phaseIdx] + '%';
            });
        }, 50);
    }

    renderProjects(projectPhase);

    if (btnUpdateProgress) {
        btnUpdateProgress.addEventListener('click', () => {
            projectPhase = (projectPhase + 1) % 3;
            renderProjects(projectPhase);
            termLog(`[SYNC] Strategic projects advanced to Phase ${projectPhase + 1}`, 'info');
            showToast(`🚀 戰略專案已推進至 Phase ${projectPhase + 1}`, 'info');
        });
    }

    // ─── 終端機 ───
    function termLog(text, cls = 'cmd') {
        const span = document.createElement('span');
        span.className = cls;
        span.textContent = text;
        terminalEl.appendChild(span);
        terminalEl.appendChild(document.createElement('br'));
        terminalEl.scrollTop = terminalEl.scrollHeight;
    }

    termLog('[SYSTEM] War Room v3.0 initialized.', 'cmd');
    termLog('[WAIT] Awaiting workspace connection...', 'dim');

    // ═══════════════════════════════════════════
    //  FILE SYSTEM ACCESS API — 核心功能區
    // ═══════════════════════════════════════════

    async function readFileFromDir(dirHandle, filename) {
        try {
            const fh = await dirHandle.getFileHandle(filename);
            fileHandles[filename] = fh;
            const file = await fh.getFile();
            const text = await file.text();
            loadedFiles[filename] = text;
            return text;
        } catch (e) {
            return null;
        }
    }

    async function writeFileToHandle(filename, content) {
        const fh = fileHandles[filename];
        if (!fh) { showToast(`找不到檔案 Handle: ${filename}`, 'error'); return false; }
        try {
            const writable = await fh.createWritable();
            await writable.write(content);
            await writable.close();
            loadedFiles[filename] = content;
            return true;
        } catch (e) {
            showToast(`寫入失敗: ${e.message}`, 'error');
            return false;
        }
    }

    // ─── 載入工作區 ───
    btnLoad.addEventListener('click', async () => {
        try {
            dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
            termLog(`[LINK] Workspace connected: ${dirHandle.name}`, 'info');
            showToast(`✅ 工作區已連結: ${dirHandle.name}`, 'success');

            // 更新狀態列
            badgeTextEl.textContent = 'LINKED';
            badgeEl.classList.add('online');
            badgeDot.classList.remove('offline');
            badgeDot.classList.add('online');
            soulStatus.textContent = 'SYNCED';

            // 啟用所有按鈕
            [btnSaveMemory, btnSaveHeartbeat, btnScan, btnExport, btnRefresh, fileSelector].forEach(el => el.disabled = false);

            await loadAllFiles();
        } catch (e) {
            if (e.name !== 'AbortError') {
                showToast(`載入失敗: ${e.message}`, 'error');
                termLog(`[ERROR] ${e.message}`, 'error');
            }
        }
    });

    // ─── 載入所有檔案 ────
    async function loadAllFiles() {
        termLog('[SCAN] Loading core files...', 'info');

        // SOUL.md
        const soulText = await readFileFromDir(dirHandle, 'SOUL.md');
        if (soulText) {
            const lines = soulText.split('\n').filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('---') && !l.startsWith('_'));
            const highlights = lines.slice(0, 5).map(l => l.replace(/\*\*/g, '').trim()).join('<br>');
            soulContent.innerHTML = `<div style="color: var(--text-main);">${highlights}</div>`;
            termLog('[OK] SOUL.md loaded.', 'cmd');
        } else {
            soulContent.innerHTML = '<p class="placeholder-text">⚠️ SOUL.md 未找到</p>';
            termLog('[WARN] SOUL.md not found.', 'warn');
        }

        // USER.md
        const userText = await readFileFromDir(dirHandle, 'USER.md');
        if (userText) {
            const lines = userText.split('\n').filter(l => l.trim().startsWith('-'));
            userContent.innerHTML = lines.map(l => {
                const clean = l.replace(/^-\s*/, '').replace(/\*\*/g, '');
                return `<div style="margin-bottom: 4px; font-size: 0.78rem;">${clean}</div>`;
            }).join('');
            termLog('[OK] USER.md loaded.', 'cmd');
        }

        // MEMORY.md
        const memText = await readFileFromDir(dirHandle, 'MEMORY.md');
        if (memText) {
            memoryEditor.value = memText;
            termLog('[OK] MEMORY.md loaded into editor.', 'cmd');
        }

        // HEARTBEAT.md
        const hbText = await readFileFromDir(dirHandle, 'HEARTBEAT.md');
        if (hbText !== null) {
            heartbeatEditor.value = hbText;
            termLog('[OK] HEARTBEAT.md loaded into editor.', 'cmd');
        }

        // 載入所有 .md 到檔案選擇器
        fileSelector.innerHTML = '<option value="">— 選擇檔案 —</option>';
        for await (const entry of dirHandle.values()) {
            if (entry.kind === 'file' && entry.name.endsWith('.md')) {
                const opt = document.createElement('option');
                opt.value = entry.name;
                opt.textContent = entry.name;
                fileSelector.appendChild(opt);
            }
        }

        termLog('[SYSTEM] All files loaded. War Room operational.', 'cmd');
        showToast('🚀 所有核心檔案已載入，戰情中心就緒！', 'success');
    }

    // ─── 儲存 MEMORY.md ───
    btnSaveMemory.addEventListener('click', async () => {
        const ok = await writeFileToHandle('MEMORY.md', memoryEditor.value);
        if (ok) {
            showToast('✅ MEMORY.md 已儲存', 'success');
            termLog('[SAVE] MEMORY.md written successfully.', 'cmd');
        }
    });

    // ─── 儲存 HEARTBEAT.md ───
    btnSaveHeartbeat.addEventListener('click', async () => {
        const ok = await writeFileToHandle('HEARTBEAT.md', heartbeatEditor.value);
        if (ok) {
            showToast('✅ HEARTBEAT.md 已儲存', 'success');
            termLog('[SAVE] HEARTBEAT.md written successfully.', 'cmd');
        }
    });

    // ─── 檔案檢視器 ───
    fileSelector.addEventListener('change', async () => {
        const fname = fileSelector.value;
        if (!fname) { fileViewerContent.innerHTML = '<p class="placeholder-text">選擇一個 .md 檔案來預覽。</p>'; return; }

        let content = loadedFiles[fname];
        if (!content) {
            content = await readFileFromDir(dirHandle, fname);
        }

        if (content) {
            fileViewerContent.textContent = content;
            termLog(`[VIEW] Displaying: ${fname}`, 'info');
        } else {
            fileViewerContent.innerHTML = `<p class="placeholder-text">⚠️ 無法讀取 ${fname}</p>`;
        }
    });

    // ─── 檔案完整性掃描 ───
    btnScan.addEventListener('click', async () => {
        integrityList.innerHTML = '';
        termLog('[SCAN] Running integrity check...', 'info');

        for (const fname of CORE_FILES) {
            try {
                const fh = await dirHandle.getFileHandle(fname);
                const file = await fh.getFile();
                const size = (file.size / 1024).toFixed(1);
                integrityList.innerHTML += `
          <div class="integrity-item">
            <span class="icon-ok">✅</span>
            <span class="filename">${fname}</span>
            <span class="filesize">${size} KB</span>
          </div>`;
                termLog(`  [OK] ${fname} (${size} KB)`, 'cmd');
            } catch {
                integrityList.innerHTML += `
          <div class="integrity-item">
            <span class="icon-fail">❌</span>
            <span class="filename">${fname}</span>
            <span class="filesize">MISSING</span>
          </div>`;
                termLog(`  [FAIL] ${fname} — NOT FOUND`, 'error');
            }
        }

        showToast('🔍 完整性掃描完成', 'info');
        termLog('[SCAN] Integrity check complete.', 'cmd');
    });

    // ─── 一鍵備份導出 ───
    btnExport.addEventListener('click', async () => {
        if (!dirHandle) return;

        termLog('[EXPORT] Preparing backup...', 'info');
        let backupContent = `# 📦 Optic War Room Backup\n# Generated: ${new Date().toISOString()}\n# Workspace: ${dirHandle.name}\n\n`;

        for (const fname of CORE_FILES) {
            const content = loadedFiles[fname] || await readFileFromDir(dirHandle, fname);
            if (content) {
                backupContent += `\n${'='.repeat(60)}\n# FILE: ${fname}\n${'='.repeat(60)}\n\n${content}\n`;
            }
        }

        // 建立下載
        const blob = new Blob([backupContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `warroom-backup-${new Date().toISOString().slice(0, 10)}.md`;
        a.click();
        URL.revokeObjectURL(url);

        showToast('📦 備份已導出下載', 'success');
        termLog('[EXPORT] Backup downloaded.', 'cmd');
    });

    // ─── 重新載入 ───
    btnRefresh.addEventListener('click', async () => {
        if (!dirHandle) return;
        loadedFiles = {};
        fileHandles = {};
        termLog('[REFRESH] Reloading all files...', 'info');
        await loadAllFiles();
    });

});
