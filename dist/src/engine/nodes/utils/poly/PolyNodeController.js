import {NodeContext as NodeContext2} from "../../../poly/NodeContext";
import {SceneJsonImporter} from "../../../io/json/import/Scene";
import {NodeJsonImporter} from "../../../io/json/import/Node";
import {JsonExportDispatcher} from "../../../io/json/export/Dispatcher";
import {create_poly_sop_node} from "../../sop/Poly";
import {create_poly_obj_node} from "../../obj/Poly";
export class PolyNodeController {
  constructor(node, _definition) {
    this.node = node;
    this._definition = _definition;
  }
  initialize_node() {
    this.init_inputs();
    this.node.params.on_params_created("poly_node_init", () => {
      this.create_params_from_definition();
    });
    this.node.lifecycle.add_on_create_hook(() => {
      this.create_params_from_definition();
      this.create_child_nodes_from_definition();
    });
  }
  init_inputs() {
    const inputs_data = this._definition.inputs;
    if (!inputs_data) {
      return;
    }
    this.node.io.inputs.set_count(inputs_data[0], inputs_data[1]);
  }
  create_params_from_definition() {
    const params_data = this._definition.params;
    if (!params_data) {
      return;
    }
    for (let param_data of params_data) {
      param_data.options = param_data.options || {};
      param_data.options.spare = true;
    }
    this.node.params.update_params({to_add: params_data});
  }
  create_child_nodes_from_definition() {
    const nodes_data = this._definition.nodes;
    if (!nodes_data) {
      return;
    }
    const current_scene_loaded_state = this.node.scene.loading_controller.loaded;
    if (current_scene_loaded_state) {
      this.node.scene.loading_controller.mark_as_loading();
    }
    const scene_importer = new SceneJsonImporter({});
    const node_importer = new NodeJsonImporter(this.node);
    node_importer.create_nodes(scene_importer, nodes_data);
    if (current_scene_loaded_state) {
      this.node.scene.loading_controller.mark_as_loaded();
    }
  }
  debug(param) {
    const node = param.found_node();
    if (node) {
      const root_exporter = JsonExportDispatcher.dispatch_node(node);
      const nodes_data = root_exporter.data();
      console.log(JSON.stringify(nodes_data.nodes));
    }
  }
  static create_node_class(node_type, node_context, definition) {
    switch (node_context) {
      case NodeContext2.SOP:
        return create_poly_sop_node(node_type, definition);
      case NodeContext2.OBJ:
        return create_poly_obj_node(node_type, definition);
    }
  }
}
