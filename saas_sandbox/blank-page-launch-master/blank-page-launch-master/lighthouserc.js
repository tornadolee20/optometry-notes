module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      url: ['http://localhost:4173'],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.8 }],
        
        // 核心 Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        
        // 資源優化
        'unused-css-rules': ['warn', { maxLength: 5 }],
        'unused-javascript': ['warn', { maxLength: 5 }],
        'render-blocking-resources': ['warn', { maxLength: 3 }],
        
        // 圖片優化
        'uses-optimized-images': 'warn',
        'uses-webp-images': 'warn',
        'uses-responsive-images': 'warn',
        
        // 緩存策略
        'uses-long-cache-ttl': 'warn',
        'efficient-animated-content': 'warn',
        
        // 安全性
        'is-on-https': 'error',
        'external-anchors-use-rel-noopener': 'error',
        'geolocation-on-start': 'error',
        'notification-on-start': 'error',
      },
    },
    upload: {
      target: 'lhci',
      serverBaseUrl: process.env.LHCI_SERVER_URL,
      token: process.env.LHCI_TOKEN,
    },
  },
};