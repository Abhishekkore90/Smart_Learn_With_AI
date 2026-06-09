const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '..', 'node_modules', '@tanstack', 'start-plugin-core', 'node_modules', '@tanstack', 'router-plugin', 'dist', 'esm', 'core', 'code-splitter', 'compilers.js');
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');
console.log("Line 460 exact characters:");
console.log(lines[459]); // 0-indexed
