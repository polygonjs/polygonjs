/**
 * Creates a BVH from geometries.
 *
 * @remarks
 * BVH allow for faster raycasting
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {BVHSopOperation} from '../../operations/sop/BVH';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = BVHSopOperation.DEFAULT_PARAMS;
class BVHSopParamsConfig extends NodeParamsConfig {
	maxLeafTris = ParamConfig.INTEGER(DEFAULT.maxLeafTris, {
		range: [1, 16],
		rangeLocked: [true, false],
	});
	verbose = ParamConfig.BOOLEAN(DEFAULT.verbose);
	keepOnlyPosition = ParamConfig.BOOLEAN(DEFAULT.keepOnlyPosition);
}
const ParamsConfig = new BVHSopParamsConfig();

export class BVHSopNode extends TypedSopNode<BVHSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'BVH';
	}

	static override displayedInputNames(): string[] {
		return ['geometry to create BVH from'];
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(BVHSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: BVHSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new BVHSopOperation(this._scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
