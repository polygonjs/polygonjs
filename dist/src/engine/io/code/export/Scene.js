import {CodeExporterDispatcher} from "./Dispatcher";
import {CoreString} from "../../../../core/String";
export class SceneCodeExporter {
  constructor(_scene) {
    this._scene = _scene;
  }
  process() {
    const lines = [];
    this._scene.nodes_controller.reset_node_context_signatures();
    CodeExporterDispatcher.dispatch_node(this._scene.root).create().forEach((root_line) => {
      lines.push(root_line);
    });
    lines.push(`${this.var_name()}.set_frame(${this._scene.frame || 1})`);
    lines.push(`${this.var_name()}.set_frame_range(${this._scene.frame_range.join(",")})`);
    const camera_path = this._scene.cameras_controller.master_camera_node_path;
    if (camera_path) {
      lines.push(`${this.var_name()}.cameras_controller.set_master_camera_node_path('${camera_path}')`);
    }
    this.add_semi_colons(lines);
    return lines.join("\n");
  }
  add_semi_colons(lines) {
    const characters_without_semi_colon = "{}";
    lines.forEach((line, i) => {
      const last_char = line[line.length - 1];
      if (!characters_without_semi_colon.includes(last_char)) {
        lines[i] = `${line};`;
      }
    });
  }
  var_name() {
    return "scene";
  }
  static sanitize_string(word) {
    word = word.replace(/'/g, "\\'");
    word = CoreString.escape_line_breaks(word);
    return word;
  }
}
