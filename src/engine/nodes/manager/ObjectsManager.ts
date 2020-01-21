import {Group} from 'three/src/objects/Group';
// import lodash_isEqual from 'lodash/isEqual';
// import lodash_map from 'lodash/map';

import {TypedBaseManagerNode} from './_Base';
// import {CoreObject} from 'src/core/Object';
// import {BaseNode} from '../_Base';
import {BaseObjNodeType} from '../obj/_Base';

// import {BaseManagerObjNode} from 'src/engine/nodes/obj/_BaseManager';
// import {BaseCameraObjNodeClass} from 'src/engine/nodes/obj/_BaseCamera';
// import {BaseLightObjNodeClass} from 'src/engine/nodes/obj/_BaseLight';

// obj nodes
// import {EventsObjNode} from 'src/engine/nodes/obj/Events';
// import {MaterialsObjNode} from 'src/engine/nodes/obj/Materials';
// import {FogObjNode} from 'src/engine/nodes/obj/Fog';
import {GeoObjNode} from 'src/engine/nodes/obj/Geo';

import 'src/engine/Poly';
import {NodeContext} from 'src/engine/poly/NodeContext';
// import {PolyScene} from 'src/engine/scene/PolyScene';
// TODO:
// ensure removing a node removes its content from the scene (spotlight?)

import {ObjNodeTypeMap} from 'src/engine/poly/registers/Obj';

