import {Group} from 'three/src/objects/Group';
import {TypedBaseManagerNode} from './_Base';
import {BaseObjNodeType} from '../obj/_Base';
import {NodeContext} from '../../poly/NodeContext';
import {ObjNodeChildrenMap} from '../../poly/registers/nodes/Obj';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {HierarchyObjNode} from '../obj/utils/HierarchyController';
import {ParamsInitData} from '../utils/io/IOController';
import {Constructor, valueof} from '../../../types/GlobalTypes';
class ObjectsManagerParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new ObjectsManagerParamsConfig();

export class ObjectsManagerNode extends TypedBaseManagerNode<ObjectsManagerParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'obj';
	}

	private _object: Group = new Group();
	private _queued_nodes_by_id: Map<number, BaseObjNodeType> = new Map();
	// private _expected_geo_nodes: PolyDictionary<GeoObjNode> = {};
	// private _process_queue_start: number = -1;

	protected _children_controller_context = NodeContext.OBJ;
	initialize_node() {
		// this.children_controller?.init({dependent: false});
		this._object.matrixAutoUpdate = false;

		this.lifecycle.add_on_child_add_hook(this._on_child_add.bind(this));
		this.lifecycle.add_on_child_remove_hook(this._on_child_remove.bind(this));
	}

	init_default_scene() {
		this._object.name = '_WORLD_';
		this._scene.threejsScene().add(this._object);
	}

	object() {
		return this._object;
	}
	createNode<S extends keyof ObjNodeChildrenMap>(
		node_class: S,
		params_init_value_overrides?: ParamsInitData
	): ObjNodeChildrenMap[S];
	createNode<K extends valueof<ObjNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K;
	createNode<K extends valueof<ObjNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K {
		return super.createNode(node_class, params_init_value_overrides) as K;
	}
	children() {
		return super.children() as BaseObjNodeType[];
	}
	nodesByType<K extends keyof ObjNodeChildrenMap>(type: K): ObjNodeChildrenMap[K][] {
		return super.nodesByType(type) as ObjNodeChildrenMap[K][];
	}

	multiple_display_flags_allowed() {
		return true;
	}

	private _add_to_queue(node: BaseObjNodeType) {
		const id = node.graphNodeId();
		if (!this._queued_nodes_by_id.has(id)) {
			this._queued_nodes_by_id.set(id, node);
		}
		return node;
	}

	async processQueue() {
		const queued_nodes_by_path: Map<string, BaseObjNodeType> = new Map();
		const paths: string[] = [];
		this._queued_nodes_by_id.forEach((node, id) => {
			const fullPath = `_____${node.render_order}__${node.fullPath()}`;
			paths.push(fullPath);
			queued_nodes_by_path.set(fullPath, node);
		});
		this._queued_nodes_by_id.clear();

		// const promises = [];
		for (let path_id of paths) {
			const node = queued_nodes_by_path.get(path_id);
			if (node) {
				queued_nodes_by_path.delete(path_id);
				this._add_to_scene(node);
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
			return this._add_to_queue(node);
		} else {
			return this._add_to_scene(node);
		}
	}

	//
	//
	// OBJ PARENTING
	//
	//
	get_parent_for_node(node: BaseObjNodeType) {
		if (node.attachable_to_hierarchy) {
			const node_input = node.io.inputs.input(0);
			if (node_input) {
				return node_input.children_group;
			} else {
				return this._object;
			}
		} else {
			return null;
		}
	}

	private _add_to_scene(node: BaseObjNodeType): void {
		if (node.attachable_to_hierarchy) {
			const parent_object = node.root().get_parent_for_node(node);
			if (parent_object) {
				// await node.params.eval_all().then((params_eval_key) => {
				// 	node.requestContainer();
				// });

				if (node.usedInScene()) {
					// I need to query the display_node_controller here,
					// for geo obj whose display_node is a node without inputs.
					// Since that node will not be made dirty, it seems that there is
					// nothing triggering the obj to request it itself.
					// TODO: investigate if it has a performance cost, or if it could be done
					// only when scene loads. Or if the display_node_controller itself could be improved
					// to take care of it itself.
					// node.requestContainer();
					node.children_display_controller?.request_display_node_container();
					node.add_object_to_parent(parent_object);
				} else {
					node.remove_object_from_parent();
					// parent_object.remove(node.object);
				}

				// node.request_display_node();
			} else {
				// node.requestContainer().then(() => {
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

	remove_from_scene(node: BaseObjNodeType) {
		node.remove_object_from_parent();
	}
	are_children_cooking(): boolean {
		const children = this.children();
		for (let child of children) {
			if (child.cookController.is_cooking || child.is_display_node_cooking()) {
				return true;
			}
		}
		return false;
	}

	// private async expected_loading_geo_nodes_by_id() {
	// 	const geo_nodes = this.nodesByType('geo');
	// 	const node_by_id: PolyDictionary<GeoObjNode> = {};
	// 	for (let geo_node of geo_nodes) {
	// 		const is_displayed = await geo_node.is_displayed();
	// 		if (is_displayed) {
	// 			node_by_id[geo_node.graphNodeId()] = geo_node;
	// 		}
	// 	}
	// 	return node_by_id;
	// }

	add_to_parent_transform(node: HierarchyObjNode) {
		this._update_object(node);
	}

	remove_from_parent_transform(node: HierarchyObjNode) {
		this._update_object(node);
	}

	private _on_child_add(node?: BaseNodeType) {
		if (node) {
			this._update_object(node as BaseObjNodeType);
		}
	}
	private _on_child_remove(node?: BaseNodeType) {
		if (node) {
			this.remove_from_scene(node as BaseObjNodeType);
		}
	}
}
