const fs = require('fs');
const path = require('path');

console.log("Environment variables:");
console.log("REACT_APP_FIREBASE_DATABASE_URL:", process.env.REACT_APP_FIREBASE_DATABASE_URL);

// Check all files in the directory for env definitions
const rootFiles = fs.readdirSync(__dirname);
for (const file of rootFiles) {
    if (file.toLowerCase().includes('env')) {
        console.log(`Found env-like file: ${file}`);
        try {
            console.log(fs.readFileSync(path.join(__dirname, file), 'utf-8').slice(0, 100));
        } catch (e) {}
    }
}
