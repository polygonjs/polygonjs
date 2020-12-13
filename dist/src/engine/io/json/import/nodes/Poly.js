import {NodeJsonImporter} from "../Node";
export class PolyNodeJsonImporter extends NodeJsonImporter {
  create_nodes(scene_importer, data) {
    const node = this._node;
    if (node.poly_node_controller) {
      node.poly_node_controller.create_child_nodes_from_definition();
    }
  }
}
