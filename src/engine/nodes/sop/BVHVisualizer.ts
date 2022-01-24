/**
 * Creates a BVH from geometries.
 *
 * @remarks
 * Visualize a BVH, created with the node sop/BVH
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {BVHVisualizerSopOperation} from '../../operations/sop/BVHVisualizer';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = BVHVisualizerSopOperation.DEFAULT_PARAMS;
class BVHVisualizerSopParamsConfig extends NodeParamsConfig {
	/** @param depth */
	depth = ParamConfig.INTEGER(DEFAULT.depth, {
		range: [0, 20],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new BVHVisualizerSopParamsConfig();

export class BVHVisualizerSopNode extends TypedSopNode<BVHVisualizerSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'BVHVisualizer';
	}

	static override displayedInputNames(): string[] {
		return ['geometry with bvh'];
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(BVHVisualizerSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: BVHVisualizerSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new BVHVisualizerSopOperation(this._scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
