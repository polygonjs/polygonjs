/**
 * Transform input geometries or objects.
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {ROTATION_ORDERS, TransformTargetType, TRANSFORM_TARGET_TYPES} from '../../../core/Transform';
import {TransformSopOperation} from '../../operations/sop/Transform';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {
	OBJECT_TRANSFORM_MODES,
	OBJECT_TRANSFORM_SPACE_MENU_ENTRIES,
	ObjectTransformMode,
} from '../../../core/TransformSpace';
const DEFAULT = TransformSopOperation.DEFAULT_PARAMS;
class TransformSopParamConfig extends NodeParamsConfig {
	/** @param sets if this node should transform objects or geometries */
	applyOn = ParamConfig.INTEGER(DEFAULT.applyOn, {
		menu: {
			entries: TRANSFORM_TARGET_TYPES.map((name, value) => ({name, value})),
		},
	});
	/** @param group to assign the material to */
	group = ParamConfig.STRING(DEFAULT.group, {
		objectMask: true,
	});

	/** @param if applyOn is set to object, the transform can then be applied in 2 different ways on those objects. Either the .position, .rotation and .scale attributes are set, or the matrix is set directly. */
	objectMode = ParamConfig.INTEGER(DEFAULT.objectMode, {
		visibleIf: {applyOn: TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.OBJECT)},
		menu: {
			entries: OBJECT_TRANSFORM_MODES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param defines how the objects are transformed */
	objectTransformSpace = ParamConfig.INTEGER(0, {
		visibleIf: {
			applyOn: TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.OBJECT),
			objectMode: OBJECT_TRANSFORM_MODES.indexOf(ObjectTransformMode.MULT),
		},
		menu: {
			entries: OBJECT_TRANSFORM_SPACE_MENU_ENTRIES,
		},
	});
	/** @param group to assign the material to */
	pointGroup = ParamConfig.STRING(DEFAULT.pointGroup, {
		visibleIf: {applyOn: TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.GEOMETRY)},
	});

	// transform
	/** @param rotation order */
	rotationOrder = ParamConfig.INTEGER(DEFAULT.rotationOrder, {
		separatorBefore: true,
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
	scale = ParamConfig.FLOAT(DEFAULT.scale, {
		range: [0, 2],
		step: 0.01,
	});
	// look_at = ParamConfig.OPERATOR_PATH('');
	// up = ParamConfig.VECTOR3([0, 1, 0]);
	/** @param pivot */
	pivot = ParamConfig.VECTOR3(DEFAULT.pivot, {
		visibleIf: {applyOn: TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.GEOMETRY)},
	});
}
const ParamsConfig = new TransformSopParamConfig();

export class TransformSopNode extends TypedSopNode<TransformSopParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.TRANSFORM;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(TransformSopOperation.INPUT_CLONED_STATE);
	}

	setApplyOn(type: TransformTargetType) {
		this.p.applyOn.set(TRANSFORM_TARGET_TYPES.indexOf(type));
	}
	applyOn() {
		return TRANSFORM_TARGET_TYPES[this.pv.applyOn];
	}
	setObjectMode(mode: ObjectTransformMode) {
		this.p.objectMode.set(OBJECT_TRANSFORM_MODES.indexOf(mode));
	}

	private _operation: TransformSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new TransformSopOperation(this.scene(), this.states);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
