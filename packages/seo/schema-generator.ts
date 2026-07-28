/**
 * Vision Knowledge OS - Schema.org 結構化資料 JSON-LD 生成器
 * 遵循規格書 13.1 & 13.2 節 SEO/GEO 技術要求
 */

import { Question, Article, Person } from '../content-model/src/types';

/**
 * 為 Question 自然語言頁面生成 FAQPage JSON-LD
 */
export function generateFAQSchema(questionObj: Question, personAuthor: Person) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": questionObj.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": questionObj.short_answer,
          "author": {
            "@type": "Person",
            "name": personAuthor.display_name,
            "jobTitle": personAuthor.role.join(', '),
            "worksFor": {
              "@type": "Organization",
              "name": personAuthor.organization || "自己的驗光所"
            }
          }
        }
      }
    ]
  };
}

/**
 * 為衛教與臨床解讀文章生成 Article & MedicalWebPage JSON-LD
 */
export function generateArticleSchema(article: Article, personAuthor: Person) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "headline": article.title,
    "description": article.summary,
    "datePublished": article.published_at,
    "dateModified": article.updated_at,
    "author": {
      "@type": "Person",
      "name": personAuthor.display_name,
      "jobTitle": personAuthor.role.join(', '),
      "honorificSuffix": personAuthor.credentials.join(', ')
    },
    "publisher": {
      "@type": "Organization",
      "name": "目鏡大叔 ── 自己的眼鏡・自己的驗光所",
      "logo": {
        "@type": "ImageObject",
        "url": "https://uncle-glasses.com/logo.png"
      }
    },
    "aspect": "MedicalSpecialtyOptometry",
    "medicalAudience": {
      "@type": "MedicalAudience",
      "audienceType": "Parents of children with myopia"
    }
  };
}

/**
 * 為門市生成 LocalBusiness & Optician 結構化資料
 */
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Optician",
    "name": "自己的眼鏡・自己的驗光所 (目鏡大叔)",
    "description": "專業視光驗光門市，提供兒童近視追蹤、雙眼視覺評估、角膜塑型追蹤諮詢與多焦點適應調校。",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "新北市",
      "addressRegion": "三峽區 / 鶯歌區 / 北大特區",
      "addressCountry": "TW"
    },
    "founder": {
      "@type": "Person",
      "name": "李錫彥 (目鏡大叔)"
    },
    "priceRange": "$$"
  };
}
