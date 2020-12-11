import {OrthographicCamera as OrthographicCamera2} from "three/src/cameras/OrthographicCamera";
import {
  TypedThreejsCameraObjNode,
  BASE_CAMERA_DEFAULT,
  ThreejsCameraTransformParamConfig,
  CameraMasterCameraParamConfig
} from "./_BaseCamera";
const DEFAULT = {
  left: -0.5,
  right: 0.5,
  top: 0.5,
  bottom: -0.5
};
import {ParamConfig, NodeParamsConfig} from "../utils/params/ParamsConfig";
import {CameraRenderParamConfig} from "./utils/cameras/RenderController";
import {CameraPostProcessParamConfig} from "./utils/cameras/PostProcessController";
import {LayerParamConfig} from "./utils/LayersController";
import {TransformedParamConfig} from "./utils/TransformController";
import {CameraNodeType} from "../../poly/NodeContext";
export function OrthographicCameraObjParamConfigMixin(Base) {
  return class Mixin extends Base {
    constructor() {
      super(...arguments);
      this.size = ParamConfig.FLOAT(1);
    }
  };
}
class OrthographicCameraObjParamConfig extends CameraPostProcessParamConfig(CameraRenderParamConfig(LayerParamConfig(OrthographicCameraObjParamConfigMixin(CameraMasterCameraParamConfig(ThreejsCameraTransformParamConfig(TransformedParamConfig(NodeParamsConfig, {matrix_auto_update: true}))))))) {
}
const ParamsConfig2 = new OrthographicCameraObjParamConfig();
export class OrthographicCameraObjNode extends TypedThreejsCameraObjNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return CameraNodeType.ORTHOGRAPHIC;
  }
  create_object() {
    return new OrthographicCamera2(DEFAULT.left * 2, DEFAULT.right * 2, DEFAULT.top * 2, DEFAULT.bottom * 2, BASE_CAMERA_DEFAULT.near, BASE_CAMERA_DEFAULT.far);
  }
  update_camera() {
    this._update_for_aspect_ratio();
  }
  _update_for_aspect_ratio() {
    if (this._aspect) {
      const size = this.pv.size || 1;
      const horizontal_size = size * this._aspect;
      const zoom = 1;
      this._object.left = DEFAULT.left * horizontal_size * zoom;
      this._object.right = DEFAULT.right * horizontal_size * zoom;
      this._object.top = DEFAULT.top * size * zoom;
      this._object.bottom = DEFAULT.bottom * size * zoom;
      this._object.updateProjectionMatrix();
    }
  }
}
