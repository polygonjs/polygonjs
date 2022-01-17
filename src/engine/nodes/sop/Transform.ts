/**
 * Transform input geometries or objects.
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {ROTATION_ORDERS, TransformTargetType, TRANSFORM_TARGET_TYPES} from '../../../core/Transform';
import {TransformSopOperation, TRANSFORM_OBJECT_MODES, TransformObjectMode} from '../../operations/sop/Transform';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = TransformSopOperation.DEFAULT_PARAMS;
class TransformSopParamConfig extends NodeParamsConfig {
	/** @param sets if this node should transform objects or geometries */
	applyOn = ParamConfig.INTEGER(DEFAULT.applyOn, {
		menu: {
			entries: TRANSFORM_TARGET_TYPES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param if applyOn is set to object, the transform can then be applied in 2 different ways on those objects. Either the .position, .rotation and .scale attributes are set, or the matrix is set directly. */
	objectMode = ParamConfig.INTEGER(DEFAULT.objectMode, {
		visibleIf: {applyOn: TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.OBJECTS)},
		menu: {
			entries: TRANSFORM_OBJECT_MODES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param group this applies to */
	group = ParamConfig.STRING(DEFAULT.group, {
		visibleIf: {applyOn: TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.GEOMETRIES)},
	});

	// transform
	/** @param rotation order */
	rotationOrder = ParamConfig.INTEGER(DEFAULT.rotationOrder, {
		menu: {
			entries: ROTATION_ORDERS.map((order, v) => {
				return {name: order, value: v};
			}),
		},
	});
	/** @param translate */
	t = ParamConfig.VECTOR3(DEFAULT.t);
	/** @param rotation */
	r = ParamConfig.VECTOR3(DEFAULT.r);
	/** @param scale */
	s = ParamConfig.VECTOR3(DEFAULT.s);
	/** @param scale (as a float) */
	scale = ParamConfig.FLOAT(DEFAULT.scale, {range: [0, 10]});
	// look_at = ParamConfig.OPERATOR_PATH('');
	// up = ParamConfig.VECTOR3([0, 1, 0]);
	/** @param pivot */
	pivot = ParamConfig.VECTOR3(DEFAULT.pivot, {
		visibleIf: {applyOn: TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.GEOMETRIES)},
	});
}
const ParamsConfig = new TransformSopParamConfig();

export class TransformSopNode extends TypedSopNode<TransformSopParamConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return SopType.TRANSFORM;
	}

	static displayedInputNames(): string[] {
		return ['geometries or objects to transform'];
	}

	initializeNode() {
		// this.uiData.set_param_label(this.p.applyOn, (v)=>TARGET_TYPES[v])
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(TransformSopOperation.INPUT_CLONED_STATE);
	}

	setApplyOn(type: TransformTargetType) {
		this.p.applyOn.set(TRANSFORM_TARGET_TYPES.indexOf(type));
	}
	setObjectMode(mode: TransformObjectMode) {
		this.p.objectMode.set(TRANSFORM_OBJECT_MODES.indexOf(mode));
	}

	private _operation: TransformSopOperation | undefined;
	cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new TransformSopOperation(this.scene(), this.states);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
