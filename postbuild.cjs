const fs = require('fs');
const path = require('path');

const distPath = path.resolve(__dirname, 'dist');
const clientPath = path.join(distPath, 'client');
const serverPath = path.join(distPath, 'server');
const rootDistPath = path.resolve(__dirname, '..', 'dist');

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

if (fs.existsSync(clientPath)) {
  console.log('Post-build: Flattening dist/client into dist folders...');

  // Ensure root dist exists
  if (!fs.existsSync(rootDistPath)) {
    fs.mkdirSync(rootDistPath, { recursive: true });
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

  // Create vercel.json for SPA routing inside both dist folders (for drag-and-drop)
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

  // ============================================================
  // Vercel Build Output API v3
  // This bypasses ALL Vercel framework detection and forces
  // a pure static deployment with SPA catch-all routing.
  // ============================================================
  const vercelOutputPath = path.resolve(__dirname, '.vercel', 'output');
  const vercelStaticPath = path.join(vercelOutputPath, 'static');

  // Clean previous .vercel/output if it exists
  deleteRecursiveSync(vercelOutputPath);

  // Create .vercel/output/config.json
  fs.mkdirSync(vercelOutputPath, { recursive: true });
  const vercelOutputConfig = {
    version: 3,
    routes: [
      { handle: "filesystem" },
      { src: "/(.*)", dest: "/index.html" }
    ]
  };
  fs.writeFileSync(
    path.join(vercelOutputPath, 'config.json'),
    JSON.stringify(vercelOutputConfig, null, 2),
    'utf-8'
  );

  // Copy flat dist contents into .vercel/output/static
  fs.mkdirSync(vercelStaticPath, { recursive: true });
  fs.readdirSync(distPath).forEach((file) => {
    // Skip client/server subdirs if they still exist, and skip vercel.json
    if (file === 'client' || file === 'server' || file === 'vercel.json') return;
    const srcFile = path.join(distPath, file);
    const destFile = path.join(vercelStaticPath, file);
    copyRecursiveSync(srcFile, destFile);
  });
  console.log('Post-build: Created .vercel/output (Build Output API v3) for static SPA deployment');

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
