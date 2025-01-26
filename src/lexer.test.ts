import { describe, it } from "node:test";
import { deepEqual, throws } from "node:assert/strict";
import { lexer, type LexToken } from "./lexer";
import { notDeepEqual } from "node:assert";

describe("lexer", () => {
  it("nil", () => {
    deepEqual(lexer("nil"), [{ type: "nil" }] satisfies LexToken[]);
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
        { type: "number", value: 4 },
      ] satisfies LexToken[]);
    });

    it("0.4", () => {
      deepEqual(lexer("0.4"), [
        { type: "number", value: 0.4 },
      ] satisfies LexToken[]);
    });

    it("4.57e-3", () => {
      deepEqual(lexer("4.57e-3"), [
        { type: "number", value: 4.57e-3 },
      ] satisfies LexToken[]);
    });

    it("0.3e12", () => {
      deepEqual(lexer("0.3e12"), [
        { type: "number", value: 0.3e12 },
      ] satisfies LexToken[]);
    });

    it("5e+20", () => {
      deepEqual(lexer("5e+20"), [
        { type: "number", value: 5e20 },
      ] satisfies LexToken[]);
    });

    it("1 + 1", () => {
      deepEqual(lexer("1 + 1"), [
        { type: "number", value: 1 },
        { type: "+" },
        { type: "number", value: 1 },
      ] satisfies LexToken[]);
    });

    it("1 - 1", () => {
      deepEqual(lexer("1 - 1"), [
        { type: "number", value: 1 },
        { type: "-" },
        { type: "number", value: 1 },
      ] satisfies LexToken[]);
    });

    it("1 / 1", () => {
      deepEqual(lexer("1 / 1"), [
        { type: "number", value: 1 },
        { type: "/" },
        { type: "number", value: 1 },
      ] satisfies LexToken[]);
    });

    it("1 * 1", () => {
      deepEqual(lexer("1 * 1"), [
        { type: "number", value: 1 },
        { type: "*" },
        { type: "number", value: 1 },
      ] satisfies LexToken[]);
    });

    it("(1 + 1) * 2", () => {
      deepEqual(lexer("(1 + 1) * 2"), [
        { type: "(" },
        { type: "number", value: 1 },
        { type: "+" },
        { type: "number", value: 1 },
        { type: ")" },
        { type: "*" },
        { type: "number", value: 2 },
      ] satisfies LexToken[]);
    });

    describe("should be invalid", () => {
      it("4.", () => {
        throws(() => lexer("4."), new Error("Unexpected character: ."));
      });

      it("1e", () => {
        throws(() => lexer("1e"), new Error("Unexpected character: e"));
      });

      it("1e1.1", () => {
        throws(() => lexer("1e.1"), new Error("Unexpected character: e"));
      });

      it("1e-", () => {
        throws(() => lexer("1e-"), new Error("Unexpected character: e"));
      });
    });
  });
});
