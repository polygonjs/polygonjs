import {Group} from 'three/src/objects/Group';
import {TypedBaseManagerNode} from './_Base';
import {BaseObjNodeType} from '../obj/_Base';
import {GeoObjNode} from '../obj/Geo';
// import {Poly} from '../../Poly';
import {NodeContext} from '../../poly/NodeContext';
import {ObjNodeChildrenMap} from '../../poly/registers/nodes/Obj';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
class ObjectsManagerParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new ObjectsManagerParamsConfig();

export class ObjectsManagerNode extends TypedBaseManagerNode<ObjectsManagerParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'obj';
	}

	private _object: Group = new Group();
	private _queued_nodes_by_id: Dictionary<BaseObjNodeType> = {};
	private _queued_nodes_by_path: Dictionary<BaseObjNodeType> = {};
	private _expected_geo_nodes: Dictionary<GeoObjNode> = {};
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
		this._scene.default_scene.add(this._object);
	}

	object() {
		return this._object;
	}
	create_node<K extends keyof ObjNodeChildrenMap>(type: K): ObjNodeChildrenMap[K] {
		return super.create_node(type) as ObjNodeChildrenMap[K];
	}
	children() {
		return super.children() as BaseObjNodeType[];
	}
	nodes_by_type<K extends keyof ObjNodeChildrenMap>(type: K): ObjNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as ObjNodeChildrenMap[K][];
	}

	multiple_display_flags_allowed() {
		return true;
	}

	add_to_queue(node: BaseObjNodeType) {
		const id = node.graph_node_id;
		if (this._queued_nodes_by_id[id] == null) {
			return (this._queued_nodes_by_id[id] = node);
		}
	}

	async process_queue() {
		this._queued_nodes_by_path = {};
		const ids = Object.keys(this._queued_nodes_by_id);
		for (let id of ids) {
			const node = this._queued_nodes_by_id[id];
			delete this._queued_nodes_by_id[id];

			const full_path = `_____${node.render_order}__${node.full_path()}`;

			this._queued_nodes_by_path[full_path] = node;
		}

		const promises = Object.keys(this._queued_nodes_by_path)
			.sort()
			.map((path_id) => {
				const node = this._queued_nodes_by_path[path_id];
				return this.update_object(node);
			});

		this._expected_geo_nodes = this._expected_geo_nodes || (await this.expected_loading_geo_nodes_by_id());

		// this._process_queue_start = performance.now();
		Promise.all(promises).then(() => {
			// Poly.instance().log(`SCENE LOADED '${this.scene.name}`);
			// `SCENE LOADED '${this.scene.name}' in ${performance.now() - this._process_queue_start}`
			// this.scene().performance().print()
			// do the update here if there are no objects to load
			// otherwise an empty scene will have a loader that never gets removed
			// if (Object.keys(this._expected_geo_nodes).length == 0) {
			// 	this.update_on_all_objects_loaded();
			// }
		});
	}

	update_object(node: BaseObjNodeType) {
		if (!this.scene.loading_controller.auto_updating) {
			this.add_to_queue(node);
		} else {
			// if (node.object) {
			this.add_to_scene(node);
			// } else {
			// 	//if POLY.env != 'test'
			// 	// console.warn(`no object from ${node.full_path()} (error:${node.error_message()}) (${POLY.env})`);
			// }
		}
	}

	//
	//
	// OBJ PARENTING
	//
	//

	// TODO:
	// a OBJ node should be able to submit its group for transform
	// apart from the geometry. This would allow parenting to function
	// regardless if the underlying geo is valid or not
	get_parent_for_node(node: BaseObjNodeType) {
		// if (this._is_node_event(node) || this._is_node_mat(node)) {
		// 	return null;
		if (node.attachable_to_hierarchy) {
			// if (this._is_node_camera(node)) {
			// 	return this.scene.display_scene;
			// } else {
			const node_input = node.io.inputs.input(0);
			if (node_input) {
				//node_input.request_container (container)=>
				//	callback(container.object() || @_object)
				return node_input.children_group;
			} else {
				return this._object;
			}
			// }
		} else {
			return null;
		}
	}

	add_to_scene(node: BaseObjNodeType): void {
		if (node.attachable_to_hierarchy) {
			const parent_object = this.get_parent_for_node(node);
			if (parent_object) {
				// await node.params.eval_all().then((params_eval_key) => {
				// 	node.request_container();
				// });

				if (node.used_in_scene) {
					// I need to query the display_node_controller here,
					// for geo obj whose display_node is a node without inputs.
					// Since that node will not be made dirty, it seems that there is
					// nothing triggering the obj to request it itself.
					// TODO: investigate if it has a performance cost, or if it could be done
					// only when scene loads. Or if the display_node_controller itself could be improved
					// to take care of it itself.
					node.children_display_controller?.request_display_node_container();
					node.add_object_to_parent(parent_object);
				} else {
					node.remove_object_from_parent();
					// parent_object.remove(node.object);
				}

				// node.request_display_node();
			} else {
				// node.request_container().then(() => {
				// 	// force events and mat to cook and remove the dirty state
				// 	// ensure that pickers are cooked
				// 	// TODO: although there has been cases with two picker and
				// 	// one referencing the other with an expression, and that
				// 	// expression be evaluated before the second was created
				// 	// which led to an error. This should not happen
				// 	node.children_controller.traverse_children((child) => child.set_dirty());
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
			if (child.cook_controller.is_cooking || child.is_display_node_cooking()) {
				return true;
			}
		}
		return false;
	}

	async expected_loading_geo_nodes_by_id() {
		const geo_nodes = this.nodes_by_type('geo');
		const node_by_id: Dictionary<GeoObjNode> = {};
		for (let geo_node of geo_nodes) {
			const is_displayed = await geo_node.is_displayed();
			if (is_displayed) {
				node_by_id[geo_node.graph_node_id] = geo_node;
			}
		}
		return node_by_id;
	}

	add_to_parent_transform(node: BaseObjNodeType) {
		this.update_object(node);
	}

	remove_from_parent_transform(node: BaseObjNodeType) {
		this.update_object(node);
	}

	private _on_child_add(node?: BaseNodeType) {
		if (node) {
			this.update_object(node as BaseObjNodeType);
		}
	}
	private _on_child_remove(node?: BaseNodeType) {
		if (node) {
			this.remove_from_scene(node as BaseObjNodeType);
		}
	}
}
