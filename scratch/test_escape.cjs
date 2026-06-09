const template = require("@babel/template");

const pathWithSingleQuote = "D:/Abhi/Project's/pure-pixel-showcase-main 2/src/routes/upload.tsx";
const localImporterIdent = "$$splitComponentImporter";

// Let's test with two backslashes in replace
try {
  const escaped2 = pathWithSingleQuote.replace(/'/g, "\\'");
  console.log("Escaped with 2 backslashes:", escaped2);
  const code2 = `const ${localImporterIdent} = () => import('${escaped2}')`;
  console.log("Code to parse:", code2);
  const ast2 = template.statement(code2)();
  console.log("Success with 2 backslashes!\n");
} catch (err) {
  console.error("Failed with 2 backslashes:", err.message, "\n");
}

// Let's test with four backslashes in replace
try {
  const escaped4 = pathWithSingleQuote.replace(/'/g, "\\\\'");
  console.log("Escaped with 4 backslashes:", escaped4);
  const code4 = `const ${localImporterIdent} = () => import('${escaped4}')`;
  console.log("Code to parse:", code4);
  const ast4 = template.statement(code4)();
  console.log("Success with 4 backslashes!\n");
} catch (err) {
  console.error("Failed with 4 backslashes:", err.message, "\n");
}

// Let's test with simple replace using double quotes for import
try {
  const codeDoubleQuotes = `const ${localImporterIdent} = () => import("${pathWithSingleQuote}")`;
  console.log("Code to parse (Double Quotes):", codeDoubleQuotes);
  const astDQ = template.statement(codeDoubleQuotes)();
  console.log("Success with Double Quotes!\n");
} catch (err) {
  console.error("Failed with Double Quotes:", err.message, "\n");
}
