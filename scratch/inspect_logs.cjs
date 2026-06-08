const fs = require("fs");
const path = require("path");

const dir =
  "C:\\Users\\Win-11\\.gemini\\antigravity-ide\\brain\\35464fa8-eedf-4da6-983c-b3bc046b9f1d\\.system_generated\\tasks";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".log"));

for (const file of files) {
  const filePath = path.join(dir, file);
  const stat = fs.statSync(filePath);
  console.log(`File: ${file}, Size: ${stat.size} bytes`);
  const content = fs.readFileSync(filePath, "utf8");
  console.log(content.slice(0, 500));
  console.log("------------------------------------");
}
