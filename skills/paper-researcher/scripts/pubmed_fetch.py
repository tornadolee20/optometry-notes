#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PubMed Automated Research Fetcher — 目鏡大叔 AI 研究系統
=========================================================
自動爬取各視光研究領域的最新論文，寫入 Inbox/待深處理.md

使用 NCBI E-utilities (支援 API Key / 自動去重 / 載入 Abstract / 連線重試)
"""

import urllib.request
import urllib.parse
import json
import os
import sys
import time
import re
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone

# ── 基礎設定 ──────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
INBOX_PATH = os.path.join(BASE_DIR, "Inbox", "待深處理.md")
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(SCRIPT_DIR, "pubmed_config.json")
HISTORY_PATH = os.path.join(SCRIPT_DIR, ".fetched_pmids.json")
LOG_PATH   = os.path.join(BASE_DIR, "skills", "paper-researcher", "fetch_log.txt")

NCBI_ESEARCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
NCBI_EFETCH  = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"

NCBI_EMAIL  = "uncle-glasses-ai@local.dev"
NCBI_TOOL   = "uncle-glasses-pubmed-fetcher"

# 載入環境變數 (.env) 取得 API Key
def load_env():
    env_path = os.path.join(BASE_DIR, ".env")
    env_vars = {}
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        env_vars[k.strip()] = v.strip()
        except Exception:
            pass
    return env_vars

ENV = load_env()
NCBI_API_KEY = ENV.get("NCBI_API_KEY", "")

# 決定速率限制 (如果有 API key 可以加快)
if NCBI_API_KEY:
    RATE_LIMIT = 0.1  # 有 Key 可達 10 req/sec
else:
    RATE_LIMIT = 0.4  # 免 Key 為 3 req/sec

# 載入設定檔 pubmed_config.json
def load_config():
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"無法讀取設定檔 {CONFIG_PATH}: {e}")
    # 預設後備設定
    return {
        "max_per_topic": 3,
        "domains": []
    }

CONFIG = load_config()
MAX_PER_TOPIC = CONFIG.get("max_per_topic", 3)
RESEARCH_DOMAINS = CONFIG.get("domains", [])


def write_log(message):
    """寫入 fetch_log.txt"""
    ts = datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%d %H:%M:%S")
    # 確保日誌目錄存在
    os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(f"[{ts}] {message}\n")
    safe_msg = message.encode(sys.stdout.encoding or "utf-8", errors="replace").decode(sys.stdout.encoding or "utf-8", errors="replace")
    print(f"[{ts}] {safe_msg}")


def ncbi_request_with_retry(url, params, max_retries=3):
    """發送 HTTP 請求到 NCBI API，包含指數退避重試邏輯"""
    params["tool"] = NCBI_TOOL
    params["email"] = NCBI_EMAIL
    if NCBI_API_KEY:
        params["api_key"] = NCBI_API_KEY

    query = urllib.parse.urlencode(params)
    full_url = f"{url}?{query}"
    
    delay = 1.0
    for attempt in range(1, max_retries + 1):
        try:
            req = urllib.request.Request(full_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=20) as resp:
                return resp.read()
        except Exception as e:
            if attempt == max_retries:
                write_log(f"連線失敗 (已重試 {max_retries} 次): {e}")
                return None
            write_log(f"連線異常 ({e})，將於 {delay} 秒後重試第 {attempt} 次...")
            time.sleep(delay)
            delay *= 2.0
    return None


def get_date_range(days_back=4):
    """
    取得搜尋日期範圍：過去 N 天到今天
    使用 EDAT (Entrez Date) 語法需要 YYYY/MM/DD 格式
    """
    tz_taipei = timezone(timedelta(hours=8))
    today = datetime.now(tz_taipei).date()
    start = today - timedelta(days=days_back)
    return start.strftime("%Y/%m/%d"), today.strftime("%Y/%m/%d")


def search_pubmed(query, date_from, date_to, max_results=10):
    """使用 EDAT 搜尋近期的文獻，回傳 PMID 列表"""
    params = {
        "db":      "pubmed",
        "term":    f"({query}) AND (\"{date_from}\"[EDAT]:\"{date_to}\"[EDAT])",
        "retmax":  str(max_results),
        "sort":    "pub+date",
        "retmode": "json",
    }
    raw_data = ncbi_request_with_retry(NCBI_ESEARCH, params)
    if not raw_data:
        return []
    try:
        data = json.loads(raw_data.decode("utf-8"))
        return data["esearchresult"].get("idlist", [])
    except Exception as e:
        write_log(f"解析 ESearch JSON 錯誤: {e}")
        return []


def fetch_details(pmids):
    """
    使用 efetch.fcgi (XML 格式) 批次取得詳細資訊與 Abstract 內容
    """
    if not pmids:
        return []
    params = {
        "db":  "pubmed",
        "id":  ",".join(pmids),
        "retmode": "xml"
    }
    raw_xml = ncbi_request_with_retry(NCBI_EFETCH, params)
    if not raw_xml:
        return []

    results = []
    try:
        root = ET.fromstring(raw_xml)
        for article in root.findall(".//PubmedArticle"):
            pmid_node = article.find(".//PMID")
            if pmid_node is None:
                continue
            pmid = pmid_node.text

            # 標題
            title_node = article.find(".//ArticleTitle")
            title = "".join(title_node.itertext()).strip() if title_node is not None else "No title"
            # 移除結尾的句號，避免排版重複
            if title.endswith("."):
                title = title[:-1]

            # 期刊
            journal_node = article.find(".//Journal/Title")
            journal = journal_node.text if journal_node is not None else ""
            if not journal:
                journal_node = article.find(".//Journal/ISOAbbreviation")
                journal = journal_node.text if journal_node is not None else "Unknown Journal"

            # 發表日期
            pub_date_node = article.find(".//JournalIssue/PubDate")
            pub_date = ""
            if pub_date_node is not None:
                year = pub_date_node.find("Year")
                month = pub_date_node.find("Month")
                day = pub_date_node.find("Day")
                if year is not None:
                    pub_date = year.text
                    if month is not None:
                        pub_date += f" {month.text}"
                        if day is not None:
                            pub_date += f" {day.text}"
                else:
                    medline_date = pub_date_node.find("MedlineDate")
                    if medline_date is not None:
                        pub_date = medline_date.text
            if not pub_date:
                pub_date = "Unknown Date"

            # 作者列表
            authors = []
            for author in article.findall(".//AuthorList/Author"):
                last_name = author.find("LastName")
                initials = author.find("Initials")
                if last_name is not None and initials is not None:
                    authors.append(f"{last_name.text} {initials.text}")
                elif last_name is not None:
                    authors.append(last_name.text)
            
            author_str = "Unknown"
            if authors:
                author_str = authors[0]
                if len(authors) > 1:
                    author_str += " et al."

            # DOI
            doi = ""
            for eloc in article.findall(".//ArticleIdList/ArticleId"):
                if eloc.attrib.get("IdType") == "doi":
                    doi = eloc.text
                    break

            # 摘要
            abstract_texts = []
            for abstract_sec in article.findall(".//Abstract/AbstractText"):
                label = abstract_sec.attrib.get("Label")
                text = "".join(abstract_sec.itertext()).strip()
                if label:
                    abstract_texts.append(f"**{label}**: {text}")
                else:
                    abstract_texts.append(text)
            abstract = "\n".join(abstract_texts) if abstract_texts else "No abstract available."

            results.append({
                "pmid":    pmid,
                "title":   title,
                "journal": journal,
                "authors": author_str,
                "date":    pub_date,
                "doi":     doi.strip(),
                "abstract": abstract
            })
    except Exception as e:
        write_log(f"解析 XML 錯誤: {e}")

    return results


def format_inbox_entry(domain, papers):
    """將主題文獻清單格式化為帶有 Abstract 的 Inbox 區塊"""
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
        lines.append(f"- **建議模板**：文獻卡 (PaperNote)")
        lines.append(f"- **Antigravity 初判連結**：可能與 [[{domain['id']}]] 相關")
        lines.append(f"- **摘要內容**：")
        # 摘要縮排顯示，排版更美觀
        for abs_line in p['abstract'].split("\n"):
            lines.append(f"  > {abs_line}")
        lines.append("")
        lines.append("> [待 Claude 深處理]")
        lines.append("")

    lines.append("---")
    return "\n".join(lines)


def get_history_pmids():
    """讀取持久化去重歷史記錄檔案 (.fetched_pmids.json)"""
    if not os.path.exists(HISTORY_PATH):
        return set()
    try:
        with open(HISTORY_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                return set(data)
    except Exception as e:
        write_log(f"讀取去重記錄檔錯誤: {e}")
    return set()


def save_history_pmids(pmid_set):
    """保存持久化去重歷史記錄檔案 (.fetched_pmids.json)"""
    try:
        with open(HISTORY_PATH, "w", encoding="utf-8") as f:
            json.dump(list(pmid_set), f, indent=2, ensure_ascii=False)
    except Exception as e:
        write_log(f"保存去重記錄檔錯誤: {e}")


def append_to_inbox(content):
    """附加到 Inbox/待深處理.md"""
    # 確保 Inbox 目錄存在
    os.makedirs(os.path.dirname(INBOX_PATH), exist_ok=True)
    with open(INBOX_PATH, "a", encoding="utf-8") as f:
        f.write("\n")
        f.write(content)
        f.write("\n")


def run():
    """主流程"""
    write_log("=== PubMed Fetch 開始 ===")
    date_from, date_to = get_date_range(days_back=4)
    write_log(f"搜尋日期範圍 (EDAT)：{date_from} → {date_to}")

    # 讀取去重歷史
    history_pmids = get_history_pmids()
    if history_pmids:
        write_log(f"歷史記錄中已有 {len(history_pmids)} 筆 PMID 紀錄，將自動跳過重複")

    total_papers = 0
    total_topics_with_results = 0
    inbox_chunks = []
    
    # 紀錄本次執行的 PMID
    newly_fetched_pmids = set()

    for domain in RESEARCH_DOMAINS:
        write_log(f"處理領域：{domain['label']}")
        seen_pmids = set(history_pmids)
        domain_papers = []

        for query in domain["queries"]:
            if len(domain_papers) >= MAX_PER_TOPIC:
                break

            pmids = search_pubmed(query, date_from, date_to, max_results=10)
            time.sleep(RATE_LIMIT)

            # 去重
            new_pmids = [p for p in pmids if p not in seen_pmids]
            # 限制單一主題的總獲取量
            remaining_slots = MAX_PER_TOPIC - len(domain_papers)
            pmids_to_fetch = new_pmids[:remaining_slots]

            if pmids_to_fetch:
                papers = fetch_details(pmids_to_fetch)
                time.sleep(RATE_LIMIT)
                domain_papers.extend(papers)
                
                # 更新 seen_pmids 與 newly_fetched_pmids
                for p in papers:
                    seen_pmids.add(p["pmid"])
                    newly_fetched_pmids.add(p["pmid"])
                
                write_log(f"  [{query[:40]}...] → 成功取得 {len(papers)} 篇摘要")
            else:
                write_log(f"  [{query[:40]}...] → 0 篇新文獻")

        if domain_papers:
            domain_papers = domain_papers[:MAX_PER_TOPIC]
            inbox_chunks.append(format_inbox_entry(domain, domain_papers))
            total_papers += len(domain_papers)
            total_topics_with_results += 1
            write_log(f"  小計：{len(domain_papers)} 篇")
        else:
            write_log(f"  本次無新論文")

    # 如果有新抓取的，寫入歷史記錄
    if newly_fetched_pmids:
        history_pmids.update(newly_fetched_pmids)
        save_history_pmids(history_pmids)

    # 寫入 Inbox
    if inbox_chunks:
        header = (
            f"\n\n<!-- ===== PubMed 自動研究報告 {date_to} "
            f"({total_papers} 篇 / {total_topics_with_results} 領域) ===== -->"
        )
        append_to_inbox(header + "\n" + "\n".join(inbox_chunks))
        write_log(f"=== 完成：{total_papers} 篇論文（含摘要）寫入 Inbox/待深處理.md ===")
    else:
        write_log("=== 本次無新論文，Inbox 未更新 ===")

    return total_papers


if __name__ == "__main__":
    papers_found = run()
    sys.exit(0)
