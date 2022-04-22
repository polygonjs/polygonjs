/**
 * Creates a THREE.Scene.
 *
 * @remarks
 * By default, all objects created will be added under the same master scene. This is enough in most cases, but there might be times where you want to use a custom one. For instance:
 *
 * - you would like to change the background color or the environment.
 * - you would like to have a fog.
 * - You may also use multiple scenes, if you want to switch from one to the other.
 *
 * For those situtation, you can parent the objects under a scene node, and set your camera scene parameter to point to it. The camera will then render this scene instead of the master one.
 *
 *
 */
import {TypedObjNode} from './_Base';
import {Scene} from 'three';
import {HierarchyController} from './utils/HierarchyController';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {SceneAutoUpdateParamConfig, SceneAutoUpdateController} from '../manager/utils/Scene/AutoUpdate';
import {SceneBackgroundParamConfig, SceneBackgroundController} from '../manager/utils/Scene/Background';
import {SceneEnvParamConfig, SceneEnvController} from '../manager/utils/Scene/Env';
import {SceneFogParamConfig, SceneFogController} from '../manager/utils/Scene/Fog';
import {
	SceneMaterialOverrideParamConfig,
	SceneMaterialOverrideController,
} from '../manager/utils/Scene/MaterialOverride';
import {ObjType} from '../../poly/registers/nodes/types/Obj';
class SceneObjParamConfig extends SceneMaterialOverrideParamConfig(
	SceneFogParamConfig(SceneEnvParamConfig(SceneBackgroundParamConfig(SceneAutoUpdateParamConfig(NodeParamsConfig))))
) {}
const ParamsConfig = new SceneObjParamConfig();

export class SceneObjNode extends TypedObjNode<Scene, SceneObjParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<ObjType.SCENE> {
		return ObjType.SCENE;
	}
	override readonly hierarchyController: HierarchyController = new HierarchyController(this);

	override createObject() {
		const scene = new Scene();
		scene.matrixAutoUpdate = false;
		return scene;
	}

	override initializeNode() {
		this.hierarchyController.initializeNode();
	}

	readonly SceneAutoUpdateController: SceneAutoUpdateController = new SceneAutoUpdateController(this as any);
	readonly sceneBackgroundController: SceneBackgroundController = new SceneBackgroundController(this as any);
	readonly SceneEnvController: SceneEnvController = new SceneEnvController(this as any);
	readonly sceneFogController: SceneFogController = new SceneFogController(this as any);
	readonly sceneMaterialOverrideController: SceneMaterialOverrideController = new SceneMaterialOverrideController(
		this as any
	);

	override cook() {
		this.SceneAutoUpdateController.update();
		this.sceneBackgroundController.update();
		this.SceneEnvController.update();
		this.sceneFogController.update();
		this.sceneMaterialOverrideController.update();

		this.cookController.endCook();
	}
}
