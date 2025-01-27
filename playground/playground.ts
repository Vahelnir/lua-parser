import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { lexer } from "../src/lexer";

main();

async function main() {
  const file = await readFile(
    join(import.meta.dirname, "./example.lua"),
    "utf-8",
  );

  const tokens = lexer(file);
  console.log(tokens);
}
