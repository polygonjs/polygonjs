/**
 * Creates a THREE MapControls
 *
 * @remarks
 * This can be linked to a camera's controls parameter
 *
 */
import {Camera} from 'three';

import {CameraControlsNodeType} from '../../poly/NodeContext';
import {CameraOrbitControlsEventNode} from './CameraOrbitControls';

// see note in orbitControls
// regarding where to import the module from
import {MapControls} from '../../../modules/core/controls/OrbitControls';
// import {MapControls} from 'three/examples/jsm/controls/OrbitControls';

export class CameraMapControlsEventNode extends CameraOrbitControlsEventNode {
	static override type() {
		return CameraControlsNodeType.MAP;
	}

	protected override _createControls(camera: Camera, element: HTMLElement) {
		return new MapControls(camera, element);
	}
}
