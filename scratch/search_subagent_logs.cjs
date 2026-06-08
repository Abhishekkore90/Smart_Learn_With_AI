const fs = require("fs");

const logPath =
  "C:\\Users\\Win-11\\.gemini\\antigravity-ide\\brain\\35464fa8-eedf-4da6-983c-b3bc046b9f1d\\.system_generated\\logs\\transcript.jsonl";
const logLines = fs.readFileSync(logPath, "utf8").split("\n");

for (const line of logLines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    // Find subagent response or steps
    if (
      JSON.stringify(obj).includes("error") ||
      JSON.stringify(obj).includes("failed") ||
      JSON.stringify(obj).includes("failed-precondition")
    ) {
      console.log(`Step ${obj.step_index}: ${obj.type} - has error/fail`);
      if (obj.content && obj.content.includes("error")) {
        console.log(obj.content.slice(0, 500));
      }
    }
  } catch (e) {}
}
