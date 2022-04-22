import {TypedBaseManagerNode} from './_Base';
import {BaseObjNodeType} from '../obj/_Base';
import {NodeContext} from '../../poly/NodeContext';
import {ObjNodeChildrenMap} from '../../poly/registers/nodes/Obj';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {HierarchyObjNode} from '../obj/utils/HierarchyController';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {ROOT_NAME} from '../../scene/utils/ObjectsController';
import {Scene} from 'three';

import {RootAudioController, RootAudioParamConfig} from './utils/Scene/Audio';
import {SceneAutoUpdateParamConfig, SceneAutoUpdateController} from './utils/Scene/AutoUpdate';
import {SceneBackgroundParamConfig, SceneBackgroundController} from './utils/Scene/Background';
import {SceneEnvParamConfig, SceneEnvController} from './utils/Scene/Env';
import {SceneFogParamConfig, SceneFogController} from './utils/Scene/Fog';
import {RootLoadProgressParamConfig, RootLoadProgressController} from './utils/Scene/LoadProgress';
import {SceneMaterialOverrideParamConfig, SceneMaterialOverrideController} from './utils/Scene/MaterialOverride';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';

export const ROOT_NODE_NAME = 'RootNode';
class ObjectsManagerParamsConfig extends RootLoadProgressParamConfig(
	RootAudioParamConfig(
		SceneMaterialOverrideParamConfig(
			SceneEnvParamConfig(
				SceneFogParamConfig(SceneBackgroundParamConfig(SceneAutoUpdateParamConfig(NodeParamsConfig)))
			)
		)
	)
) {}
const ParamsConfig = new ObjectsManagerParamsConfig();

