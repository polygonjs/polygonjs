import {LinesController as LinesController2} from "./LinesController";
export class ShadersCollectionController {
  constructor(_shader_names, _current_shader_name) {
    this._shader_names = _shader_names;
    this._current_shader_name = _current_shader_name;
    this._lines_controller_by_shader_name = new Map();
    for (let shader_name of this._shader_names) {
      this._lines_controller_by_shader_name.set(shader_name, new LinesController2(shader_name));
    }
  }
  get shader_names() {
    return this._shader_names;
  }
  set_current_shader_name(shader_name) {
    this._current_shader_name = shader_name;
  }
  get current_shader_name() {
    return this._current_shader_name;
  }
  add_definitions(node, definitions, shader_name) {
    if (definitions.length == 0) {
      return;
    }
    shader_name = shader_name || this._current_shader_name;
    const lines_controller = this._lines_controller_by_shader_name.get(shader_name);
    if (lines_controller) {
      lines_controller.add_definitions(node, definitions);
    }
  }
  definitions(shader_name, node) {
    const lines_controller = this._lines_controller_by_shader_name.get(shader_name);
    if (lines_controller) {
      return lines_controller.definitions(node);
    }
  }
  add_body_lines(node, lines, shader_name) {
    if (lines.length == 0) {
      return;
    }
    shader_name = shader_name || this._current_shader_name;
    const lines_controller = this._lines_controller_by_shader_name.get(shader_name);
    if (lines_controller) {
      lines_controller.add_body_lines(node, lines);
    }
  }
  body_lines(shader_name, node) {
    const lines_controller = this._lines_controller_by_shader_name.get(shader_name);
    if (lines_controller) {
      return lines_controller.body_lines(node);
    }
  }
}
