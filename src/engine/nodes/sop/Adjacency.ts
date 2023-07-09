/**
 * Adds attribute containing information about connected points.
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {AdjacencySopOperation} from '../../operations/sop/Adjacency';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = AdjacencySopOperation.DEFAULT_PARAMS;

class AdjacencySopParamsConfig extends NodeParamsConfig {
	/** @param toggle on to apply recursively to children */
	applyToChildren = ParamConfig.BOOLEAN(DEFAULT.applyToChildren, {
		separatorAfter: true,
	});
	/** @param name of attribute with count of adjacency attributes */
	adjacencyCountName = ParamConfig.STRING(DEFAULT.adjacencyCountName);
	/** @param name of adjacency attribute */
	adjacencyBaseName = ParamConfig.STRING(DEFAULT.adjacencyBaseName);
}
const ParamsConfig = new AdjacencySopParamsConfig();

export class AdjacencySopNode extends TypedSopNode<AdjacencySopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.ADJACENCY;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState([InputCloneMode.FROM_NODE]);
	}

	private _operation: AdjacencySopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new AdjacencySopOperation(this.scene(), this.states);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
