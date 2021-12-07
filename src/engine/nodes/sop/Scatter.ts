/**
 * Scatter points onto a geometry
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';

import {ScatterSopOperation} from '../../operations/sop/Scatter';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = ScatterSopOperation.DEFAULT_PARAMS;
class ScatterSopParamsConfig extends NodeParamsConfig {
	/** @param number of points to create */
	pointsCount = ParamConfig.INTEGER(DEFAULT.pointsCount, {
		range: [0, 1000],
		rangeLocked: [true, false],
	});
	/** @param seed */
	seed = ParamConfig.INTEGER(DEFAULT.seed, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	/** @param attribute which will influence the distribution of points */
	useWeightAttribute = ParamConfig.BOOLEAN(DEFAULT.useWeightAttribute);
	/** @param attribute which will influence the distribution of points */
	weightAttribute = ParamConfig.STRING(DEFAULT.weightAttribute, {
		visibleIf: {useWeightAttribute: 1},
	});
	/** @param toggle on to transfer attribute from the input geometry to the created points */
	transferAttributes = ParamConfig.BOOLEAN(DEFAULT.transferAttributes);
	/** @param names of the attributes to transfer */
	attributesToTransfer = ParamConfig.STRING(DEFAULT.attributesToTransfer, {
		visibleIf: {transferAttributes: 1},
	});
	/** @param add an id attribute, starting at 0, incrementing by 1 for each point (0,1,2,3...) */
	addIdAttribute = ParamConfig.BOOLEAN(DEFAULT.addIdAttribute);
	/** @param add an idn attribute, which is the id normalized between 0 and 1 */
	addIdnAttribute = ParamConfig.BOOLEAN(DEFAULT.addIdnAttribute);
}
const ParamsConfig = new ScatterSopParamsConfig();

export class ScatterSopNode extends TypedSopNode<ScatterSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'scatter';
	}

	static displayedInputNames(): string[] {
		return ['geometry to scatter points onto'];
	}

	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	private _operation: ScatterSopOperation | undefined;
	async cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new ScatterSopOperation(this.scene(), this.states);
		const core_group = await this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
