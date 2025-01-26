export type LexToken =
  | {
      type: (typeof ALLOWED_SPECIAL_CHARS)[number];
    }
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
