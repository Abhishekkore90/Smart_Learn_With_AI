const fs = require("fs");
const path = require("path");

const dir =
  "C:\\Users\\Win-11\\.gemini\\antigravity-ide\\brain\\35464fa8-eedf-4da6-983c-b3bc046b9f1d\\.system_generated\\tasks";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".log"));

for (const file of files) {
  const filePath = path.join(dir, file);
  const content = fs.readFileSync(filePath, "utf8");
  console.log(`--- File: ${file} ---`);

  // Search for console logs or errors in the playbooks/execution details
  const lines = content.split("\n");
  lines.forEach((line, idx) => {
    if (
      line.toLowerCase().includes("error") ||
      line.toLowerCase().includes("console") ||
      line.toLowerCase().includes("fail") ||
      line.includes("toast") ||
      line.includes("success")
    ) {
      console.log(`Line ${idx + 1}: ${line.trim().slice(0, 200)}`);
    }
  });
}
