/**
 * Creates a hull from the input geometry
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {ConvexHullSopOperation} from '../../operations/sop/ConvexHull';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class BoxSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new BoxSopParamsConfig();

export class ConvexHullSopNode extends TypedSopNode<BoxSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'convexHull';
	}

	protected override initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(ConvexHullSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: ConvexHullSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new ConvexHullSopOperation(this._scene, this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
