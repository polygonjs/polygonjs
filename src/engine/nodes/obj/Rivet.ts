/**
 * Sets its transform based on the point position in a referenced object.
 *
 *
 */
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
import {Geometry} from '../../../modules/three/examples/jsm/deprecated/Geometry';
import {Material} from 'three/src/materials/Material';
import {Mesh} from 'three/src/objects/Mesh';
import {Vector3} from 'three/src/math/Vector3';
import {Object3DWithGeometry} from '../../../core/geometry/Group';
import {RenderHook} from '../../../core/geometry/Material';
import {TypeAssert} from '../../poly/Assert';

enum RivetUpdateMode {
	ON_RENDER = 'On Every Render',
	MANUAL = 'Manual',
}
const UPDATE_MODES: RivetUpdateMode[] = [RivetUpdateMode.ON_RENDER, RivetUpdateMode.MANUAL];

class RivetObjParamConfig extends NodeParamsConfig {
	object = ParamConfig.OPERATOR_PATH('', {
		nodeSelection: {
			context: NodeContext.OBJ,
		},
		dependentOnFoundNode: false,
		computeOnDirty: true,
		callback: (node: BaseNodeType) => {
			RivetObjNode.PARAM_CALLBACK_update_resolved_object(node as RivetObjNode);
		},
	});
	pointIndex = ParamConfig.INTEGER(0, {
		range: [0, 100],
		// callback: (node: BaseNodeType) => {
		// 	RivetObjNode.PARAM_CALLBACK_update_object_position(node as RivetObjNode);
		// },
	});
	// active = ParamConfig.BOOLEAN(true, {
	// 	callback: (node: BaseNodeType) => {
	// 		RivetObjNode.PARAM_CALLBACK_update_active_state(node as RivetObjNode);
	// 	},
	// });
	updateMode = ParamConfig.INTEGER(UPDATE_MODES.indexOf(RivetUpdateMode.ON_RENDER), {
		callback: (node: BaseNodeType) => {
			RivetObjNode.PARAM_CALLBACK_update_updateMode(node as RivetObjNode);
		},
		menu: {
			entries: UPDATE_MODES.map((name, value) => {
				return {name, value};
			}),
		},
		// visibleIf: {active: true},
	});
	update = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			RivetObjNode.PARAM_CALLBACK_update(node as RivetObjNode);
		},
		visibleIf: {updateMode: UPDATE_MODES.indexOf(RivetUpdateMode.MANUAL)},
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
	readonly hierarchyController: HierarchyController = new HierarchyController(this);
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);
	private _helper = new AxesHelper(1);
	private _resolved_sop_group: Group | undefined;
	private _found_point_post = new Vector3();

	createObject() {
		const mesh = new Mesh();
		mesh.matrixAutoUpdate = false;
		return mesh;
	}
	initializeNode() {
		this.hierarchyController.initializeNode();
		// this.io.inputs.add_on_set_input_hook('on_input_updated:update_object_position', () => {
		// 	this.update_object_position();
		// });

		// register hooks
		// this.lifecycle.add_on_add_hook(() => {
		// 	this._add_render_hook();
		// 	// this.scene.rivets_register.register_rivet(this);
		// });
		// this.lifecycle.add_delete_hook(() => {
		// 	this._remove_render_hook();
		// 	// this.scene.rivets_register.deregister_rivet(this);
		// });
		// this.nameController.add_post_set_name_hook(() => {
		// 	this.scene.rivets_register.sort_rivets();
		// });

		// setup frame dependency to update the matrix
		// this._time_graph_node.addPostDirtyHook('rivet_on_frame_change', () => {
		// 	setTimeout(() => {
		// 		this.update_object_position();
		// 	}, 0);
		// });
		this.addPostDirtyHook('rivet_on_dirty', () => {
			this.cookController.cook_main_without_inputs();
		});
		// this.params.set_post_create_params_hook(() => {
		// 	this._update_render_hook();
		// });

		// helper
		this._updateHelperHierarchy();
		this.flags.display.onUpdate(() => {
			this._updateHelperHierarchy();
		});
	}
	private _updateHelperHierarchy() {
		if (this.flags.display.active()) {
			this.object.add(this._helper);
		} else {
			this.object.remove(this._helper);
		}
	}

	async cook() {
		await this._update_resolved_object();
		this._update_render_hook();
		// this._update_updateMode();
		this.cookController.endCook();
	}
	// private _remove_render_hook() {
	// 	if (this._previous_on_before_render) {
	// 		this.object.onBeforeRender = this._previous_on_before_render;
	// 	}
	// }

	// private _update_updateMode(){
	// The problem with a frame dependency is that if there is a hierarchy
	// of rivets, the update chain will be in the wrong order, and therefore wrong.
	// It is then better to update it via a code node.
	// 	const mode = UPDATE_MODES[this.pv.mode]
	// 	switch(mode){
	// 		case RivetUpdateMode.ON_RENDER: {
	// 			this._remove_frame_dependency()
	// 			return this._add_render_hook()
	// 		}
	// 		case RivetUpdateMode.ON_FRAME_CHANGE: {
	// 			this._remove_render_hook()
	// 			return this._add_frame_depedency()
	// 		}
	// 	}
	// 	TypeAssert.unreachable(mode)
	// }

	// private _remove_frame_dependency(){
	// 	const frame_graph_node = this.scene.time_controller.graph_node
	// 	this.removeGraphInput(frame_graph_node)
	// }
	// private _add_frame_depedency(){
	// 	const frame_graph_node = this.scene.time_controller.graph_node
	// 	this.addGraphInput(frame_graph_node)
	// }

	private _update_render_hook() {
		const mode = UPDATE_MODES[this.pv.updateMode];
		switch (mode) {
			case RivetUpdateMode.ON_RENDER: {
				return this._add_render_hook();
			}
			case RivetUpdateMode.MANUAL: {
				return this._remove_render_hook();
			}
		}
		TypeAssert.unreachable(mode);
	}

	private _add_render_hook() {
		// check if the new hook is different than the current one
		// because if we were to add it 2x, previous hook would not be valid anymore
		// if (this.object.onBeforeRender !== this._on_object_before_render_bound) {
		// this._previous_on_before_render = this.object.onBeforeRender;
		this.object.onBeforeRender = this._on_object_before_render_bound;
		// not being frustumCulled ensures that the render hook is still used even though when the object is not on screen (as the children might very well be)
		this.object.frustumCulled = false;
	}
	private _remove_render_hook() {
		this.object.onBeforeRender = () => {};
	}
	private _on_object_before_render_bound: RenderHook = this._update.bind(this);
	// private _previous_on_before_render: RenderHook | undefined;
	private _update(
		renderer?: WebGLRenderer,
		scene?: Scene,
		camera?: Camera,
		geometry?: BufferGeometry | Geometry,
		material?: Material,
		group?: Group | null
	) {
		const resolved_object = this._resolved_object();
		if (resolved_object) {
			const geometry = resolved_object.geometry;
			if (geometry) {
				const position_attrib = geometry.attributes['position'];
				if (position_attrib) {
					const position_array = position_attrib.array;
					this._found_point_post.fromArray(position_array, this.pv.pointIndex * 3);
					// ensures that parent objects have their matrices up to date
					resolved_object.updateWorldMatrix(true, false);
					resolved_object.localToWorld(this._found_point_post);
					this.object.matrix.makeTranslation(
						this._found_point_post.x,
						this._found_point_post.y,
						this._found_point_post.z
					);
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
		if (this.p.object.isDirty()) {
			await this.p.object.compute();
		}

		const node = this.p.object.found_node();
		if (node) {
			if (node.nodeContext() == NodeContext.OBJ && node.type() == GeoObjNode.type()) {
				const geo_node = node as GeoObjNode;
				// this._remove_render_hook();
				this._resolved_sop_group = geo_node.childrenDisplayController.sopGroup();
				// I can't really use _resolved_sop_group_child
				// because it may not exist when this method is execute
				// this._resolved_sop_group_child = this._resolved_sop_group.children[0] as Object3DWithGeometry;
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
		// return this._resolved_sop_group_child;
	}
	//
	//
	// ACTIVE
	//
	//
	static PARAM_CALLBACK_update_updateMode(node: RivetObjNode) {
		node._update_render_hook();
	}
	// private async _update_active_state() {
	// 	// await this.p.active.compute();
	// 	this._update_render_hook();
	// }

	//
	//
	// UPDATE
	//
	//
	static PARAM_CALLBACK_update(node: RivetObjNode) {
		node._update();
	}
	// private _reset() {
	// 	this._resolved_sop_group = undefined;
	// 	// this._resolved_sop_group_child = undefined;
	// 	this._update_resolved_object();
	// }
}
