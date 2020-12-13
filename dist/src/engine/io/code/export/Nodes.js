import {CodeExporterDispatcher} from "./Dispatcher";
export class NodesCodeExporter {
  constructor(_nodes) {
    this._nodes = _nodes;
    this._lines = [];
  }
  process(parent_var_name, position_x_offset) {
    this._lines = [];
    this.add_process(parent_var_name, position_x_offset);
    return this._lines;
  }
  process_with_existing_nodes(parent, parent_var_name, position_x_offset) {
    this._lines = [];
    this.add_existing_nodes(parent, parent_var_name);
    this.add_process(parent_var_name, position_x_offset);
    return this._lines;
  }
  add_process(parent_var_name, position_x_offset) {
    if (parent_var_name) {
      this.multi_push(this.create_function_declare(parent_var_name));
      this.multi_push(this.create_function_call(parent_var_name));
    }
    this._nodes.forEach((node) => {
      this.multi_push(CodeExporterDispatcher.dispatch_node(node).set_up({position_x_offset}));
    });
  }
  add_existing_nodes(parent, parent_var_name) {
    parent.children().forEach((child) => {
      const child_var_name = CodeExporterDispatcher.dispatch_node(child).var_name();
      const line = `var ${child_var_name} = ${parent_var_name}.node('${child.name}')`;
      this._lines.push(line);
    });
  }
  create_function_declare(parent_var_name) {
    const lines = [];
    this._nodes.forEach((node) => {
      const child_lines = CodeExporterDispatcher.dispatch_node(node).create_function_declare(parent_var_name);
      child_lines.forEach((child_line) => {
        lines.push(child_line);
      });
    });
    return lines;
  }
  create_function_call(parent_var_name) {
    const lines = [];
    this._nodes.forEach((node) => {
      const child_line = CodeExporterDispatcher.dispatch_node(node).create_function_call(parent_var_name);
      lines.push(child_line);
    });
    return lines;
  }
  multi_push(child_lines) {
    child_lines.forEach((child_line) => {
      this._lines.push(child_line);
    });
  }
}
