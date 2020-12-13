import {JsonImportDispatcher} from "./Dispatcher";
import {ParamJsonImporter} from "./Param";
import {OptimizedNodesJsonImporter} from "./OptimizedNodes";
import {Poly as Poly3} from "../../../Poly";
export class NodesJsonImporter {
  constructor(_node) {
    this._node = _node;
  }
  process_data(scene_importer, data) {
    if (!data) {
      return;
    }
    if (!(this._node.children_allowed() && this._node.children_controller)) {
      return;
    }
    const {optimized_names, non_optimized_names} = OptimizedNodesJsonImporter.child_names_by_optimized_state(data);
    const nodes = [];
    for (let node_name of non_optimized_names) {
      const node_data = data[node_name];
      let node_type = node_data["type"];
      const non_spare_params_data = ParamJsonImporter.non_spare_params_data_value(node_data["params"]);
      try {
        const node = this._node.createNode(node_type, non_spare_params_data);
        if (node) {
          node.set_name(node_name);
          nodes.push(node);
        }
      } catch (e) {
        scene_importer.report.add_warning(`failed to create node with type '${node_type}'`);
        Poly3.warn("failed to create node with type", node_type, e);
      }
    }
    if (optimized_names.length > 0) {
      const optimized_nodes_importer = new OptimizedNodesJsonImporter(this._node);
      optimized_nodes_importer.process_data(scene_importer, data);
      nodes.concat(optimized_nodes_importer.nodes());
    }
    const importers_by_node_name = new Map();
    for (let node of nodes) {
      const child_data = data[node.name];
      if (child_data) {
        const importer = JsonImportDispatcher.dispatch_node(node);
        importers_by_node_name.set(node.name, importer);
        importer.process_data(scene_importer, data[node.name]);
      } else {
        Poly3.warn(`possible import error for node ${node.name}`);
      }
    }
    for (let node of nodes) {
      const importer = importers_by_node_name.get(node.name);
      if (importer) {
        importer.process_inputs_data(data[node.name]);
      }
    }
  }
}
