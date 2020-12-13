const TypedNodeConnection2 = class {
  constructor(_node_src, _node_dest, _output_index = 0, _input_index = 0) {
    this._node_src = _node_src;
    this._node_dest = _node_dest;
    this._output_index = _output_index;
    this._input_index = _input_index;
    this._id = TypedNodeConnection2._next_id++;
    if (this._node_src.io.connections && this._node_dest.io.connections) {
      this._node_src.io.connections.add_output_connection(this);
      this._node_dest.io.connections.add_input_connection(this);
    }
  }
  get id() {
    return this._id;
  }
  get node_src() {
    return this._node_src;
  }
  get node_dest() {
    return this._node_dest;
  }
  get output_index() {
    return this._output_index;
  }
  get input_index() {
    return this._input_index;
  }
  src_connection_point() {
    const node_src = this._node_src;
    const output_index = this._output_index;
    return node_src.io.outputs.named_output_connection_points[output_index];
  }
  dest_connection_point() {
    const node_dest = this._node_dest;
    const input_index = this._input_index;
    return node_dest.io.inputs.named_input_connection_points[input_index];
  }
  disconnect(options = {}) {
    if (this._node_src.io.connections && this._node_dest.io.connections) {
      this._node_src.io.connections.remove_output_connection(this);
      this._node_dest.io.connections.remove_input_connection(this);
    }
    if (options.set_input === true) {
      this._node_dest.io.inputs.set_input(this._input_index, null);
    }
  }
};
export let TypedNodeConnection = TypedNodeConnection2;
TypedNodeConnection._next_id = 0;
