/**
 * boolean operation
 *
 */
import {TypedSopNode} from './_Base';
import {BooleanOperation, BooleanSopOperation, BOOLEAN_OPERATIONS} from '../../operations/sop/Boolean';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
const DEFAULT = BooleanSopOperation.DEFAULT_PARAMS;
class BooleanSopParamsConfig extends NodeParamsConfig {
	/** @param url to load the geometry from */
	operation = ParamConfig.INTEGER(DEFAULT.operation, {
		menu: {
			entries: BOOLEAN_OPERATIONS.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param defines if only the material from the first input is used, or if the ones from both inputs should be used */
	useBothMaterials = ParamConfig.BOOLEAN(DEFAULT.useBothMaterials);
}
const ParamsConfig = new BooleanSopParamsConfig();

export class BooleanSopNode extends TypedSopNode<BooleanSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'boolean';
	}

	initializeNode() {
		this.io.inputs.setCount(2);
		this.io.inputs.initInputsClonedState(BooleanSopOperation.INPUT_CLONED_STATE);
	}
	setOperation(operation: BooleanOperation) {
		this.p.operation.set(BOOLEAN_OPERATIONS.indexOf(operation));
	}

	private _operation: BooleanSopOperation | undefined;
	async cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new BooleanSopOperation(this.scene(), this.states, this);
		const core_group = await this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
