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

    // Remove "use client";
    content = content.replace(/"use client";?\n?/g, '');
    content = content.replace(/'use client';?\n?/g, '');

    // Replace next/link
    content = content.replace(/import Link from ["']next\/link["'];?/g, 'import { Link } from "react-router-dom";');
    
    // Replace next/navigation
    content = content.replace(/import { useRouter } from ["']next\/navigation["'];?/g, 'import { useNavigate } from "react-router-dom";');
    content = content.replace(/import { usePathname } from ["']next\/navigation["'];?/g, 'import { useLocation } from "react-router-dom";');
    
    // Replace useRouter() -> useNavigate()
    content = content.replace(/const router = useRouter\(\);?/g, 'const navigate = useNavigate();');
    content = content.replace(/router\.push\(/g, 'navigate(');
    content = content.replace(/router\.replace\(/g, 'navigate(');
    content = content.replace(/router\.back\(\)/g, 'navigate(-1)');

    // Replace usePathname() -> useLocation().pathname
    content = content.replace(/const pathname = usePathname\(\);?/g, 'const location = useLocation();\n  const pathname = location.pathname;');

    // Replace next/image
    content = content.replace(/import Image from ["']next\/image["'];?/g, '');
    // <Image src="..." alt="..." width={..} height={..} /> -> <img src="..." alt="..." width={..} height={..} />
    content = content.replace(/<Image\s/g, '<img ');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
