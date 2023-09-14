import {CameraControls} from './../../engine/nodes/event/_BaseCameraControls';
import {BaseViewerType} from './../../engine/viewers/_Base';
import {Camera, Vector3} from 'three';
import {PolyScene} from '../../engine/scene/PolyScene';
import {CameraAttribute} from './CoreCamera';
import {CoreType} from '../Type';
import {coreObjectClassFactory} from '../geometry/CoreObjectFactory';
interface CreateControlsConfigOptions {
	scene: PolyScene;
	camera: Camera;
}

type GetTargetFunction = (target: Vector3) => void;
type SetTargetFunction = (target: Vector3) => void;

export interface ApplicableControlsNode {
	type(): string;
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
		const foundNodeId = coreObjectClassFactory(camera).attribValue(camera, CameraAttribute.CONTROLS_NODE_ID);
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
