import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';
import {FlagsControllerD} from '../utils/FlagsController';
import {AxesHelper} from 'three/src/helpers/AxesHelper';
import {HierarchyController} from './utils/HierarchyController';
import {Object3D} from 'three/src/core/Object3D';
import {NodeContext} from '../../poly/NodeContext';

enum BlendMode {
	TOGETHER = 'translate + rotate together',
	SEPARATELY = 'translate + rotate separately',
}
const BLEND_MODES: BlendMode[] = [BlendMode.TOGETHER, BlendMode.SEPARATELY];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypeAssert} from '../../poly/Assert';
import {Vector3, Quaternion} from 'three';
class BlendObjParamConfig extends NodeParamsConfig {
	object0 = ParamConfig.OPERATOR_PATH('/geo1', {
		node_selection: {
			context: NodeContext.OBJ,
		},
	});
	object1 = ParamConfig.OPERATOR_PATH('/geo2', {
		node_selection: {
			context: NodeContext.OBJ,
		},
	});
	mode = ParamConfig.INTEGER(BLEND_MODES.indexOf(BlendMode.TOGETHER), {
		menu: {
			entries: BLEND_MODES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	blend = ParamConfig.FLOAT(0, {
		visible_if: {mode: BLEND_MODES.indexOf(BlendMode.TOGETHER)},
		range: [0, 1],
		range_locked: [false, false],
	});
	blend_t = ParamConfig.FLOAT(0, {
		visible_if: {mode: BLEND_MODES.indexOf(BlendMode.SEPARATELY)},
		range: [0, 1],
		range_locked: [false, false],
	});
	blend_r = ParamConfig.FLOAT(0, {
		visible_if: {mode: BLEND_MODES.indexOf(BlendMode.SEPARATELY)},
		range: [0, 1],
		range_locked: [false, false],
	});
}
const ParamsConfig = new BlendObjParamConfig();

export class BlendObjNode extends TypedObjNode<Group, BlendObjParamConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'blend';
	}
	readonly hierarchy_controller: HierarchyController = new HierarchyController(this);
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);
	private _helper = new AxesHelper(1);

	create_object() {
		const group = new Group();
		group.matrixAutoUpdate = false;
		return group;
	}
	initialize_node() {
		this.hierarchy_controller.initialize_node();
		this.io.inputs.set_count(0);

		this.add_post_dirty_hook('blend_on_dirty', () => {
			this.cook_controller.cook_main_without_inputs();
		});

		// helper
		this.object.add(this._helper);
		this.flags.display.add_hook(() => {
			this._helper.visible = this.flags.display.active;
		});
	}
	cook() {
		const obj_node0 = this.p.object0.found_node_with_context(NodeContext.OBJ);
		const obj_node1 = this.p.object1.found_node_with_context(NodeContext.OBJ);
		if (obj_node0 && obj_node1) {
			this._blend(obj_node0.object, obj_node1.object);
		}

		this.cook_controller.end_cook();
	}

	private _blend(object0: Object3D, object1: Object3D) {
		const mode = BLEND_MODES[this.pv.mode];
		switch (mode) {
			case BlendMode.TOGETHER:
				return this._blend_together(object0, object1);
			case BlendMode.SEPARATELY:
				return this._blend_separately(object0, object1);
		}
		TypeAssert.unreachable(mode);
	}
	private _t0 = new Vector3();
	private _q0 = new Quaternion();
	private _s0 = new Vector3();
	private _t1 = new Vector3();
	private _q1 = new Quaternion();
	private _s1 = new Vector3();
	private _blend_together(object0: Object3D, object1: Object3D) {
		this._decompose_matrices(object0, object1);

		this._object.position.copy(this._t0).lerp(this._t1, this.pv.blend);
		this._object.quaternion.copy(this._q0).slerp(this._q1, this.pv.blend);
		if (!this._object.matrixAutoUpdate) {
			this._object.updateMatrix();
		}
	}
	private _blend_separately(object0: Object3D, object1: Object3D) {
		this._decompose_matrices(object0, object1);
		this._object.position.copy(this._t0).lerp(this._t1, this.pv.blend_t);
		this._object.quaternion.copy(this._q0).slerp(this._q1, this.pv.blend_r);
		if (!this._object.matrixAutoUpdate) {
			this._object.updateMatrix();
		}
	}
	private _decompose_matrices(object0: Object3D, object1: Object3D) {
		object0.matrixWorld.decompose(this._t0, this._q0, this._s0);
		object1.matrixWorld.decompose(this._t1, this._q1, this._s1);
	}
}
