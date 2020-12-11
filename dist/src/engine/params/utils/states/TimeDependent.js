export class TimeDependentState {
  constructor(param) {
    this.param = param;
  }
  get active() {
    const frame_graph_node_id = this.param.scene.time_controller.graph_node.graph_node_id;
    return this.param.graph_predecessor_ids().includes(frame_graph_node_id);
  }
}