export class RootManagerNode extends TypedBaseManagerNode<ObjectsManagerParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'root';
	}

	protected _object: Scene = this._createScene();
	private _queued_nodes_by_id: Map<number, BaseObjNodeType> = new Map();
	// private _expected_geo_nodes: PolyDictionary<GeoObjNode> = {};
	// private _process_queue_start: number = -1;
	readonly audioController: RootAudioController = new RootAudioController(this);
	readonly sceneAutoUpdateController: SceneAutoUpdateController = new SceneAutoUpdateController(this);
	readonly sceneBackgroundController: SceneBackgroundController = new SceneBackgroundController(this);
	readonly sceneEnvController: SceneEnvController = new SceneEnvController(this);
	readonly sceneFogController: SceneFogController = new SceneFogController(this);
	readonly loadProgress: RootLoadProgressController = new RootLoadProgressController(this);
	readonly sceneMaterialOverrideController: SceneMaterialOverrideController = new SceneMaterialOverrideController(
		this as any
	);

	override cook() {
		// the cook method is necessary here,
		// with the .endCook()
		// Without it, the button param of this node would not execute
		// its callback, as this node would not be perceived as cooking done
		this.cookController.endCook();
	}

	protected override _childrenControllerContext = NodeContext.OBJ;
	override initializeNode() {
		// this.children_controller?.init({dependent: false});
		this._object.matrixAutoUpdate = false;

		this.lifecycle.onChildAdd(this._on_child_add.bind(this));
		this.lifecycle.onChildRemove(this._on_child_remove.bind(this));
	}

	private _createScene() {
		const scene = new Scene();
		scene.name = ROOT_NAME;
		scene.matrixAutoUpdate = false;
		return scene;
	}

	get object() {
		return this._object;
	}
	override createNode<S extends keyof ObjNodeChildrenMap>(
		nodeClass: S,
		options?: NodeCreateOptions
	): ObjNodeChildrenMap[S];
	override createNode<K extends valueof<ObjNodeChildrenMap>>(
		nodeClass: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<ObjNodeChildrenMap>>(
		nodeClass: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(nodeClass, options) as K;
	}
	override children() {
		return super.children() as BaseObjNodeType[];
	}
	override nodesByType<K extends keyof ObjNodeChildrenMap>(type: K): ObjNodeChildrenMap[K][] {
		return super.nodesByType(type) as ObjNodeChildrenMap[K][];
	}

	// multiple_display_flags_allowed() {
	// 	return true;
	// }
	private _updateScene() {
		this.sceneAutoUpdateController.update();
		this.sceneBackgroundController.update();
		this.sceneEnvController.update();
		this.sceneFogController.update();
		this.sceneMaterialOverrideController.update();
	}

	private _addToQueue(node: BaseObjNodeType) {
		const id = node.graphNodeId();
		if (!this._queued_nodes_by_id.has(id)) {
			this._queued_nodes_by_id.set(id, node);
		}
		return node;
	}

	async processQueue() {
		this._updateScene();

		const queued_nodes_by_path: Map<string, BaseObjNodeType> = new Map();
		const paths: string[] = [];
		this._queued_nodes_by_id.forEach((node, id) => {
			const fullPath = `_____${node.renderOrder}__${node.path()}`;
			paths.push(fullPath);
			queued_nodes_by_path.set(fullPath, node);
		});
		this._queued_nodes_by_id.clear();

		// const promises = [];
		for (let path_id of paths) {
			const node = queued_nodes_by_path.get(path_id);
			if (node) {
				queued_nodes_by_path.delete(path_id);
				this._addToScene(node);
				// promises.push();
			}
		}

		// this._expected_geo_nodes = this._expected_geo_nodes || (await this.expected_loading_geo_nodes_by_id());

		// this._process_queue_start = performance.now();
		// Promise.all(promises).then(() => {
		// 	// Poly.log(`SCENE LOADED '${this.scene.name}`);
		// 	// `SCENE LOADED '${this.scene.name}' in ${performance.now() - this._process_queue_start}`
		// 	// this.scene().performance().print()
		// 	// do the update here if there are no objects to load
		// 	// otherwise an empty scene will have a loader that never gets removed
		// 	// if (Object.keys(this._expected_geo_nodes).length == 0) {
		// 	// 	this.update_on_all_objects_loaded();
		// 	// }
		// });
	}

	private _update_object(node: BaseObjNodeType) {
		if (!this.scene().loadingController.autoUpdating()) {
			return this._addToQueue(node);
		} else {
			// update 25/01/2022: the light obj nodes, the null obj do not cook when created.
			// this aims to solve this.
			// and only once the scene has loaded
			if (node.isDisplayed() && !node.cookController.isCooking()) {
				node.compute();
			}
			return this._addToScene(node);
		}
	}

	//
	//
	// OBJ PARENTING
	//
	//
	getParentForNode(node: BaseObjNodeType) {
		if (node.attachableToHierarchy()) {
			const node_input = node.io.inputs.input(0);
			if (node_input) {
				return node_input.childrenGroup();
			} else {
				return this._object;
			}
		} else {
			return null;
		}
	}

	private _addToScene(node: BaseObjNodeType): void {
		if (node.attachableToHierarchy()) {
			const parent_object = this.getParentForNode(node);
			if (parent_object) {
				// await node.params.eval_all().then((params_eval_key) => {
				// 	node.compute();
				// });

				if (node.usedInScene()) {
					// I need to query the displayNodeController here,
					// for geo obj whose display_node is a node without inputs.
					// Since that node will not be made dirty, it seems that there is
					// nothing triggering the obj to request it itself.
					// TODO: investigate if it has a performance cost, or if it could be done
					// only when scene loads. Or if the displayNodeController itself could be improved
					// to take care of it itself.
					// node.compute();

					node.childrenDisplayController?.request_display_node_container();
					node.addObjectToParent(parent_object);
				} else {
					node.removeObjectFromParent();
					// parent_object.remove(node.object);
				}

				// node.request_display_node();
			} else {
				// node.compute().then(() => {
				// 	// force events and mat to cook and remove the dirty state
				// 	// ensure that pickers are cooked
				// 	// TODO: although there has been cases with two picker and
				// 	// one referencing the other with an expression, and that
				// 	// expression be evaluated before the second was created
				// 	// which led to an error. This should not happen
				// 	node.children_controller.traverse_children((child) => child.setDirty());
				// });
			}
		}
	}

	private _removeFromScene(node: BaseObjNodeType) {
		node.removeObjectFromParent();
	}
	areChildrenCooking(): boolean {
		const children = this.children();
		for (let child of children) {
			if (child.cookController.isCooking() || child.isDisplayNodeCooking()) {
				return true;
			}
		}
		return false;
	}

	// private async expected_loading_geo_nodes_by_id() {
	// 	const geo_nodes = this.nodesByType('geo');
	// 	const node_by_id: PolyDictionary<GeoObjNode> = {};
	// 	for (let geo_node of geo_nodes) {
	// 		const isDisplayed = await geo_node.isDisplayed();
	// 		if (isDisplayed) {
	// 			node_by_id[geo_node.graphNodeId()] = geo_node;
	// 		}
	// 	}
	// 	return node_by_id;
	// }

	addToParentTransform(node: HierarchyObjNode) {
		this._update_object(node);
	}

	removeFromParentTransform(node: HierarchyObjNode) {
		this._update_object(node);
	}

	private _on_child_add(node?: BaseNodeType) {
		if (node) {
			this._update_object(node as BaseObjNodeType);
		}
	}
	private _on_child_remove(node?: BaseNodeType) {
		if (node) {
			this._removeFromScene(node as BaseObjNodeType);
		}
	}
}
