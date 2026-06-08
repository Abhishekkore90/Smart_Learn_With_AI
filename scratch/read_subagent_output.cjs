const fs = require("fs");

const logPath =
  "C:\\Users\\Win-11\\.gemini\\antigravity-ide\\brain\\35464fa8-eedf-4da6-983c-b3bc046b9f1d\\.system_generated\\logs\\transcript.jsonl";
const logLines = fs.readFileSync(logPath, "utf8").split("\n");

for (const line of logLines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.step_index === 286) {
      console.log("--- Step 286 content ---");
      console.log(obj.content);
    }
  } catch (e) {}
}
