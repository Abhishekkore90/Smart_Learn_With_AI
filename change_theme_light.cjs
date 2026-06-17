const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'routes', 'teacher.result.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  // Backgrounds
  { search: /bg-\[\#0B1510\]/g, replace: 'bg-white' }, // Main container
  { search: /bg-\[\#132A1C\]/g, replace: 'bg-emerald-50' }, // Banners
  { search: /bg-\[\#16221A\]/g, replace: 'bg-white' }, // Cards / Selects
  { search: /hover:bg-\[\#1E2E24\]/g, replace: 'hover:bg-slate-50' }, // Card hover
  { search: /bg-emerald-950\/40/g, replace: 'bg-emerald-100' }, // Icon backgrounds
  { search: /bg-emerald-950\/30/g, replace: 'bg-emerald-100' },
  
  // Borders
  { search: /border-\[\#1C2C22\]/g, replace: 'border-slate-200' }, // Main border
  { search: /border-\[\#1E432D\]/g, replace: 'border-emerald-200' }, // Banner border
  { search: /border-\[\#24352B\]/g, replace: 'border-slate-200' }, // Select border
  { search: /border-\[\#22352B\]/g, replace: 'border-slate-200' }, // Card border
  
  // Text Colors
  { search: /text-\[\#E2E8F0\]/g, replace: 'text-slate-800' }, // General text
  { search: /text-white/g, replace: 'text-slate-800' }, // Card titles
  { search: /text-\[\#A3E635\]/g, replace: 'text-emerald-800' }, // Banner text
  { search: /text-emerald-400/g, replace: 'text-emerald-600' }, // Icons / values
  { search: /text-emerald-500/g, replace: 'text-emerald-600' }, // Subtitles
  { search: /text-\[\#4ADE80\]/g, replace: 'text-emerald-600' }, // Chevron text
  { search: /text-\[\#64748B\]/g, replace: 'text-slate-500' }, // Muted text
  { search: /hover:text-emerald-400/g, replace: 'hover:text-emerald-700' },
  { search: /hover:text-emerald-300/g, replace: 'hover:text-emerald-600' },
  
  // Gradients and Shadows
  { search: /from-emerald-600\/5/g, replace: 'from-emerald-50' },
  { search: /shadow-emerald-950\/30/g, replace: 'shadow-emerald-200' },
];

replacements.forEach(({ search, replace }) => {
  content = content.replace(search, replace);
});

// Since we replaced `text-white` with `text-slate-800`, the top nav "निकाल" text might be broken 
// (it was in a gradient pill `bg-gradient-to-r from-emerald-600 to-teal-500`). 
// Let's fix that back to white for just that pill.
// We can find `text-slate-800 font-black text-sm` and replace with `text-white font-black text-sm`.
content = content.replace(/text-slate-800 font-black text-sm/g, 'text-white font-black text-sm');

// Also, the attendance tracker header text was `text-white` and now `text-slate-800`.
// Let's make sure that's fine.

fs.writeFileSync(filePath, content, 'utf8');
console.log('Theme updated to light in teacher.result.tsx');
