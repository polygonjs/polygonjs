/**
 * Can blend between 2 other OBJ nodes.
 *
 *
 */
import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';
import {FlagsControllerD} from '../utils/FlagsController';
import {AxesHelper} from 'three/src/helpers/AxesHelper';
import {HierarchyController} from './utils/HierarchyController';
import {Object3D} from 'three/src/core/Object3D';
import {NodeContext} from '../../poly/NodeContext';
import {Vector3} from 'three/src/math/Vector3';
import {Quaternion} from 'three/src/math/Quaternion';

enum BlendMode {
	TOGETHER = 'translate + rotate together',
	SEPARATELY = 'translate + rotate separately',
}
const BLEND_MODES: BlendMode[] = [BlendMode.TOGETHER, BlendMode.SEPARATELY];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypeAssert} from '../../poly/Assert';
class BlendObjParamConfig extends NodeParamsConfig {
	object0 = ParamConfig.OPERATOR_PATH('/geo1', {
		nodeSelection: {
			context: NodeContext.OBJ,
		},
	});
	object1 = ParamConfig.OPERATOR_PATH('/geo2', {
		nodeSelection: {
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
		visibleIf: {mode: BLEND_MODES.indexOf(BlendMode.TOGETHER)},
		range: [0, 1],
		rangeLocked: [false, false],
	});
	blendT = ParamConfig.FLOAT(0, {
		visibleIf: {mode: BLEND_MODES.indexOf(BlendMode.SEPARATELY)},
		range: [0, 1],
		rangeLocked: [false, false],
	});
	blendR = ParamConfig.FLOAT(0, {
		visibleIf: {mode: BLEND_MODES.indexOf(BlendMode.SEPARATELY)},
		range: [0, 1],
		rangeLocked: [false, false],
	});
}
const ParamsConfig = new BlendObjParamConfig();

export class BlendObjNode extends TypedObjNode<Group, BlendObjParamConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'blend';
	}
	readonly hierarchyController: HierarchyController = new HierarchyController(this);
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);
	private _helper = new AxesHelper(1);

	create_object() {
		const group = new Group();
		group.matrixAutoUpdate = false;
		return group;
	}
	initializeNode() {
		this.hierarchyController.initializeNode();
		this.io.inputs.setCount(0);

		this.addPostDirtyHook('blend_on_dirty', () => {
			this.cookController.cook_main_without_inputs();
		});

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

	cook() {
		const obj_node0 = this.p.object0.found_node_with_context(NodeContext.OBJ);
		const obj_node1 = this.p.object1.found_node_with_context(NodeContext.OBJ);
		if (obj_node0 && obj_node1) {
			this._blend(obj_node0.object, obj_node1.object);
		}

		this.cookController.end_cook();
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
		this._object.position.copy(this._t0).lerp(this._t1, this.pv.blendT);
		this._object.quaternion.copy(this._q0).slerp(this._q1, this.pv.blendR);
		if (!this._object.matrixAutoUpdate) {
			this._object.updateMatrix();
		}
	}
	private _decompose_matrices(object0: Object3D, object1: Object3D) {
		object0.matrixWorld.decompose(this._t0, this._q0, this._s0);
		object1.matrixWorld.decompose(this._t1, this._q1, this._s1);
	}
}
