import {ShaderName} from './ShaderName';
import {NodeContext} from '../../../poly/NodeContext';
import {NodeTypeMap} from '../../../containers/utils/ContainerMap';
export abstract class TypedAssembler<NC extends NodeContext> {
	abstract shaderNames(): ShaderName[];
	abstract input_names_for_shader_name(node: NodeTypeMap[NC], shader_name: ShaderName): string[];
}
