import {Camera} from 'three';
import {PolyScene} from '../../engine/scene/PolyScene';
import {BaseNodeType} from '../../engine/nodes/_Base';
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
		const foundNodePath = CoreObject.attribValue(camera, CameraAttribute.RENDER_SCENE_PATH);
		if (foundNodePath && CoreType.isString(foundNodePath)) {
			const foundNode = scene.node(foundNodePath);
			if (foundNode && this.isRenderSceneNode(foundNode)) {
				sceneNode = foundNode as SceneObjNode;
				return sceneNode.object;
			}
		}
	}
}
