import {Poly as Poly2} from "../../Poly";
import {NodeCookPerformanceformanceController} from "./cook/PerformanceController";
export class NodeCookController {
  constructor(node) {
    this.node = node;
    this._cooking = false;
    this._performance_controller = new NodeCookPerformanceformanceController(this);
    this._inputs_evaluation_required = true;
    this._core_performance = this.node.scene.performance;
  }
  get performance_record_started() {
    return this._core_performance.started;
  }
  disallow_inputs_evaluation() {
    this._inputs_evaluation_required = false;
  }
  get is_cooking() {
    return this._cooking === true;
  }
  _init_cooking_state() {
    this._cooking = true;
    this._cooking_dirty_timestamp = this.node.dirty_controller.dirty_timestamp;
  }
  _start_cook_if_no_errors(input_contents) {
    if (this.node.states.error.active) {
      this.end_cook();
    } else {
      try {
        this._performance_controller.record_cook_start();
        this.node.cook(input_contents);
      } catch (e) {
        this.node.states.error.set(`node internal error: '${e}'.`);
        Poly2.warn(e);
        this.end_cook();
      }
    }
  }
  async cook_main() {
    if (this.is_cooking) {
      return;
    }
    this._init_cooking_state();
    this.node.states.error.clear();
    let input_contents;
    if (this._inputs_evaluation_required) {
      input_contents = await this._evaluate_inputs();
    } else {
      input_contents = [];
    }
    if (this.node.params.params_eval_required()) {
      await this._evaluate_params();
    }
    this._start_cook_if_no_errors(input_contents);
  }
  async cook_main_without_inputs() {
    this.node.scene.cook_controller.add_node(this.node);
    if (this.is_cooking) {
      Poly2.warn("cook_main_without_inputs already cooking", this.node.full_path());
      return;
    }
    this._init_cooking_state();
    this.node.states.error.clear();
    if (this.node.params.params_eval_required()) {
      await this._evaluate_params();
    }
    this._start_cook_if_no_errors([]);
  }
  end_cook(message) {
    this._finalize_cook_performance();
    const dirty_timestamp = this.node.dirty_controller.dirty_timestamp;
    if (dirty_timestamp == null || dirty_timestamp === this._cooking_dirty_timestamp) {
      this.node.remove_dirty_state();
      this._terminate_cook_process();
    } else {
      Poly2.log("COOK AGAIN", dirty_timestamp, this._cooking_dirty_timestamp, this.node.full_path());
      this._cooking = false;
      this.cook_main();
    }
  }
  _terminate_cook_process() {
    if (this.is_cooking) {
      this._cooking = false;
      this.node.container_controller.notify_requesters();
      this._run_on_cook_complete_hooks();
    }
  }
  async _evaluate_inputs() {
    this._performance_controller.record_inputs_start();
    let input_containers = [];
    const io_inputs = this.node.io.inputs;
    if (this._inputs_evaluation_required) {
      if (io_inputs.is_any_input_dirty()) {
        input_containers = await io_inputs.eval_required_inputs();
      } else {
        input_containers = io_inputs.containers_without_evaluation();
      }
    }
    const inputs = io_inputs.inputs();
    const input_contents = [];
    let input_container;
    for (let i = 0; i < inputs.length; i++) {
      input_container = input_containers[i];
      if (input_container) {
        if (io_inputs.clone_required(i)) {
          input_contents[i] = input_container.core_content_cloned();
        } else {
          input_contents[i] = input_container.core_content();
        }
      }
    }
    this._performance_controller.record_inputs_end();
    return input_contents;
  }
  async _evaluate_params() {
    this._performance_controller.record_params_start();
    await this.node.params.eval_all();
    this._performance_controller.record_params_end();
  }
  get cooks_count() {
    return this._performance_controller.cooks_count;
  }
  get cook_time() {
    return this._performance_controller.data.cook_time;
  }
  _finalize_cook_performance() {
    if (!this._core_performance.started) {
      return;
    }
    this._performance_controller.record_cook_end();
    this._core_performance.record_node_cook_data(this.node, this._performance_controller.data);
  }
  add_on_cook_complete_hook(core_graph_node, callback) {
    this._on_cook_complete_hook_ids = this._on_cook_complete_hook_ids || [];
    this._on_cook_complete_hooks = this._on_cook_complete_hooks || [];
    this._on_cook_complete_hook_ids.push(core_graph_node.graph_node_id);
    this._on_cook_complete_hooks.push(callback);
  }
  remove_on_cook_complete_hook(core_graph_node) {
    if (!this._on_cook_complete_hook_ids || !this._on_cook_complete_hooks) {
      return;
    }
    const index = this._on_cook_complete_hook_ids?.indexOf(core_graph_node.graph_node_id);
    this._on_cook_complete_hook_ids.splice(index, 1);
    this._on_cook_complete_hooks.splice(index, 1);
  }
  _run_on_cook_complete_hooks() {
    if (this._on_cook_complete_hooks) {
      for (let hook of this._on_cook_complete_hooks) {
        hook(this.node);
      }
    }
  }
}
