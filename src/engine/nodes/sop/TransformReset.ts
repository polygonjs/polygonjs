/**
 * Resets the center of a geometry.
 *
 * @remarks
 * This can be useful when importing an object whose centroid is not at the center of the geometry. When using this geometry via the LOD SOP, the center of the object will be used to calculate the distance from the object to the camera. It is then necessary to ensure that the center of the object and the center of the geometry are as close to each other as possible.
 *
 * This node can operate in one of multiple modes:
 *
 * - reset_object: this will set the transform of objects to t=0,0,0, r=0,0,0 and s=0,0,0
 * - center geometry: TBD
 * - promote: TBD
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {
	TransformResetSopOperation,
	TRANSFORM_RESET_MODES,
	TransformResetMode,
} from '../../operations/sop/TransformReset';

import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
const DEFAULT = TransformResetSopOperation.DEFAULT_PARAMS;
class TransformResetSopParamConfig extends NodeParamsConfig {
	/** @param mode to reset the geometry and object */
	mode = ParamConfig.INTEGER(DEFAULT.mode, {
		menu: {
			entries: TRANSFORM_RESET_MODES.map((target_type, i) => {
				return {name: target_type, value: i};
			}),
		},
	});
}
const ParamsConfig = new TransformResetSopParamConfig();

export class TransformResetSopNode extends TypedSopNode<TransformResetSopParamConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'transformReset';
	}

	static displayedInputNames(): string[] {
		return ['objects to reset transform', 'optional reference for center'];
	}

	initializeNode() {
		this.io.inputs.setCount(1, 2);
		this.io.inputs.initInputsClonedState(TransformResetSopOperation.INPUT_CLONED_STATE);
	}

	setMode(mode: TransformResetMode) {
		this.p.mode.set(TRANSFORM_RESET_MODES.indexOf(mode));
	}

	private _operation: TransformResetSopOperation | undefined;
	cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new TransformResetSopOperation(this.scene(), this.states);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
