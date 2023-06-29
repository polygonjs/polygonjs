import {ShaderNameByContextMap} from './ShaderName';
import {BaseNodeByContextMap, NodeContext} from '../../../poly/NodeContext';
// import {BaseGlNodeType} from '../../gl/_Base';
// import {NodeTypeMap} from '../../../containers/utils/ContainerMap';
export abstract class TypedAssembler<NC extends NodeContext> {
	abstract shaderNames(): ShaderNameByContextMap[NC][];
	abstract inputNamesForShaderName(node: BaseNodeByContextMap[NC], shaderName: ShaderNameByContextMap[NC]): string[];
	abstract rootNodesByShaderName(
		shaderName: ShaderNameByContextMap[NC],
		rootNodes: BaseNodeByContextMap[NC][]
	): BaseNodeByContextMap[NC][];
}
