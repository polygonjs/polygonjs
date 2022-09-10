/**
 * Sorts vertices
 *
 *
 */
import {AttribClass} from './../../../core/geometry/Constant';
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SortSopOperation, AXISES, SORT_MODES, SortMode, SORT_TARGET_TYPES} from '../../operations/sop/Sort';
const DEFAULT = SortSopOperation.DEFAULT_PARAMS;

class SortSopParamsConfig extends NodeParamsConfig {
	/** @param criteria used to sort */
	mode = ParamConfig.INTEGER(DEFAULT.mode, {
		menu: {
			entries: SORT_MODES.map((name, value) => ({name, value})),
		},
	});
	/** @param defines if this node will sort points or objects */
	targetType = ParamConfig.INTEGER(DEFAULT.targetType, {
		menu: {
			entries: SORT_TARGET_TYPES.map((name, value) => ({name, value})),
		},
	});
	/** @param seed used by the random mode */
	seed = ParamConfig.INTEGER(DEFAULT.seed, {
		range: [0, 100],
		rangeLocked: [false, false],
		visibleIf: {mode: SORT_MODES.indexOf(SortMode.RANDOM)},
	});
	/** @param axis along which points will be sorted */
	axis = ParamConfig.INTEGER(DEFAULT.axis, {
		menu: {
			entries: AXISES.map((name, value) => {
				return {name, value};
			}),
		},
		visibleIf: {mode: SORT_MODES.indexOf(SortMode.AXIS)},
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
		this._operation = this._operation || new SortSopOperation(this._scene, this.states, this);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}

	setSortMode(mode: SortMode) {
		this.p.mode.set(SORT_MODES.indexOf(mode));
	}
	setTargetType(targetType: AttribClass.VERTEX | AttribClass.OBJECT) {
		this.p.targetType.set(SORT_TARGET_TYPES.indexOf(targetType));
	}
}
