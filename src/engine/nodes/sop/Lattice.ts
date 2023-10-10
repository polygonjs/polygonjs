/**
 * applies a box lattice
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {LatticeSopOperation} from '../../operations/sop/Lattice';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';

const DEFAULT = LatticeSopOperation.DEFAULT_PARAMS;
class LatticeSopParamConfig extends NodeParamsConfig {
	group = ParamConfig.STRING(DEFAULT.group, {
		objectMask: true,
	});
	p0 = ParamConfig.VECTOR3(DEFAULT.p0);
	p1 = ParamConfig.VECTOR3(DEFAULT.p1);
	p2 = ParamConfig.VECTOR3(DEFAULT.p2);
	p3 = ParamConfig.VECTOR3(DEFAULT.p3);
	p4 = ParamConfig.VECTOR3(DEFAULT.p4);
	p5 = ParamConfig.VECTOR3(DEFAULT.p5);
	p6 = ParamConfig.VECTOR3(DEFAULT.p6);
	p7 = ParamConfig.VECTOR3(DEFAULT.p7);
	offset = ParamConfig.VECTOR3(DEFAULT.offset);
	moveObjectPosition = ParamConfig.BOOLEAN(DEFAULT.moveObjectPosition);
}
const ParamsConfig = new LatticeSopParamConfig();

export class LatticeSopNode extends TypedSopNode<LatticeSopParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.LATTICE;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(LatticeSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: LatticeSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new LatticeSopOperation(this.scene(), this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
