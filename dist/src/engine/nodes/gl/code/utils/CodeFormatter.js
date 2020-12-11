import {LineType as LineType2} from "./LineType";
import {NetworkChildNodeType} from "../../../../poly/NodeContext";
const LINE_SUFFIXES = {
  [LineType2.FUNCTION_DECLARATION]: "",
  [LineType2.DEFINE]: ";",
  [LineType2.BODY]: ";"
};
const LINE_PREFIXES = {
  [LineType2.FUNCTION_DECLARATION]: "",
  [LineType2.DEFINE]: "",
  [LineType2.BODY]: "	"
};
const BLOCK_START_LAST_CHAR = "{";
const BLOCK_END_LAST_CHAR = "}";
export class CodeFormatter {
  static node_comment(node, line_type) {
    let line = `// ${node.full_path()}`;
    let prefix = LINE_PREFIXES[line_type];
    if (line_type == LineType2.BODY) {
      let distance = this.node_distance_to_material(node);
      if (node.type == NetworkChildNodeType.OUTPUT) {
        distance += 1;
      }
      prefix = prefix.repeat(distance);
    }
    if (line_type == LineType2.BODY) {
      line = `${prefix}${line}`;
    }
    return line;
  }
  static line_wrap(node, line, line_type) {
    let add_suffix = true;
    if (line.indexOf("#if") == 0 || line.indexOf("#endif") == 0) {
      add_suffix = false;
    }
    let prefix = LINE_PREFIXES[line_type];
    if (line_type == LineType2.BODY) {
      prefix = prefix.repeat(this.node_distance_to_material(node));
    }
    line = `${prefix}${line}`;
    if (add_suffix) {
      const last_char = line[line.length - 1];
      const suffix = LINE_SUFFIXES[line_type];
      if (last_char != suffix && last_char != BLOCK_START_LAST_CHAR && last_char != BLOCK_END_LAST_CHAR) {
        line += suffix;
      }
    }
    return line;
  }
  static post_line_separator(line_type) {
    return line_type == LineType2.BODY ? "	" : "";
  }
  static node_distance_to_material(node) {
    if (!node.parent) {
      return 0;
    }
    if (node.parent.node_context() != node.node_context()) {
      return 1;
    } else {
      let offset = 1;
      if (node.type == NetworkChildNodeType.INPUT || node.type == NetworkChildNodeType.OUTPUT) {
        offset = 0;
      }
      return offset + this.node_distance_to_material(node.parent);
    }
  }
}
