const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'AI之眼', 'prompts-index.json');
const outPath = path.join(__dirname, '..', 'AI之眼', 'prompts-categorized.json');

const prompts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Category keyword mappings
const categories = {
  'content-writing': ['writer', 'copywriter', 'blogger', 'editor', 'journalist', 'storyteller', 'novelist', 'screenwriter', 'content', 'essay', 'proofreader'],
  'seo-marketing': ['seo', 'marketing', 'advertiser', 'sales', 'social media', 'brand', 'campaign', 'growth', 'audience', 'influencer'],
  'medical-health': ['doctor', 'physician', 'medical', 'health', 'nurse', 'therapist', 'dietitian', 'nutritionist', 'mental health', 'dentist', 'pharmacist', 'wellness'],
  'education-teaching': ['teacher', 'tutor', 'instructor', 'professor', 'coach', 'mentor', 'trainer', 'educator', 'academic'],
  'research-analysis': ['researcher', 'analyst', 'scientist', 'data', 'statistician', 'economist', 'critic', 'reviewer'],
  'business-strategy': ['business', 'consultant', 'advisor', 'strategist', 'entrepreneur', 'startup', 'manager', 'executive', 'finance', 'accountant', 'investor'],
  'tech-coding': ['developer', 'programmer', 'engineer', 'software', 'coder', 'linux', 'terminal', 'javascript', 'typescript', 'python', 'database', 'security', 'devops'],
  'creative-arts': ['artist', 'designer', 'musician', 'poet', 'composer', 'architect', 'photographer', 'illustrator', 'creative'],
  'communication': ['translator', 'interpreter', 'speaker', 'communicator', 'debate', 'negotiator', 'diplomat'],
  'psychology-counseling': ['psychologist', 'counselor', 'therapist', 'life coach', 'relationship', 'behavioral', 'motivational'],
  'legal': ['lawyer', 'attorney', 'legal', 'law', 'judge', 'paralegal', 'compliance'],
  'roleplay-character': ['character', 'roleplay', 'persona', 'act as', 'impersonate', 'simulate', 'game'],
};

// Categorize each prompt
const categorized = {};
const uncategorized = [];

for (const category of Object.keys(categories)) {
  categorized[category] = [];
}

for (const prompt of prompts) {
  const titleLower = prompt.title.toLowerCase();
  const contentLower = prompt.content.substring(0, 200).toLowerCase();
  let found = false;

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => titleLower.includes(kw) || contentLower.includes(kw))) {
      categorized[category].push({ title: prompt.title });
      found = true;
      break;
    }
  }

  if (!found) {
    uncategorized.push({ title: prompt.title });
  }
}

categorized['other'] = uncategorized;

// Summary stats
const stats = {};
for (const [cat, items] of Object.entries(categorized)) {
  stats[cat] = items.length;
}

const result = { stats, categories: categorized };
fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');

console.log('Categorized prompts:');
for (const [cat, count] of Object.entries(stats)) {
  console.log(`  ${cat}: ${count}`);
}
console.log('\nSaved to:', outPath);
