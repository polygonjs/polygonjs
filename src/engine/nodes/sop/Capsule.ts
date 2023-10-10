/**
 * Just like the Box, with rounded bevels.
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CapsuleSopOperation} from '../../operations/sop/Capsule';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
// import {PolyNodeController} from './../utils/poly/PolyNodeController';
// import {NodeContext} from './../../poly/NodeContext';
// import {PolyNodeDataRegister} from '../utils/poly/PolyNodeDataRegister';
// import {PolyNodeDefinition} from '../utils/poly/PolyNodeDefinition';
// import {ParamType} from '../../poly/ParamType';
const DEFAULT = CapsuleSopOperation.DEFAULT_PARAMS;
class CapsuleSopParamsConfig extends NodeParamsConfig {
	/** @param radius */
	radius = ParamConfig.FLOAT(DEFAULT.radius, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param height */
	height = ParamConfig.FLOAT(DEFAULT.height, {
		range: [0, 2],
		rangeLocked: [true, false],
	});
	/** @param divisions */
	divisions = ParamConfig.INTEGER(DEFAULT.divisions, {
		range: [1, 10],
		rangeLocked: [true, false],
	});
	/** @param center */
	center = ParamConfig.VECTOR3(DEFAULT.center);
}
const ParamsConfig = new CapsuleSopParamsConfig();

export class CapsuleSopNode extends TypedSopNode<CapsuleSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAPSULE;
	}

	override initializeNode() {
		this.io.inputs.setCount(0);
	}

	private _operation: CapsuleSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new CapsuleSopOperation(this._scene, this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
