import {MapUtils as MapUtils2} from "../../../../../core/MapUtils";
export class LinesController {
  constructor() {
    this._definitions_by_node_id = new Map();
    this._body_lines_by_node_id = new Map();
  }
  add_definitions(node, definitions) {
    for (let definition of definitions) {
      MapUtils2.push_on_array_at_entry(this._definitions_by_node_id, node.graph_node_id, definition);
    }
  }
  definitions(node) {
    return this._definitions_by_node_id.get(node.graph_node_id);
  }
  add_body_lines(node, lines) {
    for (let line of lines) {
      MapUtils2.push_on_array_at_entry(this._body_lines_by_node_id, node.graph_node_id, line);
    }
  }
  body_lines(node) {
    return this._body_lines_by_node_id.get(node.graph_node_id);
  }
}
