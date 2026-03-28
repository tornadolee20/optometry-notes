#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PubMed Automated Research Fetcher — 目鏡大叔 AI 研究系統
=========================================================
每 3 天自動爬取 7 大視光研究領域的最新論文，寫入 Inbox/待深處理.md

使用 NCBI E-utilities (免費，無需 API key)
文件：https://www.ncbi.nlm.nih.gov/books/NBK25499/

執行方式：
  python skills/paper-researcher/scripts/pubmed_fetch.py

排程：每 3 天早上 09:00 (由 Claude Code CronCreate 管理)
"""

import urllib.request
import urllib.parse
import json
import os
import sys
import time
from datetime import datetime, timedelta, timezone

# ── 基礎設定 ──────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
INBOX_PATH = os.path.join(BASE_DIR, "Inbox", "待深處理.md")
LOG_PATH   = os.path.join(BASE_DIR, "skills", "paper-researcher", "fetch_log.txt")

NCBI_ESEARCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
NCBI_EFETCH  = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
NCBI_ESUMMARY = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"

# NCBI 限制：免費用戶 3 requests/sec，加上 email 可到 10/sec
NCBI_EMAIL  = "uncle-glasses-ai@local.dev"
NCBI_TOOL   = "uncle-glasses-pubmed-fetcher"
RATE_LIMIT  = 0.4  # 秒/請求（保守 2.5 req/sec）

# 每個主題最多抓幾篇（避免 Inbox 爆炸）
MAX_PER_TOPIC = 3

# ── 7 大研究領域定義 ────────────────────────────────────────────────────────
RESEARCH_DOMAINS = [
    {
        "id": "myopia_control",
        "label": "🔴 近視控制",
        "priority": "high",
        "queries": [
            "(myopia control) AND (Taiwan OR Chinese OR Asian)",
            "orthokeratology randomized controlled trial",
            "low-dose atropine myopia rebound",
            "myopia progression children intervention 2024",
        ],
    },
    {
        "id": "child_vision",
        "label": "🔴 兒童視力發展",
        "priority": "high",
        "queries": [
            "amblyopia dichoptic therapy children",
            "convergence insufficiency reading children",
            "pediatric vision screening preschool",
            "accommodative esotropia children treatment",
        ],
    },
    {
        "id": "digital_eyestrain",
        "label": "🟡 數位眼疲勞",
        "priority": "medium",
        "queries": [
            "accommodative fatigue near work digital screen",
            "NIBUT dry eye office workers screen time",
            "computer vision syndrome prevalence",
            "blue light filter screen fatigue",
        ],
    },
    {
        "id": "binocular_vision",
        "label": "🟡 雙眼視覺",
        "priority": "medium",
        "queries": [
            "convergence insufficiency CITT treatment",
            "vertical phoria prism adaptation",
            "binocular vision dysfunction headache",
            "fusional vergence range clinical",
        ],
    },
    {
        "id": "presbyopia_multifocal",
        "label": "🟢 老花多焦點",
        "priority": "normal",
        "queries": [
            "progressive addition lens freeform design",
            "trifocal IOL presbyopia outcomes",
            "multifocal contact lens presbyopia",
            "reading glasses occupational presbyopia",
        ],
    },
    {
        "id": "eye_systemic_health",
        "label": "🟢 眼睛與全身健康",
        "priority": "normal",
        "queries": [
            "diabetic retinopathy AI screening Taiwan",
            "retinal biomarker Alzheimer dementia",
            "hypertension retinal vascular changes",
            "retinal imaging cardiovascular biomarker",
        ],
    },
    {
        "id": "visual_nutrition",
        "label": "🟢 視覺營養飲食",
        "priority": "normal",
        "queries": [
            "lutein zeaxanthin myopia children",
            "omega-3 fatty acid dry eye treatment",
            "gut microbiome eye health",
            "vitamin D myopia outdoor activity",
        ],
    },
]


def ncbi_get(url, params):
    """發送 GET 請求到 NCBI API，回傳 JSON 字典"""
    params["tool"]  = NCBI_TOOL
    params["email"] = NCBI_EMAIL
    params["retmode"] = "json"
    query = urllib.parse.urlencode(params)
    full_url = f"{url}?{query}"
    try:
        with urllib.request.urlopen(full_url, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        return None


def get_date_range(days_back=4):
    """
    取得搜尋日期範圍：過去 N 天到今天
    多取 1 天（4 天而非 3 天）避免時區邊界漏抓
    """
    tz_taipei = timezone(timedelta(hours=8))
    today = datetime.now(tz_taipei).date()
    start = today - timedelta(days=days_back)
    return start.strftime("%Y/%m/%d"), today.strftime("%Y/%m/%d")


def search_pubmed(query, date_from, date_to, max_results=5):
    """在 PubMed 搜尋，回傳 PMID 列表"""
    params = {
        "db":      "pubmed",
        "term":    f"({query}) AND (\"{date_from}\"[PDAT]:\"{date_to}\"[PDAT])",
        "retmax":  str(max_results),
        "sort":    "pub+date",
        "usehistory": "n",
    }
    data = ncbi_get(NCBI_ESEARCH, params)
    if not data:
        return []
    try:
        return data["esearchresult"].get("idlist", [])
    except (KeyError, TypeError):
        return []


def fetch_summaries(pmids):
    """批次取得論文摘要資訊（標題、作者、期刊、日期）"""
    if not pmids:
        return []
    params = {
        "db":  "pubmed",
        "id":  ",".join(pmids),
    }
    data = ncbi_get(NCBI_ESUMMARY, params)
    if not data:
        return []

    results = []
    try:
        uids = data["result"]["uids"]
        for uid in uids:
            item = data["result"][uid]
            authors = item.get("authors", [])
            author_str = authors[0].get("name", "Unknown") if authors else "Unknown"
            if len(authors) > 1:
                author_str += " et al."

            pub_date = item.get("pubdate", "")[:10]  # 只取 YYYY-MM-DD 部分

            results.append({
                "pmid":    uid,
                "title":   item.get("title", "No title"),
                "journal": item.get("fulljournalname", item.get("source", "")),
                "authors": author_str,
                "date":    pub_date,
                "doi":     item.get("elocationid", "").replace("doi: ", "").strip(),
            })
    except (KeyError, TypeError):
        pass

    return results


def format_inbox_entry(domain, papers):
    """將一個主題的論文清單格式化為 Inbox 條目"""
    now_str = datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%d %H:%M")
    lines = []
    lines.append(f"\n## {domain['label']} — PubMed 自動抓取 ({now_str})")
    lines.append(f"- **來源**：PubMed E-utilities（自動）")
    lines.append(f"- **類型**：論文批次")
    lines.append(f"- **優先級**：{domain['priority']}")
    lines.append(f"- **搜尋策略**：{' | '.join(domain['queries'][:2])} ...")
    lines.append("")

    for i, p in enumerate(papers, 1):
        pmid_url = f"https://pubmed.ncbi.nlm.nih.gov/{p['pmid']}/"
        doi_str  = f" DOI: {p['doi']}" if p['doi'] else ""
        lines.append(f"### [{i}] {p['title']}")
        lines.append(f"- **作者**：{p['authors']}")
        lines.append(f"- **期刊**：{p['journal']} ({p['date']})")
        lines.append(f"- **連結**：{pmid_url}{doi_str}")
        lines.append(f"- **核心主張**：（待 Paper Digest 解構）")
        lines.append(f"- **建議模板**：文獻卡 (PaperNote)")
        lines.append(f"- **Antigravity 初判連結**：可能與 [[{domain['id']}]] 相關")
        lines.append("")
        lines.append("> [待 Claude 深處理]")
        lines.append("")

    lines.append("---")
    return "\n".join(lines)


def append_to_inbox(content):
    """將內容附加到 Inbox/待深處理.md"""
    with open(INBOX_PATH, "a", encoding="utf-8") as f:
        f.write("\n")
        f.write(content)
        f.write("\n")


def write_log(message):
    """寫入 fetch_log.txt"""
    ts = datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(f"[{ts}] {message}\n")
    # Windows CP950 terminal 無法顯示 emoji，fallback 用 ASCII
    safe_msg = message.encode(sys.stdout.encoding or "utf-8", errors="replace").decode(sys.stdout.encoding or "utf-8", errors="replace")
    print(f"[{ts}] {safe_msg}")


def run():
    """主流程"""
    write_log("=== PubMed Fetch 開始 ===")
    date_from, date_to = get_date_range(days_back=4)
    write_log(f"搜尋日期範圍：{date_from} → {date_to}")

    total_papers = 0
    total_topics_with_results = 0
    inbox_chunks = []

    for domain in RESEARCH_DOMAINS:
        write_log(f"處理領域：{domain['label']}")
        seen_pmids = set()
        domain_papers = []

        for query in domain["queries"]:
            if len(domain_papers) >= MAX_PER_TOPIC:
                break

            pmids = search_pubmed(query, date_from, date_to, max_results=5)
            time.sleep(RATE_LIMIT)

            # 去重
            new_pmids = [p for p in pmids if p not in seen_pmids]
            seen_pmids.update(new_pmids)

            if new_pmids:
                papers = fetch_summaries(new_pmids[:MAX_PER_TOPIC - len(domain_papers)])
                time.sleep(RATE_LIMIT)
                domain_papers.extend(papers)
                write_log(f"  [{query[:40]}...] → {len(papers)} 篇")
            else:
                write_log(f"  [{query[:40]}...] → 0 篇")

        if domain_papers:
            # 限制每個主題最多 MAX_PER_TOPIC 篇
            domain_papers = domain_papers[:MAX_PER_TOPIC]
            inbox_chunks.append(format_inbox_entry(domain, domain_papers))
            total_papers += len(domain_papers)
            total_topics_with_results += 1
            write_log(f"  小計：{len(domain_papers)} 篇")
        else:
            write_log(f"  本次無新論文")

    # 寫入 Inbox
    if inbox_chunks:
        header = (
            f"\n\n<!-- ===== PubMed 自動研究報告 {date_to} "
            f"({total_papers} 篇 / {total_topics_with_results} 領域) ===== -->"
        )
        append_to_inbox(header + "\n" + "\n".join(inbox_chunks))
        write_log(f"=== 完成：{total_papers} 篇論文寫入 Inbox/待深處理.md ===")
    else:
        write_log("=== 本次無新論文，Inbox 未更新 ===")

    return total_papers


if __name__ == "__main__":
    papers_found = run()
    sys.exit(0)
