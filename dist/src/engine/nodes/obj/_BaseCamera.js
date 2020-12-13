import lodash_isNaN from "lodash/isNaN";
import {CoreTransform} from "../../../core/Transform";
import {ObjNodeRenderOrder} from "./_Base";
import {ThreejsCameraControlsController} from "./utils/cameras/ControlsController";
import {LayersController as LayersController2, LayerParamConfig} from "./utils/LayersController";
import {PostProcessController as PostProcessController2, CameraPostProcessParamConfig} from "./utils/cameras/PostProcessController";
import {RenderController as RenderController2, CameraRenderParamConfig} from "./utils/cameras/RenderController";
import {TransformedParamConfig, TransformController as TransformController2} from "./utils/TransformController";
import {ChildrenDisplayController as ChildrenDisplayController2} from "./utils/ChildrenDisplayController";
import {DisplayNodeController as DisplayNodeController2} from "../utils/DisplayNodeController";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {ThreejsViewer} from "../../viewers/Threejs";
import {FlagsControllerD} from "../utils/FlagsController";
import {TypedObjNode} from "./_Base";
import {HierarchyController as HierarchyController2} from "./utils/HierarchyController";
const EVENT_CHANGE = {type: "change"};
export const BASE_CAMERA_DEFAULT = {
  near: 1,
  far: 100
};
export var UpdateFromControlsMode;
(function(UpdateFromControlsMode2) {
  UpdateFromControlsMode2["ON_END"] = "on move end";
  UpdateFromControlsMode2["ALWAYS"] = "always";
  UpdateFromControlsMode2["NEVER"] = "never";
})(UpdateFromControlsMode || (UpdateFromControlsMode = {}));
export const UPDATE_FROM_CONTROLS_MODES = [
  UpdateFromControlsMode.ON_END,
  UpdateFromControlsMode.ALWAYS,
  UpdateFromControlsMode.NEVER
];
import {ParamConfig, NodeParamsConfig} from "../utils/params/ParamsConfig";
export function CameraMasterCameraParamConfig(Base7) {
  return class Mixin extends Base7 {
    constructor() {
      super(...arguments);
      this.set_master_camera = ParamConfig.BUTTON(null, {
        callback: (node, param) => {
          BaseCameraObjNodeClass.PARAM_CALLBACK_set_master_camera(node);
        }
      });
    }
  };
}
export function ThreejsCameraTransformParamConfig(Base7) {
  return class Mixin extends Base7 {
    constructor() {
      super(...arguments);
      this.camera = ParamConfig.FOLDER();
      this.controls = ParamConfig.OPERATOR_PATH("", {
        node_selection: {
          context: NodeContext2.EVENT
        }
      });
      this.update_from_controls_mode = ParamConfig.INTEGER(UPDATE_FROM_CONTROLS_MODES.indexOf(UpdateFromControlsMode.ON_END), {
        menu: {
          entries: UPDATE_FROM_CONTROLS_MODES.map((name, value) => {
            return {name, value};
          })
        }
      });
      this.allow_update_from_controls = ParamConfig.BOOLEAN(1);
      this.near = ParamConfig.FLOAT(BASE_CAMERA_DEFAULT.near, {
        range: [0, 100],
        cook: false,
        compute_on_dirty: true,
        callback: (node, param) => {
          BaseThreejsCameraObjNodeClass.PARAM_CALLBACK_update_near_far_from_param(node, param);
        }
      });
      this.far = ParamConfig.FLOAT(BASE_CAMERA_DEFAULT.far, {
        range: [0, 100],
        cook: false,
        compute_on_dirty: true,
        callback: (node, param) => {
          BaseThreejsCameraObjNodeClass.PARAM_CALLBACK_update_near_far_from_param(node, param);
        }
      });
      this.display = ParamConfig.BOOLEAN(1);
    }
  };
}
export class BaseCameraObjParamsConfig extends CameraMasterCameraParamConfig(NodeParamsConfig) {
}
export class BaseThreejsCameraObjParamsConfig extends CameraPostProcessParamConfig(CameraRenderParamConfig(TransformedParamConfig(LayerParamConfig(ThreejsCameraTransformParamConfig(CameraMasterCameraParamConfig(NodeParamsConfig)))))) {
}
export class TypedCameraObjNode extends TypedObjNode {
  constructor() {
    super(...arguments);
    this.render_order = ObjNodeRenderOrder.CAMERA;
    this._aspect = -1;
  }
  get object() {
    return this._object;
  }
  async cook() {
    this.update_camera();
    this._object.dispatchEvent(EVENT_CHANGE);
    this.cook_controller.end_cook();
  }
  on_create() {
  }
  on_delete() {
  }
  prepare_raycaster(mouse, raycaster) {
  }
  camera() {
    return this._object;
  }
  update_camera() {
  }
  static PARAM_CALLBACK_set_master_camera(node) {
    node.set_as_master_camera();
  }
  set_as_master_camera() {
    this.scene.cameras_controller.set_master_camera_node_path(this.full_path());
  }
  setup_for_aspect_ratio(aspect) {
  }
  _update_for_aspect_ratio() {
  }
  update_transform_params_from_object() {
    CoreTransform.set_params_from_object(this._object, this);
  }
  static PARAM_CALLBACK_update_from_param(node, param) {
    node.object[param.name] = node.pv[param.name];
  }
}
export class TypedThreejsCameraObjNode extends TypedCameraObjNode {
  constructor() {
    super(...arguments);
    this.flags = new FlagsControllerD(this);
    this.hierarchy_controller = new HierarchyController2(this);
    this.transform_controller = new TransformController2(this);
    this.children_display_controller = new ChildrenDisplayController2(this);
    this.display_node_controller = new DisplayNodeController2(this, this.children_display_controller.display_node_controller_callbacks());
    this._children_controller_context = NodeContext2.SOP;
  }
  get controls_controller() {
    return this._controls_controller = this._controls_controller || new ThreejsCameraControlsController(this);
  }
  get layers_controller() {
    return this._layers_controller = this._layers_controller || new LayersController2(this);
  }
  get render_controller() {
    return this._render_controller = this._render_controller || new RenderController2(this);
  }
  get post_process_controller() {
    return this._post_process_controller = this._post_process_controller || new PostProcessController2(this);
  }
  initialize_base_node() {
    super.initialize_base_node();
    this.io.outputs.set_has_one_output();
    this.hierarchy_controller.initialize_node();
    this.transform_controller.initialize_node();
    this.children_display_controller.initialize_node();
  }
  createNode(node_class, params_init_value_overrides) {
    return super.createNode(node_class, params_init_value_overrides);
  }
  children() {
    return super.children();
  }
  nodes_by_type(type) {
    return super.nodes_by_type(type);
  }
  prepare_raycaster(mouse, raycaster) {
    raycaster.setFromCamera(mouse, this._object);
  }
  async cook() {
    this.transform_controller.update();
    this.layers_controller.update();
    this.update_near_far();
    this.render_controller.update();
    this.update_camera();
    this.controls_controller.update_controls();
    this._object.dispatchEvent(EVENT_CHANGE);
    this.cook_controller.end_cook();
  }
  static PARAM_CALLBACK_update_near_far_from_param(node, param) {
    node.update_near_far();
  }
  update_near_far() {
    if (this._object.near != this.pv.near || this._object.far != this.pv.far) {
      this._object.near = this.pv.near;
      this._object.far = this.pv.far;
      this._object.updateProjectionMatrix();
    }
  }
  setup_for_aspect_ratio(aspect) {
    if (lodash_isNaN(aspect)) {
      return;
    }
    if (aspect && this._aspect != aspect) {
      this._aspect = aspect;
      this._update_for_aspect_ratio();
    }
  }
  create_viewer(element, viewer_properties) {
    return new ThreejsViewer(element, this.scene, this, viewer_properties);
  }
  createViewer(element, viewer_properties) {
    return this.create_viewer(element, viewer_properties);
  }
  static PARAM_CALLBACK_reset_effects_composer(node) {
    node.post_process_controller.reset();
  }
}
export class BaseCameraObjNodeClass extends TypedCameraObjNode {
}
export class BaseThreejsCameraObjNodeClass extends TypedThreejsCameraObjNode {
  PARAM_CALLBACK_update_effects_composer(node) {
  }
}
