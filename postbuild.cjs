const fs = require('fs');
const path = require('path');

const distPath = path.resolve(__dirname, 'dist');
const clientPath = path.join(distPath, 'client');
const serverPath = path.join(distPath, 'server');
const rootDistPath = path.resolve(__dirname, '..', 'dist');

if (fs.existsSync(clientPath)) {
  console.log('Post-build: Flattening dist/client into dist folders...');

  // Ensure root dist exists
  if (!fs.existsSync(rootDistPath)) {
    fs.mkdirSync(rootDistPath, { recursive: true });
  }

  // Helper function to recursively copy directories/files
  function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      fs.readdirSync(src).forEach((childItemName) => {
        copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  // Copy everything from dist/client to both distPath and rootDistPath
  fs.readdirSync(clientPath).forEach((file) => {
    const srcFile = path.join(clientPath, file);
    
    // Copy to pure-pixel-showcase-main/dist
    const destFileLocal = path.join(distPath, file);
    copyRecursiveSync(srcFile, destFileLocal);

    // Copy to root /dist
    const destFileRoot = path.join(rootDistPath, file);
    copyRecursiveSync(srcFile, destFileRoot);
  });

  // Rename _shell.html to index.html if it exists in both
  const renameHtml = (dir) => {
    const shellPath = path.join(dir, '_shell.html');
    const indexPath = path.join(dir, 'index.html');
    if (fs.existsSync(shellPath)) {
      fs.renameSync(shellPath, indexPath);
    }
  };
  renameHtml(distPath);
  renameHtml(rootDistPath);
  console.log('Post-build: Renamed _shell.html to index.html in both dist folders');

  // Create vercel.json for SPA routing inside both dist folders
  const writeVercelJson = (dir) => {
    const vercelJsonPath = path.join(dir, 'vercel.json');
    const vercelConfig = {
      cleanUrls: true,
      rewrites: [
        {
          source: '/(.*)',
          destination: '/index.html'
        }
      ]
    };
    fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelConfig, null, 2), 'utf-8');
  };
  writeVercelJson(distPath);
  writeVercelJson(rootDistPath);
  console.log('Post-build: Created vercel.json in both dist folders');

  // Helper to recursively delete directory
  function deleteRecursiveSync(targetPath) {
    if (fs.existsSync(targetPath)) {
      fs.readdirSync(targetPath).forEach((file) => {
        const curPath = path.join(targetPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          deleteRecursiveSync(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(targetPath);
    }
  }

  // Clean up client and server directories, server.js, wrangler.json, and .assetsignore in local dist
  console.log('Post-build: Cleaning up temp files...');
  deleteRecursiveSync(clientPath);
  deleteRecursiveSync(serverPath);
  
  const filesToDelete = ['server.js', 'wrangler.json', '.assetsignore'];
  filesToDelete.forEach(file => {
    const filePath = path.join(distPath, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  console.log('Post-build: Success! Subproject dist/ and Root dist/ folders are now vercel-friendly.');
} else {
  console.log('Post-build: dist/client directory not found, skipping flattening.');
}
