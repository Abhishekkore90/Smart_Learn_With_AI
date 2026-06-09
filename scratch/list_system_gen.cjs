const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
}

const dirPath =
  "C:\\Users\\Win-11\\.gemini\\antigravity-ide\\brain\\35464fa8-eedf-4da6-983c-b3bc046b9f1d\\.system_generated";
console.log(
  walk(dirPath)
    .filter(
      (f) => f.endsWith(".json") || f.endsWith(".log") || f.includes("console"),
    )
    .slice(0, 50),
);
