import {TypedPostProcessNode, PostParamOptions} from "./_Base";
import {BokehPass2 as BokehPass22} from "../../../modules/core/post_process/BokehPass2";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {CoreGraphNode as CoreGraphNode2} from "../../../core/graph/CoreGraphNode";
class DepthOfFieldPostParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.focal_depth = ParamConfig.FLOAT(10, {
      range: [0, 50],
      range_locked: [true, false],
      step: 1e-3,
      ...PostParamOptions
    });
    this.f_stop = ParamConfig.FLOAT(10, {
      range: [0.1, 22],
      range_locked: [true, true],
      ...PostParamOptions
    });
    this.max_blur = ParamConfig.FLOAT(2, {
      range: [0, 10],
      range_locked: [true, false],
      ...PostParamOptions
    });
    this.vignetting = ParamConfig.BOOLEAN(0, {
      ...PostParamOptions
    });
    this.depth_blur = ParamConfig.BOOLEAN(0, {
      ...PostParamOptions
    });
    this.threshold = ParamConfig.FLOAT(0.5, {
      range: [0, 1],
      range_locked: [true, true],
      step: 1e-3,
      ...PostParamOptions
    });
    this.gain = ParamConfig.FLOAT(1, {
      range: [0, 100],
      range_locked: [true, true],
      step: 1e-3,
      ...PostParamOptions
    });
    this.bias = ParamConfig.FLOAT(1, {
      range: [0, 3],
      range_locked: [true, true],
      step: 1e-3,
      ...PostParamOptions
    });
    this.fringe = ParamConfig.FLOAT(0.7, {
      range: [0, 5],
      range_locked: [true, false],
      step: 1e-3,
      ...PostParamOptions
    });
    this.noise = ParamConfig.BOOLEAN(0, {
      ...PostParamOptions
    });
    this.dithering = ParamConfig.FLOAT(0, {
      range: [0, 1e-3],
      range_locked: [true, true],
      step: 1e-4,
      ...PostParamOptions
    });
    this.pentagon = ParamConfig.BOOLEAN(0, {
      ...PostParamOptions
    });
    this.rings = ParamConfig.INTEGER(3, {
      range: [1, 8],
      range_locked: [true, true],
      ...PostParamOptions
    });
    this.samples = ParamConfig.INTEGER(4, {
      range: [1, 13],
      range_locked: [true, true],
      ...PostParamOptions
    });
    this.clear_color = ParamConfig.COLOR([1, 1, 1], {
      ...PostParamOptions
    });
  }
}
const ParamsConfig2 = new DepthOfFieldPostParamsConfig();
export class DepthOfFieldPostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "depth_of_field";
  }
  static saturate(x) {
    return Math.max(0, Math.min(1, x));
  }
  static linearize(depth, near, far) {
    var zfar = far;
    var znear = near;
    return -zfar * znear / (depth * (zfar - znear) - zfar);
  }
  static smoothstep(near, far, depth) {
    var x = this.saturate((depth - near) / (far - near));
    return x * x * (3 - 2 * x);
  }
  _create_pass(context) {
    const camera = context.camera;
    if (camera.isPerspectiveCamera) {
      const camera_node = context.camera_node;
      if (camera_node) {
        const pass = new BokehPass22(this, context.scene, camera_node.object, context.resolution);
        this.update_pass(pass);
        const core_graph_node = new CoreGraphNode2(this.scene, "DOF");
        core_graph_node.add_graph_input(camera_node.p.near);
        core_graph_node.add_graph_input(camera_node.p.far);
        core_graph_node.add_graph_input(camera_node.p.fov);
        core_graph_node.add_graph_input(this.p.focal_depth);
        core_graph_node.add_post_dirty_hook("post/DOF", () => {
          this.update_pass_from_camera_node(pass, camera_node);
        });
        return pass;
      }
    }
  }
  update_pass_from_camera_node(pass, camera) {
    pass.update_camera_uniforms_with_node(this, camera.object);
  }
  update_pass(pass) {
    pass.bokeh_uniforms["fstop"].value = this.pv.f_stop;
    pass.bokeh_uniforms["maxblur"].value = this.pv.max_blur;
    pass.bokeh_uniforms["threshold"].value = this.pv.threshold;
    pass.bokeh_uniforms["gain"].value = this.pv.gain;
    pass.bokeh_uniforms["bias"].value = this.pv.bias;
    pass.bokeh_uniforms["fringe"].value = this.pv.fringe;
    pass.bokeh_uniforms["dithering"].value = this.pv.dithering;
    pass.bokeh_uniforms["noise"].value = this.pv.noise ? 1 : 0;
    pass.bokeh_uniforms["pentagon"].value = this.pv.pentagon ? 1 : 0;
    pass.bokeh_uniforms["vignetting"].value = this.pv.vignetting ? 1 : 0;
    pass.bokeh_uniforms["depthblur"].value = this.pv.depth_blur ? 1 : 0;
    pass.bokeh_uniforms["shaderFocus"].value = 0;
    pass.bokeh_uniforms["showFocus"].value = 0;
    pass.bokeh_uniforms["manualdof"].value = 0;
    pass.bokeh_uniforms["focusCoords"].value.set(0.5, 0.5);
    pass.bokeh_material.defines["RINGS"] = this.pv.rings;
    pass.bokeh_material.defines["SAMPLES"] = this.pv.samples;
    pass.bokeh_material.needsUpdate = true;
    pass.clear_color.copy(this.pv.clear_color);
  }
}
