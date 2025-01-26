import { FileCursor } from "./file-cursor";

export type LexToken =
  | { type: "keyword"; value: (typeof KEYWORDS)[number] }
  | {
      type: "operator";
      value: (typeof OPERATORS)[number];
    }
  | {
      type: "punctuation";
      value: (typeof PUNCTUATION)[number];
    }
  | { type: "boolean"; value: boolean }
  | { type: "string"; value: string }
  | {
      type: "number";
      value: string;
    }
  | { type: "identifier"; value: string }
  | { type: "comment"; value: string };

const KEYWORDS = [
  "and",
  "break",
  "do",
  "if",
  // NOTE: elseif needs to be before else to avoid matching else
  "elseif",
  "else",
  "end",
  "for",
  "function",
  "in",
  "local",
  "nil",
  "not",
  "or",
  "repeat",
  "return",
  "then",
  "until",
  "while",
] as const;
const OPERATORS = [
  "..",
  "<=",
  ">=",
  "==",
  "~=",
  "+",
  "-",
  "/",
  "*",
  "=",
  "^",
  "<",
  ">",
] as const;
const PUNCTUATION = ["(", ")", ";", "{", "}", "[", "]", ",", "."] as const;

// TODO: see how much faster would avoiding regexes be (for isDigit, identifiers, etc)

export function lexer(code: string) {
  const cursor = new FileCursor(code);
  const tokens: LexToken[] = [];

  while (cursor.hasNext()) {
    const peekedChar = cursor.peek();
    if ([" ", "\n", "\t"].includes(peekedChar)) {
      cursor.skip();
      continue;
    }

    const foundKeyword = KEYWORDS.find((keyword) => cursor.match(keyword));
    if (foundKeyword) {
      tokens.push({
        type: "keyword",
        value: foundKeyword,
      });
      continue;
    }

    if (cursor.match("true")) {
      tokens.push({ type: "boolean", value: true });
      continue;
    }

    if (cursor.match("false")) {
      tokens.push({ type: "boolean", value: false });
      continue;
    }

    // strings
    if (peekedChar === '"' || peekedChar === "'") {
      const delimiter = cursor.next();
      let string = "";
      while (cursor.peek() !== delimiter) {
        if (cursor.peek() === undefined || cursor.peek() === "\n") {
          throw new Error("Unfinished string");
        }

        string += cursor.next();
      }

      tokens.push({ type: "string", value: `${string}` });
      cursor.skip();
      continue;
    }

    // multiline strings
    if (cursor.match("[[")) {
      let string = extractMultilineString(code, cursor);

      tokens.push({ type: "string", value: string });
      continue;
    }

    // comments
    if (cursor.match("--")) {
      let comment = "";
      if (cursor.match("[[")) {
        comment += `${extractMultilineString(code, cursor)}`;
      } else {
        while (cursor.peek() && cursor.peek() !== "\n") {
          comment += cursor.next();
        }
      }

      tokens.push({ type: "comment", value: comment });
      continue;
    }

    // numbers
    if (isDigit(peekedChar)) {
      let number = cursor.next();
      while (isDigit(cursor.peek())) {
        number += cursor.next();
      }

      // floats
      if (cursor.peek() === "." && isDigit(cursor.peek(1))) {
        number += cursor.next();
        while (isDigit(cursor.peek())) {
          number += cursor.next();
        }
      }

      // exponentials
      if (
        cursor.peek() === "e" &&
        (isDigit(cursor.peek(1)) ||
          (["+", "-"].includes(cursor.peek(1)) && isDigit(cursor.peek(2))))
      ) {
        number += cursor.next();
        if (["+", "-"].includes(cursor.peek())) {
          number += cursor.next();
        }

        while (isDigit(cursor.peek())) {
          number += cursor.next();
        }
      }

      tokens.push({ type: "number", value: number });
      continue;
    }

    const foundOperator = OPERATORS.find((operator) => cursor.match(operator));
    if (foundOperator) {
      tokens.push({ type: "operator", value: foundOperator });
      continue;
    }

    if (isPunctuation(peekedChar)) {
      tokens.push({ type: "punctuation", value: peekedChar });
      cursor.skip();
      continue;
    }

    // identifiers
    if (/[a-zA-Z_]/.test(peekedChar)) {
      let identifier = cursor.next();
      while (
        cursor.peek() !== undefined &&
        /[a-zA-Z_0-9]/.test(cursor.peek())
      ) {
        identifier += cursor.next();
      }

      tokens.push({ type: "identifier", value: identifier });
      continue;
    }

    throw new Error(`Unexpected character: ${peekedChar}`);
  }

  return tokens;
}

function isPunctuation(char: string): char is (typeof PUNCTUATION)[number] {
  return PUNCTUATION.includes(char as any);
}

function isDigit(char: string) {
  return /[0-9]/.test(char);
}

function extractMultilineString(code: string, cursor: FileCursor) {
  let string = "";
  let depth = 0;
  while (!(cursor.doesMatch("]]") && depth === 0)) {
    if (cursor.peek() === undefined) {
      throw new Error("Unfinished string");
    }

    if (cursor.doesMatch("[[")) {
      depth++;
      string += cursor.nextSlice(2);
      continue;
    }

    if (cursor.doesMatch("]]")) {
      depth--;
      string += cursor.nextSlice(2);
      continue;
    }

    string += cursor.next();
  }

  // skip the closing ]]
  cursor.skip(2);

  return string;
}
