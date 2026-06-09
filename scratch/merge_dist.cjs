const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
const tempDir = path.join(__dirname, '../dist_temp');

console.log('Starting merge process directly into root of dist...');

// Helper to copy recursively
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 1. Create temporary directory
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir, { recursive: true });

// 2. Copy client files to temp
const clientDir = path.join(distDir, 'client');
if (fs.existsSync(clientDir)) {
  console.log('Copying files from dist/client to temp...');
  copyDirSync(clientDir, tempDir);
}

// 3. Copy server files to temp
const serverDir = path.join(distDir, 'server');
if (fs.existsSync(serverDir)) {
  console.log('Copying files from dist/server to temp...');
  copyDirSync(serverDir, tempDir);
}

// 4. Delete everything inside dist
console.log('Cleaning original dist directory...');
if (fs.existsSync(distDir)) {
  const items = fs.readdirSync(distDir);
  for (let item of items) {
    const itemPath = path.join(distDir, item);
    fs.rmSync(itemPath, { recursive: true, force: true });
  }
} else {
  fs.mkdirSync(distDir, { recursive: true });
}

// 5. Copy everything from temp back into dist root
console.log('Moving merged files back to dist root...');
copyDirSync(tempDir, distDir);

// 6. Delete temp directory
fs.rmSync(tempDir, { recursive: true, force: true });

console.log('Success! All files successfully merged directly into dist root: ' + distDir);
