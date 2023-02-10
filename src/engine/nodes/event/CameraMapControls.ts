/**
 * Creates a THREE MapControls
 *
 * @remarks
 * This can be linked to a camera's controls parameter
 *
 */
import {Camera} from 'three';
import {MapControls} from 'three/examples/jsm/controls/OrbitControls';
import {CameraControlsNodeType} from '../../poly/NodeContext';
import {CameraOrbitControlsEventNode} from './CameraOrbitControls';

export class CameraMapControlsEventNode extends CameraOrbitControlsEventNode {
	static override type() {
		return CameraControlsNodeType.MAP;
	}

	async create_controls_instance(camera: Camera, element: HTMLElement) {
		const controls = new MapControls(camera, element);
		this._bind_listeners_to_controls_instance(controls);
		return controls;
	}
}
