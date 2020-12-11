export class TextureVariable {
  constructor(_name, _size) {
    this._name = _name;
    this._size = _size;
    this._position = -1;
    if (!_name) {
      throw "TextureVariable requires a name";
    }
  }
  set_allocation(allocation) {
    this._allocation = allocation;
  }
  get allocation() {
    return this._allocation;
  }
  get graph_node_ids() {
    return this._graph_node_ids;
  }
  add_graph_node_id(id) {
    this._graph_node_ids = this._graph_node_ids || new Map();
    this._graph_node_ids.set(id, true);
  }
  get name() {
    return this._name;
  }
  get size() {
    return this._size;
  }
  set_position(position) {
    this._position = position;
  }
  get position() {
    return this._position;
  }
  get component() {
    return "xyzw".split("").splice(this._position, this._size).join("");
  }
  static from_json(data) {
    return new TextureVariable(data.name, data.size);
  }
  to_json(scene) {
    const names = [];
    if (this._graph_node_ids) {
      this._graph_node_ids.forEach((boolean, node_id) => {
        const name = scene.graph.node_from_id(node_id)?.name;
        if (name) {
          names.push(name);
        }
      });
    }
    return {
      name: this.name,
      size: this.size,
      nodes: names.sort()
    };
  }
}
