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

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class BVHSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new BVHSopParamsConfig();

export class BVHSopNode extends TypedSopNode<BVHSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'BVH';
	}

	static displayedInputNames(): string[] {
		return ['geometry to create BVH from'];
	}

	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(BVHSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: BVHSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new BVHSopOperation(this._scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
