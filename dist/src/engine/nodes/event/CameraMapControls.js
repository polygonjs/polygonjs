import {MapControls} from "../../../modules/core/controls/OrbitControls";
import {CameraControlsNodeType} from "../../poly/NodeContext";
import {CameraOrbitControlsEventNode} from "./CameraOrbitControls";
export class CameraMapControlsEventNode extends CameraOrbitControlsEventNode {
  static type() {
    return CameraControlsNodeType.MAP;
  }
  async create_controls_instance(camera, element) {
    const controls = new MapControls(camera, element);
    this._bind_listeners_to_controls_instance(controls);
    return controls;
  }
}
