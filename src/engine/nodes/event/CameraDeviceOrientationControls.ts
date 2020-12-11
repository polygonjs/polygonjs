import {Camera} from 'three/src/cameras/Camera';
import {TypedCameraControlsEventNode, CameraControls} from './_BaseCameraControls';
import {DeviceOrientationControls} from '../../../modules/three/examples/jsm/controls/DeviceOrientationControls';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CameraControlsNodeType} from '../../poly/NodeContext';
class CameraDeviceOrientationControlsEventParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new CameraDeviceOrientationControlsEventParamsConfig();

export class CameraDeviceOrientationControlsEventNode extends TypedCameraControlsEventNode<CameraDeviceOrientationControlsEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return CameraControlsNodeType.DEVICE_ORIENTATION;
	}

	private _controls_by_element_id: Map<string, DeviceOrientationControls> = new Map();

	async create_controls_instance(camera: Camera, element: HTMLElement) {
		// Note that in order to work, it currently requires user action, such as a click on the canvas
		const controls = new DeviceOrientationControls(camera);
		this._controls_by_element_id.set(element.id, controls);
		return controls;
	}

	setup_controls(controls: CameraControls) {}

	update_required() {
		return true;
	}

	dispose_controls_for_html_element_id(html_element_id: string) {
		const controls = this._controls_by_element_id.get(html_element_id);
		if (controls) {
			controls.dispose();
			this._controls_by_element_id.delete(html_element_id);
		}
	}
}
