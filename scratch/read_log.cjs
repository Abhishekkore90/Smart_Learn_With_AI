const fs = require("fs");
const logPath =
  "C:\\Users\\Win-11\\.gemini\\antigravity-ide\\brain\\35464fa8-eedf-4da6-983c-b3bc046b9f1d\\.system_generated\\logs\\transcript.jsonl";
const logLines = fs.readFileSync(logPath, "utf8").split("\n").filter(Boolean);
for (let i = 0; i < logLines.length; i++) {
  try {
    const obj = JSON.parse(logLines[i]);
    if (obj.step_index === 286) {
      console.log(JSON.stringify(obj, null, 2));
    }
  } catch (e) {}
}
