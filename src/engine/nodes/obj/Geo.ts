import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';
// const THREE = {Group};

import {CoreTransform} from 'src/core/Transform';

import {BaseNodeType} from '../_Base';
import {DisplayNodeController} from '../utils/DisplayNodeController';
import {NodeContext} from 'src/engine/poly/NodeContext';

//import Layers from './Concerns/Layers'
// import {Transformed} from './Concerns/Transformed';

// sop map
import {BaseSopNodeType} from '../sop/_Base';
import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
// import {PolyScene} from 'src/engine/scene/PolyScene';

import {GeoNodeChildrenMap} from 'src/engine/poly/registers/Sop';
import {FlagsControllerD} from '../utils/FlagsController';

class GeoObjParamConfig extends NodeParamsConfig {
	t = ParamConfig.VECTOR3([0, 0, 0]);
	r = ParamConfig.VECTOR3([0, 0, 0]);
	s = ParamConfig.VECTOR3([1, 1, 1]);
	scale = ParamConfig.FLOAT(1);
	look_at = ParamConfig.OPERATOR_PATH('', {node_selection: {context: NodeContext.OBJ}});
	up = ParamConfig.VECTOR3([0, 1, 0]);
	pivot = ParamConfig.VECTOR3([0, 0, 0]);

	display = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new GeoObjParamConfig();

export class GeoObjNode extends TypedObjNode<Group, GeoObjParamConfig> {
	params_config = ParamsConfig;
	protected _display_node_controller: DisplayNodeController = new DisplayNodeController(this);
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);
	static type() {
		return 'geo';
	}
	// children_context() {
	// 	return NodeContext.SOP;
	// }

	protected _used_in_scene: boolean = true;
	protected _children_controller_context = NodeContext.SOP;
	initialize_node() {
		this.children_controller?.init();

		this.flags.display.add_hook(() => {
			this.set_used_in_scene(this.flags.display.active);
		});
		// this._init_display_flag({
		// 	multiple_display_flags_allowed: false,
		// 	affects_hierarchy: true,
		// });
		// this._init_dirtyable_hook();
		this.dirty_controller.add_post_dirty_hook(this._cook_main_without_inputs_when_dirty_bound);

		this.io.inputs.set_count(0, 1);
		this.io.outputs.set_has_one_output();
	}
	private _cook_main_without_inputs_when_dirty_bound = this._cook_main_without_inputs_when_dirty.bind(this);
	private async _cook_main_without_inputs_when_dirty() {
		if (this.used_in_scene) {
			await this.cook_controller.cook_main_without_inputs();
		}
	}

	create_object() {
		return new Group();
	}

	//base_layers_included: -> false

	// create_params() {
	// 	// CoreTransform.create_params(this);
	// }
	//this.create_layers_params()

	request_display_node() {
		if (!this.scene.loading_controller.auto_updating) {
			return;
		}

		// TODO: typescript
		// if (this.is_displayed)
		// 	const display_node = this.display_node();
		// 	if (display_node) {
		// 		display_node.request_container_p().then(async (container) => {
		// 			if (!this._sop_loaded) {
		// 				this.root().notify_geo_loaded(this);
		// 			}
		// 			this._sop_loaded = true;

		// 			const update_needed = await this.display_node_objects_changed(container);
		// 			if (update_needed) {
		// 				this.remove_display_node_group();
		// 				await this.add_display_node_group(container);
		// 			}
		// 			// this.set_needsUpdate(container)
		// 		});
		// 	} else {
		// 		this.root().notify_geo_loaded(this);
		// 		this._sop_loaded = true;
		// 	}
		// }
	}

	is_display_node_cooking(): boolean {
		if (this.flags.display.active) {
			const display_node = this._display_node_controller.display_node;
			return display_node ? display_node.is_dirty : false;
		} else {
			return false;
		}
	}

	post_display_flag_node_set_dirty() {
		this.request_display_node();
	}
	post_add_node(node: BaseNodeType) {
		// we test if the scene is loaded
		// otherwise a display flag will be set for the first node
		// that is added when the scene is being loaded,
		// only to be changed again when the actual display node is set.
		// Without this, we have a jarring first object being displayed
		// only to be replaced by the proper one when it is ready.
		if (this.scene.loading_controller.loaded) {
			if (this.children().length == 1) {
				node.flags?.display?.set(true);
			}
		}
	}
	create_node<K extends keyof GeoNodeChildrenMap>(type: K): GeoNodeChildrenMap[K] {
		return super.create_node(type) as GeoNodeChildrenMap[K];
	}
	children() {
		return super.children() as BaseSopNodeType[];
	}
	nodes_by_type<K extends keyof GeoNodeChildrenMap>(type: K): GeoNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as GeoNodeChildrenMap[K][];
	}
	// create_node(type: string): BaseSopNode<any> {
	// 	return super.create_node(type) as  BaseSopNode<any>;
	// }
	on_create() {
		// this.create_node('text')
	}
	private _core_transform = new CoreTransform();
	cook() {
		const matrix = this._core_transform.matrix(this.pv.t, this.pv.r, this.pv.s, this.pv.scale);
		//this._update_object_params(group, matrix)

		this.group.visible = this.flags.display.active;
		this.transform_controller.update(matrix);
		//this.update_layers()

		this.cook_controller.end_cook();
	}
}
