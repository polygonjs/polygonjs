import {CoreGraphNode as CoreGraphNode2} from "../../../core/graph/CoreGraphNode";
export class ViewerControlsController {
  constructor(viewer) {
    this.viewer = viewer;
    this._active = false;
    this._controls = null;
    this._bound_on_controls_start = this._on_controls_start.bind(this);
    this._bound_on_controls_end = this._on_controls_end.bind(this);
    this._update_graph_node();
  }
  get active() {
    return this._active;
  }
  get camera_node() {
    return this.viewer.camera_node;
  }
  get controls() {
    return this._controls;
  }
  async create_controls() {
    this._dispose_controls();
    if (!this.viewer.canvas) {
      return;
    }
    this._config = await this.viewer?.camera_controls_controller?.apply_controls(this.viewer.canvas);
    if (this._config) {
      this._controls = this._config.controls;
      if (this._controls) {
        if (this.viewer.active) {
          this._controls.addEventListener("start", this._bound_on_controls_start);
          this._controls.addEventListener("end", this._bound_on_controls_end);
        } else {
          this._dispose_controls();
        }
      }
    }
  }
  update() {
    if (this._config && this._controls) {
      if (this._config.update_required()) {
        this._controls.update();
      }
    }
  }
  dispose() {
    this._graph_node?.graph_disconnect_predecessors();
    this._dispose_controls();
  }
  _dispose_controls() {
    if (this._controls) {
      if (this.viewer.canvas) {
        this.viewer?.camera_controls_controller.dispose_controls(this.viewer.canvas);
      }
      if (this._bound_on_controls_start) {
        this._controls.removeEventListener("start", this._bound_on_controls_start);
      }
      if (this._bound_on_controls_end) {
        this._controls.removeEventListener("end", this._bound_on_controls_end);
      }
      this._controls.dispose();
      this._controls = null;
    }
  }
  _on_controls_start() {
    this._active = true;
  }
  _on_controls_end() {
    this._active = false;
  }
  _update_graph_node() {
    const controls_param = this.viewer.camera_node.p.controls;
    this._graph_node = this._graph_node || this._create_graph_node();
    if (!this._graph_node) {
      return;
    }
    this._graph_node.graph_disconnect_predecessors();
    this._graph_node.add_graph_input(controls_param);
  }
  _create_graph_node() {
    const node = new CoreGraphNode2(this.viewer.camera_node.scene, "viewer-controls");
    node.add_post_dirty_hook("this.viewer.controls_controller", async () => {
      await this.viewer.controls_controller.create_controls();
    });
    return node;
  }
}
