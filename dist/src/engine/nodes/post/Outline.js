import {Vector2 as Vector22} from "three/src/math/Vector2";
import {TypedPostProcessNode, PostParamOptions} from "./_Base";
import {OutlinePass as OutlinePass2} from "../../../modules/three/examples/jsm/postprocessing/OutlinePass";
import {CoreString} from "../../../core/String";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class OutlinePostParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.objects_mask = ParamConfig.STRING("*outlined*", {
      ...PostParamOptions
    });
    this.refresh_objects = ParamConfig.BUTTON(null, {
      ...PostParamOptions
    });
    this.edge_strength = ParamConfig.FLOAT(3, {
      range: [0, 10],
      range_locked: [true, false],
      ...PostParamOptions
    });
    this.edge_thickness = ParamConfig.FLOAT(0, {
      range: [0, 4],
      range_locked: [true, false],
      ...PostParamOptions
    });
    this.edge_glow = ParamConfig.FLOAT(0, {
      range: [0, 1],
      range_locked: [true, false],
      ...PostParamOptions
    });
    this.pulse_period = ParamConfig.FLOAT(0, {
      range: [0, 5],
      range_locked: [true, false],
      ...PostParamOptions
    });
    this.visible_edge_color = ParamConfig.COLOR([1, 1, 1], {
      ...PostParamOptions
    });
    this.hidden_edge_color = ParamConfig.COLOR([0, 0, 0], {
      ...PostParamOptions
    });
  }
}
const ParamsConfig2 = new OutlinePostParamsConfig();
export class OutlinePostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "outline";
  }
  _create_pass(context) {
    const pass = new OutlinePass2(new Vector22(context.resolution.x, context.resolution.y), context.scene, context.camera, context.scene.children);
    this.update_pass(pass);
    return pass;
  }
  update_pass(pass) {
    pass.edgeStrength = this.pv.edge_strength;
    pass.edgeThickness = this.pv.edge_thickness;
    pass.edgeGlow = this.pv.edge_glow;
    pass.pulsePeriod = this.pv.pulse_period;
    pass.visibleEdgeColor = this.pv.visible_edge_color;
    pass.hiddenEdgeColor = this.pv.hidden_edge_color;
    this._set_selected_objects(pass);
  }
  _set_selected_objects(pass) {
    const objects = [];
    const mask = this.pv.objects_mask;
    this.scene.default_scene.traverse((object) => {
      if (CoreString.match_mask(object.name, mask)) {
        objects.push(object);
      }
    });
    pass.selectedObjects = objects;
  }
}
