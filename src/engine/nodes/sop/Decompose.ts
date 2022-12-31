/**
 * Decomposes the input objects into multiple geometry, material and texture nodes to allow granular updates
 *
 */
import {SubnetSopNodeLike} from './utils/subnet/ChildrenDisplayController';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {NetworkNodeType} from '../../poly/NodeContext';

class DecomposeSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new DecomposeSopParamsConfig();

export class DecomposeSopNode extends SubnetSopNodeLike<DecomposeSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return NetworkNodeType.DECOMPOSE;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.ALWAYS);
	}
}
