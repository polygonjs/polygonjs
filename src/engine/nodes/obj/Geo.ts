import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';
// const THREE = {Group};

import {CoreTransform} from 'src/core/Transform';

import {BaseNode} from '../_Base';
import {DisplayNodeController} from '../utils/DisplayNodeController';
import {NodeContext} from 'src/engine/poly/NodeContext';

//import Layers from './Concerns/Layers'
// import {Transformed} from './Concerns/Transformed';

// sop map
// import {BaseSopNode} from '../sop/_Base';
import {BoxSopNode} from '../sop/Box';
import {TransformSopNode} from '../sop/Transform';
import {NodeParamsConfig} from 'src/engine/nodes/utils/ParamsConfig';
import {PolyScene} from 'src/engine/scene/PolyScene';

interface SopNodeTypeMap {
	box: BoxSopNode;
	transform: TransformSopNode;
}

class GeoObjParamConfig extends NodeParamsConfig {}

export class GeoObjNode extends TypedObjNode<GeoObjParamConfig> {
	private _display_node_controller = new DisplayNodeController(this);
	static type() {
		return 'geo';
	}
	// children_context() {
	// 	return NodeContext.SOP;
	// }

	constructor(scene: PolyScene) {
		super(scene, 'GeoObjNode');

		this.children_controller.init(NodeContext.SOP);

		this.flags.add_display();
		// this._init_display_flag({
		// 	multiple_display_flags_allowed: false,
		// 	affects_hierarchy: true,
		// });
		this._init_dirtyable_hook();

		this.io.inputs.set_count_to_one_max();
	}

	create_object() {
		return new Group();
	}

	//base_layers_included: -> false

	create_params() {
		// CoreTransform.create_params(this);
	}
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
	post_add_node(node: BaseNode) {
		// we test if the scene is loaded
		// otherwise a display flag will be set for the first node
		// that is added when the scene is being loaded,
		// only to be changed again when the actual display node is set.
		// Without this, we have a jarring first object being displayed
		// only to be replaced by the proper one when it is ready.
		if (this.scene.loading_controller.loaded) {
			if (this.children().length == 1) {
				node.flags.display.set(true);
			}
		}
	}
	create_node<K extends keyof SopNodeTypeMap>(type: K): SopNodeTypeMap[K] {
		return super.create_node(type) as SopNodeTypeMap[K];
	}
	// create_node(type: string): BaseSopNode<any> {
	// 	return super.create_node(type) as  BaseSopNode<any>;
	// }
	on_create() {
		// this.create_node('text')
	}
	cook() {
		// TODO: why does it cook twice when changing a param like layers
		const matrix = CoreTransform.matrix_from_node_with_transform_params(this);
		//this._update_object_params(group, matrix)

		this.group.visible = this.flags.display.active;
		this.transform_controller.update(matrix);
		//this.update_layers()

		this.cook_controller.end_cook();
	}
}
