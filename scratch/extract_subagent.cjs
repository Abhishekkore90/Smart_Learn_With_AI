const fs = require("fs");

const logPath =
  "C:\\Users\\Win-11\\.gemini\\antigravity-ide\\brain\\35464fa8-eedf-4da6-983c-b3bc046b9f1d\\.system_generated\\logs\\transcript.jsonl";
const logLines = fs.readFileSync(logPath, "utf8").split("\n");

for (const line of logLines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.step_index === 286) {
      // Print everything about step 286
      console.log("--- Step 286 keys ---", Object.keys(obj));
      console.log(
        "--- Step 286 content length ---",
        obj.content ? obj.content.length : 0,
      );
      if (obj.content) {
        fs.writeFileSync("subagent_content.txt", obj.content);
        console.log("Saved subagent content to subagent_content.txt");
      }
    }
  } catch (e) {
    console.error(e);
  }
}
