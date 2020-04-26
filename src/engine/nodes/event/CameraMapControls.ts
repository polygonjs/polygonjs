import {Camera} from 'three/src/cameras/Camera';
import {MapControls} from '../../../../modules/three/examples/jsm/controls/OrbitControls';
import {CameraOrbitControlsEventNode} from './CameraOrbitControls';

export class CameraMapControlsEventNode extends CameraOrbitControlsEventNode {
	static type() {
		return 'camera_map_controls';
	}

	async create_controls_instance(camera: Camera, element: HTMLElement) {
		return new MapControls(camera, element);
	}
}
