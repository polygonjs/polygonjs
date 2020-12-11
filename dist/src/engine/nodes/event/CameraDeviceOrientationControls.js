import {TypedCameraControlsEventNode} from "./_BaseCameraControls";
import {DeviceOrientationControls as DeviceOrientationControls2} from "../../../modules/three/examples/jsm/controls/DeviceOrientationControls";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
import {CameraControlsNodeType} from "../../poly/NodeContext";
class CameraDeviceOrientationControlsEventParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new CameraDeviceOrientationControlsEventParamsConfig();
export class CameraDeviceOrientationControlsEventNode extends TypedCameraControlsEventNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._controls_by_element_id = new Map();
  }
  static type() {
    return CameraControlsNodeType.DEVICE_ORIENTATION;
  }
  async create_controls_instance(camera, element) {
    const controls = new DeviceOrientationControls2(camera);
    this._controls_by_element_id.set(element.id, controls);
    return controls;
  }
  setup_controls(controls) {
  }
  update_required() {
    return true;
  }
  dispose_controls_for_html_element_id(html_element_id) {
    const controls = this._controls_by_element_id.get(html_element_id);
    if (controls) {
      controls.dispose();
      this._controls_by_element_id.delete(html_element_id);
    }
  }
}
