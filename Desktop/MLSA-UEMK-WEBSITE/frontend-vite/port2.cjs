const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // React Router DOM Link uses `to` instead of `href`
    content = content.replace(/<Link([^>]*)href=/g, '<Link$1to=');
    
    // Remove passHref and legacyBehavior from Link
    content = content.replace(/passHref(\=\{true\})?/g, '');
    content = content.replace(/legacyBehavior(\=\{true\})?/g, '');
    
    // Replace router.push with navigate
    content = content.replace(/router\./g, 'navigate.');
    content = content.replace(/navigate\.push\(/g, 'navigate(');
    content = content.replace(/navigate\.replace\(/g, 'navigate(');

    // Replace next/dynamic with React.lazy
    if (content.includes('next/dynamic')) {
      content = content.replace(/import dynamic from ["']next\/dynamic["'];?/g, 'import { lazy, Suspense } from "react";');
      content = content.replace(/const ([a-zA-Z0-9_]+) = dynamic\(\(\) => import\((.*?)\), .*?\);/g, 'const $1 = lazy(() => import($2));\n// Wrap usages of $1 with <Suspense fallback={<div/>}>');
      content = content.replace(/const ([a-zA-Z0-9_]+) = dynamic\(\(\) => import\((.*?)\)\);/g, 'const $1 = lazy(() => import($2));\n// Wrap usages of $1 with <Suspense fallback={<div/>}>');
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed next.js leftovers in ${filePath}`);
    }
  }
});
