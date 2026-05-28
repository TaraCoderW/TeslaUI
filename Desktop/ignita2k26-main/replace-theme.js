import fs from 'fs';

let content = fs.readFileSync('src/index.css', 'utf-8');
content = content.replace(/200 95% 65%/g, '0 95% 60%')
                 .replace(/260 85% 75%/g, '20 85% 60%')
                 .replace(/180 90% 65%/g, '15 90% 60%')
                 .replace(/330 85% 70%/g, '0 90% 55%')
                 .replace(/199 89% 48%/g, '0 89% 50%')
                 .replace(/263 70% 58%/g, '20 70% 50%');

fs.writeFileSync('src/index.css', content);
console.log('Theme replaced in index.css');
