import {TypedObjNode, ObjNodeRenderOrder} from "./_Base";
import {Color as Color2} from "three/src/math/Color";
import {FlagsControllerD} from "../utils/FlagsController";
export class TypedLightObjNode extends TypedObjNode {
  constructor() {
    super(...arguments);
    this.flags = new FlagsControllerD(this);
    this.render_order = ObjNodeRenderOrder.LIGHT;
    this._color_with_intensity = new Color2(0);
    this._used_in_scene = true;
    this._cook_main_without_inputs_when_dirty_bound = this._cook_main_without_inputs_when_dirty.bind(this);
  }
  get light() {
    return this._light;
  }
  initialize_base_node() {
    super.initialize_base_node();
    this._light = this.create_light();
    this.object.add(this._light);
    this.flags.display.add_hook(() => {
      this.update_light_attachment();
    });
    this.dirty_controller.add_post_dirty_hook("_cook_main_without_inputs_when_dirty", this._cook_main_without_inputs_when_dirty_bound);
  }
  async _cook_main_without_inputs_when_dirty() {
    await this.cook_controller.cook_main_without_inputs();
  }
  set_object_name() {
    super.set_object_name();
    if (this._light) {
      this._light.name = `${this.full_path()}:light`;
    }
  }
  update_light_attachment() {
    if (this.flags.display.active) {
      this.object.add(this.light);
      this._cook_main_without_inputs_when_dirty();
    } else {
      this.object.remove(this.light);
    }
  }
  create_shadow_params_main() {
    if (this._light.shadow != null) {
      return this.create_shadow_params();
    }
  }
  create_light_params() {
  }
  update_light_params() {
  }
  create_shadow_params() {
    return;
  }
  cook() {
    this.update_light_params();
    this.update_shadow_params();
    this.cook_controller.end_cook();
  }
  update_shadow_params() {
  }
  get color_with_intensity() {
    const color = this.params.color("color");
    const intensity = this.params.float("intensity");
    this._color_with_intensity.copy(color).multiplyScalar(intensity);
    return this._color_with_intensity;
  }
  get active() {
    return this.flags.display.active;
  }
}
