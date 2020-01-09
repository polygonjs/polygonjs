import {Group} from 'three/src/objects/Group';
import lodash_isEqual from 'lodash/isEqual';
import lodash_map from 'lodash/map';

import {BaseNodeManager} from './_Base';
import {CoreObject} from 'src/core/Object';
import {BaseNode} from '../_Base';
import {BaseObjNode} from '../obj/_Base';
import {GeoObjNode} from '../obj/Geo';

import {BaseManager} from 'src/engine/nodes/obj/_BaseManager';
import {BaseCameraObjNode} from 'src/engine/nodes/obj/_BaseCamera';
import {BaseLightObjNode} from 'src/engine/nodes/obj/_BaseLight';
import {Events} from 'src/engine/nodes/obj/Events';
import {Materials} from 'src/engine/nodes/obj/Materials';
import {FogObj} from 'src/engine/nodes/obj/Fog';

import 'src/engine/Poly';
// TODO:
// ensure removing a node removes its content from the scene (spotlight?)

export class ObjectsManagerNode extends BaseNodeManager {
	static type() {
		return 'obj';
	}
	// children_context() {
	// 	return NodeContext.OBJ;
	// }

	private _object: Group = new Group();
	private _queued_nodes_by_id: Dictionary<BaseObjNode> = {};
	private _queued_nodes_by_path: Dictionary<BaseObjNode> = {};
	private _expected_geo_nodes: Dictionary<GeoObjNode> = {};
	private _loaded_geo_node_by_id: Dictionary<boolean> = {};
	private _process_queue_start: number;

	constructor() {
		super();

		this.children_controller.init(NodeContext.OBJ);

		this.flags.add_display();
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
	// TODO: typescript: there may be a better way to convert
	create_node(type: string): BaseObjNode {
		return super.create_node(type) as BaseObjNode;
	}

	multiple_display_flags_allowed() {
		return true;
	}

	add_to_queue(node: BaseObjNode) {
		const id = node.graph_node_id();
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

			let full_path = node.full_path();
			// we want to process managers, cameras, then lights, then everything else
			// so we add a prefix for those
			if (this._is_node_manager(node)) {
				full_path = `/_____005_${full_path}`;
			} else if (this._is_node_fog(node)) {
				full_path = `/_____002_${full_path}`;
			} else if (this._is_node_camera(node)) {
				full_path = `/_____003_${full_path}`;
			} else if (this._is_node_light(node)) {
				full_path = `/_____004_${full_path}`;
			}

			this._queued_nodes_by_path[full_path] = node;
		}

		const promises = lodash_map(Object.keys(this._queued_nodes_by_path).sort(), (path_id) => {
			const node = this._queued_nodes_by_path[path_id];
			return this.update_object(node);
		});

		this._expected_geo_nodes = this._expected_geo_nodes || (await this.expected_loading_geo_nodes_by_id());

		this._process_queue_start = performance.now();
		Promise.all(promises).then(() => {
			POLY.log(`SCENE LOADED '${this.scene().name}' in ${performance.now() - this._process_queue_start}`);
			// this.scene().performance().print()

			// do the update here if there are no objects to load
			// otherwise an empty scene will have a loader that never gets removed
			if (Object.keys(this._expected_geo_nodes).length == 0) {
				this.update_on_all_objects_loaded();
			}
		});
	}

	update_object(node: BaseObjNode) {
		return new Promise((resolve, reject) => {
			if (!this.scene().loading_controller.auto_updating) {
				this.add_to_queue(node);
				return resolve();
			} else {
				let object;
				// console.log(node.full_path())
				if ((object = node.object) != null) {
					this.add_to_scene(node);
				} else {
					//if POLY.env != 'test'
					// console.warn(`no object from ${node.full_path()} (error:${node.error_message()}) (${POLY.env})`);
				}
				return resolve();
			}
		});
	}

