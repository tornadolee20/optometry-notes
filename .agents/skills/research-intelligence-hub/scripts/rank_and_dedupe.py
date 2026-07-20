import json
import sys
import os
from datetime import datetime

def parse_evidence_level(level):
    if not level:
        return 'D'
    level = str(level).upper().strip()
    return level if level in ['A', 'B', 'C', 'D'] else 'D'

def clean_score(val):
    try:
        if val is None:
            return 0.5
        v = float(val)
        return max(0.0, min(1.0, v))
    except (ValueError, TypeError):
        return 0.5

def calculate_score(domain, level, relevance_score, study_size_score):
    level_multipliers = {'A': 1.0, 'B': 0.8, 'C': 0.5, 'D': 0.3}
    multiplier = level_multipliers.get(level, 0.3)
    
    if domain == "optometry":
        raw_score = (relevance_score * 0.6) + (study_size_score * 0.4)
        score = raw_score * multiplier * 100
        if level == 'C':
            score = min(score, 70.0)
        elif level == 'D':
            score = min(score, 50.0)
            
    elif domain == "visual_diet":
        raw_score = (relevance_score * 0.7) + (study_size_score * 0.3)
        score = raw_score * multiplier * 100
        if level == 'C':
            score = min(score, 72.0)
            
    elif domain == "store_marketing":
        raw_score = (relevance_score * 0.8) + (study_size_score * 0.2)
        marketing_multiplier = 1.0 if level == 'A' else (0.9 if level == 'B' else (0.75 if level == 'C' else 0.4))
        score = raw_score * marketing_multiplier * 100
        if level == 'D':
            score = min(score, 55.0)
    else:
        score = 0.0
        
    return round(score, 1)

def get_routing(score):
    if score >= 80.0:
        return "immediate"
    elif score >= 60.0:
        return "weekly"
    elif score >= 40.0:
        return "observation"
    else:
        return "exclude"

def deduplicate_and_rank(input_file, output_file):
    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' does not exist.")
        sys.exit(1)
        
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            if not content:
                records = []
            elif content.startswith('['):
                records = json.loads(content)
            else:
                records = [json.loads(line) for line in content.splitlines() if line.strip()]
    except Exception as e:
        print(f"Error reading input file: {e}")
        sys.exit(1)

    seen_dois = set()
    seen_pmids = set()
    unique_records = []

    for r in records:
        if r.get("retracted", False):
            print(f"Filtering retracted paper: '{r.get('title', 'Unknown')}'")
            continue

        doi = str(r.get("doi", "")).strip().lower()
        pmid = str(r.get("pmid", "")).strip().lower()
        
        if doi and doi != "none" and doi in seen_dois:
            continue
        if pmid and pmid != "none" and pmid in seen_pmids:
            continue
            
        if doi and doi != "none":
            seen_dois.add(doi)
        if pmid and pmid != "none":
            seen_pmids.add(pmid)
            
        domain = str(r.get("domain", "optometry")).strip()
        level = parse_evidence_level(r.get("evidence_level", "D"))
        relevance = clean_score(r.get("relevance_score", 0.5))
        study_size = clean_score(r.get("study_size_score", 0.5))
        
        score = calculate_score(domain, level, relevance, study_size)
        r["calculated_score"] = score
        r["routing"] = get_routing(score)
        r["evaluated_at"] = datetime.utcnow().isoformat()
        
        r["caveat_required"] = level in ['C', 'D']
        r["layman_summary_anchor"] = f"【白話重點解讀】這項研究發現了『{domain}』領域的關聯，但其證據等級為 {level} 級，在寫作時應避免使用絕對因果字眼。"

        unique_records.append(r)

    unique_records.sort(key=lambda x: (-x["calculated_score"], x.get("title", "")))

    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(unique_records, f, ensure_ascii=False, indent=2)
        print(f"Deduplication completed. Input {len(records)} records -> Output {len(unique_records)} records. Saved to {output_file}")
    except Exception as e:
        print(f"Error writing output file: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python rank_and_dedupe.py <input.json> <output.json>")
        sys.exit(1)
    deduplicate_and_rank(sys.argv[1], sys.argv[2])
