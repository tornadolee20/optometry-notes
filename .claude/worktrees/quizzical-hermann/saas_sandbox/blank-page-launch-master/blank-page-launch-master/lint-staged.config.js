export default {
  // TypeScript and JavaScript files
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
    () => 'tsc --noEmit', // Type check all files
  ],
  
  // CSS and styling files
  '*.{css,scss,sass}': [
    'prettier --write',
  ],
  
  // JSON and configuration files
  '*.{json,yml,yaml}': [
    'prettier --write',
  ],
  
  // Markdown files
  '*.{md,mdx}': [
    'prettier --write',
  ],
  
  // Package.json specific checks
  'package.json': [
    'prettier --write',
    () => 'npm audit --audit-level=moderate',
  ],
  
  // Test files
  '*.test.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
    () => 'npm run test:unit -- --run --reporter=basic',
  ],
};