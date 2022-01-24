/**
 * Applies a shear (non-linear) transform to geometries
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {
	ShearSopOperation,
	SHEAR_MODES,
	ShearMode,
	SHEAR_CENTER_MODES,
	ShearCenterMode,
} from '../../operations/sop/Shear';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = ShearSopOperation.DEFAULT_PARAMS;
class ShearSopParamConfig extends NodeParamsConfig {
	/** @param mode */
	mode = ParamConfig.INTEGER(DEFAULT.mode, {
		menu: {
			entries: SHEAR_MODES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param matrixMode XY */
	xy = ParamConfig.FLOAT(DEFAULT.xy, {
		visibleIf: {
			mode: SHEAR_MODES.indexOf(ShearMode.MATRIX),
		},
	});
	/** @param matrixMode XZ */
	xz = ParamConfig.FLOAT(DEFAULT.xz, {
		visibleIf: {
			mode: SHEAR_MODES.indexOf(ShearMode.MATRIX),
		},
	});
	/** @param matrixMode YX */
	yx = ParamConfig.FLOAT(DEFAULT.yx, {
		visibleIf: {
			mode: SHEAR_MODES.indexOf(ShearMode.MATRIX),
		},
	});
	/** @param matrixMode YZ */
	yz = ParamConfig.FLOAT(DEFAULT.yz, {
		visibleIf: {
			mode: SHEAR_MODES.indexOf(ShearMode.MATRIX),
		},
	});
	/** @param matrixMode ZX */
	zx = ParamConfig.FLOAT(DEFAULT.zx, {
		visibleIf: {
			mode: SHEAR_MODES.indexOf(ShearMode.MATRIX),
		},
	});
	/** @param matrixMode ZY */
	zy = ParamConfig.FLOAT(DEFAULT.zy, {
		visibleIf: {
			mode: SHEAR_MODES.indexOf(ShearMode.MATRIX),
		},
	});
	/** @param centerMode defines how the center of the shear in axis mode is computed */
	centerMode = ParamConfig.INTEGER(DEFAULT.centerMode, {
		visibleIf: {
			mode: SHEAR_MODES.indexOf(ShearMode.AXIS),
		},
		menu: {
			entries: SHEAR_CENTER_MODES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param centerOffset */
	centerOffset = ParamConfig.VECTOR3(DEFAULT.centerOffset.toArray(), {
		visibleIf: {
			mode: SHEAR_MODES.indexOf(ShearMode.AXIS),
			centerMode: SHEAR_CENTER_MODES.indexOf(ShearCenterMode.BBOX_CENTER_OFFSET),
		},
	});
	/** @param center */
	center = ParamConfig.VECTOR3(DEFAULT.center.toArray(), {
		visibleIf: {
			mode: SHEAR_MODES.indexOf(ShearMode.AXIS),
			centerMode: SHEAR_CENTER_MODES.indexOf(ShearCenterMode.CUSTOM),
		},
	});
	/** @param PlaneAxis */
	planeAxis = ParamConfig.VECTOR3(DEFAULT.planeAxis.toArray(), {
		visibleIf: {
			mode: SHEAR_MODES.indexOf(ShearMode.AXIS),
		},
	});
	/** @param axis */
	axis = ParamConfig.VECTOR3(DEFAULT.axis.toArray(), {
		visibleIf: {
			mode: SHEAR_MODES.indexOf(ShearMode.AXIS),
		},
	});
	/** @param axisAmount */
	axisAmount = ParamConfig.FLOAT(DEFAULT.axisAmount, {
		range: [-1, 1],
		visibleIf: {
			mode: SHEAR_MODES.indexOf(ShearMode.AXIS),
		},
	});
}
const ParamsConfig = new ShearSopParamConfig();

export class ShearSopNode extends TypedSopNode<ShearSopParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.SHEAR;
	}

	static override displayedInputNames(): string[] {
		return ['geometries or objects to transform'];
	}

	override initializeNode() {
		// this.uiData.set_param_label(this.p.applyOn, (v)=>TARGET_TYPES[v])
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(ShearSopOperation.INPUT_CLONED_STATE);
	}

	setMode(mode: ShearMode) {
		this.p.mode.set(SHEAR_MODES.indexOf(mode));
	}

	private _operation: ShearSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new ShearSopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
