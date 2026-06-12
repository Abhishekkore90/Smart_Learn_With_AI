const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.join(__dirname, 'node_modules', '@tanstack', 'router-plugin', 'dist', 'esm', 'core', 'code-splitter', 'compilers.js'),
  path.join(__dirname, 'node_modules', '@tanstack', 'router-plugin', 'dist', 'cjs', 'core', 'code-splitter', 'compilers.cjs')
];

targetFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Look for: import('${splitUrl}')
      // Replace with: import(${JSON.stringify(splitUrl)})
      const target = "import('${splitUrl}')";
      const replacement = "import(${JSON.stringify(splitUrl)})";
      
      if (content.includes(target)) {
        // We use split-join to replace all occurrences
        content = content.split(target).join(replacement);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Successfully patched: ${filePath}`);
      } else {
        console.log(`Already patched or target pattern not found in: ${filePath}`);
      }
    } catch (err) {
      console.error(`Failed to patch ${filePath}:`, err);
    }
  } else {
    console.log(`File not found: ${filePath}`);
  }
});
