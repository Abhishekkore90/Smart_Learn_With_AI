const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'routes', 'teacher.result.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  { search: /emerald-600/g, replace: 'blue-600' },
  { search: /teal-500/g, replace: 'cyan-500' },
  { search: /emerald-500/g, replace: 'blue-500' },
  { search: /emerald-400/g, replace: 'blue-400' },
  { search: /emerald-300/g, replace: 'blue-300' },
  { search: /emerald-950/g, replace: 'blue-950' },
  { search: /#132A1C/g, replace: '#172554' },
  { search: /#1E432D/g, replace: '#1E3A8A' },
  { search: /#A3E635/g, replace: '#60A5FA' },
  { search: /#0B1510/g, replace: '#020617' },
  { search: /#1C2C22/g, replace: '#0F172A' },
  { search: /#16221A/g, replace: '#0B1120' },
  { search: /#24352B/g, replace: '#1E293B' },
  { search: /#1E2E24/g, replace: '#172554' },
  { search: /#22352B/g, replace: '#1E293B' },
  { search: /#4ADE80/g, replace: '#3B82F6' }
];

replacements.forEach(({ search, replace }) => {
  content = content.replace(search, replace);
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Theme updated to blue in teacher.result.tsx');
