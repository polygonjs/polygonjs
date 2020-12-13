import {TypedEventNode} from "./_Base";
export class TypedCameraControlsEventNode extends TypedEventNode {
  async apply_controls(camera, html_element) {
    const controls = await this.create_controls_instance(camera, html_element);
    const timestamp = performance.now();
    controls.name = `${this.full_path()}:${camera.name}:${timestamp}:${this.controls_id()}`;
    await this.params.eval_all();
    this.setup_controls(controls);
    return controls;
  }
  controls_id() {
    return JSON.stringify(this.params.all.map((p) => p.value_serialized));
  }
}