import {NodeParamsConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
class ObjectsManagerParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new ObjectsManagerParamsConfig();

export class ObjectsManagerNode extends TypedBaseManagerNode<ObjectsManagerParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'obj';
	}
	// children_context() {
	// 	return NodeContext.OBJ;
	// }

	private _object: Group = new Group();
	private _queued_nodes_by_id: Dictionary<BaseObjNodeType> = {};
	private _queued_nodes_by_path: Dictionary<BaseObjNodeType> = {};
	private _expected_geo_nodes: Dictionary<GeoObjNode> = {};
	// private _loaded_geo_node_by_id: Dictionary<boolean> = {};
	private _process_queue_start: number;

	initialize_node() {
		this.children_controller.init(NodeContext.OBJ);

		// this.flags.add_display();

		this.lifecycle.add_on_child_add_hook(this._on_child_add.bind(this));
		this.lifecycle.add_on_child_remove_hook(this._on_child_remove.bind(this));
		// this.flags.add_bypass({has_bypass_flag: false});

		// this.set_min_inputs_count(0);
		// this.set_max_inputs_count(0);
	}
	//@_object_uuid_by_node_graph_id = {}

	init_display_scene() {
		this._object.name = '_WORLD_';
		this._scene.display_scene.add(this._object);
	}

	// TODO: is this method still used?
	// available_children_classes() {
	// 	return POLY.Engine.Node.Obj;
	// }

	object() {
		return this._object;
	}
	create_node<K extends keyof ObjNodeTypeMap>(type: K): ObjNodeTypeMap[K] {
		return super.create_node(type) as ObjNodeTypeMap[K];
	}
	children() {
		return super.children() as BaseObjNodeType[];
	}
	nodes_by_type<K extends keyof ObjNodeTypeMap>(type: K): ObjNodeTypeMap[K][] {
		return super.nodes_by_type(type) as ObjNodeTypeMap[K][];
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
			// we want to process managers, cameras, then lights, then everything else
			// so we add a prefix for those
			// if (this._is_node_manager(node)) {
			// 	full_path = `/_____005_${full_path}`;
			// } else if (this._is_node_fog(node)) {
			// 	full_path = `/_____002_${full_path}`;
			// } else if (this._is_node_camera(node)) {
			// 	full_path = `/_____003_${full_path}`;
			// } else if (this._is_node_light(node)) {
			// 	full_path = `/_____004_${full_path}`;
			// }

			this._queued_nodes_by_path[full_path] = node;
		}

		const promises = Object.keys(this._queued_nodes_by_path)
			.sort()
			.map((path_id) => {
				const node = this._queued_nodes_by_path[path_id];
				return this.update_object(node);
			});

		this._expected_geo_nodes = this._expected_geo_nodes || (await this.expected_loading_geo_nodes_by_id());

		this._process_queue_start = performance.now();
		Promise.all(promises).then(() => {
			POLY.log(`SCENE LOADED '${this.scene.name}' in ${performance.now() - this._process_queue_start}`);
			// this.scene().performance().print()

			// do the update here if there are no objects to load
			// otherwise an empty scene will have a loader that never gets removed
			// if (Object.keys(this._expected_geo_nodes).length == 0) {
			// 	this.update_on_all_objects_loaded();
			// }
		});
	}

	async update_object(node: BaseObjNodeType) {
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

	// _is_node_fog(node: BaseObjNodeType) {
	// 	return CoreObject.is_a(node, FogObjNode);
	// }
	// _is_node_camera(node: BaseObjNodeType) {
	// 	return CoreObject.is_a(node, BaseCameraObjNodeClass);
	// }

	// _is_node_event(node: BaseObjNodeType) {
	// 	return CoreObject.is_a(node, EventsObjNode);
	// }
	// _is_node_mat(node: BaseObjNodeType) {
	// 	return CoreObject.is_a(node, MaterialsObjNode);
	// }

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
		if (node.add_to_hierarchy) {
			// if (this._is_node_camera(node)) {
			// 	return this.scene.display_scene;
			// } else {
			const node_input = node.io.inputs.input(0);
			if (node_input) {
				//node_input.request_container (container)=>
				//	callback(container.object() || @_object)
				return node_input.object;
			} else {
				return this._object;
			}
			// }
		} else {
			return null;
		}
	}

	add_to_scene(node: BaseObjNodeType): void {
		// if (this._is_node_fog(node)) {
		// console.log("fog")
		// # TODO: ensure fog is removed if we set display or bypass flag
		// # TODO: ensure we get a warning if more than 1 fog
		// # TODO: why does it get added twice when its parameters are changed?
		// node.get_fog (fog)=>
		// 	@_scene.display_scene().fog = fog
		// #console.log("added fog", node.object())
		if (node.add_to_hierarchy) {
			const parent_object = this.get_parent_for_node(node);
			if (parent_object) {
				// await node.params.eval_all().then((params_eval_key) => {
				// 	node.request_container();
				// });

				if (node.used_in_scene) {
					parent_object.add(node.object);
					node.cook_controller.cook_main_without_inputs();
				} else {
					parent_object.remove(node.object);
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
		if (node.add_to_hierarchy) {
			const object = node.object;
			if (object != null) {
				const parent_object = object.parent;
				if (parent_object != null) {
					parent_object.remove(object);
				}
			}
		}
	}
	are_children_cooking(): boolean {
		const children = this.children();
		for (let child of children) {
			if (child.is_display_node_cooking()) {
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

	// async notify_geo_loaded(geo_node: GeoObjNode) {
	// 	this._loaded_geo_node_by_id = this._loaded_geo_node_by_id || {};
	// 	this._loaded_geo_node_by_id[geo_node.graph_node_id] = true;

	// 	this._expected_geo_nodes = this._expected_geo_nodes || (await this.expected_loading_geo_nodes_by_id());

	// 	if (this.scene) {
	// 		this.scene.loading_controller.on_first_object_loaded();

	// 		if (lodash_isEqual(Object.keys(this._loaded_geo_node_by_id), Object.keys(this._expected_geo_nodes))) {
	// 			this.update_on_all_objects_loaded();
	// 		}
	// 	}
	// }

	// update_on_all_objects_loaded() {
	// 	this.scene.loading_controller.on_all_objects_loaded();
	// 	// this.scene.cube_cameras_controller.on_all_objects_loaded(); // TODO: typescript
	// }

	add_to_parent_transform(node: BaseObjNodeType) {
		this.update_object(node);
	}
	// return if !this.scene().loaded()

	// transformed_node.request_container (input_container)->
	// 	object = input_container.object()

	// 	transformed_node.request_input_container 0, (parent_input_container)->
	// 		parent = parent_input_container.object()
	// 		parent.add(object)

	remove_from_parent_transform(node: BaseObjNodeType) {
		this.update_object(node);
	}
	// return if !this.scene().loaded()

	// transformed_node.request_container (input_container)=>
	// 	object = input_container.object()

	// 	this.get_parent_for_node transformed_node, (parent_object)=>
	// 		parent_object.add(object)

	private _on_child_add(node: BaseObjNodeType) {
		this.update_object(node);
	}
	private _on_child_remove(node: BaseObjNodeType) {
		this.remove_from_scene(node);
	}
}
