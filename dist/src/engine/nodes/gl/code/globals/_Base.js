const GlobalsBaseController2 = class {
  constructor() {
    this._id = GlobalsBaseController2.__next_id++;
  }
  id() {
    return this._id;
  }
  handle_globals_node(globals_node, output_name, shaders_collection_controller) {
  }
};
export let GlobalsBaseController = GlobalsBaseController2;
GlobalsBaseController.__next_id = 0;
