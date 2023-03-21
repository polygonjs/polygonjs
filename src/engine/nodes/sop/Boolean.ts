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
		separatorAfter: true,
	});
	/** @param preserves the color attribute of both input */
	keepVertexColor = ParamConfig.BOOLEAN(DEFAULT.keepVertexColor);
	/** @param add any additional attribute to be preserved */
	additionalAttributes = ParamConfig.STRING(DEFAULT.additionalAttributes, {
		separatorAfter: true,
	});
	/** @param defines if only the material from the first input is used, or if the ones from both inputs should be used */
	keepMaterials = ParamConfig.BOOLEAN(DEFAULT.keepMaterials);
	/** @param if one of the input has multiple material for a single object, and you'd like to preserve those, toggle this on */
	useInputGroups = ParamConfig.BOOLEAN(DEFAULT.useInputGroups);
	/** @param intersectionEdgesOnly */
	intersectionEdgesOnly = ParamConfig.BOOLEAN(DEFAULT.intersectionEdgesOnly);
}
const ParamsConfig = new BooleanSopParamsConfig();

export class BooleanSopNode extends TypedSopNode<BooleanSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'boolean';
	}

	override initializeNode() {
		this.io.inputs.setCount(2);
		this.io.inputs.initInputsClonedState(BooleanSopOperation.INPUT_CLONED_STATE);
	}
	setOperation(operation: BooleanOperation) {
		this.p.operation.set(BOOLEAN_OPERATIONS.indexOf(operation));
	}

	private _operation: BooleanSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new BooleanSopOperation(this.scene(), this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
