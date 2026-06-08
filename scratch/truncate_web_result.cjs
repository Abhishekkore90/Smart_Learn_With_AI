const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/result/webResult.jsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split(/\r?\n/);

console.log('Original lines:', lines.length);

// We want to keep lines 1 to 1661 (which corresponds to index 0 to 1660)
const truncatedLines = lines.slice(0, 1661);
console.log('Truncated lines:', truncatedLines.length);

fs.writeFileSync(filePath, truncatedLines.join('\n'), 'utf8');
console.log('File successfully truncated!');
