const fs = require('fs');
const path = require('path');

const targetRegex = /const getTranslated\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?(?:return\s+[^;]+;|return\s+[^}]+\})\s*\};/g;

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && file !== 'node_modules' && file !== '.next' && file !== '.git' && file !== 'scratch') {
            processDirectory(fullPath);
        } else if (stat.isFile() && (fullPath.endsWith('.js') || fullPath.endsWith('.jsx'))) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Standard (most files use this)
            const standardReplacement = `const getTranslated = (field, lang = language) => {
    if (!field) return "";
    let parsed = field;
    if (typeof field === "string") {
      try {
        parsed = JSON.parse(field);
      } catch (e) {
        return field;
      }
    }
    if (typeof parsed === "object" && parsed !== null) {
      const v = parsed[lang] || parsed.en || parsed.hi || parsed.gu || Object.values(parsed)[0];
      return v !== undefined && v !== null ? v : "";
    }
    return typeof parsed === 'string' || typeof parsed === 'number' ? parsed : "";
  };`;

            // Admin variant
            const adminReplacement = `const getTranslated = (field, fallback = '') => {
    if (!field) return fallback;
    let parsed = field;
    if (typeof field === 'string') {
        try { parsed = JSON.parse(field); } catch (e) { return field; }
    }
    if (typeof parsed === 'object' && parsed !== null) {
        const v = parsed[language] || parsed.en || parsed.hi || parsed.gu || Object.values(parsed)[0];
        return v !== undefined && v !== null ? v : fallback;
    }
    return typeof parsed === 'string' || typeof parsed === 'number' ? parsed : fallback;
  };`;

            // Extended variant
            const extendedReplacement = `const getTranslated = (obj, field = 'name', currentLang = language) => {
    if (!obj) return '';
    let val = obj[field];
    if (typeof val === 'string') {
        try {
            val = JSON.parse(val);
        } catch(e) {}
    }
    if (typeof val === 'object' && val !== null) {
        const v = val[currentLang] || val.en || val.hi || val.gu || Object.values(val)[0];
        return v !== undefined && v !== null ? v : '';
    }
    if (currentLang === 'hi' && obj[\`\${field}Hi\`]) return obj[\`\${field}Hi\`];
    if (currentLang === 'gu' && obj[\`\${field}Gu\`]) return obj[\`\${field}Gu\`];
    return typeof val === 'string' || typeof val === 'number' ? val : '';
  };`;

            content = content.replace(targetRegex, (match) => {
                modified = true;
                if (match.includes(`const getTranslated = (obj, field`)) {
                    return extendedReplacement;
                } else if (match.includes(`fallback`)) {
                    return adminReplacement;
                } else {
                    return standardReplacement;
                }
            });

            const inlineRegex = /const getTranslated = \(f\) => \{[\s\S]*?return p;\s*\};/g;
            const inlineReplacement = `const getTranslated = (f) => {
    if (!f) return '';
    let p = f;
    if (typeof f === 'string') { try { p = JSON.parse(f); } catch(e) { return f; }}
    if (typeof p === 'object' && p !== null) {
      const v = p[language] || p.en || p.hi || p.gu || Object.values(p)[0];
      return v !== undefined && v !== null ? v : "";
    }
    return typeof p === 'string' || typeof p === 'number' ? p : "";
  };`;
            
            if (inlineRegex.test(content)) {
                content = content.replace(inlineRegex, inlineReplacement);
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

processDirectory('.');
