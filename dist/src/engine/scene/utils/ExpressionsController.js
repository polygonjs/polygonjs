export class ExpressionsController {
  constructor() {
    this._params_by_id = new Map();
  }
  register_param(param) {
    this._params_by_id.set(param.graph_node_id, param);
  }
  deregister_param(param) {
    this._params_by_id.delete(param.graph_node_id);
  }
  regenerate_referring_expressions(node) {
    node.name_controller.graph_node.set_successors_dirty(node);
  }
}
