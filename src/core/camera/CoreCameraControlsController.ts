import {Camera} from 'three';
import {PolyScene} from '../../engine/scene/PolyScene';
import {BaseNodeType} from '../../engine/nodes/_Base';
import {CAMERA_CONTROLS_NODE_TYPES} from '../../engine/poly/NodeContext';
import {TypedCameraControlsEventNode} from '../../engine/nodes/event/_BaseCameraControls';
import {CoreObject} from '../geometry/Object';
import {CameraAttribute} from './CoreCamera';
import {CoreType} from '../Type';

interface CreateControlsConfigOptions {
	scene: PolyScene;
	camera: Camera;
}

export class CoreCameraControlsController {
	static isCameraControlsNode(node: BaseNodeType) {
		return CAMERA_CONTROLS_NODE_TYPES.includes(node.type());
	}

	static controlsNode(options: CreateControlsConfigOptions) {
		const {scene, camera} = options;

		let controlsNode: TypedCameraControlsEventNode<any> | undefined;
		const foundNodePath = CoreObject.attribValue(camera, CameraAttribute.CONTROLS_PATH);
		if (foundNodePath && CoreType.isString(foundNodePath)) {
			const foundNode = scene.node(foundNodePath);
			if (foundNode && this.isCameraControlsNode(foundNode)) {
				controlsNode = foundNode as TypedCameraControlsEventNode<any>;
			}
		}

		return controlsNode;
	}
}
