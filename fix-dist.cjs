const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist');
const clientPath = path.join(distPath, 'client');
const serverPath = path.join(distPath, 'server');

// Helper to recursively copy files
function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(clientPath)) {
  console.log('Copying client assets to dist root...');
  copyDirSync(clientPath, distPath);
  
  // If _shell.html exists, copy it as index.html
  const shellHtml = path.join(distPath, '_shell.html');
  const indexHtml = path.join(distPath, 'index.html');
  if (fs.existsSync(shellHtml)) {
    fs.copyFileSync(shellHtml, indexHtml);
    console.log('Copied _shell.html to index.html');
  }
  
  // Remove server and client directories to make it a clean static output
  console.log('Cleaning up server/client subdirectories...');
  fs.rmSync(clientPath, { recursive: true, force: true });
  fs.rmSync(serverPath, { recursive: true, force: true });
  console.log('Dist directory is now fixed and ready!');
} else {
  console.log('No client folder found in dist/ to process.');
}
