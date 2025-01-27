import type { LexToken } from "./lexer";

export type BinaryExpression = {
  type: "binary";
  left: Expression;
  operator: string;
  right: Expression;
};

export type IdentifierExpression = {
  type: "identifier";
  value: string;
};

export type AssignmentExpression = {
  type: "assignment";
  left: IdentifierExpression;
  right: Expression;
};

export type UnaryExpression = {
  type: "unary";
  operator: "not" | "-";
  argument: Expression;
};

export type LiteralExpression =
  | {
      type: "number_literal";
      value: string;
    }
  | {
      type: "string_literal";
      value: string;
    }
  | {
      type: "boolean_literal";
      value: boolean;
    };
export type Expression =
  | BinaryExpression
  | IdentifierExpression
  | AssignmentExpression
  | LiteralExpression
  | UnaryExpression;

export function parser(tokens: LexToken[]) {
  let cursor = 0;

  function tokenAt(index: number): LexToken | undefined {
    return tokens[index];
  }

  function expression(): Expression {
    return assignmentExpression();
  }

  function assignmentExpression(): Expression {
    let left = comparisonExpression();
    const token = tokenAt(cursor);
    while (token?.type === "operator" && token.value === "=") {
      cursor++;
      if (left.type !== "identifier") {
        throw new Error("left side of assignment must be an identifier");
      }

      return {
        type: "assignment",
        left,
        right: expression(),
      };
    }
    return left;
  }

  function comparisonExpression(): Expression {
    let left = stringConcatenationExpression();

    let token = tokenAt(cursor);
    if (
      token?.type === "operator" &&
      ["<", ">", "<=", ">=", "~=", "=="].includes(token.value)
    ) {
      cursor++;
      left = {
        type: "binary",
        left,
        operator: token.value,
        right: comparisonExpression(),
      };

      token = tokenAt(cursor);
    }

    return left;
  }

  function stringConcatenationExpression(): Expression {
    let left = termExpression();

    let token = tokenAt(cursor);
    while (token?.type === "operator" && token.value === "+") {
      cursor++;

      left = {
        type: "binary",
        left,
        operator: token.value,
        right: termExpression(),
      };

      token = tokenAt(cursor);
    }

    return left;
  }

  function termExpression(): Expression {
    let left = factorExpression();

    let token = tokenAt(cursor);
    while (token?.type === "operator" && ["+", "-"].includes(token.value)) {
      cursor++;

      left = {
        type: "binary",
        left,
        operator: token.value,
        right: factorExpression(),
      };

      token = tokenAt(cursor);
    }

    return left;
  }

  function factorExpression(): Expression {
    let left = unaryExpression();

    let token = tokenAt(cursor);
    while (token?.type === "operator" && ["*", "/"].includes(token.value)) {
      cursor++;

      left = {
        type: "binary",
        left,
        operator: token.value,
        right: unaryExpression(),
      };

      token = tokenAt(cursor);
    }

    return left;
  }

  function unaryExpression(): Expression {
    const token = tokenAt(cursor);
    if (
      token &&
      ((token.type === "operator" && token.value === "-") ||
        (token.type === "keyword" && token.value === "not"))
    ) {
      cursor++;
      return {
        type: "unary",
        operator: token.value,
        argument: unaryExpression(),
      };
    }

    return literalExpression();
  }

  function literalExpression(): Expression {
    const token = tokenAt(cursor++);
    if (token?.type === "number") {
      return { type: "number_literal", value: token.value };
    }

    if (token?.type === "string") {
      return { type: "string_literal", value: token.value };
    }

    if (token?.type === "boolean") {
      return { type: "boolean_literal", value: token.value };
    }

    if (token?.type === "identifier") {
      return { type: "identifier", value: token.value };
    }

    if (token?.type === "punctuation") {
      if (token.value === "(") {
        const expr = expression();
        const nextToken = tokenAt(cursor);
        if (nextToken?.type === "punctuation" && nextToken.value !== ")") {
          throw new Error("expected closing parenthesis");
        }

        cursor++;
        return expr;
      }
    }

    throw new Error(`Unexpected literal: ${JSON.stringify(token)}`);
  }

  return expression();
}
