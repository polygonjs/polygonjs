/**
 * Creates a box.
 *
 * @remarks
 * If the node has no input, you can control the radius and center of the box. If the node has an input, it will create a box that encompasses the input geometry.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {DecalSopOperation} from '../../operations/sop/Decal';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = DecalSopOperation.DEFAULT_PARAMS;
class DecalSopParamsConfig extends NodeParamsConfig {
	/** @param decal position */
	t = ParamConfig.VECTOR3(DEFAULT.t);
	/** @param decal rotation */
	r = ParamConfig.VECTOR3(DEFAULT.r);
	/** @param decal scale */
	s = ParamConfig.VECTOR3(DEFAULT.s);
	/** @param decal scale multipler */
	scale = ParamConfig.FLOAT(DEFAULT.scale);
}
const ParamsConfig = new DecalSopParamsConfig();

export class DecalSopNode extends TypedSopNode<DecalSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.DECAL;
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(DecalSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: DecalSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new DecalSopOperation(this._scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
