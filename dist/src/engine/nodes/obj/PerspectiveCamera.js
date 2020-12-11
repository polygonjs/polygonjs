import {PerspectiveCamera as PerspectiveCamera2} from "three/src/cameras/PerspectiveCamera";
import {
  TypedThreejsCameraObjNode,
  BASE_CAMERA_DEFAULT,
  ThreejsCameraTransformParamConfig,
  CameraMasterCameraParamConfig
} from "./_BaseCamera";
const DEFAULT = {
  fov: 50
};
import {ParamConfig, NodeParamsConfig} from "../utils/params/ParamsConfig";
import {CameraRenderParamConfig} from "./utils/cameras/RenderController";
import {CameraPostProcessParamConfig} from "./utils/cameras/PostProcessController";
import {LayerParamConfig} from "./utils/LayersController";
import {TransformedParamConfig} from "./utils/TransformController";
import {CameraNodeType} from "../../poly/NodeContext";
export function PerspectiveCameraObjParamConfigMixin(Base) {
  return class Mixin extends Base {
    constructor() {
      super(...arguments);
      this.fov = ParamConfig.FLOAT(DEFAULT.fov, {range: [0, 100]});
    }
  };
}
class PerspectiveCameraObjParamConfig extends CameraPostProcessParamConfig(CameraRenderParamConfig(LayerParamConfig(CameraMasterCameraParamConfig(PerspectiveCameraObjParamConfigMixin(ThreejsCameraTransformParamConfig(TransformedParamConfig(NodeParamsConfig, {matrix_auto_update: true}))))))) {
}
const ParamsConfig2 = new PerspectiveCameraObjParamConfig();
export class PerspectiveCameraObjNode extends TypedThreejsCameraObjNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return CameraNodeType.PERSPECTIVE;
  }
  create_object() {
    return new PerspectiveCamera2(DEFAULT.fov, 1, BASE_CAMERA_DEFAULT.near, BASE_CAMERA_DEFAULT.far);
  }
  update_camera() {
    if (this._object.fov != this.pv.fov) {
      this._object.fov = this.pv.fov;
      this._object.updateProjectionMatrix();
    }
    this._update_for_aspect_ratio();
  }
  _update_for_aspect_ratio() {
    if (this._aspect) {
      this._object.aspect = this._aspect;
      this._object.updateProjectionMatrix();
    }
  }
}