	_is_node_manager(node: BaseNode) {
		return CoreObject.is_a(node, BaseManager);
	}
	_is_node_fog(node: BaseNode) {
		return CoreObject.is_a(node, FogObj);
	}
	_is_node_camera(node: BaseNode) {
		return CoreObject.is_a(node, BaseCameraObjNode);
	}
	_is_node_light(node: BaseNode) {
		return CoreObject.is_a(node, BaseLightObjNode);
	}
	_is_node_event(node: BaseNode) {
		return CoreObject.is_a(node, Events);
	}
	_is_node_mat(node: BaseNode) {
		return CoreObject.is_a(node, Materials);
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
	get_parent_for_node(node: BaseNode) {
		if (this._is_node_event(node) || this._is_node_mat(node)) {
			return null;
		} else {
			if (this._is_node_camera(node)) {
				return this.scene().display_scene;
			} else {
				const node_input = node.io.inputs.input(0) as BaseObjNode;
				if (node_input != null) {
					//node_input.request_container (container)=>
					//	callback(container.object() || @_object)
					return node_input.object;
				} else {
					return this._object;
				}
			}
		}
	}

	add_to_scene(node: BaseObjNode) {
		if (this._is_node_fog(node)) {
			// console.log("fog")
			// # TODO: ensure fog is removed if we set display or bypass flag
			// # TODO: ensure we get a warning if more than 1 fog
			// # TODO: why does it get added twice when its parameters are changed?
			// node.get_fog (fog)=>
			// 	@_scene.display_scene().fog = fog
			// #console.log("added fog", node.object())
		} else {
			const parent_object = this.get_parent_for_node(node);
			if (parent_object != null) {
				node.params.eval_all().then((params_eval_key) => {
					return node.request_container();
				});

				parent_object.add(node.object);
				return node.request_display_node();
			} else {
				node.request_container().then(() => {
					// force events and mat to cook and remove the dirty state
					// ensure that pickers are cooked
					// TODO: although there has been cases with two picker and
					// one referencing the other with an expression, and that
					// expression be evaluated before the second was created
					// which led to an error. This should not happen
					node.children_controller.traverse_children((child) => child.set_dirty());
				});
			}
		}
	}

	remove_from_scene(node: BaseObjNode) {
		if (!this._is_node_fog(node)) {
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
		const children = this.children() as BaseObjNode[];
		for (let child of children) {
			if (child.is_display_node_cooking()) {
				return true;
			}
		}
		return false;
	}

	async expected_loading_geo_nodes_by_id() {
		const geo_nodes = this.nodes_by_type('geo') as GeoObjNode[];
		const node_by_id: Dictionary<GeoObjNode> = {};
		for (let geo_node of geo_nodes) {
			const is_displayed = await geo_node.is_displayed();
			if (is_displayed) {
				node_by_id[geo_node.graph_node_id()] = geo_node;
			}
		}
		return node_by_id;
	}

	async notify_geo_loaded(geo_node: GeoObjNode) {
		this._loaded_geo_node_by_id = this._loaded_geo_node_by_id || {};
		this._loaded_geo_node_by_id[geo_node.graph_node_id()] = true;

		this._expected_geo_nodes = this._expected_geo_nodes || (await this.expected_loading_geo_nodes_by_id());

		const scene = this.scene();

		if (scene) {
			scene.loading_controller.on_first_object_loaded();

			if (lodash_isEqual(Object.keys(this._loaded_geo_node_by_id), Object.keys(this._expected_geo_nodes))) {
				this.update_on_all_objects_loaded();
			}
		}
	}

	update_on_all_objects_loaded() {
		const scene = this.scene();
		scene.loading_controller.on_all_objects_loaded();
		scene.cube_cameras_controller.on_all_objects_loaded();
	}

	add_to_parent_transform(node: BaseObjNode) {
		this.update_object(node);
	}
	// return if !this.scene().loaded()

	// transformed_node.request_container (input_container)->
	// 	object = input_container.object()

	// 	transformed_node.request_input_container 0, (parent_input_container)->
	// 		parent = parent_input_container.object()
	// 		parent.add(object)

	remove_from_parent_transform(node: BaseObjNode) {
		this.update_object(node);
	}
	// return if !this.scene().loaded()

	// transformed_node.request_container (input_container)=>
	// 	object = input_container.object()

	// 	this.get_parent_for_node transformed_node, (parent_object)=>
	// 		parent_object.add(object)

	on_child_add(node: BaseObjNode) {
		this.update_object(node);
	}
	on_child_remove(node: BaseObjNode) {
		this.remove_from_scene(node);
	}
}
