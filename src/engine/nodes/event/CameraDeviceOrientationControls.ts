// /**
//  * Creates a THREE DevideOrientationControls
//  *
//  * @remarks
//  * This can be linked to a camera's controls parameter
//  *
//  */
// import {Camera} from 'three';
// import {TypedCameraControlsEventNode, CameraControls} from './_BaseCameraControls';
// import {DeviceOrientationControls} from '../../../modules/three/examples/jsm/controls/DeviceOrientationControls';
// import {CameraControlsNodeType} from '../../poly/NodeContext';

// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {isBooleanTrue} from '../../../core/BooleanValue';
// class CameraDeviceOrientationControlsEventParamsConfig extends NodeParamsConfig {
// 	/** @param enable/disable */
// 	enabled = ParamConfig.BOOLEAN(1);
// }
// const ParamsConfig = new CameraDeviceOrientationControlsEventParamsConfig();

// export class CameraDeviceOrientationControlsEventNode extends TypedCameraControlsEventNode<CameraDeviceOrientationControlsEventParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return CameraControlsNodeType.DEVICE_ORIENTATION;
// 	}
// 	endEventName() {
// 		return 'end';
// 	}

// 	private _controls_by_element_id: Map<string, DeviceOrientationControls> = new Map();

// 	async createControlsInstance(camera: Camera, element: HTMLElement) {
// 		// Note that in order to work, it currently requires user action, such as a click on the canvas
// 		const controls = new DeviceOrientationControls(camera);
// 		this._controls_by_element_id.set(element.id, controls);
// 		return controls;
// 	}

// 	setupControls(controls: CameraControls) {
// 		controls.enabled = isBooleanTrue(this.pv.enabled);
// 	}

// 	updateRequired() {
// 		return true;
// 	}

// 	disposeControlsForHtmlElementId(html_element_id: string) {
// 		const controls = this._controls_by_element_id.get(html_element_id);
// 		if (controls) {
// 			controls.dispose();
// 			this._controls_by_element_id.delete(html_element_id);
// 		}
// 	}
// }
