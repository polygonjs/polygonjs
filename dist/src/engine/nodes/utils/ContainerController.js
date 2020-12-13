import {ContainerClassMap} from "../../containers/utils/ContainerMap";
export class TypedContainerController {
  constructor(node) {
    this.node = node;
    this._callbacks = [];
    this._callbacks_tmp = [];
    const container_class = ContainerClassMap[node.node_context()];
    this._container = new container_class(this.node);
  }
  get container() {
    return this._container;
  }
  request_container() {
    if (this.node.is_dirty || this.node.flags?.bypass?.active) {
      return new Promise((resolve, reject) => {
        this._callbacks.push(resolve);
        this.node.scene.cook_controller.add_node(this.node);
        this.process_container_request();
      });
    } else {
      return this.container;
    }
  }
  process_container_request() {
    if (this.node.flags?.bypass?.active) {
      const input_index = 0;
      this.request_input_container(input_index).then((container) => {
        this.node.remove_dirty_state();
        if (container) {
          this.notify_requesters(container);
        } else {
          this.node.states.error.set("input invalid");
        }
      });
    } else {
      if (this.node.is_dirty) {
        this.node.cook_controller.cook_main();
      } else {
        this.notify_requesters();
      }
    }
  }
  async request_input_container(input_index) {
    const input_node = this.node.io.inputs.input(input_index);
    if (input_node) {
      if (input_node.is_dirty || input_node.flags?.bypass?.active) {
        const container = await input_node.container_controller.request_container();
        return container;
      } else {
        return input_node.container_controller.container;
      }
    } else {
      this.node.states.error.set(`input ${input_index} required`);
      this.notify_requesters();
      return null;
    }
  }
  notify_requesters(container) {
    this._callbacks_tmp = this._callbacks.slice();
    this._callbacks.splice(0, this._callbacks.length);
    if (!container) {
      container = this.node.container_controller.container;
    }
    let callback;
    while (callback = this._callbacks_tmp.pop()) {
      callback(container);
    }
    this.node.scene.cook_controller.remove_node(this.node);
  }
}
export class BaseContainerController extends TypedContainerController {
}
