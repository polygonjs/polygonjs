import {Camera} from 'three/src/cameras/Camera';
import {MapControls} from 'modules/three/examples/jsm/controls/OrbitControls';
import {CameraOrbitControlsEventNode} from './CameraOrbitControls';

export class CameraMapControlsEventNode extends CameraOrbitControlsEventNode {
	static type() {
		return 'camera_map_controls';
	}

	async create_controls_instance(camera: Camera, element: HTMLElement) {
		// await CoreScriptLoader.load_module_three_example('controls/OrbitControls')
		// const constructor_name = 'MapControls'
		// const constructor = THREE[constructor_name]
		// const c = this.constructor as typeof CameraMapControlsEventNode;
		// const {MapControls} = await CoreScriptLoader.module(c.required_imports()[0]);

		return new MapControls(camera, element);
	}
}
