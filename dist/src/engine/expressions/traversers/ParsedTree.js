import lodash_isString from "lodash/isString";
import jsep2 from "jsep";
jsep2.addUnaryOp("@");
let precedence = 10;
jsep2.addBinaryOp("**", precedence);
const JSEP_IDENTIFIER = "Identifier";
const JSEP_LITERAL = "Literal";
const JSEP_CALL_EXPRESSION = "CallExpression";
const STRING_EXPRESSION_SEPARATOR = "`";
export class ParsedTree {
  constructor() {
  }
  parse_expression(string) {
    try {
      this.reset();
      this.node = jsep2(string);
    } catch (e) {
      const message = `could not parse the expression '${string}' (error: ${e})`;
      this.error_message = message;
    }
  }
  parse_expression_for_string_param(string) {
    try {
      this.reset();
      const elements = ParsedTree.string_value_elements(string);
      const nodes = [];
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        let node;
        if (i % 2 == 1) {
          node = jsep2(element);
        } else {
          node = {
            type: JSEP_LITERAL,
            value: `'${element}'`,
            raw: `'${element}'`
          };
        }
        nodes.push(node);
      }
      this.node = {
        type: JSEP_CALL_EXPRESSION,
        arguments: nodes,
        callee: {
          type: JSEP_IDENTIFIER,
          name: "str_concat"
        }
      };
    } catch (e) {
      const message = `could not parse the expression '${string}' (error: ${e})`;
      this.error_message = message;
    }
  }
  static string_value_elements(v) {
    if (v != null) {
      if (lodash_isString(v)) {
        return v.split(STRING_EXPRESSION_SEPARATOR);
      } else {
        return [];
      }
    } else {
      return [];
    }
  }
  reset() {
    this.node = void 0;
    this.error_message = void 0;
  }
}
