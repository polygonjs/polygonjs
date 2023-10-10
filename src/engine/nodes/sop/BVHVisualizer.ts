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
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = BVHVisualizerSopOperation.DEFAULT_PARAMS;
class BVHVisualizerSopParamsConfig extends NodeParamsConfig {
	/** @param depth */
	depth = ParamConfig.INTEGER(DEFAULT.depth, {
		range: [0, 128],
		rangeLocked: [true, false],
	});
	/** @param opacity */
	opacity = ParamConfig.FLOAT(DEFAULT.opacity, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
	/** @param depth */
	displayEdges = ParamConfig.BOOLEAN(DEFAULT.displayEdges);
	/** @param depth */
	displayParents = ParamConfig.BOOLEAN(DEFAULT.displayParents);
}
const ParamsConfig = new BVHVisualizerSopParamsConfig();

export class BVHVisualizerSopNode extends TypedSopNode<BVHVisualizerSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.BVH_VISUALIZER;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(BVHVisualizerSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: BVHVisualizerSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new BVHVisualizerSopOperation(this._scene, this.states, this);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
