export type LexToken =
  | {
      type: (typeof ALLOWED_SPECIAL_CHARS)[number];
    }
  | { type: "nil" }
  | { type: "boolean"; value: boolean }
  | { type: "string"; value: string }
  | {
      type: "number";
      value: number;
    };

const ALLOWED_SPECIAL_CHARS = ["+", "-", "/", "*", "(", ")"] as const;

export function lexer(code: string) {
  let cursor = 0;

  const tokens: LexToken[] = [];
  while (cursor < code.length) {
    const char = code[cursor++];
    if ([" ", "\n", "\t"].includes(char)) {
      continue;
    }

    if (isSpecialChar(char)) {
      tokens.push({ type: char });
      continue;
    }

    if (code.slice(cursor - 1, cursor + 2) === "nil") {
      tokens.push({ type: "nil" });
      cursor += 2;
      continue;
    }

    if (code.slice(cursor - 1, cursor + 3) === "true") {
      tokens.push({ type: "boolean", value: true });
      cursor += 3;
      continue;
    }

    if (code.slice(cursor - 1, cursor + 4) === "false") {
      tokens.push({ type: "boolean", value: false });
      cursor += 4;
      continue;
    }

    // strings
    if (char === '"' || char === "'") {
      let string = "";
      while (code[cursor] !== char) {
        if (code[cursor] === undefined || code[cursor] === "\n") {
          throw new Error("Unfinished string");
        }

        string += code[cursor++];
      }

      tokens.push({ type: "string", value: `${char}${string}${char}` });
      cursor++;
      continue;
    }

    if (char === "[" && code[cursor] === "[") {
      cursor++;
      let string = "";
      let depth = 0;
      while (
        !(code[cursor] === "]" && code[cursor + 1] === "]" && depth === 0)
      ) {
        if (code[cursor] === undefined) {
          throw new Error("Unfinished string");
        }

        if (code[cursor] === "[" && code[cursor + 1] === "[") {
          depth++;
          string += code.slice(cursor, cursor + 2);
          cursor += 2;
          continue;
        }

        if (code[cursor] === "]" && code[cursor + 1] === "]") {
          depth--;
          string += code.slice(cursor, cursor + 2);
          cursor += 2;
          continue;
        }

        string += code[cursor++];
      }

      cursor += 2;

      tokens.push({ type: "string", value: `[[${string}]]` });
      continue;
    }

    // numbers
    if (isDigit(char)) {
      let number = char;
      while (isDigit(code[cursor])) {
        number += code[cursor++];
      }

      // floats
      if (code[cursor] === "." && isDigit(code[cursor + 1])) {
        number += code[cursor++];
        while (isDigit(code[cursor])) {
          number += code[cursor++];
        }
      }

      // exponentials
      if (
        code[cursor] === "e" &&
        (isDigit(code[cursor + 1]) ||
          (["+", "-"].includes(code[cursor + 1]) && isDigit(code[cursor + 2])))
      ) {
        number += code[cursor++];
        if (["+", "-"].includes(code[cursor])) {
          number += code[cursor++];
        }

        while (isDigit(code[cursor])) {
          number += code[cursor++];
        }
      }

      tokens.push({ type: "number", value: parseFloat(number) });
      continue;
    }

    throw new Error(`Unexpected character: ${char}`);
  }

  return tokens;
}

function isSpecialChar(
  char: string,
): char is (typeof ALLOWED_SPECIAL_CHARS)[number] {
  return ALLOWED_SPECIAL_CHARS.includes(char as any);
}

function isDigit(char: string) {
  return /[0-9]/.test(char);
}
