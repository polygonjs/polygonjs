import {Camera} from 'three';
import {PolyScene} from '../../engine/scene/PolyScene';
import {BaseNodeType, TypedNode} from '../../engine/nodes/_Base';
import {CoreObject} from '../geometry/Object';
import {CameraAttribute} from './CoreCamera';
import {CoreType} from '../Type';
import {ObjType} from '../../engine/poly/registers/nodes/types/Obj';
import type {SceneObjNode} from '../../engine/nodes/obj/Scene';

interface RenderSceneControllerOptions {
	scene: PolyScene;
	camera: Camera;
}

export class CoreCameraRenderSceneController {
	static isRenderSceneNode(node: BaseNodeType) {
		return node.type() == ObjType.SCENE;
	}

	static renderScene(options: RenderSceneControllerOptions) {
		const {scene, camera} = options;

		let sceneNode: SceneObjNode | undefined;
		const foundNodeId = CoreObject.attribValue(camera, CameraAttribute.RENDER_SCENE_NODE_ID);
		if (foundNodeId && CoreType.isNumber(foundNodeId)) {
			const foundNode = scene.graph.nodeFromId(foundNodeId);
			if (foundNode && foundNode instanceof TypedNode && this.isRenderSceneNode(foundNode)) {
				sceneNode = foundNode as SceneObjNode;
				return sceneNode.object;
			}
		}
	}
}
