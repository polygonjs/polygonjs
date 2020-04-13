import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';
// const THREE = {Group};

// import {CoreTransform} from '../../../core/Transform';

import {BaseNodeType} from '../_Base';
import {DisplayNodeController} from '../utils/DisplayNodeController';
import {NodeContext} from '../../poly/NodeContext';

//import Layers from './Concerns/Layers'
// import {Transformed} from './Concerns/Transformed';

// sop map
import {BaseSopNodeType} from '../sop/_Base';
// import {PolyScene} from '../../scene/PolyScene';
import {TransformedParamConfig, TransformController} from './utils/TransformController';

import {GeoNodeChildrenMap} from '../../poly/registers/nodes/Sop';
import {FlagsControllerD} from '../utils/FlagsController';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class GeoObjParamConfig extends TransformedParamConfig(NodeParamsConfig) {
	display = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new GeoObjParamConfig();

export class GeoObjNode extends TypedObjNode<Group, GeoObjParamConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'geo';
	}
	readonly transform_controller: TransformController = new TransformController(this);
	protected _display_node_controller: DisplayNodeController = new DisplayNodeController(this);
	get display_node_controller() {
		return this._display_node_controller;
	}
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);

	private _sop_group = this._create_sop_group();
	private _create_sop_group() {
		return new Group();
	}
	get sop_group() {
		return this._sop_group;
	}
	set_sop_group_name() {
		this._sop_group.name = `${this.full_path()}:sop_group`;
	}

	// children_context() {
	// 	return NodeContext.SOP;
	// }

	protected _children_controller_context = NodeContext.SOP;

	private _on_create_bound = this._on_create.bind(this);
	private _on_child_add_bound = this._on_child_add.bind(this);
	initialize_node() {
		this.children_controller?.init();
		this.lifecycle.add_on_create_hook(this._on_create_bound);
		this.lifecycle.add_on_child_add_hook(this._on_child_add_bound);

		this.display_node_controller.initialize_node();
		this.transform_controller.initialize_node();
		// this.flags.display.add_hook(() => {
		// 	this.set_used_in_scene(this.flags.display.active);
		// });

		this.object.add(this.sop_group);

		this.name_controller.add_post_set_full_path_hook(this.set_sop_group_name.bind(this));
		this._create_sop_group();
		// this._init_display_flag({
		// 	multiple_display_flags_allowed: false,
		// 	affects_hierarchy: true,
		// });
		// this._init_dirtyable_hook();

		// this.io.inputs.set_count(0, 1);
		// this.io.outputs.set_has_one_output();
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

	create_node<K extends keyof GeoNodeChildrenMap>(type: K): GeoNodeChildrenMap[K] {
		return super.create_node(type) as GeoNodeChildrenMap[K];
	}
	children() {
		return super.children() as BaseSopNodeType[];
	}
	nodes_by_type<K extends keyof GeoNodeChildrenMap>(type: K): GeoNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as GeoNodeChildrenMap[K][];
	}

	//
	//
	// HOOK
	//
	//
	_on_create() {
		this.create_node('text');
	}
	_on_child_add(node: BaseNodeType) {
		if (this.scene.loading_controller.loaded) {
			if (this.children().length == 1) {
				node.flags?.display?.set(true);
			}
		}
	}
	// post_display_flag_node_set_dirty() {
	// 	this.request_display_node();
	// }

	//
	//
	// COOK
	//
	//
	cook() {
		this.transform_controller.update();
		//this.update_layers()

		this.object.visible = this.pv.display;

		this.cook_controller.end_cook();
	}
}
