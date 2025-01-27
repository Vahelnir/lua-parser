import { describe, it } from "node:test";
import { lexer } from "./lexer";
import { deepEqual, throws } from "node:assert";
import { parser, type Statement } from "./parser";

function parse(code: string) {
  return parser(lexer(code));
}

function parseExpression(code: string) {
  return parser(lexer(`a = ${code}`)).initialization[0];
}

describe("parser", () => {
  describe("var", () => {
    it("a = 1 + 2", () => {
      const ast = parse("a = 1 + 2");
      deepEqual(ast, {
        type: "assignment",
        variables: [
          {
            type: "identifier",
            value: "a",
          },
        ],
        initialization: [
          {
            type: "binary",
            left: { type: "number_literal", value: "1" },
            operator: "+",
            right: { type: "number_literal", value: "2" },
          },
        ],
      } satisfies Statement);
    });

    it("a, b = 2", () => {
      const ast = parse("a, b = 2");
      deepEqual(ast, {
        type: "assignment",
        variables: [
          {
            type: "identifier",
            value: "a",
          },
          {
            type: "identifier",
            value: "b",
          },
        ],
        initialization: [
          {
            type: "number_literal",
            value: "2",
          },
        ],
      } satisfies Statement);
    });

    it("a, b = 'hello', 'world'", () => {
      const ast = parse("a, b = 'hello', 'world'");
      deepEqual(ast, {
        type: "assignment",
        variables: [
          {
            type: "identifier",
            value: "a",
          },
          {
            type: "identifier",
            value: "b",
          },
        ],
        initialization: [
          {
            type: "string_literal",
            value: "hello",
          },
          {
            type: "string_literal",
            value: "world",
          },
        ],
      } satisfies Statement);
    });
  });

  describe("equality", () => {
    it("1 == 2", () => {
      const expressionAst = parseExpression("1 == 2");
      deepEqual(expressionAst, {
        type: "binary",
        left: { type: "number_literal", value: "1" },
        operator: "==",
        right: { type: "number_literal", value: "2" },
      });
    });

    it("1 ~= 2", () => {
      const expressionAst = parseExpression("1 ~= 2");
      deepEqual(expressionAst, {
        type: "binary",
        left: { type: "number_literal", value: "1" },
        operator: "~=",
        right: { type: "number_literal", value: "2" },
      });
    });

    it("1 <= 2 >= 3", () => {
      const expressionAst = parseExpression("1 == 2 == 3");
      deepEqual(expressionAst, {
        type: "binary",
        left: { type: "number_literal", value: "1" },
        operator: "==",
        right: {
          type: "binary",
          left: { type: "number_literal", value: "2" },
          operator: "==",
          right: { type: "number_literal", value: "3" },
        },
      });
    });
  });

  describe("terms", () => {
    it("1 + 2", () => {
      const expressionAst = parseExpression("1 + 2");
      deepEqual(expressionAst, {
        type: "binary",
        left: { type: "number_literal", value: "1" },
        operator: "+",
        right: { type: "number_literal", value: "2" },
      });
    });

    it("1 + 2 + 3", () => {
      const expressionAst = parseExpression("1 + 2 + 3");
      deepEqual(expressionAst, {
        type: "binary",
        left: {
          type: "binary",
          left: { type: "number_literal", value: "1" },
          operator: "+",
          right: { type: "number_literal", value: "2" },
        },
        operator: "+",
        right: { type: "number_literal", value: "3" },
      });
    });
  });

  describe("factors", () => {
    it("1 * 2 / 3 + 4", () => {
      const expressionAst = parseExpression("1 * 2 / 3 + 4");
      deepEqual(expressionAst, {
        type: "binary",
        left: {
          type: "binary",
          left: {
            type: "binary",
            left: { type: "number_literal", value: "1" },
            operator: "*",
            right: { type: "number_literal", value: "2" },
          },
          operator: "/",
          right: { type: "number_literal", value: "3" },
        },
        operator: "+",
        right: { type: "number_literal", value: "4" },
      });
    });

    it("1 * 2 / (3 + 4)", () => {
      const expressionAst = parseExpression("1 * 2 / 3 + 4");
      deepEqual(expressionAst, {
        type: "binary",
        left: {
          type: "binary",
          left: {
            type: "binary",
            left: { type: "number_literal", value: "1" },
            operator: "*",
            right: { type: "number_literal", value: "2" },
          },
          operator: "/",
          right: { type: "number_literal", value: "3" },
        },
        operator: "+",
        right: { type: "number_literal", value: "4" },
      });
    });
  });

  describe("unary", () => {
    it("-1", () => {
      const expressionAst = parseExpression("-1");
      deepEqual(expressionAst, {
        type: "unary",
        operator: "-",
        argument: { type: "number_literal", value: "1" },
      });
    });

    it("1 - -1", () => {
      const expressionAst = parseExpression("1 - -1");
      deepEqual(expressionAst, {
        type: "binary",
        left: { type: "number_literal", value: "1" },
        operator: "-",
        right: {
          type: "unary",
          operator: "-",
          argument: { type: "number_literal", value: "1" },
        },
      });
    });

    it("1 - - -1", () => {
      const expressionAst = parseExpression("1 - - -1");
      deepEqual(expressionAst, {
        type: "binary",
        left: { type: "number_literal", value: "1" },
        operator: "-",
        right: {
          type: "unary",
          operator: "-",
          argument: {
            type: "unary",
            operator: "-",
            argument: { type: "number_literal", value: "1" },
          },
        },
      });
    });

    it("-(3 * 4)", () => {
      const expressionAst = parseExpression("-(3 * 4)");
      deepEqual(expressionAst, {
        type: "unary",
        operator: "-",
        argument: {
          type: "binary",
          left: { type: "number_literal", value: "3" },
          operator: "*",
          right: { type: "number_literal", value: "4" },
        },
      });
    });

    it("not true", () => {
      const expressionAst = parseExpression("not true");
      deepEqual(expressionAst, {
        type: "unary",
        operator: "not",
        argument: { type: "boolean_literal", value: true },
      });
    });

    it("not not true", () => {
      const expressionAst = parseExpression("not not true");
      deepEqual(expressionAst, {
        type: "unary",
        operator: "not",
        argument: {
          type: "unary",
          operator: "not",
          argument: { type: "boolean_literal", value: true },
        },
      });
    });

    it("-not true", () => {
      const expressionAst = parseExpression("-not true");
      deepEqual(expressionAst, {
        type: "unary",
        operator: "-",
        argument: {
          type: "unary",
          operator: "not",
          argument: { type: "boolean_literal", value: true },
        },
      });
    });

    it("not -true", () => {
      const expressionAst = parseExpression("not -true");
      deepEqual(expressionAst, {
        type: "unary",
        operator: "not",
        argument: {
          type: "unary",
          operator: "-",
          argument: { type: "boolean_literal", value: true },
        },
      });
    });
  });
});
