import {CameraControls} from './../../engine/nodes/event/_BaseCameraControls';
import {BaseViewerType} from './../../engine/viewers/_Base';
import {Camera} from 'three';
import {PolyScene} from '../../engine/scene/PolyScene';
// import {TypedNode} from '../../engine/nodes/_Base';
// import {CAMERA_CONTROLS_NODE_TYPES} from '../../engine/poly/NodeContext';
// import {TypedCameraControlsEventNode} from '../../engine/nodes/event/_BaseCameraControls';
import {CoreObject} from '../geometry/Object';
import {CameraAttribute} from './CoreCamera';
import {CoreType} from '../Type';
import {Vector3} from 'three';
interface CreateControlsConfigOptions {
	scene: PolyScene;
	camera: Camera;
}

type GetTargetFunction = (target: Vector3) => void;
type SetTargetFunction = (target: Vector3) => void;

export interface ApplicableControlsNode {
	applyControls: (camera: Camera, viewer: BaseViewerType) => Promise<CameraControls>;
	target?: GetTargetFunction;
	setTarget?: SetTargetFunction;
}

export class CoreCameraControlsController {
	// static isCameraControlsNode(node: BaseNodeType) {
	// 	return CAMERA_CONTROLS_NODE_TYPES.includes(node.type());
	// }

	static controlsNode(options: CreateControlsConfigOptions): ApplicableControlsNode | undefined {
		const {scene, camera} = options;

		let controlsNode: ApplicableControlsNode | undefined; //TypedCameraControlsEventNode<any> | undefined;
		const foundNodeId = CoreObject.attribValue(camera, CameraAttribute.CONTROLS_NODE_ID);
		if (foundNodeId && CoreType.isNumber(foundNodeId)) {
			const foundNode = scene.graph.nodeFromId(foundNodeId);
			// if (foundNode && foundNode instanceof TypedNode && this.isCameraControlsNode(foundNode)) {
			if (foundNode && (foundNode as unknown as ApplicableControlsNode).applyControls) {
				controlsNode = foundNode as unknown as ApplicableControlsNode; //TypedCameraControlsEventNode<any>;
			}
		}

		return controlsNode;
	}
}
