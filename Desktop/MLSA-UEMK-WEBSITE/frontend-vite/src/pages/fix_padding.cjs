const fs = require('fs');
const path = require('path');

const files = [
  'Admin.tsx', 'Contact.tsx', 'Events.tsx', 'Gallery.tsx', 'Join.tsx', 'Portal.tsx', 'Projects.tsx', 'Team.tsx'
];

files.forEach(f => {
  let p = path.join('c:/Users/rahul/Desktop/MLSA-UEMK-WEBSITE/frontend-vite/src/pages', f);
  let content = fs.readFileSync(p, 'utf-8');

  if (f === 'Admin.tsx') {
    content = content.replace('paddingTop: "80px"', 'paddingTop: "120px"');
  }
  if (f === 'Events.tsx') {
    content = content.replace('padding: "80px 40px 52px"', 'padding: "120px 40px 52px"');
  }
  if (f === 'Projects.tsx') {
    content = content.replace('padding: "clamp(80px, 10vw, 120px) clamp(20px, 5vw, 60px) 80px"', 'padding: "clamp(120px, 10vw, 160px) clamp(20px, 5vw, 60px) 80px"');
  }
  if (f === 'Team.tsx') {
    content = content.replace('padding: "60px 48px 80px"', 'padding: "120px 48px 80px"');
  }

  const lines = content.split('\n');
  const divLines = lines.filter(l => l.includes('padding') && (l.includes('<div style=') || l.includes('<main style=')));
  console.log('--- ' + f + ' ---');
  divLines.slice(0, 2).forEach(l => console.log(l));
  
  fs.writeFileSync(p, content);
});
