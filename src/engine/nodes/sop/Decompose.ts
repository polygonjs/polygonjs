/**
 * Decomposes the input objects into multiple geometry, material and texture nodes to allow granular updates
 *
 */
import {SubnetSopNodeLike} from './utils/subnet/ChildrenDisplayController';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NetworkNodeType} from '../../poly/NodeContext';
import {BaseNodeType} from '../_Base';

export const DECOMPOSE_EVENT_TYPE: 'decompose' = 'decompose';
const DECOMPOSE_EVENT = {type: DECOMPOSE_EVENT_TYPE};

class DecomposeSopParamsConfig extends NodeParamsConfig {
	/** @param decompose the input object */
	decompose = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			DecomposeSopNode.PARAM_CALLBACK_decompose(node as DecomposeSopNode);
		},
	});
	// /** @param toggle if you want to use an environment map */
	// useEnvMap = ParamConfig.BOOLEAN(0, {
	// 	separatorBefore: true,
	// });
	// /** @param specify the environment map COP node */
	// envMap = ParamConfig.NODE_PATH('', {
	// 	visibleIf: {useEnvMap: 1},
	// 	nodeSelection: {context: NodeContext.COP},
	// 	cook: false,
	// });
	// /** @param environment intensity */
	// envMapIntensity = ParamConfig.FLOAT(1, {
	// 	visibleIf: {useEnvMap: 1},
	// });
}
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
	static PARAM_CALLBACK_decompose(node: DecomposeSopNode) {
		node._paramCallbackDecompose();
	}
	private _paramCallbackDecompose() {
		this.dispatchEvent(DECOMPOSE_EVENT);
	}
}
