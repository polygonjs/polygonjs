import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';
import {FlagsControllerD} from '../utils/FlagsController';
import {AxesHelper} from 'three/src/helpers/AxesHelper';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {GeoObjNode} from './Geo';
import {HierarchyController} from './utils/HierarchyController';
import {NodeContext} from '../../poly/NodeContext';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {Scene} from 'three/src/scenes/Scene';
import {Camera} from 'three/src/cameras/Camera';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Geometry} from 'three/src/core/Geometry';
import {Material} from 'three/src/materials/Material';
import {Mesh} from 'three/src/objects/Mesh';
import {Vector3} from 'three/src/math/Vector3';
import {Object3DWithGeometry} from '../../../core/geometry/Group';

// import {Object3DWithGeometry} from '../../../core/geometry/Group';
// import {Vector3} from 'three/src/math/Vector3';
// import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
// import {BaseParamType} from '../../params/_Base';

import {RenderHook} from '../../../core/geometry/Material';

class RivetObjParamConfig extends NodeParamsConfig {
	object = ParamConfig.OPERATOR_PATH('', {
		node_selection: {
			context: NodeContext.OBJ,
		},
		dependent_on_found_node: false,
		compute_on_dirty: true,
		callback: (node: BaseNodeType) => {
			RivetObjNode.PARAM_CALLBACK_update_resolved_object(node as RivetObjNode);
		},
	});
	point_index = ParamConfig.INTEGER(0, {
		range: [0, 100],
		// callback: (node: BaseNodeType) => {
		// 	RivetObjNode.PARAM_CALLBACK_update_object_position(node as RivetObjNode);
		// },
	});
	active = ParamConfig.BOOLEAN(true, {
		callback: (node: BaseNodeType) => {
			RivetObjNode.PARAM_CALLBACK_update_active_state(node as RivetObjNode);
		},
	});
	// update = ParamConfig.BUTTON(null, {
	// 	callback: (node: BaseNodeType) => {
	// 		RivetObjNode.PARAM_CALLBACK_update_object_position(node as RivetObjNode);
	// 	},
	// });
}
const ParamsConfig = new RivetObjParamConfig();

export class RivetObjNode extends TypedObjNode<Mesh, RivetObjParamConfig> {
	params_config = ParamsConfig;
	static type(): Readonly<'rivet'> {
		return 'rivet';
	}
	readonly hierarchy_controller: HierarchyController = new HierarchyController(this);
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);
	private _helper = new AxesHelper(1);
	// private _time_graph_node = new CoreGraphNode(this.scene, 'time');
	private _resolved_sop_group: Mesh | undefined;
	private _found_point_post = new Vector3();

	create_object() {
		return new Mesh();
	}
	initialize_node() {
		this.hierarchy_controller.initialize_node();
		// this.io.inputs.add_on_set_input_hook('on_input_updated:update_object_position', () => {
		// 	this.update_object_position();
		// });

		this._add_render_hook();
		// register hooks
		// this.lifecycle.add_on_add_hook(() => {
		// 	this._add_render_hook();
		// 	// this.scene.rivets_register.register_rivet(this);
		// });
		// this.lifecycle.add_delete_hook(() => {
		// 	this._remove_render_hook();
		// 	// this.scene.rivets_register.deregister_rivet(this);
		// });
		// this.name_controller.add_post_set_name_hook(() => {
		// 	this.scene.rivets_register.sort_rivets();
		// });

		// setup frame dependency to update the matrix
		// this._time_graph_node.add_post_dirty_hook('rivet_on_frame_change', () => {
		// 	setTimeout(() => {
		// 		this.update_object_position();
		// 	}, 0);
		// });
		// this.params.set_post_create_params_hook(() => {
		// 	this._update_active_state();
		// });

		// helper
		this.object.add(this._helper);
		this.flags.display.add_hook(() => {
			this._helper.visible = this.flags.display.active;
		});
	}
	async cook() {
		await this._update_resolved_object();
		// this._update_active_state();
		this.cook_controller.end_cook();
	}
	// private _remove_render_hook() {
	// 	if (this._previous_on_before_render) {
	// 		this.object.onBeforeRender = this._previous_on_before_render;
	// 	}
	// }
	private _add_render_hook() {
		// check if the new hook is different than the current one
		// because if we were to add it 2x, previous hook would not be valid anymore
		// if (this.object.onBeforeRender !== this._on_object_before_render_bound) {
		// this._previous_on_before_render = this.object.onBeforeRender;
		this.object.onBeforeRender = this._on_object_before_render_bound;
		// not being frustumCulled ensures that the render hook is still used even though when the object is not on screen (as the children might very well be)
		this.object.frustumCulled = false;
	}
	private _on_object_before_render_bound: RenderHook = this._on_object_before_render.bind(this);
	// private _previous_on_before_render: RenderHook | undefined;
	private _on_object_before_render(
		renderer: WebGLRenderer,
		scene: Scene,
		camera: Camera,
		geometry: BufferGeometry | Geometry,
		material: Material,
		group: Group | null
	) {
		if (!this.pv.active) {
			return;
		}
		const resolved_object = this._resolved_object();
		if (resolved_object) {
			const geometry = resolved_object.geometry;
			if (geometry) {
				const position_array = geometry.attributes['position'].array;
				if (position_array) {
					this._found_point_post.fromArray(position_array, this.pv.point_index * 3);
					resolved_object.localToWorld(this._found_point_post);
					this.object.position.copy(this._found_point_post);
					// this.object.updateMatrix();
					// this.object.updateWorldMatrix(true, true);
				}
			}
		}
	}

	//
	//
	// RESOLVE
	//
	//
	static PARAM_CALLBACK_update_resolved_object(node: RivetObjNode) {
		node._update_resolved_object();
	}
	private async _update_resolved_object() {
		if (this.p.object.is_dirty) {
			await this.p.object.compute();
		}

		const node = this.p.object.found_node();
		if (node) {
			if (node.node_context() == NodeContext.OBJ && node.type == GeoObjNode.type()) {
				const geo_node = node as GeoObjNode;
				// this._remove_render_hook();
				this._resolved_sop_group = geo_node.sop_group;
			} else {
				this.states.error.set('found node is not a geo node');
			}
		}
	}
	private _resolved_object() {
		if (!this._resolved_sop_group) {
			return;
		}
		const object = this._resolved_sop_group.children[0];
		if (object) {
			return object as Object3DWithGeometry;
		}
	}
	//
	//
	// ACTIVE
	//
	//
	static PARAM_CALLBACK_update_active_state(node: RivetObjNode) {
		node._update_active_state();
	}
	private _update_active_state() {
		this.p.active.compute();
		// if (this.pv.active == true) {
		// 	this._add_render_hook();
		// } else {
		// 	this._remove_render_hook();
		// }
	}
}
