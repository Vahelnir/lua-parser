import { describe, it } from "node:test";
import { deepEqual, throws } from "node:assert/strict";
import { lexer, type LexToken } from "./lexer";
import { notDeepEqual } from "node:assert";

describe("lexer", () => {
  describe("keywords", () => {
    it("and", () => {
      deepEqual(lexer("and"), [
        { type: "keyword", value: "and" },
      ] satisfies LexToken[]);
    });

    it("break", () => {
      deepEqual(lexer("break"), [
        { type: "keyword", value: "break" },
      ] satisfies LexToken[]);
    });

    it("do", () => {
      deepEqual(lexer("do"), [
        { type: "keyword", value: "do" },
      ] satisfies LexToken[]);
    });

    it("if", () => {
      deepEqual(lexer("if"), [
        { type: "keyword", value: "if" },
      ] satisfies LexToken[]);
    });

    it("else", () => {
      deepEqual(lexer("else"), [
        { type: "keyword", value: "else" },
      ] satisfies LexToken[]);
    });

    it("elseif", () => {
      deepEqual(lexer("elseif"), [
        { type: "keyword", value: "elseif" },
      ] satisfies LexToken[]);
    });

    it("end", () => {
      deepEqual(lexer("end"), [
        { type: "keyword", value: "end" },
      ] satisfies LexToken[]);
    });

    it("for", () => {
      deepEqual(lexer("for"), [
        { type: "keyword", value: "for" },
      ] satisfies LexToken[]);
    });

    it("function", () => {
      deepEqual(lexer("function"), [
        { type: "keyword", value: "function" },
      ] satisfies LexToken[]);
    });

    it("in", () => {
      deepEqual(lexer("in"), [
        { type: "keyword", value: "in" },
      ] satisfies LexToken[]);
    });

    it("local", () => {
      deepEqual(lexer("local"), [
        { type: "keyword", value: "local" },
      ] satisfies LexToken[]);
    });

    it("nil", () => {
      deepEqual(lexer("nil"), [
        { type: "keyword", value: "nil" },
      ] satisfies LexToken[]);
    });

    it("not", () => {
      deepEqual(lexer("not"), [
        { type: "keyword", value: "not" },
      ] satisfies LexToken[]);
    });

    it("or", () => {
      deepEqual(lexer("or"), [
        { type: "keyword", value: "or" },
      ] satisfies LexToken[]);
    });

    it("repeat", () => {
      deepEqual(lexer("repeat"), [
        { type: "keyword", value: "repeat" },
      ] satisfies LexToken[]);
    });

    it("return", () => {
      deepEqual(lexer("return"), [
        { type: "keyword", value: "return" },
      ] satisfies LexToken[]);
    });

    it("then", () => {
      deepEqual(lexer("then"), [
        { type: "keyword", value: "then" },
      ] satisfies LexToken[]);
    });

    it("until", () => {
      deepEqual(lexer("until"), [
        { type: "keyword", value: "until" },
      ] satisfies LexToken[]);
    });

    it("while", () => {
      deepEqual(lexer("while"), [
        { type: "keyword", value: "while" },
      ] satisfies LexToken[]);
    });
  });

  describe("identifiers", () => {
    it("a", () => {
      deepEqual(lexer("a"), [
        { type: "identifier", value: "a" },
      ] satisfies LexToken[]);
    });

    it("a1", () => {
      deepEqual(lexer("a1"), [
        { type: "identifier", value: "a1" },
      ] satisfies LexToken[]);
    });

    it("a_b", () => {
      deepEqual(lexer("a_b"), [
        { type: "identifier", value: "a_b" },
      ] satisfies LexToken[]);
    });

    it("_a", () => {
      deepEqual(lexer("_a"), [
        { type: "identifier", value: "_a" },
      ] satisfies LexToken[]);
    });

    it("_1", () => {
      deepEqual(lexer("_1"), [
        { type: "identifier", value: "_1" },
      ] satisfies LexToken[]);
    });

    it("_", () => {
      deepEqual(lexer("_"), [
        { type: "identifier", value: "_" },
      ] satisfies LexToken[]);
    });

    describe("should be invalid", () => {
      it("1a", () => {
        notDeepEqual(lexer("1a"), [
          { type: "identifier", value: "1a" },
        ] satisfies LexToken[]);
      });

      it("1_", () => {
        notDeepEqual(lexer("1_"), [
          { type: "identifier", value: "1_" },
        ] satisfies LexToken[]);
      });
    });
  });

  describe("booleans", () => {
    it("true", () => {
      deepEqual(lexer("true"), [
        { type: "boolean", value: true },
      ] satisfies LexToken[]);
    });

    it("false", () => {
      deepEqual(lexer("false"), [
        { type: "boolean", value: false },
      ] satisfies LexToken[]);
    });
  });

  describe("strings", () => {
    it("''", () => {
      deepEqual(lexer("''"), [
        { type: "string", value: "''" },
      ] satisfies LexToken[]);
    });

    it('""', () => {
      deepEqual(lexer('""'), [
        { type: "string", value: '""' },
      ] satisfies LexToken[]);
    });

    it("'hello'", () => {
      deepEqual(lexer("'hello'"), [
        { type: "string", value: "'hello'" },
      ] satisfies LexToken[]);
    });

    it('"hello"', () => {
      deepEqual(lexer('"hello"'), [
        { type: "string", value: '"hello"' },
      ] satisfies LexToken[]);
    });

    it("[[ hello ]]", () => {
      deepEqual(lexer("[[ hello ]]"), [
        { type: "string", value: "[[ hello ]]" },
      ] satisfies LexToken[]);
    });

    it("[[\\nhello\\n[[ world ]]\\n]]", () => {
      deepEqual(lexer("[[\nhello\n[[ world ]]\n]]"), [
        { type: "string", value: "[[\nhello\n[[ world ]]\n]]" },
      ] satisfies LexToken[]);
    });

    describe("should be invalid", () => {
      it("'\"", () => {
        throws(() => lexer("'\""), new Error("Unfinished string"));
      });

      it("\"'", () => {
        throws(() => lexer("\"'"), new Error("Unfinished string"));
      });

      it('"hello\\nworld"', () => {
        throws(() => lexer('"hello\nworld"'), new Error("Unfinished string"));
      });

      it("[[\\nhello\\n[[ world ]]\\n", () => {
        throws(() => lexer("[[\nhello\n[[ world ]]\n"), "l");
      });
    });
  });

  describe("numbers", () => {
    it("4", () => {
      deepEqual(lexer("4"), [
        { type: "number", value: "4" },
      ] satisfies LexToken[]);
    });

    it("0.4", () => {
      deepEqual(lexer("0.4"), [
        { type: "number", value: "0.4" },
      ] satisfies LexToken[]);
    });

    it("4.57e-3", () => {
      deepEqual(lexer("4.57e-3"), [
        { type: "number", value: "4.57e-3" },
      ] satisfies LexToken[]);
    });

    it("0.3e12", () => {
      deepEqual(lexer("0.3e12"), [
        { type: "number", value: "0.3e12" },
      ] satisfies LexToken[]);
    });

    it("5e+20", () => {
      deepEqual(lexer("5e+20"), [
        { type: "number", value: "5e+20" },
      ] satisfies LexToken[]);
    });

    describe("should be invalid", () => {
      it("4.", () => {
        throws(() => lexer("4."), new Error("Unexpected character: ."));
      });

      it("1e", () => {
        notDeepEqual(lexer("1e"), [
          { type: "number", value: "1e" },
        ] satisfies LexToken[]);
      });

      it("1e1.1", () => {
        throws(() => lexer("1e1.1"));
      });

      it("1e-", () => {
        notDeepEqual(lexer("1e-"), [
          { type: "number", value: "1e-" },
        ] satisfies LexToken[]);
      });
    });
  });
});
