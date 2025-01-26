import { describe, it } from "node:test";
import { deepEqual, throws } from "node:assert/strict";
import { lexer, type LexToken } from "./lexer";

describe("lexer", () => {
  it("nil", () => {
    deepEqual(lexer("nil"), [{ type: "nil" }] satisfies LexToken[]);
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

    describe("should throw", () => {
      it("4.", () => {
        throws(() => lexer("4."));
      });

      it("1e", () => {
        throws(() => lexer("1e"));
      });

      it("1e1.1", () => {
        throws(() => lexer("1e.1"));
      });

      it("1e-", () => {
        throws(() => lexer("1e-"));
      });
    });
  });
});
