import {ShaderName} from './ShaderName';
import {BaseNodeByContextMap, NodeContext} from '../../../poly/NodeContext';
import {BaseGlNodeType} from '../../gl/_Base';
// import {NodeTypeMap} from '../../../containers/utils/ContainerMap';
export abstract class TypedAssembler<NC extends NodeContext> {
	abstract shaderNames(): ShaderName[];
	abstract inputNamesForShaderName(node: BaseNodeByContextMap[NC], shaderName: ShaderName): string[];
	abstract rootNodesByShaderName(shaderName: ShaderName, rootNodes: BaseGlNodeType[]): BaseNodeByContextMap[NC][];
}
