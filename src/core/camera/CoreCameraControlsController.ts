import {Camera} from 'three';
import {PolyScene} from '../../engine/scene/PolyScene';
import {BaseNodeType, TypedNode} from '../../engine/nodes/_Base';
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
		const foundNodeId = CoreObject.attribValue(camera, CameraAttribute.CONTROLS_NODE_ID);
		if (foundNodeId && CoreType.isNumber(foundNodeId)) {
			const foundNode = scene.graph.nodeFromId(foundNodeId);
			if (foundNode && foundNode instanceof TypedNode && this.isCameraControlsNode(foundNode)) {
				controlsNode = foundNode as TypedCameraControlsEventNode<any>;
			}
		}

		return controlsNode;
	}
}
