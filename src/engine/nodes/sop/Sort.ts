/**
 * Sorts vertices
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SortSopOperation, AXISES} from '../../operations/sop/Sort';
const DEFAULT = SortSopOperation.DEFAULT_PARAMS;

class SortSopParamsConfig extends NodeParamsConfig {
	/** @param axis along which points will be sorted */
	axis = ParamConfig.INTEGER(DEFAULT.axis, {
		menu: {
			entries: AXISES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param invert the sort */
	invert = ParamConfig.BOOLEAN(DEFAULT.invert);
}
const ParamsConfig = new SortSopParamsConfig();

export class SortSopNode extends TypedSopNode<SortSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'sort';
	}

	static override displayedInputNames(): string[] {
		return ['geometry to sort'];
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState([InputCloneMode.FROM_NODE]);
	}

	private _operation: SortSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new SortSopOperation(this._scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
