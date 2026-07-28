#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Vision Knowledge OS - 舊 Blogger 文章結構化匯入與欄位映射器 (Import Blogger to VKOS)
將傳統 Blogger HTML/Markdown 文章解析並映射成 VKOS 的 Article / Question / Topic 結構化資料。
"""

import json
import re
import os
from datetime import datetime

def clean_html_content(raw_html):
    """去除舊 Blogger 雜亂 inline style 與無用標籤，保留語意標籤"""
    if not raw_html:
        return ""
    # 簡單清洗範例
    cleaned = re.sub(r'style="[^"]*"', '', raw_html)
    cleaned = re.sub(r'<font[^>]*>', '', cleaned)
    cleaned = re.sub(r'</font>', '', cleaned)
    return cleaned.strip()

def infer_article_type(title, content):
    """依據標題與內文自動推導 ArticleType (8種類型)"""
    text = title + " " + content
    if any(k in text for k in ["指南", "完整解析", "對照表", "懶人包"]):
        return "guide"
    elif any(k in text for k in ["迷思", "誤解", "是真的嗎", "打破"]):
        return "myth_busting"
    elif any(k in text for k in ["案例", "故事", "臨床", "門市"]):
        return "case_story"
    elif any(k in text for k in ["研究", "論文", "期刊", "實驗"]):
        return "research_interpretation"
    elif any(k in text for k in ["門市", "驗光服務", "地址", "預約"]):
        return "local_service"
    return "explainer"

def extract_primary_question(title, content):
    """嘗試從標題或開頭萃取自然語言 Question"""
    if "？" in title or "?" in title:
        return title.strip()
    match = re.search(r'([^。！？\n]+[？?])', content[:300])
    if match:
        return match.group(1).strip()
    return f"關於「{title}」的常見問題？"

def convert_blogger_post_to_vkos(post):
    """
    將單篇 Blogger Post 轉化為 VKOS Article Schema 格式
    """
    post_id = post.get("id", f"article_{int(datetime.now().timestamp())}")
    title = post.get("title", "未命名文章")
    content = clean_html_content(post.get("content", ""))
    published_at = post.get("published", datetime.now().isoformat())
    
    # 自動分析屬性
    article_type = infer_article_type(title, content)
    primary_question = extract_primary_question(title, content)
    
    # 產生 Slug
    slug = re.sub(r'[^\w\s-]', '', title.lower()).strip().replace(' ', '-')
    if not slug:
        slug = f"post-{post_id}"

    vkos_article = {
        "id": f"article_{post_id}",
        "title": title,
        "slug": slug,
        "summary": content[:150].replace("\n", " ") + "...",
        "content": content,
        "article_type": article_type,
        "primary_question_extracted": primary_question,
        "topics": ["topic_axial_length"] if "眼軸" in title or "近視" in title else ["topic_general_optometry"],
        "audiences": ["aud_parents_myopia"],
        "journeys": ["journey_myopia_control"],
        "author": "person_li_xiyan",
        "published_at": published_at,
        "updated_at": datetime.now().strftime("%Y-%m-%d"),
        "medical_disclaimer": True,
        "seo": {
            "meta_title": f"{title} | 目鏡大叔 Vision Knowledge OS",
            "meta_description": content[:120].replace("\n", " ")
        },
        "status": "published"
    }
    
    return vkos_article

if __name__ == "__main__":
    print("🚀 Vision Knowledge OS - Blogger 文章結構化轉化工具初始化完成。")
    sample_blogger_post = {
        "id": "1001",
        "title": "孩子度數沒增加，眼軸為什麼還會變長？家長必看的近視控制指標",
        "content": "很多家長常帶著小朋友的驗光單問我這個問題...其實眼軸就像眼球的骨架...",
        "published": "2026-07-20T10:00:00Z"
    }
    result = convert_blogger_post_to_vkos(sample_blogger_post)
    print("✅ 範例轉化結果：")
    print(json.dumps(result, ensure_ascii=False, indent=2))
