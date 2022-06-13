/**
 * Places the geometry of the second input into the objects of the first input.
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {SetGeometrySopOperation} from '../../operations/sop/SetGeometry';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class SetGeometrySopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SetGeometrySopParamsConfig();

export class SetGeometrySopNode extends TypedSopNode<SetGeometrySopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'setGeometry';
	}

	static override displayedInputNames(): string[] {
		return ['objects to places geometries into', 'objects to take geometries from'];
	}

	override initializeNode() {
		this.io.inputs.setCount(2);
		this.io.inputs.initInputsClonedState(SetGeometrySopOperation.INPUT_CLONED_STATE);
	}

	private _operation: SetGeometrySopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new SetGeometrySopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
